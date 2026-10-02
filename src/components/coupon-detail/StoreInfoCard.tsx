import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { StoreLogo } from "@/components/ui/StoreLogo";
import { formatCount } from "@/lib/format";
import type { Store } from "@/lib/types";

export function StoreInfoCard({ store }: { store: Store }) {
  return (
    <div className="rounded-card border border-line-subtle bg-raised p-5">
      <div className="mb-4 flex items-center gap-3">
        <StoreLogo name={store.name} image={store.logo} size="lg" />
        <div>
          <h3 className="text-[16px] font-bold">{store.name}</h3>
          <p className="text-[13px] text-fg-secondary">
            {formatCount(store.shopCount)} shop đang phát mã
          </p>
        </div>
      </div>

      <p className="dashed-line pt-4 text-[13px] text-fg-secondary">
        Tổng số mã đang có:{" "}
        <span className="font-mono font-semibold text-fg">
          {formatCount(store.couponCount)}
        </span>
      </p>

      <Link
        href={`/store/${store.slug}`}
        className="mt-4 flex h-11 items-center justify-center gap-1 rounded-control border border-line-strong text-[13px] font-semibold text-fg transition-colors hover:bg-overlay"
      >
        Xem tất cả mã {store.name}
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
