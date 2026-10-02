import Link from "next/link";
import { Menu, Search, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getStores } from "@/lib/repository";
import { cn } from "@/lib/utils";

export async function Header({ activeHref = "/" }: { activeHref?: string }) {
  const stores = await getStores();
  const navItems = [
    { href: "/", label: "Trang chủ" },
    ...stores.map((store) => ({ href: `/store/${store.slug}`, label: store.name })),
    { href: "/#shops", label: "Shop nổi bật" },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-line-subtle bg-base">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 md:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="size-6 text-brand-500" />
          <span className="text-xl font-bold tracking-tight">SaveHunt</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap text-[15px] font-medium transition-colors",
                item.href === activeHref
                  ? "text-fg"
                  : "text-fg-secondary hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Tìm kiếm"
            className="text-fg-secondary lg:hidden"
          >
            <Search className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Mở menu"
            className="text-fg-secondary lg:hidden"
          >
            <Menu className="size-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
