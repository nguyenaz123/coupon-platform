import { NextResponse } from "next/server";

import { searchSuggestions } from "@/lib/repository";

export async function GET(request: Request) {
  const keyword = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json(await searchSuggestions(keyword));
}
