import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { X } from "lucide-react";

import { CouponGrid } from "@/components/coupon/CouponGrid";
import { BrandFilter } from "@/components/filters/BrandFilter";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { Pagination } from "@/components/filters/Pagination";
import { StatusTabs } from "@/components/filters/StatusTabs";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { SyncNotice } from "@/components/layout/SyncNotice";
import { SearchBar } from "@/components/search/SearchBar";
import { HowToUse } from "@/components/store/HowToUse";
import { StoreHero } from "@/components/store/StoreHero";
import {
  countByStatus,
  getCoupons,
  getShop,
  getStore,
  getStores,
  getSyncInfo,
  getTopShops,
} from "@/lib/repository";
import { buildHref, firstParam, parseCouponQuery, type SearchParams } from "@/lib/url";

interface StorePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  params,
  searchParams,
}: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const shopSlug = firstParam((await searchParams).shop);
  const [store, shop] = await Promise.all([
    getStore(slug),
    shopSlug ? getShop(shopSlug, slug) : undefined,
  ]);

  if (!store) return { title: "Không tìm thấy sàn — SaveHunt" };
  return {
    title: shop
      ? `Mã giảm giá ${shop.name} trên ${store.name} — SaveHunt`
      : `Mã giảm giá ${store.name} mới nhất — SaveHunt`,
  };
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { slug } = await params;
  const currentParams = await searchParams;
  const { query, page } = parseCouponQuery(currentParams);
  const basePath = `/store/${slug}`;

  const store = await getStore(slug);
  if (!store) notFound();

  const [stores, shops, shop, result, counts, syncInfo] = await Promise.all([
    getStores(),
    getTopShops(slug, 10),
    query.shop ? getShop(query.shop, slug) : undefined,
    getCoupons({ ...query, store: slug }, page),
    countByStatus({ store: slug, shop: query.shop, search: query.search }),
    getSyncInfo(),
  ]);

  const storeBySlug = new Map(stores.map((item) => [item.slug, item]));
  const otherStores = stores.filter((item) => item.slug !== slug);

  return (
    <>
      <Header activeHref={basePath} />

      <div className="pb-20 md:pb-0">
        <main className="mx-auto max-w-[1280px] px-4 pt-8 md:px-6 lg:px-10">
          <SyncNotice syncInfo={syncInfo} />
          <StoreHero store={store} shop={shop} syncInfo={syncInfo} />

          <div className="mb-6">
            <SearchBar
              key={query.search ?? ""}
              placeholder={`Tìm shop hoặc mã trong ${store.name}...`}
              basePath={basePath}
              defaultValue={query.search}
            />
          </div>

          {(query.search || query.shop) && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-[13px]">
              {query.search && (
                <FilterChip
                  label={`Từ khoá: ${query.search}`}
                  href={buildHref(basePath, currentParams, { q: undefined })}
                />
              )}
              {query.shop && (
                <FilterChip
                  label={`Shop: ${shop?.name ?? query.shop}`}
                  href={buildHref(basePath, currentParams, { shop: undefined })}
                />
              )}
            </div>
          )}

          <StatusTabs
            counts={counts}
            activeStatus={query.status}
            activeSort={query.sort}
            basePath={basePath}
            searchParams={currentParams}
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <FilterSidebar shops={shops} />

            <div className="min-w-0 flex-1">
              <p className="mb-4 text-[13px] text-fg-secondary">
                {result.total.toLocaleString("vi-VN")} mã phù hợp
              </p>
              <CouponGrid
                coupons={result.items}
                storeBySlug={storeBySlug}
                columns={2}
              />
              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                basePath={basePath}
                searchParams={currentParams}
              />
            </div>
          </div>

          <HowToUse storeName={store.name} />

          {otherStores.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 text-[22px] font-bold leading-[1.2] sm:text-[28px]">
                Sàn khác
              </h2>
              <BrandFilter stores={otherStores} />
            </section>
          )}
        </main>

        <Footer />
      </div>

      <MobileBottomBar
        label={`Xem ${store.couponCount.toLocaleString("vi-VN")} mã ${store.name}`}
        href={basePath}
      />
    </>
  );
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      className="flex h-8 max-w-full items-center gap-1.5 rounded-chip border border-brand-500/40 bg-brand-500/12 px-3 text-brand-300 hover:border-brand-500"
    >
      <span className="truncate">{label}</span>
      <X className="size-3.5 shrink-0" />
    </Link>
  );
}
