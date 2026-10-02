import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MobileBottomBar({
  label = "Săn mã ngay",
  href = "/#coupons",
}: {
  label?: string;
  href?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-subtle bg-raised p-4 md:hidden">
      <Button asChild variant="brand" size="lg" className="w-full">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
