import { NextResponse } from "next/server";
import { DAILY_LOGS } from "@/data/seed";

const logs = [...DAILY_LOGS];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7");
  const sorted = logs.sort((a, b) => b.day.localeCompare(a.day)).slice(0, days);
  return NextResponse.json({ success: true, data: sorted, timestamp: new Date().toISOString() });
}

export async function POST(req: Request) {
  const body = await req.json();
  const idx = logs.findIndex(l => l.day === body.day);
  if (idx >= 0) Object.assign(logs[idx], body);
  else logs.push(body);
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
