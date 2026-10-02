"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownWideNarrow, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CouponSort } from "@/lib/types";

const options: { value: CouponSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "expiring", label: "Sắp hết hạn" },
  { value: "saving", label: "Giảm nhiều nhất" },
  { value: "min-spend", label: "Đơn tối thiểu thấp" },
];

export function SortMenu({ value }: { value: CouponSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = options.find((option) => option.value === value) ?? options[0];

  function select(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "newest") params.delete("sort");
    else params.set("sort", next);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between border-line-subtle bg-raised text-[13px] font-medium text-fg-secondary hover:border-line-strong lg:w-[200px]"
        >
          <span className="flex items-center gap-2">
            <ArrowDownWideNarrow className="size-4" />
            {current.label}
          </span>
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuRadioGroup value={current.value} onValueChange={select}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
