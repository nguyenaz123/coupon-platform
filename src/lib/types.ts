/**
 * Mô hình dữ liệu của ứng dụng, dựng hoàn toàn từ response AccessTrade
 * (`/v1/offers_informations` + `/v1/offers_informations/merchant_list`).
 * Trường nào không có trong response thì phải suy ra được từ response.
 */

/** Tính theo ngày giờ Việt Nam khi đọc, không lưu sẵn */
export type CouponStatus = "active" | "upcoming";

/** Suy ra từ tên mã: "Giảm 15%", "Giảm 12,000 VNĐ", "Giảm 500 Xu" */
export type DiscountType = "percent" | "fixed" | "coin";

export interface Discount {
  type: DiscountType;
  /** % với percent, VNĐ với fixed, số xu với coin */
  value: number;
  /** Mức giảm tối đa (VNĐ), chỉ mã giảm theo % mới có */
  maxValue?: number;
}

export interface Store {
  /** `login_name` của merchant trên AccessTrade, ví dụ "shopee", "tikivn" */
  slug: string;
  name: string;
  logo: string;
  /** Link affiliate về trang chủ sàn, dựng từ `aff_link` của các mã */
  affiliateUrl?: string;
  /** Số mã đang diễn ra + sắp diễn ra trong dữ liệu đã đồng bộ */
  couponCount: number;
  shopCount: number;
}

export interface Shop {
  slug: string;
  name: string;
  storeSlug: string;
  /** Ảnh đại diện shop, lấy từ trường `image` của mã */
  image: string;
  couponCount: number;
}

export interface Coupon {
  id: string;
  storeSlug: string;
  /** Tên shop trong ngoặc vuông đầu tên mã, ví dụ "[Floralpunk Official Store]" */
  shopName?: string;
  shopSlug?: string;
  /** Tên mã đã bỏ phần tên shop */
  title: string;
  code: string;
  discount?: Discount;
  /** Nhãn ngắn: "Giảm 15%", "Giảm 50K", "Giảm 500 Xu" */
  discountLabel: string;
  /** Số tiền giảm tối đa quy ra VNĐ, dùng cho lọc và sắp xếp */
  maxSaving?: number;
  /** Giá trị đơn tối thiểu (VNĐ). 0: mã ghi rõ từ 0đ; không có: tên mã không ghi */
  minSpend?: number;
  /** Các dòng trong `content` */
  terms: string[];
  image: string;
  /** Trang mã trên sàn, chưa gắn tracking */
  link: string;
  /** Link affiliate có tracking của AccessTrade */
  affiliateUrl: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD, mã còn dùng được hết ngày này */
  endDate: string;
  status: CouponStatus;
}

export type CouponSort = "newest" | "expiring" | "saving" | "min-spend";

export interface CouponQuery {
  store?: string;
  shop?: string;
  status?: CouponStatus;
  discountType?: DiscountType;
  /** Khoảng số tiền giảm tối đa dạng "0-50000" */
  savingRange?: string;
  /** Khoảng đơn tối thiểu dạng "0-100000" */
  minSpendRange?: string;
  search?: string;
  sort?: CouponSort;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

export interface SyncInfo {
  /** ISO string lúc bắt đầu lấy dữ liệu đang hiển thị */
  syncedAt: string;
  /** Đang có bản đầy đủ hay mới lấy được một phần */
  isComplete: boolean;
  /** Đồng bộ thất bại đã lâu, dữ liệu có thể không còn đúng */
  isStale: boolean;
}

export interface SearchSuggestion {
  group: "coupon" | "shop" | "store";
  label: string;
  href: string;
}
