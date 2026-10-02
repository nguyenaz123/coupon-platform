"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Shop } from "@/lib/types";
import { cn } from "@/lib/utils";

const filterKeys = ["type", "saving", "minspend", "shop"] as const;

const discountTypes = [
  { value: "percent", label: "Giảm theo %" },
  { value: "fixed", label: "Giảm số tiền" },
  { value: "coin", label: "Giảm Xu" },
];

const savingRanges = [
  { value: "0-20000", label: "Dưới 20K" },
  { value: "20000-50000", label: "20K - 50K" },
  { value: "50000-100000", label: "50K - 100K" },
  { value: "100000-", label: "Trên 100K" },
];

const minSpendRanges = [
  { value: "0-0", label: "Không yêu cầu" },
  { value: "1-100000", label: "Dưới 100K" },
  { value: "100000-300000", label: "100K - 300K" },
  { value: "300000-", label: "Trên 300K" },
];

export function FilterSidebar({ shops }: { shops: Shop[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeCount = filterKeys.filter((key) => searchParams.get(key)).length;

  function navigate(params: URLSearchParams) {
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  /** Bấm lại lựa chọn đang bật để bỏ lọc */
  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) params.delete(key);
    else params.set(key, value);
    navigate(params);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    filterKeys.forEach((key) => params.delete(key));
    navigate(params);
  }

  // Bộ lọc xuất hiện ở cả drawer mobile và sidebar desktop nên id phải khác nhau
  const renderGroups = (scope: string) => (
    <>
      <FilterGroup title="Loại giảm">
        {discountTypes.map((option) => (
          <FilterOption
            key={option.value}
            id={`${scope}-type-${option.value}`}
            label={option.label}
            checked={searchParams.get("type") === option.value}
            onSelect={() => toggle("type", option.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Giảm tối đa">
        {savingRanges.map((range) => (
          <FilterOption
            key={range.value}
            id={`${scope}-saving-${range.value}`}
            label={range.label}
            checked={searchParams.get("saving") === range.value}
            onSelect={() => toggle("saving", range.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Đơn tối thiểu">
        {minSpendRanges.map((range) => (
          <FilterOption
            key={range.value}
            id={`${scope}-minspend-${range.value}`}
            label={range.label}
            checked={searchParams.get("minspend") === range.value}
            onSelect={() => toggle("minspend", range.value)}
          />
        ))}
      </FilterGroup>

      {shops.length > 0 && (
        <FilterGroup title="Shop nhiều mã nhất">
          {shops.map((shop) => (
            <FilterOption
              key={shop.slug}
              id={`${scope}-shop-${shop.slug}`}
              label={`${shop.name} (${shop.couponCount})`}
              checked={searchParams.get("shop") === shop.slug}
              onSelect={() => toggle("shop", shop.slug)}
            />
          ))}
        </FilterGroup>
      )}

      <Button
        variant="outline"
        onClick={clearAll}
        className="w-full text-[13px] text-fg-secondary hover:text-fg"
      >
        Xoá bộ lọc
      </Button>
    </>
  );

  return (
    <>
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="w-full bg-raised lg:hidden"
          >
            <SlidersHorizontal className="size-[18px]" />
            Bộ lọc{activeCount > 0 && ` (${activeCount})`}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto rounded-t-panel border-t border-line-strong bg-base p-5"
        >
          <SheetHeader className="p-0">
            <SheetTitle className="text-[18px] font-bold">Bộ lọc</SheetTitle>
          </SheetHeader>
          {renderGroups("drawer")}
        </SheetContent>
      </Sheet>

      <aside className="sticky top-24 hidden w-[260px] shrink-0 lg:block">
        {renderGroups("sidebar")}
      </aside>
    </>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-card border border-line-subtle bg-raised p-5">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
        {title}
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FilterOption({
  id,
  label,
  checked,
  onSelect,
}: {
  id: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onSelect}
        className="size-[18px] data-checked:border-transparent data-checked:brand-gradient"
      />
      <Label
        htmlFor={id}
        className={cn(
          "text-[13px] font-normal",
          checked ? "text-fg" : "text-fg-secondary",
        )}
      >
        {label}
      </Label>
    </div>
  );
}
