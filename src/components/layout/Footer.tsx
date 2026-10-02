import Link from "next/link";
import { Zap } from "lucide-react";

import { getStores, getTopShops } from "@/lib/repository";

export async function Footer() {
  const [stores, shops] = await Promise.all([getStores(), getTopShops(undefined, 5)]);
  const storeLinks = stores.map((store) => ({
    href: `/store/${store.slug}`,
    label: `Mã giảm giá ${store.name}`,
  }));
  const shopLinks = shops.map((shop) => ({
    href: `/store/${shop.storeSlug}?shop=${shop.slug}`,
    label: shop.name,
  }));

  return (
    <footer className="mt-8 border-t border-line-subtle">
      <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 lg:px-10">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Zap className="size-6 text-brand-500" />
              <span className="text-xl font-bold tracking-tight">SaveHunt</span>
            </div>
            <p className="mb-4 text-[13px] text-fg-secondary">
              Tổng hợp mã giảm giá từ các sàn TMĐT qua AccessTrade, cập nhật liên
              tục trong ngày.
            </p>
          </div>

          <FooterColumn title="Sàn TMĐT" links={storeLinks} />
          <FooterColumn title="Shop nhiều mã nhất" links={shopLinks} />
        </div>

        <div className="dashed-line flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-fg-muted">
            © 2026 SaveHunt. Mọi thương hiệu được đề cập thuộc về chủ sở hữu
            tương ứng.
          </p>
          <p className="text-[13px] text-fg-muted">
            SaveHunt có thể nhận hoa hồng affiliate khi bạn mua hàng qua liên kết
            trên trang.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] text-fg-secondary transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
