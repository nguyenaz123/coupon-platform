import { CouponCard } from "@/components/coupon/CouponCard";
import { cn } from "@/lib/utils";
import type { Coupon, Store } from "@/lib/types";

export function CouponGrid({
  coupons,
  storeBySlug,
  columns = 4,
}: {
  coupons: Coupon[];
  storeBySlug: Map<string, Store>;
  columns?: 2 | 4;
}) {
  if (coupons.length === 0) {
    return (
      <p className="rounded-card border border-line-subtle bg-raised p-8 text-center text-[15px] text-fg-secondary">
        Không có mã nào khớp bộ lọc hiện tại.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:gap-6",
        columns === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-2",
      )}
    >
      {coupons.map((coupon) => {
        const store = storeBySlug.get(coupon.storeSlug);
        if (!store) return null;
        return <CouponCard key={coupon.id} coupon={coupon} store={store} />;
      })}
    </div>
  );
}
