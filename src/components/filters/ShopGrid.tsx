import Link from "next/link";

import { StoreLogo } from "@/components/ui/StoreLogo";
import type { Shop, Store } from "@/lib/types";

/** Shop có nhiều mã nhất, tên shop tách từ tên mã của AccessTrade */
export function ShopGrid({
  shops,
  storeBySlug,
}: {
  shops: Shop[];
  storeBySlug: Map<string, Store>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {shops.map((shop) => (
        <Link
          key={`${shop.storeSlug}-${shop.slug}`}
          href={`/store/${shop.storeSlug}?shop=${shop.slug}`}
          className="flex min-w-0 items-center gap-3 rounded-card border border-line-subtle bg-raised p-3 transition-all duration-200 hover:border-brand-500/40 hover:shadow-brand sm:p-4"
        >
          <StoreLogo name={shop.name} image={shop.image} size="lg" />
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold sm:text-[15px]">
              {shop.name}
            </span>
            <span className="block text-[12px] text-fg-secondary sm:text-[13px]">
              {shop.couponCount} mã · {storeBySlug.get(shop.storeSlug)?.name ?? shop.storeSlug}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
