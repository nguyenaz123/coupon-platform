"use client";

import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StoreLogo } from "@/components/ui/StoreLogo";
import type { Coupon } from "@/lib/types";

export function RevealModal({
  coupon,
  storeName,
  code,
  terms,
  open,
  onOpenChange,
}: {
  coupon: Coupon;
  storeName: string;
  code: string;
  terms: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Đã copy mã ${code}`);
    } catch {
      toast.error("Không copy được, bạn hãy chọn và copy thủ công");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-4rem)] flex-col gap-5 overflow-y-auto rounded-panel border border-line-strong p-6 shadow-brand sm:max-w-[480px]">
        <DialogHeader className="flex-row items-center gap-3 pr-10">
          <StoreLogo name={coupon.shopName ?? storeName} image={coupon.image} size="lg" />
          <div className="min-w-0">
            <DialogDescription className="text-[13px]">
              {coupon.shopName ? `${coupon.shopName} · ${storeName}` : storeName} ·{" "}
              {coupon.discountLabel}
            </DialogDescription>
            <DialogTitle className="line-clamp-2 text-[15px]">
              {coupon.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-success">
            Mã của bạn đã sẵn sàng
          </p>
          <div className="flex min-h-[72px] items-center justify-center rounded-control border border-dashed border-line-strong bg-white/5 px-4 py-3">
            <span className="break-all text-center font-mono text-[24px] font-semibold tracking-[0.08em] sm:text-[28px]">
              {code}
            </span>
          </div>
        </div>

        <div>
          <Button variant="brand" size="lg" className="w-full" onClick={copyCode}>
            <Copy className="size-[18px]" />
            COPY MÃ
          </Button>
          <p className="mt-3 text-center text-[13px] text-fg-muted">
            Trang mã trên {storeName} đã được mở trong tab mới
          </p>
        </div>

        <div className="rounded-control border border-line-subtle bg-raised p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
            Điều kiện áp dụng
          </p>
          <ul className="flex flex-col gap-2">
            {terms.map((term) => (
              <li
                key={term}
                className="flex items-start gap-2 text-[13px] text-fg-secondary"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {term}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
