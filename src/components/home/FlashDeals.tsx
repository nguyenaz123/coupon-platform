import Link from "next/link";
import { ChevronRight, Hourglass } from "lucide-react";

import { CouponGrid } from "@/components/coupon/CouponGrid";
import { formatExpiry } from "@/lib/format";
import type { Coupon, Store } from "@/lib/types";

/** Mã hết hạn sớm nhất, ưu tiên mã giảm nhiều */
export function FlashDeals({
  coupons,
  storeBySlug,
}: {
  coupons: Coupon[];
  storeBySlug: Map<string, Store>;
}) {
  if (coupons.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-[22px] font-bold leading-[1.2] sm:text-[28px]">
            Dùng ngay kẻo lỡ
          </h2>
          <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-chip bg-danger/15 px-2.5">
            <Hourglass className="size-[13px] text-danger" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-danger">
              {formatExpiry(coupons[0].endDate)}
            </span>
          </span>
        </div>

        <Link
          href="/?sort=expiring"
          className="flex shrink-0 items-center gap-1 self-start text-[15px] font-medium text-brand-400 transition-colors hover:text-brand-300 sm:self-auto"
        >
          Xem tất cả <ChevronRight className="size-4" />
        </Link>
      </div>

      <CouponGrid coupons={coupons} storeBySlug={storeBySlug} />
    </section>
  );
}
