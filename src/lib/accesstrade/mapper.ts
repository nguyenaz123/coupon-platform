import { formatCompact } from "@/lib/format";
import type { Coupon, Discount } from "@/lib/types";

import type { RawOffer } from "./client";

/** Mã đã chuyển đổi, trạng thái được tính lại mỗi lần đọc */
export type CouponRecord = Omit<Coupon, "status">;

/** Số tiền: "12,000 VNĐ", "20K", "9 triệu", "₫60.000" */
const MONEY = String.raw`(₫\s*)?([\d.,]+)\s*(k|nghìn|ngàn|tr|triệu|vnđ|vnd|đ|₫)?`;
const DISCOUNT_PREFIX = String.raw`giảm\s+(?:ngay\s+)?`;
const PERCENT_RE = new RegExp(String.raw`${DISCOUNT_PREFIX}([\d.,]+)\s*%`, "i");
const COIN_RE = new RegExp(String.raw`${DISCOUNT_PREFIX}([\d.,]+)\s*xu`, "i");
const FIXED_RE = new RegExp(DISCOUNT_PREFIX + MONEY, "i");
const MAX_RE = new RegExp(String.raw`tối đa\s+${MONEY}`, "i");
const MIN_SPEND_RE = new RegExp(
  String.raw`(?:đơn tối thiểu|đơn hàng từ|đơn từ)\s+${MONEY}`,
  "i",
);
const SHOP_PREFIX_RE = /^\s*\[([^\]]+)\]\s*-?\s*/;

/**
 * Đổi số tiền trong tên mã ra VNĐ. Với VNĐ, dấu chấm và phẩy là phân cách
 * hàng nghìn; với K/triệu thì có thể là phần thập phân. Số không có đơn vị
 * và nhỏ hơn 1.000 là dữ liệu bị cắt (ví dụ "đơn hàng từ 3") nên bỏ qua.
 */
function parseMoney(match: RegExpMatchArray): number | undefined {
  const [, currencyPrefix, raw, rawUnit] = match;
  const unit = (rawUnit ?? (currencyPrefix ? "đ" : "")).toLowerCase();
  const multiplier = ["k", "nghìn", "ngàn"].includes(unit)
    ? 1_000
    : ["tr", "triệu"].includes(unit)
      ? 1_000_000
      : 1;

  const digits =
    multiplier > 1 && /^\d+[.,]\d{1,2}$/.test(raw)
      ? raw.replace(",", ".")
      : raw.replace(/[.,]/g, "");
  const value = Math.round(Number(digits) * multiplier);

  if (!Number.isFinite(value) || value < 0) return undefined;
  if (!unit && value < 1_000) return undefined;
  return value;
}

function parseNumber(raw: string): number {
  return Number(raw.replace(",", "."));
}

export function parseDiscount(text: string): Discount | undefined {
  const percent = text.match(PERCENT_RE);
  if (percent) {
    const max = text.match(MAX_RE);
    const value = parseNumber(percent[1]);
    if (!(value > 0 && value <= 100)) return undefined;
    return {
      type: "percent",
      value,
      maxValue: (max && parseMoney(max)) || undefined,
    };
  }

  const coin = text.match(COIN_RE);
  if (coin) {
    const value = Number(coin[1].replace(/[.,]/g, ""));
    return value > 0 ? { type: "coin", value } : undefined;
  }

  const fixed = text.match(FIXED_RE);
  // Bắt buộc có đơn vị tiền, tránh nhận nhầm tên như "Giảm 5"
  if (fixed && (fixed[1] || fixed[3])) {
    const value = parseMoney(fixed);
    return value ? { type: "fixed", value } : undefined;
  }

  return undefined;
}

/** `undefined` khi tên mã không ghi đơn tối thiểu hoặc ghi không rõ */
export function parseMinSpend(text: string): number | undefined {
  const match = text.match(MIN_SPEND_RE);
  return match ? parseMoney(match) : undefined;
}

function discountLabel(discount?: Discount): string {
  if (!discount) return "Ưu đãi";
  if (discount.type === "percent") return `Giảm ${discount.value}%`;
  if (discount.type === "coin") return `Giảm ${formatCompact(discount.value)} Xu`;
  return `Giảm ${formatCompact(discount.value)}`;
}

/** Số tiền tiết kiệm tối đa quy ra VNĐ. Xu và % không có trần thì không biết. */
function maxSaving(discount?: Discount): number | undefined {
  if (!discount) return undefined;
  if (discount.type === "fixed") return discount.value;
  if (discount.type === "percent") return discount.maxValue;
  return undefined;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitShop(name: string): { shopName?: string; title: string } {
  const match = name.match(SHOP_PREFIX_RE);
  if (!match) return { title: name.trim() };
  return { shopName: match[1].trim(), title: name.slice(match[0].length).trim() };
}

/**
 * `content` của Shopee thường lặp lại tên mã (kèm tên shop) hoặc là một đoạn
 * nhiều câu, của Tiki có nhiều dòng điều kiện. Bỏ tên shop ở đầu, tách theo
 * dòng và theo câu (dấu chấm + khoảng trắng + chữ hoa, để không tách "₫3.000").
 */
function parseTerms(content: string, title: string, fallback: string): string[] {
  const seen = new Set<string>();
  const lines = content
    .split(/\r?\n|(?<=\.)\s+(?=\p{Lu})/u)
    .map((line) => {
      let cleaned = line;
      while (SHOP_PREFIX_RE.test(cleaned)) cleaned = cleaned.replace(SHOP_PREFIX_RE, "");
      return cleaned.trim().replace(/\.$/, "");
    })
    .filter((line) => {
      const key = line.toLowerCase();
      if (!line || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (lines.length > 0) return lines;
  const base = (fallback || title).trim();
  return base ? [base] : [];
}

export function mapOffer(offer: RawOffer): CouponRecord | undefined {
  const code = offer.coupons?.[0]?.coupon_code?.trim();
  // Trang này chỉ hiển thị mã giảm giá, bỏ qua khuyến mãi không có mã
  if (!code || !offer.start_time || !offer.end_time) return undefined;

  const { shopName, title } = splitShop(offer.name);
  const description = offer.coupons[0].coupon_desc?.trim() ?? "";
  const discountSource = `${title} ${description}`;
  const discount = parseDiscount(discountSource);

  return {
    id: offer.id,
    storeSlug: offer.merchant,
    shopName,
    shopSlug: shopName ? slugify(shopName) || undefined : undefined,
    title: title || description || offer.name,
    code,
    discount,
    discountLabel: discountLabel(discount),
    maxSaving: maxSaving(discount),
    minSpend: parseMinSpend(discountSource),
    terms: parseTerms(offer.content ?? "", title, description),
    image: offer.image,
    link: offer.link,
    affiliateUrl: offer.aff_link || offer.link,
    startDate: offer.start_time,
    endDate: offer.end_time,
  };
}

/** Đổi URL đích của deep link affiliate, giữ nguyên publisher ID */
export function retargetAffiliateUrl(
  affiliateUrl: string,
  targetUrl: string,
): string | undefined {
  try {
    const url = new URL(affiliateUrl);
    if (!url.searchParams.has("url")) return undefined;
    url.searchParams.set("url", targetUrl);
    return url.toString();
  } catch {
    return undefined;
  }
}
