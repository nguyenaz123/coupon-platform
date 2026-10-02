import { NextResponse } from "next/server";

import { getCoupon } from "@/lib/repository";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const coupon = await getCoupon(slug);

  if (!coupon) {
    return NextResponse.json({ error: "Không tìm thấy mã" }, { status: 404 });
  }

  if (coupon.status === "upcoming") {
    return NextResponse.json({ error: "Mã chưa bắt đầu" }, { status: 409 });
  }

  return NextResponse.json({
    code: coupon.code,
    terms: coupon.terms,
    redirectUrl: coupon.affiliateUrl,
  });
}
