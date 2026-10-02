"use client";

import { useState } from "react";
import { toast } from "sonner";

import { RevealModal } from "@/components/coupon/RevealModal";
import { Button } from "@/components/ui/button";
import { revealCoupon } from "@/lib/api-client";
import { maskCode } from "@/lib/format";
import type { Coupon } from "@/lib/types";
import { cn } from "@/lib/utils";

type Size = "md" | "lg";

/**
 * Khối mã bị che + nút mở popup. Mã đầy đủ chỉ được tải khi người dùng bấm
 * "Xem mã", đồng thời mở tab mua sắm của sàn.
 */
export function CouponCodeReveal({
  coupon,
  storeName,
  size = "md",
}: {
  coupon: Coupon;
  storeName: string;
  size?: Size;
}) {
  const [revealed, setRevealed] = useState<{
    code: string;
    terms: string[];
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isUpcoming = coupon.status === "upcoming";

  async function reveal() {
    if (isUpcoming || isLoading) return;
    setIsLoading(true);
    try {
      const result = await revealCoupon(coupon.id);
      setRevealed({ code: result.code, terms: result.terms });
      setIsOpen(true);
      window.open(result.redirectUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Không lấy được mã, bạn thử lại sau nhé");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "flex min-w-0 items-center gap-2",
          size === "lg" && "flex-col gap-3 sm:flex-row sm:gap-4",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center justify-center rounded-chip border border-dashed border-line-strong bg-white/5",
            size === "md" ? "h-11 w-full" : "h-14 w-full rounded-control sm:h-[72px]",
          )}
        >
          <span
            className={cn(
              "font-mono font-semibold tracking-[0.08em]",
              size === "md" ? "text-[18px]" : "text-[24px] sm:text-[32px]",
              isUpcoming ? "text-fg-muted" : "text-fg",
            )}
          >
            {isUpcoming ? "••••••" : maskCode(coupon.code)}
          </span>
        </div>

        <Button
          variant={isUpcoming ? "outline" : "brand"}
          size={size === "md" ? "sm" : "lg"}
          onClick={reveal}
          disabled={isUpcoming || isLoading}
          className={cn(
            "shrink-0 uppercase tracking-[0.1em]",
            size === "md" ? "h-11" : "h-12 w-full sm:h-14 sm:w-auto sm:min-w-[180px]",
          )}
        >
          {isUpcoming ? "Chưa bắt đầu" : isLoading ? "Đang lấy mã..." : "Xem mã"}
        </Button>
      </div>

      {revealed && (
        <RevealModal
          coupon={coupon}
          storeName={storeName}
          code={revealed.code}
          terms={revealed.terms}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </>
  );
}
