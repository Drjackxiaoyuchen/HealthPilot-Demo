import { NextResponse } from "next/server";
import { BLOOD_MARKERS } from "@/data/seed";

export async function GET() {
  const parsed = BLOOD_MARKERS.map(m => ({
    ...m,
    history: typeof m.history === "string" ? JSON.parse(m.history) : m.history,
  }));
  const sorted = parsed.sort((a, b) => a.category.localeCompare(b.category) || a.marker.localeCompare(b.marker));
  return NextResponse.json({ success: true, data: sorted, timestamp: new Date().toISOString() });
}

export async function POST(req: Request) {
  const body = await req.json();
  BLOOD_MARKERS.push({ ...body, history: JSON.stringify(body.history || []) });
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
