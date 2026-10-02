import { NextResponse } from "next/server";

import { getCoupons } from "@/lib/repository";
import { parseCouponQuery } from "@/lib/url";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const { query, page } = parseCouponQuery(params);
  const result = await getCoupons({ ...query, store: params.store || undefined }, page);

  // Mã chỉ trả về qua /reveal để lượt mở mã luôn đi kèm link affiliate
  return NextResponse.json({
    ...result,
    items: result.items.map(({ code, ...rest }) => ({ ...rest, hasCode: Boolean(code) })),
  });
}
