import { loadCommerce, saveCommerce, type CommerceSnapshot } from "@/server/commerce-db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(loadCommerce(), {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as CommerceSnapshot;
  saveCommerce(body);
  return NextResponse.json({ ok: true });
}
