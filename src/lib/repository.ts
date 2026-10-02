import { retargetAffiliateUrl, slugify, type CouponRecord } from "@/lib/accesstrade/mapper";
import { getSnapshot, isSnapshotStale, type Snapshot } from "@/lib/accesstrade/snapshot";
import { todayInVietnam } from "@/lib/format";
import type {
  Coupon,
  CouponQuery,
  CouponStatus,
  Page,
  SearchSuggestion,
  Shop,
  Store,
  SyncInfo,
} from "@/lib/types";

/**
 * Lớp truy cập dữ liệu duy nhất của ứng dụng, đọc từ snapshot AccessTrade.
 * Lọc, sắp xếp và phân trang làm tại đây vì API chỉ hỗ trợ phân trang.
 */

export const PAGE_SIZE = 24;

interface Dataset {
  coupons: Coupon[];
  byId: Map<string, Coupon>;
  /** Chuỗi đã bỏ dấu để tìm kiếm không phân biệt dấu */
  searchText: Map<string, string>;
  stores: Store[];
  shops: Shop[];
}

function statusOf(record: CouponRecord, today: string): CouponStatus | undefined {
  if (record.endDate < today) return undefined;
  return record.startDate > today ? "upcoming" : "active";
}

function normalize(value: string): string {
  return slugify(value).replace(/-/g, " ");
}

function originOf(url: string): string | undefined {
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

function buildStores(snapshot: Snapshot, coupons: Coupon[]): Store[] {
  return snapshot.merchants
    .map((merchant) => {
      const own = coupons.filter((coupon) => coupon.storeSlug === merchant.login_name);
      const sample = own.find((coupon) => coupon.affiliateUrl !== coupon.link);
      const domain = sample ? originOf(sample.link) : undefined;
      const name = Array.isArray(merchant.display_name)
        ? merchant.display_name[0]
        : merchant.display_name;

      return {
        slug: merchant.login_name,
        name: name || merchant.login_name,
        logo: merchant.logo,
        affiliateUrl:
          sample && domain ? retargetAffiliateUrl(sample.affiliateUrl, domain) : undefined,
        couponCount: own.length,
        shopCount: new Set(own.map((coupon) => coupon.shopSlug).filter(Boolean)).size,
      };
    })
    .filter((store) => store.couponCount > 0)
    .sort((a, b) => b.couponCount - a.couponCount);
}

function buildShops(coupons: Coupon[]): Shop[] {
  const shops = new Map<string, Shop>();
  for (const coupon of coupons) {
    if (!coupon.shopSlug || !coupon.shopName) continue;
    const key = `${coupon.storeSlug}/${coupon.shopSlug}`;
    const shop = shops.get(key);
    if (shop) shop.couponCount += 1;
    else {
      shops.set(key, {
        slug: coupon.shopSlug,
        name: coupon.shopName,
        storeSlug: coupon.storeSlug,
        image: coupon.image,
        couponCount: 1,
      });
    }
  }
  return [...shops.values()].sort((a, b) => b.couponCount - a.couponCount);
}

// Tính lại khi có snapshot mới hoặc sang ngày mới (trạng thái mã đổi theo ngày)
let cached: { snapshot: Snapshot; today: string; dataset: Dataset } | undefined;

async function getDataset(): Promise<Dataset> {
  const snapshot = await getSnapshot();
  const today = todayInVietnam();
  if (cached?.snapshot === snapshot && cached.today === today) return cached.dataset;

  // Sàn chưa duyệt chiến dịch thì link affiliate dẫn tới trang 404, mở thẳng link gốc
  const approved = new Set(snapshot.approvedMerchants ?? []);
  const coupons: Coupon[] = [];
  for (const record of snapshot.coupons) {
    const status = statusOf(record, today);
    if (!status) continue;
    const affiliateUrl = approved.has(record.storeSlug) ? record.affiliateUrl : record.link;
    coupons.push({ ...record, affiliateUrl, status });
  }

  const dataset: Dataset = {
    coupons,
    byId: new Map(coupons.map((coupon) => [coupon.id, coupon])),
    searchText: new Map(
      coupons.map((coupon) => [
        coupon.id,
        normalize(`${coupon.shopName ?? ""} ${coupon.title} ${coupon.code}`),
      ]),
    ),
    stores: buildStores(snapshot, coupons),
    shops: buildShops(coupons),
  };

  cached = { snapshot, today, dataset };
  return dataset;
}

function parseRange(range?: string): [number, number] | undefined {
  if (!range) return undefined;
  const [min, max] = range.split("-");
  return [Number(min) || 0, max ? Number(max) : Number.POSITIVE_INFINITY];
}

function inRange(value: number | undefined, range?: [number, number]): boolean {
  if (!range) return true;
  return value !== undefined && value >= range[0] && value <= range[1];
}

function filterCoupons(dataset: Dataset, query: CouponQuery): Coupon[] {
  const keyword = query.search ? normalize(query.search) : "";
  const savingRange = parseRange(query.savingRange);
  const minSpendRange = parseRange(query.minSpendRange);

  return dataset.coupons.filter((coupon) => {
    if (query.store && coupon.storeSlug !== query.store) return false;
    if (query.shop && coupon.shopSlug !== query.shop) return false;
    if (query.status && coupon.status !== query.status) return false;
    if (query.discountType && coupon.discount?.type !== query.discountType) return false;
    if (!inRange(coupon.maxSaving, savingRange)) return false;
    if (!inRange(coupon.minSpend, minSpendRange)) return false;
    if (keyword && !dataset.searchText.get(coupon.id)?.includes(keyword)) return false;
    return true;
  });
}

const sorters: Record<NonNullable<CouponQuery["sort"]>, (a: Coupon, b: Coupon) => number> = {
  newest: (a, b) => b.startDate.localeCompare(a.startDate),
  expiring: (a, b) => a.endDate.localeCompare(b.endDate),
  saving: (a, b) => (b.maxSaving ?? -1) - (a.maxSaving ?? -1),
  // Mã không ghi đơn tối thiểu xếp cuối
  "min-spend": (a, b) => (a.minSpend ?? 1e15) - (b.minSpend ?? 1e15),
};

export async function getCoupons(
  query: CouponQuery = {},
  page = 1,
  pageSize = PAGE_SIZE,
): Promise<Page<Coupon>> {
  const dataset = await getDataset();
  const matched = filterCoupons(dataset, query).sort(sorters[query.sort ?? "newest"]);
  const pageCount = Math.max(1, Math.ceil(matched.length / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);

  return {
    items: matched.slice((current - 1) * pageSize, current * pageSize),
    total: matched.length,
    page: current,
    pageCount,
  };
}

/** Mã đang diễn ra và hết hạn sớm nhất, ưu tiên mã giảm nhiều */
export async function getExpiringSoon(limit = 4): Promise<Coupon[]> {
  const dataset = await getDataset();
  const active = dataset.coupons.filter((coupon) => coupon.status === "active");
  const soonest = active.reduce<string | undefined>(
    (min, coupon) => (!min || coupon.endDate < min ? coupon.endDate : min),
    undefined,
  );

  return active
    .filter((coupon) => coupon.endDate === soonest)
    .sort(sorters.saving)
    .slice(0, limit);
}

export async function getCoupon(id: string): Promise<Coupon | undefined> {
  return (await getDataset()).byId.get(id);
}

/** Ưu tiên mã cùng shop, sau đó tới mã cùng sàn */
export async function getRelatedCoupons(coupon: Coupon, limit = 4): Promise<Coupon[]> {
  const dataset = await getDataset();
  const others = dataset.coupons.filter(
    (item) => item.id !== coupon.id && item.storeSlug === coupon.storeSlug,
  );
  const sameShop = coupon.shopSlug
    ? others.filter((item) => item.shopSlug === coupon.shopSlug)
    : [];
  const rest = others.filter((item) => !sameShop.includes(item)).sort(sorters.saving);

  return [...sameShop, ...rest].slice(0, limit);
}

export async function countByStatus(
  query: Pick<CouponQuery, "store" | "shop" | "search"> = {},
): Promise<Record<CouponStatus, number>> {
  const dataset = await getDataset();
  return filterCoupons(dataset, query).reduce(
    (acc, coupon) => {
      acc[coupon.status] += 1;
      return acc;
    },
    { active: 0, upcoming: 0 },
  );
}

export async function getStores(): Promise<Store[]> {
  return (await getDataset()).stores;
}

export async function getStore(slug: string): Promise<Store | undefined> {
  return (await getDataset()).stores.find((store) => store.slug === slug);
}

export async function getTopShops(storeSlug?: string, limit = 8): Promise<Shop[]> {
  const shops = (await getDataset()).shops;
  return (storeSlug ? shops.filter((shop) => shop.storeSlug === storeSlug) : shops).slice(
    0,
    limit,
  );
}

export async function getShop(slug: string, storeSlug?: string): Promise<Shop | undefined> {
  return (await getDataset()).shops.find(
    (shop) => shop.slug === slug && (!storeSlug || shop.storeSlug === storeSlug),
  );
}

/** Tính lại mỗi lần gọi vì độ cũ của dữ liệu thay đổi theo thời gian */
export async function getSyncInfo(): Promise<SyncInfo> {
  const snapshot = await getSnapshot();
  return {
    syncedAt: snapshot.syncedAt,
    isComplete: snapshot.isComplete,
    isStale: isSnapshotStale(snapshot),
  };
}

export async function searchSuggestions(keyword: string): Promise<SearchSuggestion[]> {
  const term = normalize(keyword);
  if (!term) return [];
  const dataset = await getDataset();

  const stores: SearchSuggestion[] = dataset.stores
    .filter((store) => normalize(store.name).includes(term))
    .slice(0, 2)
    .map((store) => ({ group: "store", label: store.name, href: `/store/${store.slug}` }));

  const shops: SearchSuggestion[] = dataset.shops
    .filter((shop) => normalize(shop.name).includes(term))
    .slice(0, 4)
    .map((shop) => ({
      group: "shop",
      label: `${shop.name} · ${shop.couponCount} mã`,
      href: `/store/${shop.storeSlug}?shop=${shop.slug}`,
    }));

  const coupons: SearchSuggestion[] = dataset.coupons
    .filter((coupon) => dataset.searchText.get(coupon.id)?.includes(term))
    .slice(0, 4)
    .map((coupon) => ({
      group: "coupon",
      label: coupon.shopName ? `${coupon.shopName}: ${coupon.title}` : coupon.title,
      href: `/coupon/${coupon.id}`,
    }));

  return [...stores, ...shops, ...coupons];
}
