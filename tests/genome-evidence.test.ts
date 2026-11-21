import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import {
  genomeEvidenceSchema,
  validateEvidenceSet,
  buildEvidenceHistory,
  reviewStars,
  sourceUrl,
  sourceConflict,
  variantKey,
  genomeEvidenceCsvRows,
} from "../src/lib/genome-evidence";
import { parseLedger } from "../src/lib/personal-ledgers";
import { createReport } from "../src/lib/report";
import { toCsv } from "../src/lib/tabular";
const fixture = JSON.parse(
  readFileSync("docs/examples/genome-evidence-synthetic.json", "utf8"),
);
const parsed = () =>
  parseLedger(fixture, "genome-evidence", genomeEvidenceSchema);
const row = () => structuredClone(parsed().entries[0]);

test("hand-specified source histories preserve numeric version ordering, exact contexts and discrepancy flags", () => {
  const histories = buildEvidenceHistory(parsed().entries);
  assert.equal(histories.length, 4);
  const a = histories.find((h) => h.snapshots.length === 3)!;
  assert.deepEqual(
    a.snapshots.map((r) => r.accession),
    ["RCV999999991.2", "RCV999999991.10", "RCV999999991.10"],
  );
  assert.equal(a.latest.id, "synthetic-a-10-second");
  assert.deepEqual(
    a.changes.map((c) => c.fields),
    [
      ["classification", "reviewStatus", "evaluatedOn"],
      ["classification", "reviewStatus"],
    ],
  );
  assert.deepEqual(
    a.changes.map((c) => c.sameVersion),
    [false, true],
  );
  assert.equal(a.sameVersionDiscrepancy, true);
  assert.equal(a.sourceConflict, true);
  assert.equal(a.savedDisagreement, true);
  assert.equal(histories.filter((h) => h.savedDisagreement).length, 2);
  assert.equal(
    histories.find((h) => h.latest.variant.assembly === "GRCh37")!
      .savedDisagreement,
    false,
  );
  assert.equal(
    histories.find((h) => h.latest.conditionId === "MedGen:C0000002")!
      .savedDisagreement,
    false,
  );
  assert.deepEqual(
    buildEvidenceHistory([...parsed().entries].reverse()),
    histories,
  );
});
test("later capture of a lower version cannot replace highest saved source version", () => {
  const a = row(),
    b = {
      ...row(),
      id: "b",
      accession: "RCV999999991.11",
      capturedAt: "2026-11-17T00:00:00Z",
    };
  a.capturedAt = "2026-11-21T00:00:00Z";
  assert.equal(buildEvidenceHistory([a, b])[0].latest.id, "b");
});
test("different alleles, coordinates, chromosomes and conditions never merge via rsID or gene name", () => {
  const a = row();
  a.rsid = "rs123";
  const cases = [
    { ...a, id: "b", variant: { ...a.variant, alt: "C" as const } },
    { ...a, id: "c", variant: { ...a.variant, position: 102 } },
    { ...a, id: "d", variant: { ...a.variant, chromosome: "X" } },
    { ...a, id: "e", conditionId: "MedGen:C0000009" },
  ];
  assert.equal(buildEvidenceHistory([a, ...cases]).length, 5);
  assert.ok(
    buildEvidenceHistory([a, ...cases]).every((h) => !h.savedDisagreement),
  );
});
test("unsupported/missing identity and assertion structures fail rather than being guessed", () => {
  const invalid = [
    { variant: { ...row().variant, assembly: "hg38" } },
    { variant: { ...row().variant, chromosome: "chr1" } },
    { variant: { ...row().variant, position: 0 } },
    { variant: { ...row().variant, position: 1.5 } },
    { variant: { ...row().variant, position: 250000001 } },
    { variant: { ...row().variant, ref: "AT" } },
    { variant: { ...row().variant, ref: "G" } },
    { variant: { ...row().variant, ref: "N" } },
    { accession: "RCV999999991" },
    { accession: "VCV999999991.1" },
    { accession: "RCV999999991.0" },
    { assertionType: "somatic" },
    { conditionId: "unspecified" },
    { origin: "automatic clinical interpretation" },
    { reviewStatus: "99% confident" },
    { unexpected: "ignored?" },
    { rsid: "rs0" },
  ];
  for (const patch of invalid)
    assert.equal(
      genomeEvidenceSchema.safeParse({ ...row(), ...patch }).success,
      false,
      JSON.stringify(patch),
    );
});
test("calendar dates and capture instants are validated; unknown evaluated date stays null", () => {
  for (const date of [
    "2026-02-29",
    "2026-11-31",
    "2026-11-19T00:00:00Z",
    "2026-11-19",
  ])
    assert.equal(
      genomeEvidenceSchema.safeParse({ ...row(), evaluatedOn: date }).success,
      false,
    );
  assert.equal(
    genomeEvidenceSchema.parse({ ...row(), evaluatedOn: "2024-02-29" })
      .evaluatedOn,
    "2024-02-29",
  );
  assert.equal(genomeEvidenceSchema.parse(row()).evaluatedOn, null);
  assert.equal(
    genomeEvidenceSchema.safeParse({
      ...row(),
      capturedAt: "yesterday",
      evaluatedOn: "2024-01-01",
    }).success,
    false,
  );
  assert.equal(
    genomeEvidenceSchema.safeParse({
      ...row(),
      capturedAt: "2026-11-18T00:00:00",
    }).success,
    false,
  );
});
test("review stars are ordinal source-review metadata and never invented for unknown status", () => {
  assert.equal(reviewStars("not recorded"), null);
  assert.equal(reviewStars("no classification provided"), 0);
  assert.equal(reviewStars("no assertion criteria provided"), 0);
  assert.equal(
    reviewStars("criteria provided, conflicting classifications"),
    1,
  );
  assert.equal(reviewStars("criteria provided, single submitter"), 1);
  assert.equal(
    reviewStars("criteria provided, multiple submitters, no conflicts"),
    2,
  );
  assert.equal(reviewStars("reviewed by expert panel"), 3);
  assert.equal(reviewStars("practice guideline"), 4);
  assert.equal(
    sourceConflict({
      ...row(),
      classification: "Conflicting interpretations of pathogenicity",
    }),
    true,
  );
});
test("unchanged duplicate source snapshots are blocked on append or backup domain validation", () => {
  const a = row();
  assert.throws(
    () =>
      validateEvidenceSet([
        a,
        {
          ...a,
          id: "new",
          notes: "different note",
          capturedAt: "2026-11-20T00:00:00Z",
        },
      ]),
    /unchanged snapshot/,
  );
  const b = { ...a, id: "b", citationPmids: ["12345", "23456"] };
  assert.throws(
    () =>
      validateEvidenceSet([
        b,
        { ...b, id: "c", citationPmids: ["23456", "12345"] },
      ]),
    /unchanged snapshot/,
  );
  assert.throws(() =>
    parseLedger(
      { ...fixture, entries: [a, a] },
      "genome-evidence",
      genomeEvidenceSchema,
    ),
  );
});
test("citation-only and metadata-only version changes are distinguished from classification changes", () => {
  const a = row(),
    b = {
      ...a,
      id: "b",
      accession: "RCV999999991.3",
      citationPmids: ["12345"],
    };
  const h = buildEvidenceHistory([a, b])[0];
  assert.deepEqual(h.changes[0].fields, []);
  assert.equal(h.changes[0].citationsChanged, true);
  assert.equal(h.sameVersionDiscrepancy, false);
  const c = { ...a, id: "c", citationPmids: ["12345"] };
  assert.equal(buildEvidenceHistory([a, c])[0].sameVersionDiscrepancy, false);
});
test("classification terms stay verbatim while case/whitespace alone do not imply change", () => {
  const a = row(),
    b = {
      ...a,
      id: "b",
      accession: "RCV999999991.3",
      classification: "uncertain   SIGNIFICANCE",
    };
  assert.equal(buildEvidenceHistory([a, b])[0].changes[0].fields.length, 0);
  assert.equal(
    buildEvidenceHistory([a, b])[0].latest.classification,
    b.classification,
  );
});
test("CSV and personal JSON preserve source fields, missingness, provenance and limitations", () => {
  const ledger = parsed(),
    report = createReport(
      { cgm: null, genome: null, bloodwork: null, evidence: ledger },
      "2026-11-21T02:00:00Z",
    );
  assert.equal(report.genomeEvidence!.entries.length, 6);
  assert.equal(report.genomeEvidence!.histories.length, 4);
  assert.match(
    report.genomeEvidence!.limitations,
    /not independently verified/,
  );
  assert.match(
    report.sections.find((s) => s.path === "/annotations")!.status,
    /source transcriptions/,
  );
  assert.equal(
    createReport({ cgm: null, genome: null, bloodwork: null }).genomeEvidence,
    null,
  );
  assert.equal(
    sourceUrl(row()),
    "https://www.ncbi.nlm.nih.gov/clinvar/RCV999999991.2/",
  );
  assert.equal(variantKey(row().variant), "GRCh38:1:101:A>G");
  const rows = genomeEvidenceCsvRows([row()]);
  assert.equal(rows[1][14], null);
  assert.equal(rows[1][3], 101);
  assert.match(
    toCsv(genomeEvidenceCsvRows([{ ...row(), name: "=2+3" }])),
    /'=2\+3/,
  );
});
test("5,000 snapshots retain all version transitions within the bounded ledger", () => {
  const a = row(),
    entries = Array.from({ length: 5000 }, (_, i) => ({
      ...a,
      id: `scale-${i}`,
      accession: `RCV999999991.${i + 1}`,
    }));
  const start = performance.now(),
    h = buildEvidenceHistory(entries);
  assert.equal(h.length, 1);
  assert.equal(h[0].changes.length, 4999);
  assert.equal(h[0].latest.accession, "RCV999999991.5000");
  console.log(
    `Genome evidence 5,000-snapshot reference: ${(performance.now() - start).toFixed(1)} ms (local descriptive timing, not clinical validation).`,
  );
  assert.throws(
    () => validateEvidenceSet([...entries, { ...a, id: "over" }]),
    /5,000/,
  );
});
