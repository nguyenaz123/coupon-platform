"use client";

import { Store as StoreIcon, Tag, Warehouse } from "lucide-react";

import { CommandGroup, CommandItem } from "@/components/ui/command";
import type { SearchSuggestion } from "@/lib/types";

const groupLabels: Record<SearchSuggestion["group"], string> = {
  store: "Sàn TMĐT",
  shop: "Shop",
  coupon: "Mã giảm giá",
};

const groupIcons = {
  store: Warehouse,
  shop: StoreIcon,
  coupon: Tag,
} as const;

export function SearchSuggestions({
  keyword,
  suggestions,
  onNavigate,
}: {
  keyword: string;
  suggestions: SearchSuggestion[];
  onNavigate: (href: string) => void;
}) {
  const groups = (["store", "shop", "coupon"] as const)
    .map((group) => ({
      group,
      items: suggestions.filter((item) => item.group === group),
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <>
      {groups.map(({ group, items }) => {
        const Icon = groupIcons[group];
        return (
          <CommandGroup
            key={group}
            heading={groupLabels[group]}
            className="p-0 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-[0.1em] **:[[cmdk-group-heading]]:text-fg-muted"
          >
            {items.map((item) => (
              <CommandItem
                key={`${item.group}-${item.href}`}
                value={`${item.group}-${item.href}`}
                onSelect={() => onNavigate(item.href)}
                className="rounded-chip px-3 py-2.5"
              >
                <Icon className="size-4 text-fg-secondary" />
                <span className="text-[15px]">
                  {highlight(item.label, keyword)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        );
      })}
    </>
  );
}

/** Bôi đậm phần trùng với từ khoá người dùng đang gõ */
function highlight(label: string, keyword: string) {
  const term = keyword.trim();
  const index = label.toLowerCase().indexOf(term.toLowerCase());
  if (!term || index === -1) return label;

  return (
    <>
      {label.slice(0, index)}
      <span className="font-bold text-brand-300">
        {label.slice(index, index + term.length)}
      </span>
      {label.slice(index + term.length)}
    </>
  );
}
