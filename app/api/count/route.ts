import { NextResponse } from "next/server";
import { getSupportersCount } from "@/app/actions/supporters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const count = await getSupportersCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
