import Link from "next/link";
import { X } from "lucide-react";

import { CouponGrid } from "@/components/coupon/CouponGrid";
import { BrandFilter } from "@/components/filters/BrandFilter";
import { Pagination } from "@/components/filters/Pagination";
import { ShopGrid } from "@/components/filters/ShopGrid";
import { StatusTabs } from "@/components/filters/StatusTabs";
import { FlashDeals } from "@/components/home/FlashDeals";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { SyncNotice } from "@/components/layout/SyncNotice";
import {
  countByStatus,
  getCoupons,
  getExpiringSoon,
  getStores,
  getSyncInfo,
  getTopShops,
} from "@/lib/repository";
import { buildHref, parseCouponQuery, type SearchParams } from "@/lib/url";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { query, page } = parseCouponQuery(params);

  const [stores, topShops, expiring, result, counts, syncInfo] = await Promise.all([
    getStores(),
    getTopShops(undefined, 12),
    getExpiringSoon(),
    getCoupons(query, page),
    countByStatus({ search: query.search, shop: query.shop }),
    getSyncInfo(),
  ]);

  const storeBySlug = new Map(stores.map((store) => [store.slug, store]));
  const totalCoupons = stores.reduce((sum, store) => sum + store.couponCount, 0);
  const totalShops = stores.reduce((sum, store) => sum + store.shopCount, 0);

  return (
    <>
      <Header activeHref="/" />

      <div className="pb-20 md:pb-0">
        <Hero
          couponCount={totalCoupons}
          storeNames={stores.map((store) => store.name)}
          topShops={topShops.slice(0, 6)}
        />

        <main className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-10">
          <SyncNotice syncInfo={syncInfo} />

          <section className="mb-12">
            <BrandFilter stores={stores} />
          </section>

          {!query.search && <FlashDeals coupons={expiring} storeBySlug={storeBySlug} />}

          <section id="coupons" className="mb-16 scroll-mt-24">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <h2 className="text-[22px] font-bold leading-[1.2] sm:text-[28px]">
                {query.search ? `Kết quả cho “${query.search}”` : "Tất cả mã giảm giá"}
              </h2>
              {query.search && (
                <Link
                  href={buildHref("/", params, { q: undefined })}
                  className="flex h-8 items-center gap-1 rounded-chip border border-line-subtle bg-raised px-3 text-[13px] text-fg-secondary hover:border-line-strong hover:text-fg"
                >
                  <X className="size-3.5" /> Xoá tìm kiếm
                </Link>
              )}
            </div>
            <StatusTabs
              counts={counts}
              activeStatus={query.status}
              activeSort={query.sort}
              basePath="/"
              searchParams={params}
            />
            <CouponGrid coupons={result.items} storeBySlug={storeBySlug} />
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              basePath="/"
              searchParams={params}
            />
          </section>

          {topShops.length > 0 && (
            <section id="shops" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-[22px] font-bold leading-[1.2] sm:text-[28px]">
                Shop nhiều mã nhất
              </h2>
              <ShopGrid shops={topShops} storeBySlug={storeBySlug} />
            </section>
          )}

          <TrustBar
            couponCount={totalCoupons}
            shopCount={totalShops}
            syncInfo={syncInfo}
          />
        </main>

        <Footer />
      </div>

      <MobileBottomBar href="/#coupons" />
    </>
  );
}
