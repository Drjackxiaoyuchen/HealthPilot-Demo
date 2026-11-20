import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  clinicalDate,
  medicalRecordSchema,
  parseFhirReport,
  validateRecordSet,
  quantityText,
  medicalRecordsCsvRows,
} from "../src/lib/medical-records";
import { parseLedger } from "../src/lib/personal-ledgers";
import { createReport } from "../src/lib/report";
const fixture = JSON.parse(
  readFileSync("docs/examples/medical-report-synthetic.fhir.json", "utf8"),
);
const source = {
  id: "report-a",
  filename: "synthetic.fhir.json",
  sha256: "a".repeat(64),
  importedAt: "2026-11-20T01:00:00Z",
};
const copy = () => structuredClone(fixture);
const reportResource = (f: typeof fixture) => f.entry[1].resource;
const observation = (f: typeof fixture) => f.entry[2].resource;
const parsed = () => parseFhirReport(copy(), source);

test("FHIR projection resolves relative and fullUrl aliases while preserving zero, source unit codes and inequality", () => {
  const r = parsed();
  assert.equal(r.name, "Synthetic chemistry panel");
  assert.equal(r.kind, "Laboratory");
  assert.equal(r.subject, fixture.entry[0].fullUrl);
  assert.equal(r.observations.length, 3);
  assert.equal(r.observations[0].quantity!.value, 0);
  assert.equal(r.observations[0].ranges[0].low!.value, 0);
  assert.equal(quantityText(r.observations[1].quantity), "<0.2 mg/L");
  assert.equal(r.observations[1].status, "preliminary");
  assert.equal(r.observations[2].quantity, null);
  assert.equal(r.observations[2].absentReason, "Not performed");
  assert.equal(r.at, "2026-11-18T09:30:00+08:00");
  assert.equal(r.observations[2].at, null);
  assert.equal(r.sourceSha256, source.sha256);
  assert.equal(r.checkedAt, null);
});
test("entry ordering does not change projected source facts", () => {
  const f = copy();
  f.entry.reverse();
  assert.deepEqual(parseFhirReport(f, source), parsed());
});
test("unknown units, code systems and collection dates are not guessed or substituted from issue time", () => {
  const f = copy();
  delete reportResource(f).effectiveDateTime;
  reportResource(f).issued = "2026-11-19T00:00:00Z";
  observation(f).valueQuantity = { value: -2 };
  const r = parseFhirReport(f, source);
  assert.equal(r.at, null);
  assert.equal(r.observations[0].quantity!.value, -2);
  assert.equal(r.observations[0].quantity!.unit, "");
  assert.equal(
    quantityText(r.observations[0].quantity),
    "-2 [unit not supplied]",
  );
});
test("mixed patient references, extra patients and unresolved subjects block the complete import", () => {
  for (const change of [
    (f: any) => {
      observation(f).subject.reference = "Patient/another";
    },
    (f: any) => {
      f.entry.push({ resource: { resourceType: "Patient", id: "another" } });
    },
    (f: any) => {
      reportResource(f).subject = {
        reference: "https://remote.example/Patient/1",
      };
    },
  ]) {
    const f = copy();
    change(f);
    assert.throws(() => parseFhirReport(f, source));
  }
});
test("unresolved, duplicate and ambiguous report-result identities cannot produce partial results", () => {
  for (const change of [
    (f: any) => {
      reportResource(f).result.push({ reference: "Observation/missing" });
    },
    (f: any) => {
      reportResource(f).result.push(reportResource(f).result[0]);
    },
    (f: any) => {
      f.entry.push(structuredClone(f.entry[2]));
    },
  ]) {
    const f = copy();
    change(f);
    assert.throws(() => parseFhirReport(f, source));
  }
});
test("withdrawn statuses, nonnumeric values, components, conditional ranges and modifiers are rejected", () => {
  for (const change of [
    (f: any) => {
      reportResource(f).status = "entered-in-error";
    },
    (f: any) => {
      observation(f).status = "cancelled";
    },
    (f: any) => {
      observation(f).valueQuantity.value = "5";
    },
    (f: any) => {
      observation(f).valueQuantity.value = Infinity;
    },
    (f: any) => {
      observation(f).component = [];
    },
    (f: any) => {
      delete observation(f).valueQuantity;
      observation(f).valueString = "negative";
    },
    (f: any) => {
      observation(f).referenceRange[0].age = { low: { value: 18 } };
    },
    (f: any) => {
      observation(f).modifierExtension = [
        { url: "https://example.org/negated" },
      ];
    },
  ]) {
    const f = copy();
    change(f);
    assert.throws(() => parseFhirReport(f, source));
  }
});
test("invalid or ambiguous dates are rejected while date-only precision survives", () => {
  for (const v of ["2026-02-30", "11/12/2026", "2026-11-18T09:30:00"])
    assert.equal(clinicalDate.safeParse(v).success, false);
  const f = copy();
  reportResource(f).effectiveDateTime = "2026-11-18";
  assert.equal(parseFhirReport(f, source).at, "2026-11-18");
});
test("multiple reports and paginated search results block import; unrelated observations are disclosed", () => {
  const multi = copy();
  multi.entry.push(structuredClone(multi.entry[1]));
  assert.throws(() => parseFhirReport(multi, source));
  const page = copy();
  page.link = [{ relation: "next", url: "https://example.org/next" }];
  assert.throws(() => parseFhirReport(page, source), /paginated/);
  const unused = copy();
  unused.entry.push({
    resource: { resourceType: "Observation", id: "unused" },
  });
  assert.ok(
    parseFhirReport(unused, source).warnings.some((w) =>
      w.includes("1 unlinked"),
    ),
  );
});
test("missing and present values are mutually exclusive; source-only observations are not fabricated for manual records", () => {
  const f = copy();
  observation(f).dataAbsentReason = { text: "Unknown" };
  assert.throws(() => parseFhirReport(f, source));
  const a = parsed();
  assert.equal(
    medicalRecordSchema.safeParse({ ...a, origin: "manual" }).success,
    false,
  );
  assert.equal(
    medicalRecordSchema.safeParse({ ...a, sourceSha256: "" }).success,
    false,
  );
});
test("ledger identity and duplicate-source constraints apply to append and backup replacement", () => {
  const a = parsed(),
    b = { ...a, id: "report-b" };
  assert.throws(() => validateRecordSet([a, b]), /already saved/);
  assert.throws(
    () => validateRecordSet([a, { ...b, subject: "Patient/other" }]),
    /Patient/,
  );
  validateRecordSet([a, { ...b, sourceSha256: "b".repeat(64), version: "2" }]);
  assert.throws(() =>
    parseLedger(
      {
        format: "symphony-ledger-v1",
        kind: "medical-records",
        updatedAt: source.importedAt,
        entries: [a, a],
      },
      "medical-records",
      medicalRecordSchema,
    ),
  );
  assert.equal(
    medicalRecordSchema.safeParse({ ...a, sourceUrl: "javascript:alert(1)" })
      .success,
    false,
  );
});
test("metadata CSV and personal JSON preserve provenance, absence, units and method boundaries", () => {
  const a = parsed();
  const rows = medicalRecordsCsvRows([a]);
  assert.equal(rows.length, 2);
  assert.equal(rows[1][9], source.sha256);
  const r = createReport({
    cgm: null,
    genome: null,
    bloodwork: null,
    records: {
      format: "symphony-ledger-v1",
      kind: "medical-records",
      updatedAt: source.importedAt,
      entries: [a],
    },
  });
  assert.equal(r.medicalRecords!.method, "symphony-medical-records-v1");
  assert.deepEqual(r.medicalRecords!.entries[0].observations, a.observations);
  assert.equal(
    r.sections.find((s) => s.path === "/records")!.status,
    "saved personal source records; no clinical inference",
  );
  assert.equal(
    createReport({ cgm: null, genome: null, bloodwork: null }).medicalRecords,
    null,
  );
});
