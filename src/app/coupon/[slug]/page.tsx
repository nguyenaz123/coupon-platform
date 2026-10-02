import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BadgePercent,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

import { CouponCodeReveal } from "@/components/coupon/CouponCodeReveal";
import { CouponTabs } from "@/components/coupon-detail/CouponTabs";
import { RelatedCoupons } from "@/components/coupon-detail/RelatedCoupons";
import { StoreInfoCard } from "@/components/coupon-detail/StoreInfoCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoreLogo } from "@/components/ui/StoreLogo";
import { formatDate, formatExpiry, formatMoney } from "@/lib/format";
import { getCoupon, getRelatedCoupons, getStore } from "@/lib/repository";
import type { Coupon } from "@/lib/types";

interface CouponPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CouponPageProps): Promise<Metadata> {
  const { slug } = await params;
  const coupon = await getCoupon(slug);

  if (!coupon) return { title: "Không tìm thấy mã — SaveHunt" };
  return {
    title: `${coupon.shopName ? `${coupon.shopName}: ` : ""}${coupon.title} — SaveHunt`,
  };
}

export default async function CouponPage({ params }: CouponPageProps) {
  const { slug } = await params;

  const coupon = await getCoupon(slug);
  if (!coupon) notFound();

  const store = await getStore(coupon.storeSlug);
  if (!store) notFound();

  const related = await getRelatedCoupons(coupon);
  const hasSameShop = related.some((item) => item.shopSlug && item.shopSlug === coupon.shopSlug);
  const isUpcoming = coupon.status === "upcoming";

  return (
    <>
      <Header activeHref={`/store/${store.slug}`} />

      <div className="pb-24 md:pb-0">
        <main className="mx-auto max-w-[1280px] px-4 pt-6 md:px-6 lg:px-10">
          <nav className="mb-6 flex min-w-0 items-center gap-2 overflow-hidden text-[13px] text-fg-secondary">
            <Link href="/" className="shrink-0 hover:text-fg">
              Trang chủ
            </Link>
            <ChevronRight className="size-3.5 shrink-0 text-fg-muted" />
            <Link href={`/store/${store.slug}`} className="shrink-0 hover:text-fg">
              {store.name}
            </Link>
            {coupon.shopName && coupon.shopSlug && (
              <>
                <ChevronRight className="size-3.5 shrink-0 text-fg-muted" />
                <Link
                  href={`/store/${store.slug}?shop=${coupon.shopSlug}`}
                  className="truncate hover:text-fg"
                >
                  {coupon.shopName}
                </Link>
              </>
            )}
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <section className="rounded-panel border border-line-subtle bg-raised p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <StoreLogo
                    name={coupon.shopName ?? store.name}
                    image={coupon.image}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-fg-secondary">
                      {coupon.shopName ? `${coupon.shopName} · ${store.name}` : store.name}
                    </p>
                    <Badge variant={isUpcoming ? "warning" : "brand"}>
                      {isUpcoming ? "Sắp diễn ra" : coupon.discountLabel}
                    </Badge>
                  </div>
                </div>

                <h1 className="mb-6 text-[24px] font-bold leading-[1.2] md:text-[32px]">
                  {coupon.title}
                </h1>

                <dl className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {couponFacts(coupon).map((fact) => (
                    <Fact key={fact.label} {...fact} />
                  ))}
                </dl>

                <div className="hidden rounded-control border border-line-subtle bg-base p-4 md:block">
                  <CouponCodeReveal coupon={coupon} storeName={store.name} size="lg" />
                  <p className="mt-3 text-[13px] text-fg-muted">
                    {isUpcoming
                      ? `Mã dùng được từ ngày ${formatDate(coupon.startDate)}.`
                      : `Mã đã bị ẩn một phần, bấm “Xem mã” để hiện đầy đủ và mở trang mã trên ${store.name}.`}
                  </p>
                </div>
              </section>

              <CouponTabs terms={coupon.terms} />
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
              <Button asChild variant="brand" size="lg">
                <a href={coupon.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  Tới trang mã trên {store.name}
                  <ExternalLink className="size-[18px]" />
                </a>
              </Button>

              <StoreInfoCard store={store} />
              <RelatedCoupons
                coupons={related}
                title={hasSameShop ? `Mã khác của ${coupon.shopName}` : `Mã khác trên ${store.name}`}
              />
            </aside>
          </div>
        </main>

        <Footer />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-subtle bg-raised p-3 md:hidden">
        <CouponCodeReveal coupon={coupon} storeName={store.name} />
      </div>
    </>
  );
}

interface FactItem {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "danger";
}

/** Thông tin đều lấy từ response AccessTrade hoặc tách từ tên mã */
function couponFacts(coupon: Coupon): FactItem[] {
  const facts: FactItem[] = [
    {
      icon: CalendarDays,
      label: "Thời gian áp dụng",
      value: `${formatDate(coupon.startDate)} – ${formatDate(coupon.endDate)}`,
    },
  ];

  if (coupon.status === "active") {
    const expiry = formatExpiry(coupon.endDate);
    facts.push({
      icon: CalendarClock,
      label: "Hạn dùng",
      value: expiry,
      tone: expiry.startsWith("Hết hạn") ? "danger" : undefined,
    });
  }

  if (coupon.minSpend !== undefined) {
    facts.push({
      icon: ShoppingCart,
      label: "Đơn tối thiểu",
      value: coupon.minSpend > 0 ? formatMoney(coupon.minSpend) : "Không yêu cầu",
    });
  }

  if (coupon.discount?.type === "percent") {
    facts.push({
      icon: BadgePercent,
      label: "Giảm tối đa",
      value: coupon.discount.maxValue ? formatMoney(coupon.discount.maxValue) : "Không ghi rõ",
    });
  }

  return facts;
}

function Fact({ icon: Icon, label, value, tone }: FactItem) {
  return (
    <div className="flex items-center gap-3 rounded-control border border-line-subtle bg-base px-4 py-3">
      <Icon className="size-5 shrink-0 text-brand-400" />
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
          {label}
        </dt>
        <dd
          className={`truncate text-[15px] font-semibold ${tone === "danger" ? "text-danger" : "text-fg"}`}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}
