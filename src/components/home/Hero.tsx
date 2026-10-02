import Link from "next/link";

import { SearchBar } from "@/components/search/SearchBar";
import { formatCount } from "@/lib/format";
import type { Shop } from "@/lib/types";

export function Hero({
  couponCount,
  storeNames,
  topShops,
}: {
  couponCount: number;
  storeNames: string[];
  topShops: Shop[];
}) {
  return (
    <section className="relative overflow-x-clip px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20 lg:px-10">
      {/* Glow cần overflow-hidden riêng, nếu đặt trên section thì dropdown gợi ý bị cắt */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 hidden size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 opacity-15 blur-[100px] lg:block" />
      </div>

      <div className="relative z-10 mx-auto max-w-[800px] text-center">
        <h1 className="mb-4 text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.05]">
          Săn mã giảm giá{" "}
          <span className="brand-text">rẻ hơn mỗi ngày</span>
        </h1>
        <p className="mb-10 text-[15px] text-fg-secondary">
          {formatCount(couponCount)} mã giảm giá đang có
          {storeNames.length > 0 && ` trên ${storeNames.join(", ")}`}. Tìm theo tên
          shop hoặc nội dung mã.
        </p>

        <div className="mb-6">
          <SearchBar placeholder="Tìm shop hoặc mã (ví dụ: Official Store, giảm 50K...)" />
        </div>

        {topShops.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {topShops.map((shop) => (
              <Link
                key={`${shop.storeSlug}-${shop.slug}`}
                href={`/store/${shop.storeSlug}?shop=${shop.slug}`}
                className="flex h-8 max-w-full items-center rounded-chip border border-line-subtle bg-raised px-3 text-[13px] text-fg-secondary transition-colors hover:border-line-strong"
              >
                <span className="truncate">{shop.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
