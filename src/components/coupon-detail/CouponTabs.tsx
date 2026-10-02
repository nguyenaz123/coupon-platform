import { Check } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const guideSteps = [
  "Bấm XEM MÃ rồi copy đoạn mã vừa hiện ra.",
  "Mở ứng dụng hoặc website của sàn ở tab đã được mở sẵn.",
  "Dán mã vào ô Voucher tại bước thanh toán và kiểm tra số tiền giảm.",
];

export function CouponTabs({ terms }: { terms: string[] }) {
  return (
    <Tabs
      defaultValue="terms"
      className="gap-6 rounded-panel border border-line-subtle bg-raised p-6"
    >
      <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 hide-scrollbar">
        <TabsTrigger
          value="terms"
          className="h-10 flex-none rounded-chip px-4 text-[13px] data-active:brand-gradient data-active:font-semibold data-active:text-white dark:data-active:border-transparent dark:data-active:bg-transparent"
        >
          Điều kiện áp dụng
        </TabsTrigger>
        <TabsTrigger
          value="guide"
          className="h-10 flex-none rounded-chip px-4 text-[13px] data-active:brand-gradient data-active:font-semibold data-active:text-white dark:data-active:border-transparent dark:data-active:bg-transparent"
        >
          Hướng dẫn dùng
        </TabsTrigger>
      </TabsList>

      <TabsContent value="terms">
        <ul className="flex flex-col gap-3">
          {terms.map((term) => (
            <li
              key={term}
              className="flex items-start gap-2 text-[15px] text-fg-secondary"
            >
              <Check className="mt-1 size-4 shrink-0 text-success" />
              {term}
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="guide">
        <ol className="flex flex-col gap-4">
          {guideSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-chip bg-brand-500/12 font-mono text-[15px] font-semibold text-brand-400">
                {index + 1}
              </span>
              <p className="text-[15px] text-fg-secondary">{step}</p>
            </li>
          ))}
        </ol>
      </TabsContent>
    </Tabs>
  );
}
