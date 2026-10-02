import Link from "next/link";

import { StoreLogo } from "@/components/ui/StoreLogo";
import { formatExpiry } from "@/lib/format";
import type { Coupon } from "@/lib/types";

export function RelatedCoupons({
  coupons,
  title,
}: {
  coupons: Coupon[];
  title: string;
}) {
  if (coupons.length === 0) return null;

  return (
    <div className="rounded-card border border-line-subtle bg-raised p-5">
      <h3 className="mb-4 text-[16px] font-bold">{title}</h3>
      <ul className="flex flex-col gap-4">
        {coupons.map((coupon) => (
          <li key={coupon.id}>
            <Link href={`/coupon/${coupon.id}`} className="flex items-start gap-3">
              <StoreLogo name={coupon.shopName ?? coupon.title} image={coupon.image} />
              <span className="min-w-0">
                <span className="line-clamp-2 text-[13px] font-semibold transition-colors hover:text-brand-300">
                  {coupon.title}
                </span>
                <span className="mt-1 block text-[12px] text-fg-muted">
                  {coupon.shopName ? `${coupon.shopName} · ` : ""}
                  {coupon.status === "upcoming" ? "Sắp diễn ra" : formatExpiry(coupon.endDate)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
