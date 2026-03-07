import { NextRequest, NextResponse } from "next/server";
import { getPublicSupporters } from "@/app/actions/supporters";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "50", 10) || 50)
    );
    const search = searchParams.get("search") ?? "";

    const { supporters, total } = await getPublicSupporters({
      page,
      pageSize,
      search: search.trim() || undefined,
    });

    return NextResponse.json({ supporters, total });
  } catch {
    return NextResponse.json(
      { supporters: [], total: 0 },
      { status: 500 }
    );
  }
}
