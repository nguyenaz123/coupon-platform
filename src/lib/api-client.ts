import type { Coupon, SearchSuggestion } from "@/lib/types";

/** Các hàm gọi API dùng ở client component. Server component dùng `lib/repository`. */

export async function fetchSuggestions(
  keyword: string,
  signal?: AbortSignal,
): Promise<SearchSuggestion[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`, {
    signal,
  });
  if (!response.ok) throw new Error("Không tải được gợi ý tìm kiếm");
  return response.json();
}

export async function revealCoupon(
  id: string,
): Promise<Pick<Coupon, "code" | "terms"> & { redirectUrl: string }> {
  const response = await fetch(`/api/coupons/${encodeURIComponent(id)}/reveal`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Không lấy được mã giảm giá");
  return response.json();
}
