// Helpers for reading/writing the user's uploaded data in localStorage.
// All keys live under the hp: prefix so they're easy to spot and clear.

export const KEYS = {
  cgm: "hp:cgm:v1",
  genome: "hp:genome:v1",
  bloodwork: "hp:bloodwork:v1",
} as const;

export type CgmReading = { t: string; v: number };
export type CgmStored = {
  uploadedAt: string;
  count: number;
  unit: "mmol/L" | "mg/dL";
  readings: CgmReading[];
};

export type GenomeRow = { rsid: string; chr: string; pos: string; genotype: string };
export type GenomeStored = {
  uploadedAt: string;
  totalRows: number;
  matchedSnps: { rsid: string; gene: string; variant: string; genotype: string }[];
};

export function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

export function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function clearKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

// ── CGM helpers ──────────────────────────────────────────────────────────

// Take a raw upload (any units, any density) and return the daily 24-hour
// trace shape the Glucose page expects: [{t: 'HH:MM', v: 5.6}, ...]
// Strategy: find the most recent calendar day with the most points and
// downsample to ~96 readings (every 15 min).
export function buildDailyTrace(stored: CgmStored): CgmReading[] {
  if (!stored.readings.length) return [];
  const byDate = new Map<string, CgmReading[]>();
  for (const r of stored.readings) {
    const dt = new Date(r.t);
    if (isNaN(dt.getTime())) continue;
    const key = dt.toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(r);
  }
  if (!byDate.size) return [];
  const dates = [...byDate.keys()].sort();
  let chosen = dates[dates.length - 1];
  for (let i = dates.length - 1; i >= 0; i--) {
    if (byDate.get(dates[i])!.length >= 50) { chosen = dates[i]; break; }
  }
  const day = byDate.get(chosen)!.slice().sort((a, b) =>
    new Date(a.t).getTime() - new Date(b.t).getTime());
  const out: CgmReading[] = [];
  let lastBucket = -1;
  for (const r of day) {
    const dt = new Date(r.t);
    const bucket = Math.floor((dt.getHours() * 60 + dt.getMinutes()) / 15);
    if (bucket === lastBucket) continue;
    lastBucket = bucket;
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(Math.floor(dt.getMinutes() / 15) * 15).padStart(2, "0");
    out.push({ t: hh + ":" + mm, v: r.v });
  }
  return out;
}

export function computeStats(readings: CgmReading[]) {
  if (!readings.length) return null;
  const vals = readings.map(r => r.v);
  const sum = vals.reduce((a, b) => a + b, 0);
  const avg = sum / vals.length;
  const tir = vals.filter(v => v >= 3.9 && v <= 7.8).length / vals.length * 100;
  const high = vals.filter(v => v > 7.8 && v <= 10).length / vals.length * 100;
  const veryHigh = vals.filter(v => v > 10).length / vals.length * 100;
  const low = vals.filter(v => v < 3.9).length / vals.length * 100;
  return {
    avg, tir, high, veryHigh, low,
    min: Math.min(...vals), max: Math.max(...vals),
    gmi: 3.31 + 0.02392 * (avg * 18.0182),
  };
}

// ── CGM CSV/xlsx parsing ────────────────────────────────────────────────

export type ParseResult = { ok: true; readings: CgmReading[]; unit: "mmol/L" | "mg/dL" } | { ok: false; error: string };

// Parse a CSV-like text. Accepts comma/tab/semicolon delimited. First column = timestamp, second = value.
export function parseCgmCsv(text: string): ParseResult {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { ok: false, error: "Empty file" };
  const out: CgmReading[] = [];
  // Detect delimiter from first non-header line
  const delimMatch = lines[0].match(/[,;\t]/);
  const delim = delimMatch ? delimMatch[0] : ",";
  // Try to skip header
  for (let i = 0; i < lines.length; i++) {
    const fields = lines[i].split(delim).map(f => f.trim().replace(/^["']|["']$/g, ""));
    if (fields.length < 2) continue;
    const v = parseFloat(fields[1]);
    if (isNaN(v)) continue;  // skip header / non-numeric
    out.push({ t: fields[0], v });
  }
  if (!out.length) return { ok: false, error: "No numeric glucose values found. Expected: timestamp, value" };
  // Decide units: mmol/L is typically 3-15, mg/dL is typically 50-300
  const median = out.map(r => r.v).sort((a, b) => a - b)[Math.floor(out.length / 2)];
  const unit: "mmol/L" | "mg/dL" = median > 25 ? "mg/dL" : "mmol/L";
  if (unit === "mg/dL") {
    for (const r of out) r.v = +(r.v / 18.0182).toFixed(1);
  }
  return { ok: true, readings: out, unit };
}

// Lazy-load SheetJS from CDN to parse xlsx without adding a build dependency.
export async function parseCgmXlsx(file: File): Promise<ParseResult> {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
  const XLSX: any = await loadSheetJs();
  if (!XLSX) return { ok: false, error: "Could not load xlsx parser. Check your internet connection or convert to CSV." };
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  // Convert to CSV then re-use the CSV parser
  const csv: string = XLSX.utils.sheet_to_csv(sheet);
  return parseCgmCsv(csv);
}

let sheetJsPromise: Promise<any> | null = null;
function loadSheetJs(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if ((window as any).XLSX) return Promise.resolve((window as any).XLSX);
  if (sheetJsPromise) return sheetJsPromise;
  sheetJsPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    s.onload = () => resolve((window as any).XLSX);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return sheetJsPromise;
}

// ── Genome parsing (23andMe / AncestryDNA / WeGene raw txt format) ──────

// Real-world rsIDs we know about — for matching user uploads to our annotated set.
// Keep this list synchronized with the SNPs in src/data/seed.ts.
export const KNOWN_SNPS: { rsid: string; gene: string; variant: string }[] = [
  { rsid: "rs1801133",  gene: "MTHFR",   variant: "C677T" },
  { rsid: "rs1801131",  gene: "MTHFR",   variant: "A1298C" },
  { rsid: "rs4680",     gene: "COMT",    variant: "Val158Met" },
  { rsid: "rs6265",     gene: "BDNF",    variant: "Val66Met" },
  { rsid: "rs9939609",  gene: "FTO",     variant: "rs9939609" },
  { rsid: "rs429358",   gene: "APOE",    variant: "ε4 determinant" },
  { rsid: "rs7412",     gene: "APOE",    variant: "ε2 determinant" },
  { rsid: "rs1800795",  gene: "IL-6",    variant: "G>C (-174)" },
  { rsid: "rs2228570",  gene: "VDR",     variant: "FokI" },
  { rsid: "rs1544410",  gene: "VDR",     variant: "BsmI" },
  { rsid: "rs10830963", gene: "MTNR1B",  variant: "C>G" },
  { rsid: "rs1800566",  gene: "NQO1",    variant: "Pro187Ser" },
  { rsid: "rs1799971",  gene: "OPRM1",   variant: "A118G" },
  { rsid: "rs1800562",  gene: "HFE",     variant: "C282Y" },
  { rsid: "rs1799945",  gene: "HFE",     variant: "H63D" },
  { rsid: "rs4880",     gene: "SOD2",    variant: "Ala16Val" },
  { rsid: "rs1695",     gene: "GSTP1",   variant: "Ile105Val" },
  { rsid: "rs4244285",  gene: "CYP2C19", variant: "*2 allele" },
  { rsid: "rs762551",   gene: "CYP1A2",  variant: "*1F allele" },
  { rsid: "rs1801282",  gene: "PPARG",   variant: "Pro12Ala" },
  { rsid: "rs7903146",  gene: "TCF7L2",  variant: "T2D risk" },
  { rsid: "rs1333049",  gene: "9p21",    variant: "CAD risk" },
];

export function parseGenomeText(text: string): { ok: true; rows: GenomeRow[] } | { ok: false; error: string } {
  const lines = text.split(/\r?\n/);
  const rows: GenomeRow[] = [];
  for (const line of lines) {
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const f = line.split(/\s+/);
    if (f.length < 4) continue;
    const [rsid, chr, pos, genotype] = f;
    if (!rsid || !rsid.toLowerCase().startsWith("rs")) continue;
    rows.push({ rsid: rsid.toLowerCase(), chr, pos, genotype: genotype.toUpperCase() });
  }
  if (!rows.length) return { ok: false, error: "No SNP rows found. Expected 23andMe-style: rsid<tab>chr<tab>pos<tab>genotype" };
  return { ok: true, rows };
}

export function matchKnownSnps(rows: GenomeRow[]) {
  const byRsid = new Map(rows.map(r => [r.rsid, r]));
  return KNOWN_SNPS
    .map(s => {
      const r = byRsid.get(s.rsid);
      return r ? { rsid: s.rsid, gene: s.gene, variant: s.variant, genotype: r.genotype } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}
