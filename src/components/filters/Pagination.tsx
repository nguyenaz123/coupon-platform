import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buildHref, type SearchParams } from "@/lib/url";
import { cn } from "@/lib/utils";

/** Các số trang hiển thị quanh trang hiện tại, `null` là dấu "…" */
function pageItems(page: number, pageCount: number): (number | null)[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((item) => item >= 1 && item <= pageCount).sort((a, b) => a - b);

  return sorted.flatMap((item, index) =>
    index > 0 && item - sorted[index - 1] > 1 ? [null, item] : [item],
  );
}

export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams: SearchParams;
}) {
  if (pageCount <= 1) return null;

  const hrefFor = (target: number) =>
    buildHref(basePath, searchParams, { page: target > 1 ? String(target) : undefined });

  const arrowClass =
    "flex size-10 items-center justify-center rounded-chip border border-line-subtle bg-raised text-fg-secondary transition-colors hover:border-line-strong hover:text-fg";

  return (
    <nav aria-label="Phân trang" className="mt-8 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="Trang trước" className={arrowClass}>
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(arrowClass, "pointer-events-none opacity-40")}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pageItems(page, pageCount).map((item, index) =>
        item === null ? (
          <span key={`gap-${index}`} className="px-1 text-fg-muted">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "flex h-10 min-w-10 items-center justify-center rounded-chip px-3 font-mono text-[13px] font-semibold transition-colors",
              item === page
                ? "brand-gradient text-white"
                : "border border-line-subtle bg-raised text-fg-secondary hover:border-line-strong hover:text-fg",
            )}
          >
            {item}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} aria-label="Trang sau" className={arrowClass}>
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(arrowClass, "pointer-events-none opacity-40")}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
