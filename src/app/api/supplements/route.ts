import { NextResponse } from "next/server";
import { SUPPLEMENTS, SUPPLEMENT_CONFLICTS } from "@/data/seed";

export async function GET() {
  const active = SUPPLEMENTS.filter(s => s.status === "active").sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 } as Record<string, number>;
    return (p[a.priority] ?? 9) - (p[b.priority] ?? 9);
  });
  return NextResponse.json({ success: true, data: { supplements: active, conflicts: SUPPLEMENT_CONFLICTS }, timestamp: new Date().toISOString() });
}

export async function POST(req: Request) {
  const body = await req.json();
  SUPPLEMENTS.push(body);
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
