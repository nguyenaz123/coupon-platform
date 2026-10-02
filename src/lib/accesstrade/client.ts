/**
 * Client gọi API AccessTrade. Chỉ dùng phía server vì cần ACCESSTRADE_TOKEN.
 *
 * Lưu ý rút ra khi gọi thử API thật:
 * - Khoảng 10% request bị trả 403 "Invalid token" dù token đúng, gọi dày
 *   (dưới ~5 giây) thì còn bị treo. Mọi request vì thế đi qua một hàng đợi
 *   giãn cách, và 403 được thử lại ngay ở lượt kế tiếp.
 * - `limit` tối đa là 100.
 * - Có request treo rất lâu, nên luôn đặt timeout.
 */

const BASE_URL = "https://api.accesstrade.vn/v1";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 6;
/** Khoảng cách tối thiểu giữa thời điểm bắt đầu hai request */
const MIN_INTERVAL_MS = 5_500;
export const PAGE_SIZE = 100;

export interface RawOffer {
  id: string;
  name: string;
  content: string;
  merchant: string;
  domain: string;
  image: string;
  link: string;
  aff_link: string;
  start_time: string;
  end_time: string;
  coupons: { coupon_code: string; coupon_desc: string }[];
  categories: { category_name: string; category_name_show: string }[];
  banners: unknown[];
}

export interface RawMerchant {
  id: string;
  login_name: string;
  /** API trả về mảng, ví dụ ["Shopee"] */
  display_name: string[] | string;
  logo: string;
  total_offer: number;
}

export interface RawCampaign {
  id: string;
  /** Trùng với `merchant` của offer, ví dụ "shopee" */
  merchant: string;
  approval: string;
}

export class AccessTradeError extends Error {}

function getToken(): string {
  const token = process.env.ACCESSTRADE_TOKEN;
  if (!token) throw new AccessTradeError("Thiếu biến môi trường ACCESSTRADE_TOKEN");
  return token;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Lưu trên globalThis để HMR ở dev không tạo hàng đợi thứ hai
const queue = globalThis as typeof globalThis & { __accesstradeNextSlot?: number };

/** Chờ tới lượt gọi tiếp theo, kể cả khi nhiều nơi gọi cùng lúc */
async function waitForSlot(): Promise<void> {
  const now = Date.now();
  const slot = Math.max(now, queue.__accesstradeNextSlot ?? 0);
  queue.__accesstradeNextSlot = slot + MIN_INTERVAL_MS;
  if (slot > now) await sleep(slot - now);
}

async function request<T>(path: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    // Hàng đợi đã giãn cách sẵn; lỗi lặp lại thì chờ thêm để API kịp hồi
    if (attempt > 1) await sleep(5_000 * (attempt - 1));
    await waitForSlot();

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        headers: { Authorization: `Token ${getToken()}` },
        // Dữ liệu được giữ trong snapshot riêng, không đưa vào Data Cache của Next
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok) return (await response.json()) as T;
      // Không đưa body vào lỗi: API in lại token trong thông báo 403
      lastError = new AccessTradeError(`${path} trả về HTTP ${response.status}`);
      if (response.status !== 403 && response.status < 500) break;
    } catch (error) {
      if (error instanceof AccessTradeError) throw error;
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new AccessTradeError(`Không gọi được ${path}`);
}

export async function fetchOffersPage(page: number): Promise<RawOffer[]> {
  const result = await request<{ data?: RawOffer[] }>(
    `/offers_informations?limit=${PAGE_SIZE}&page=${page}`,
  );
  return result.data ?? [];
}

export async function fetchMerchants(): Promise<RawMerchant[]> {
  const result = await request<{ data?: RawMerchant[] }>(
    "/offers_informations/merchant_list",
  );
  return result.data ?? [];
}

const CAMPAIGN_PAGE_SIZE = 50;

/**
 * Sàn mà tài khoản đã được duyệt chiến dịch. `aff_link` của offer luôn có,
 * nhưng chỉ chạy được với sàn đã duyệt; sàn chưa duyệt thì go.isclix.com trả 404.
 */
export async function fetchApprovedMerchants(): Promise<string[]> {
  const merchants = new Set<string>();
  for (let page = 1; page <= 20; page += 1) {
    const result = await request<{ data?: RawCampaign[] }>(
      `/campaigns?approval=successful&limit=${CAMPAIGN_PAGE_SIZE}&page=${page}`,
    );
    const campaigns = result.data ?? [];
    for (const campaign of campaigns) {
      if (campaign.approval === "successful") merchants.add(campaign.merchant);
    }
    if (campaigns.length < CAMPAIGN_PAGE_SIZE) break;
  }
  return [...merchants];
}
