import { z } from "zod";

export const GENOME_EVIDENCE_METHOD = "symphony-genome-evidence-v1";
export const REVIEW_STATUSES = [
  "not recorded",
  "no classification provided",
  "no assertion criteria provided",
  "criteria provided, single submitter",
  "criteria provided, conflicting classifications",
  "criteria provided, multiple submitters, no conflicts",
  "reviewed by expert panel",
  "practice guideline",
] as const;
const text = z.string().trim().min(1).max(200);
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return Number.isFinite(+d) && d.toISOString().slice(0, 10) === s;
  }, "Use a real calendar date.");
const variantSchema = z
  .object({
    assembly: z.enum(["GRCh37", "GRCh38"]),
    chromosome: z.string().regex(/^(?:[1-9]|1[0-9]|2[0-2]|X|Y|MT)$/),
    position: z.number().int().positive().max(250_000_000),
    ref: z.string().regex(/^[ACGT]$/),
    alt: z.string().regex(/^[ACGT]$/),
  })
  .strict()
  .refine(
    (v) => v.ref !== v.alt,
    "Reference and alternate alleles must differ.",
  );
export const genomeEvidenceSchema = z
  .object({
    id: z.string().min(1).max(100),
    name: text,
    variant: variantSchema,
    rsid: z.string().regex(/^(?:rs[1-9]\d*|)$/),
    conditionId: z
      .string()
      .regex(
        /^MedGen:C\d{4,10}$/,
        "Use one MedGen identifier, e.g. MedGen:C0000001.",
      ),
    condition: text,
    accession: z
      .string()
      .regex(
        /^RCV\d{9}\.[1-9]\d{0,5}$/,
        "Include an RCV accession and positive version, e.g. RCV000000001.1.",
      ),
    classification: text,
    reviewStatus: z.enum(REVIEW_STATUSES),
    evaluatedOn: day.nullable(),
    capturedAt: z.string().datetime({ offset: true }),
    citationPmids: z
      .array(z.string().regex(/^[1-9]\d{0,8}$/))
      .max(50)
      .refine(
        (a) => new Set(a).size === a.length,
        "Duplicate PubMed identifiers.",
      ),
    notes: z.string().max(4000),
    origin: z.literal("manual source transcription"),
    assertionType: z.literal("germline"),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (
      r.evaluatedOn &&
      Number.isFinite(Date.parse(r.capturedAt)) &&
      r.evaluatedOn > new Date(r.capturedAt).toISOString().slice(0, 10)
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evaluatedOn"],
        message: "Evaluation cannot be after capture date (UTC).",
      });
  });
export type GenomeEvidence = z.infer<typeof genomeEvidenceSchema>;
export function variantKey(v: GenomeEvidence["variant"]) {
  return `${v.assembly}:${v.chromosome}:${v.position}:${v.ref}>${v.alt}`;
}
export function evidenceKey(r: GenomeEvidence) {
  return `${variantKey(r.variant)}|${r.conditionId}|${r.accession.split(".")[0]}|germline`;
}
export function sourceUrl(r: GenomeEvidence) {
  return `https://www.ncbi.nlm.nih.gov/clinvar/${r.accession}/`;
}
export function reviewStars(
  status: GenomeEvidence["reviewStatus"],
): number | null {
  if (status === "not recorded") return null;
  return status === "practice guideline"
    ? 4
    : status === "reviewed by expert panel"
      ? 3
      : status === "criteria provided, multiple submitters, no conflicts"
        ? 2
        : status.startsWith("criteria provided,")
          ? 1
          : 0;
}
const canonical = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
export function sourceConflict(r: GenomeEvidence) {
  return (
    /^conflicting (classifications|interpretations)/.test(
      canonical(r.classification),
    ) || r.reviewStatus === "criteria provided, conflicting classifications"
  );
}
function signature(r: GenomeEvidence) {
  return JSON.stringify([
    evidenceKey(r),
    r.accession,
    canonical(r.classification),
    r.reviewStatus,
    r.evaluatedOn,
    [...r.citationPmids].sort(),
  ]);
}
export function validateEvidenceSet(entries: GenomeEvidence[]) {
  if (entries.length > 5000)
    throw new Error("Use at most 5,000 evidence snapshots per ledger.");
  const seen = new Set<string>();
  for (const row of entries) {
    const key = signature(row);
    if (seen.has(key))
      throw new Error(
        `An unchanged snapshot for ${row.accession} is already saved. Keep a new version or changed source fields; notes alone are not new source evidence.`,
      );
    seen.add(key);
  }
}
export function buildEvidenceHistory(entries: GenomeEvidence[]) {
  validateEvidenceSet(entries);
  const groups = new Map<string, GenomeEvidence[]>();
  for (const row of entries) {
    const key = evidenceKey(row);
    const group = groups.get(key) || [];
    group.push(row);
    groups.set(key, group);
  }
  const histories = [...groups].map(([key, rows]) => {
    const snapshots = [...rows].sort(
      (a, b) =>
        Number(a.accession.split(".")[1]) - Number(b.accession.split(".")[1]) ||
        Date.parse(a.capturedAt) - Date.parse(b.capturedAt) ||
        a.id.localeCompare(b.id),
    );
    const changes = snapshots.slice(1).map((after, i) => {
      const before = snapshots[i];
      const fields = (
        ["classification", "reviewStatus", "evaluatedOn"] as const
      ).filter((f) => canonical(before[f] || "") !== canonical(after[f] || ""));
      return {
        before: before.id,
        after: after.id,
        fields,
        sameVersion: before.accession === after.accession,
        citationsChanged:
          [...before.citationPmids].sort().join() !==
          [...after.citationPmids].sort().join(),
      };
    });
    const versions = new Map<string, Set<string>>();
    for (const row of snapshots) {
      const values = versions.get(row.accession) || new Set<string>();
      values.add(
        JSON.stringify([
          canonical(row.classification),
          row.reviewStatus,
          row.evaluatedOn,
        ]),
      );
      versions.set(row.accession, values);
    }
    const sameVersionDiscrepancy = [...versions.values()].some(
      (values) => values.size > 1,
    );
    const latest = snapshots[snapshots.length - 1];
    return {
      key,
      latest,
      snapshots,
      changes,
      sameVersionDiscrepancy,
      sourceConflict: sourceConflict(latest),
      savedDisagreement: false,
    };
  });
  // Compare separate RCVs only for exactly the same SNV, assembly, condition identifier and assertion type.
  const byContext = new Map<string, typeof histories>();
  for (const history of histories) {
    const r = history.latest,
      key = `${variantKey(r.variant)}|${r.conditionId}|germline`;
    const peers = byContext.get(key) || [];
    peers.push(history);
    byContext.set(key, peers);
  }
  for (const peers of byContext.values()) {
    const disagreement =
      new Set(peers.map((h) => canonical(h.latest.classification))).size > 1;
    for (const h of peers) h.savedDisagreement = disagreement;
  }
  return histories.sort((a, b) => a.key.localeCompare(b.key));
}
export function genomeEvidenceCsvRows(entries: GenomeEvidence[]): unknown[][] {
  return [
    [
      "name",
      "assembly",
      "chromosome",
      "position_1_based",
      "ref_forward",
      "alt_forward",
      "rsid",
      "condition_id",
      "condition",
      "assertion_type",
      "accession_version",
      "classification_transcribed",
      "review_status_transcribed",
      "review_stars",
      "evaluated_on",
      "captured_at",
      "source_url",
      "pubmed_ids",
      "notes",
      "origin",
      "method",
    ],
    ...entries.map((r) => [
      r.name,
      r.variant.assembly,
      r.variant.chromosome,
      r.variant.position,
      r.variant.ref,
      r.variant.alt,
      r.rsid,
      r.conditionId,
      r.condition,
      r.assertionType,
      r.accession,
      r.classification,
      r.reviewStatus,
      reviewStars(r.reviewStatus),
      r.evaluatedOn,
      r.capturedAt,
      sourceUrl(r),
      r.citationPmids.join(";"),
      r.notes,
      r.origin,
      GENOME_EVIDENCE_METHOD,
    ]),
  ];
}
