import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { StoreLogo } from "@/components/ui/StoreLogo";
import { formatCount } from "@/lib/format";
import type { Store } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Các sàn đang có mã trong dữ liệu AccessTrade */
export function BrandFilter({
  stores,
  activeSlug,
}: {
  stores: Store[];
  activeSlug?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stores.map((store) => {
        const isActive = store.slug === activeSlug;
        return (
          <Link
            key={store.slug}
            href={`/store/${store.slug}`}
            className={cn(
              "flex items-center gap-4 rounded-card border p-4 transition-colors",
              isActive
                ? "border-brand-500 bg-brand-500/12"
                : "border-line-subtle bg-raised hover:border-line-strong",
            )}
          >
            <StoreLogo name={store.name} image={store.logo} size="lg" />
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold">{store.name}</span>
              <span className="block text-[13px] text-fg-secondary">
                {formatCount(store.couponCount)} mã · {formatCount(store.shopCount)} shop
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-fg-muted" />
          </Link>
        );
      })}
    </div>
  );
}
