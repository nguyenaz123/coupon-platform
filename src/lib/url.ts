import type { CouponQuery, CouponSort, CouponStatus, DiscountType } from "@/lib/types";

export type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Dựng link giữ nguyên các bộ lọc đang bật. Giá trị `undefined` trong
 * `overrides` sẽ xoá tham số đó; đổi bộ lọc thì luôn quay về trang 1.
 */
export function buildHref(
  basePath: string,
  current: SearchParams,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params.set(key, first);
  }
  if (!("page" in overrides)) params.delete("page");
  for (const [key, value] of Object.entries(overrides)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const statuses: CouponStatus[] = ["active", "upcoming"];
const sorts: CouponSort[] = ["newest", "expiring", "saving", "min-spend"];
const discountTypes: DiscountType[] = ["percent", "fixed", "coin"];

function oneOf<T extends string>(value: string | undefined, allowed: T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/** Đọc bộ lọc từ URL, bỏ qua giá trị không hợp lệ */
export function parseCouponQuery(searchParams: SearchParams): {
  query: CouponQuery;
  page: number;
} {
  const get = (key: string) => firstParam(searchParams[key])?.trim() || undefined;

  return {
    query: {
      status: oneOf(get("status"), statuses) ?? "active",
      sort: oneOf(get("sort"), sorts) ?? "newest",
      discountType: oneOf(get("type"), discountTypes),
      savingRange: get("saving"),
      minSpendRange: get("minspend"),
      shop: get("shop"),
      search: get("q"),
    },
    page: Number(get("page")) || 1,
  };
}
