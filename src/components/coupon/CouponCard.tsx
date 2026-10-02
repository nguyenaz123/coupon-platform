import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { CouponCodeReveal } from "@/components/coupon/CouponCodeReveal";
import { Badge } from "@/components/ui/badge";
import { StoreLogo } from "@/components/ui/StoreLogo";
import { daysUntil, formatCompact, formatExpiry, formatShortDate } from "@/lib/format";
import type { Coupon, Store } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Tiêu đề ngắn dựng từ mức giảm đã tách ("Giảm 10% tối đa 500K"). Tên mã
 * gốc vốn đã ghi kèm điều kiện nên dài; không tách được thì dùng tên gốc.
 */
function couponHeadline(coupon: Coupon): string {
  const { discount } = coupon;
  if (!discount) return coupon.title;
  if (discount.type === "percent" && discount.maxValue) {
    return `${coupon.discountLabel} tối đa ${formatCompact(discount.maxValue)}`;
  }
  return coupon.discountLabel;
}

function couponCondition(coupon: Coupon): string | undefined {
  if (coupon.minSpend === undefined) return coupon.discount ? undefined : coupon.terms[1];
  return coupon.minSpend > 0
    ? `Đơn tối thiểu ${formatCompact(coupon.minSpend)}`
    : "Không yêu cầu đơn tối thiểu";
}

export function CouponCard({ coupon, store }: { coupon: Coupon; store: Store }) {
  const isUpcoming = coupon.status === "upcoming";
  const isEndingSoon = !isUpcoming && daysUntil(coupon.endDate) <= 1;
  const condition = couponCondition(coupon);

  return (
    <article
      className={cn(
        "flex flex-col rounded-card border border-line-subtle bg-raised transition-all duration-200",
        isUpcoming
          ? "opacity-70"
          : "hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-brand",
      )}
    >
      <div className="flex-1 p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <StoreLogo name={coupon.shopName ?? store.name} image={coupon.image} />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-fg">
                {coupon.shopName ?? store.name}
              </span>
              {coupon.shopName && (
                <span className="block truncate text-[11px] text-fg-muted">
                  {store.name}
                </span>
              )}
            </span>
          </div>
          {isUpcoming && (
            <Badge variant="warning" className="shrink-0">
              Sắp diễn ra
            </Badge>
          )}
        </div>

        <h3 className="mb-1 line-clamp-2 text-[20px] font-bold leading-[1.3]">
          <Link
            href={`/coupon/${coupon.id}`}
            title={coupon.title}
            className={coupon.discount ? "brand-text" : "hover:text-brand-300"}
          >
            {couponHeadline(coupon)}
          </Link>
        </h3>
        {condition && (
          <p className="truncate text-[13px] text-fg-secondary">{condition}</p>
        )}
      </div>

      <div className="coupon-cutout dashed-line p-4">
        <div className="mb-4">
          <CouponCodeReveal coupon={coupon} storeName={store.name} />
        </div>

        <span
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]",
            isUpcoming ? "text-warning" : isEndingSoon ? "text-danger" : "text-fg-muted",
          )}
        >
          <CalendarClock className="size-3.5" />
          {isUpcoming
            ? `Bắt đầu ${formatShortDate(coupon.startDate)}`
            : formatExpiry(coupon.endDate)}
        </span>
      </div>
    </article>
  );
}
