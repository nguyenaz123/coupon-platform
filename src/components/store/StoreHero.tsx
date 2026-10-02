import { ExternalLink } from "lucide-react";

import { StoreLogo } from "@/components/ui/StoreLogo";
import { formatCount, formatTimeAgo } from "@/lib/format";
import type { Shop, Store, SyncInfo } from "@/lib/types";

export function StoreHero({
  store,
  shop,
  syncInfo,
}: {
  store: Store;
  /** Đang lọc theo một shop trong sàn */
  shop?: Shop;
  syncInfo: SyncInfo;
}) {
  return (
    <section className="mb-8 rounded-panel border border-line-subtle bg-raised p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <StoreLogo
          name={shop?.name ?? store.name}
          image={shop?.image ?? store.logo}
          size="xl"
        />

        <div className="flex-1">
          <h1 className="mb-2 text-[22px] font-bold leading-[1.2] sm:text-[28px]">
            Mã giảm giá {shop ? shop.name : store.name}
          </h1>
          <p className="max-w-[560px] text-[13px] text-fg-secondary">
            {shop
              ? `${formatCount(shop.couponCount)} mã từ shop ${shop.name} trên ${store.name}.`
              : `${formatCount(store.couponCount)} mã từ ${formatCount(store.shopCount)} shop trên ${store.name}.`}{" "}
            Mã chỉ áp dụng cho sản phẩm của shop phát hành.
          </p>
        </div>

        {store.affiliateUrl && (
          <a
            href={store.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-gradient flex h-12 shrink-0 items-center justify-center gap-2 rounded-control px-6 text-[15px] font-semibold text-white shadow-brand"
          >
            Tới {store.name}
            <ExternalLink className="size-[18px]" />
          </a>
        )}
      </div>

      <div className="dashed-line mt-6 grid grid-cols-3 gap-2 pt-6 sm:gap-4">
        <Stat
          value={formatCount(shop?.couponCount ?? store.couponCount)}
          label="mã đang có"
          tone="brand"
        />
        <Stat
          value={formatCount(store.shopCount)}
          label={`shop trên ${store.name}`}
          tone="plain"
        />
        <Stat value={formatTimeAgo(syncInfo.syncedAt)} label="cập nhật" tone="plain" />
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "brand" | "plain";
}) {
  return (
    <div className="min-w-0">
      <p
        className={`truncate font-mono text-[18px] font-semibold sm:text-[24px] ${tone === "brand" ? "brand-text" : "text-fg"}`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-fg-secondary sm:text-[13px]">{label}</p>
    </div>
  );
}
