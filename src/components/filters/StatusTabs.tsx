import Link from "next/link";

import { SortMenu } from "@/components/filters/SortMenu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CouponSort, CouponStatus } from "@/lib/types";
import { buildHref, type SearchParams } from "@/lib/url";
import { cn } from "@/lib/utils";

const tabs: { status: CouponStatus; label: string }[] = [
  { status: "active", label: "Đang diễn ra" },
  { status: "upcoming", label: "Sắp diễn ra" },
];

/**
 * Trạng thái mã nằm trong URL (?status=) để share link và cho crawler đọc được:
 * mỗi tab là một <Link> lồng trong TabsTrigger, tab đang bật do server quyết định.
 */
export function StatusTabs({
  counts,
  activeStatus = "active",
  activeSort = "newest",
  basePath,
  searchParams,
}: {
  counts: Record<CouponStatus, number>;
  activeStatus?: CouponStatus;
  activeSort?: CouponSort;
  basePath: string;
  searchParams: SearchParams;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <Tabs
        value={activeStatus}
        activationMode="manual"
        className="min-w-0 w-full lg:w-auto"
      >
        <TabsList className="h-auto w-full max-w-full justify-start gap-2 overflow-x-auto rounded-control border border-line-subtle bg-raised p-1.5 hide-scrollbar">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.status}
              value={tab.status}
              asChild
              className={cn(
                "h-10 flex-none rounded-chip px-3 text-[13px] sm:px-4",
                "data-active:brand-gradient data-active:font-semibold data-active:text-white",
                "dark:data-active:border-transparent dark:data-active:bg-transparent",
              )}
            >
              <Link
                href={buildHref(basePath, searchParams, {
                  status: tab.status === "active" ? undefined : tab.status,
                })}
                scroll={false}
              >
                {tab.label} ({counts[tab.status]})
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SortMenu value={activeSort} />
    </div>
  );
}
