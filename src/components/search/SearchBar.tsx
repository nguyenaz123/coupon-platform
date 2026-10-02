"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { SearchSuggestions } from "@/components/search/SearchSuggestions";
import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { fetchSuggestions } from "@/lib/api-client";
import type { SearchSuggestion } from "@/lib/types";

export function SearchBar({
  placeholder,
  basePath = "/",
  defaultValue = "",
}: {
  placeholder: string;
  /** Trang nhận kết quả tìm kiếm, ví dụ "/store/shopee" để chỉ tìm trong sàn đó */
  basePath?: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const term = keyword.trim();
      if (term.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        setSuggestions(await fetchSuggestions(term, controller.signal));
      } catch {
        // Bỏ qua khi request bị huỷ hoặc lỗi mạng tạm thời
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function submit() {
    const term = keyword.trim();
    router.push(term ? `${basePath}?q=${encodeURIComponent(term)}` : basePath);
    setIsOpen(false);
  }

  const term = keyword.trim();
  const isListOpen = isOpen && term.length >= 2;

  return (
    // shouldFilter=false vì gợi ý đến từ API, cmdk chỉ lo điều hướng bàn phím
    <Command
      shouldFilter={false}
      loop
      className="relative mx-auto h-auto max-w-[640px] overflow-visible bg-transparent p-0 text-left"
    >
      <div ref={containerRef}>
        <div className="relative z-20 flex items-center rounded-control border border-line-subtle bg-raised transition-colors focus-within:border-brand-500 focus-within:shadow-brand">
          <div className="pl-4 pr-3 text-fg-secondary">
            <Search className="size-5" />
          </div>
          <input
            type="search"
            value={keyword}
            placeholder={placeholder}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              // cmdk giữ Enter cho mục đang chọn; khi danh sách đóng thì tự submit
              if (event.key === "Enter" && !isListOpen) submit();
            }}
            onChange={(event) => {
              setKeyword(event.target.value);
              setIsOpen(true);
            }}
            className="h-12 min-w-0 flex-1 border-none bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-muted sm:h-14"
          />
          <div className="p-1.5 sm:p-2">
            <Button
              variant="brand"
              size="sm"
              onClick={submit}
              className="px-3 sm:px-6"
            >
              <span className="sm:hidden">Tìm</span>
              <span className="hidden sm:inline">Tìm mã</span>
            </Button>
          </div>
        </div>

        {isListOpen && (
          <CommandList className="absolute left-0 top-[calc(100%+8px)] z-30 max-h-[380px] w-full rounded-card border border-line-strong bg-popover p-2 shadow-2xl">
            <CommandItem
              value={`search-${term}`}
              onSelect={submit}
              className="rounded-chip px-3 py-2.5 text-[15px]"
            >
              <Search className="size-4 text-fg-secondary" />
              Tìm tất cả mã cho “{term}”
            </CommandItem>

            <SearchSuggestions
              keyword={keyword}
              suggestions={suggestions}
              onNavigate={(href) => {
                setIsOpen(false);
                router.push(href);
              }}
            />
          </CommandList>
        )}
      </div>
    </Command>
  );
}
