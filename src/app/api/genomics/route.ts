import { NextResponse } from "next/server";
import { GENOMIC_VARIANTS } from "@/data/seed";

export async function GET() {
  const sorted = [...GENOMIC_VARIANTS].sort((a, b) => a.category.localeCompare(b.category) || a.gene.localeCompare(b.gene));
  return NextResponse.json({ success: true, data: sorted, timestamp: new Date().toISOString() });
}

export async function POST(req: Request) {
  const body = await req.json();
  GENOMIC_VARIANTS.push(body);
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
