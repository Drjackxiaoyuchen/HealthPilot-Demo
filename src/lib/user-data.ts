// Helpers for reading/writing the user's uploaded data in localStorage.
// All keys live under the hp: prefix so they're easy to spot and clear.

export const KEYS = {
  cgm: "hp:cgm:v1",
  genome: "hp:genome:v1",
  bloodwork: "hp:bloodwork:v1",
} as const;

export {
  parseCgmCsv,
  parseCgmXlsx,
  buildDailyTrace,
  computeStats,
} from "./cgm";
export type { CgmReading, CgmStored, ParseResult } from "./cgm";

export type GenomeRow = {
  rsid: string;
  chr: string;
  pos: string;
  genotype: string;
};
export type GenomeStored = {
  uploadedAt: string;
  sourceFile?: string;
  totalRows: number;
  matchedSnps: {
    rsid: string;
    gene: string;
    variant: string;
    genotype: string;
  }[];
};

export function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("symphony:data"));
}

export function clearKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event("symphony:data"));
}

// ── Genome parsing (23andMe / AncestryDNA / WeGene raw txt format) ──────

// Real-world rsIDs we know about — for matching user uploads to our annotated set.
// Keep this list synchronized with the SNPs in src/data/seed.ts.
export const KNOWN_SNPS: { rsid: string; gene: string; variant: string }[] = [
  { rsid: "rs1801133", gene: "MTHFR", variant: "C677T" },
  { rsid: "rs1801131", gene: "MTHFR", variant: "A1298C" },
  { rsid: "rs4680", gene: "COMT", variant: "Val158Met" },
  { rsid: "rs6265", gene: "BDNF", variant: "Val66Met" },
  { rsid: "rs9939609", gene: "FTO", variant: "rs9939609" },
  { rsid: "rs429358", gene: "APOE", variant: "ε4 determinant" },
  { rsid: "rs7412", gene: "APOE", variant: "ε2 determinant" },
  { rsid: "rs1800795", gene: "IL-6", variant: "G>C (-174)" },
  { rsid: "rs2228570", gene: "VDR", variant: "FokI" },
  { rsid: "rs1544410", gene: "VDR", variant: "BsmI" },
  { rsid: "rs10830963", gene: "MTNR1B", variant: "C>G" },
  { rsid: "rs1800566", gene: "NQO1", variant: "Pro187Ser" },
  { rsid: "rs1799971", gene: "OPRM1", variant: "A118G" },
  { rsid: "rs1800562", gene: "HFE", variant: "C282Y" },
  { rsid: "rs1799945", gene: "HFE", variant: "H63D" },
  { rsid: "rs4880", gene: "SOD2", variant: "Ala16Val" },
  { rsid: "rs1695", gene: "GSTP1", variant: "Ile105Val" },
  { rsid: "rs4244285", gene: "CYP2C19", variant: "*2 allele" },
  { rsid: "rs762551", gene: "CYP1A2", variant: "*1F allele" },
  { rsid: "rs1801282", gene: "PPARG", variant: "Pro12Ala" },
  { rsid: "rs7903146", gene: "TCF7L2", variant: "T2D risk" },
  { rsid: "rs1333049", gene: "9p21", variant: "CAD risk" },
];

export function parseGenomeText(
  text: string,
): { ok: true; rows: GenomeRow[] } | { ok: false; error: string } {
  const lines = text.split(/\r?\n/);
  const rows: GenomeRow[] = [];
  for (const line of lines) {
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const f = line.trim().split(/[\s,;]+/);
    if (f.length < 4) continue;
    const [rsid, chr, pos] = f;
    const genotype = f.length >= 5 ? f[3] + f[4] : f[3];
    if (
      !/^rs\d+$/i.test(rsid) ||
      !/^\d+$/.test(pos) ||
      !/^[ACGT]{1,2}$/i.test(genotype)
    )
      continue;
    rows.push({
      rsid: rsid.toLowerCase(),
      chr,
      pos,
      genotype: genotype.toUpperCase(),
    });
  }
  if (!rows.length)
    return {
      ok: false,
      error:
        "No SNP rows found. Expected 23andMe-style: rsid<tab>chr<tab>pos<tab>genotype",
    };
  return { ok: true, rows };
}

export function matchKnownSnps(rows: GenomeRow[]) {
  const byRsid = new Map(rows.map((r) => [r.rsid, r]));
  return KNOWN_SNPS.map((s) => {
    const r = byRsid.get(s.rsid);
    return r
      ? { rsid: s.rsid, gene: s.gene, variant: s.variant, genotype: r.genotype }
      : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);
}
