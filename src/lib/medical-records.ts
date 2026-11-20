import { z } from "zod";
import { sourceUrl } from "./personal-ledgers";
import { parseTimestamp } from "./tabular";

export const RECORD_METHOD = "symphony-medical-records-v1";
const text = z.string().trim().min(1).max(300);
export const clinicalDate = z
  .string()
  .refine(
    (v) =>
      (/^\d{4}-\d{2}-\d{2}$/.test(v) || /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(v)) &&
      !!parseTimestamp(v),
    "Use a valid YYYY-MM-DD date or an ISO timestamp with an explicit offset.",
  );
const coding = z.object({
  system: z.string().max(2000),
  code: text,
  display: z.string().max(300),
});
const quantity = z.object({
  value: z.number().finite(),
  unit: z.string().max(200),
  system: z.string().max(2000),
  code: z.string().max(200),
  comparator: z.enum(["", "<", "<=", ">=", ">"]),
});
export const recordObservationSchema = z
  .object({
    id: text,
    name: text,
    status: z.enum([
      "registered",
      "preliminary",
      "final",
      "amended",
      "corrected",
      "unknown",
    ]),
    at: clinicalDate.nullable(),
    codes: z.array(coding).max(20),
    quantity: quantity.nullable(),
    absentReason: z.string().max(2000),
    ranges: z
      .array(
        z.object({
          text: z.string().max(2000),
          low: quantity.nullable(),
          high: quantity.nullable(),
        }),
      )
      .max(30),
  })
  .superRefine((o, ctx) => {
    if ((o.quantity === null) === (o.absentReason === ""))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Keep either a quantity or an explicit absence reason.",
      });
  });
export const medicalRecordSchema = z
  .object({
    id: z.string().min(1).max(100),
    name: text,
    kind: z.enum(["Laboratory", "Imaging", "Visit", "Other"]),
    at: clinicalDate.nullable(),
    provider: z.string().max(300),
    sourceUrl,
    notes: z.string().max(4000),
    checkedAt: z.string().datetime({ offset: true }).nullable(),
    origin: z.enum(["manual", "FHIR R4 subset"]),
    sourceFile: z.string().max(300),
    sourceSha256: z.string().regex(/^(|[a-f0-9]{64})$/),
    importedAt: z.string().datetime({ offset: true }).nullable(),
    subject: z.string().max(2000),
    reportId: z.string().max(300),
    version: z.string().max(300),
    status: text,
    observations: z.array(recordObservationSchema).max(1000),
    warnings: z.array(z.string().max(2000)).max(100),
  })
  .superRefine((r, ctx) => {
    if (r.origin === "FHIR R4 subset" && !statuses.includes(r.status))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unsupported or withdrawn report status.",
      });
    if (new Set(r.observations.map((o) => o.id)).size !== r.observations.length)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate observation IDs.",
      });
    if (
      r.origin === "FHIR R4 subset" &&
      (!r.subject ||
        !r.reportId ||
        !r.sourceSha256 ||
        !r.sourceFile ||
        !r.importedAt)
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Imported reports require subject, report ID, file, hash and import time.",
      });
    if (r.origin === "manual" && r.observations.length)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Structured observations must come from a reviewed supported import.",
      });
  });
export type MedicalRecord = z.infer<typeof medicalRecordSchema>;
type Obj = Record<string, unknown>;
function obj(v: unknown): Obj {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new Error("Expected a JSON object.");
  return v as Obj;
}
function str(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v !== "string") throw new Error("Expected a text field.");
  return v;
}
function list(v: unknown): unknown[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new Error("Expected an array.");
  return v;
}
function codes(v: unknown) {
  return list(obj(v).coding).map((x) => {
    const c = obj(x);
    return {
      system: str(c.system),
      code: str(c.code),
      display: str(c.display),
    };
  });
}
function concept(v: unknown): string {
  const c = obj(v);
  return (
    str(c.text) ||
    codes(c)
      .map((x) => x.display || x.code)
      .join("; ")
  );
}
function q(v: unknown) {
  if (v === undefined) return null;
  const a = obj(v);
  return quantity.parse({
    value: a.value,
    unit: str(a.unit),
    code: str(a.code),
    system: str(a.system),
    comparator: str(a.comparator),
  });
}
const statuses = [
  "registered",
  "partial",
  "preliminary",
  "final",
  "amended",
  "corrected",
  "appended",
  "unknown",
];
function status(v: unknown) {
  const s = str(v);
  if (!statuses.includes(s))
    throw new Error(
      `Unsupported or withdrawn resource status: ${s || "missing"}.`,
    );
  return s;
}

/** A deliberately narrow projection, not a general FHIR validator. Never fetches references. */
export function parseFhirReport(
  value: unknown,
  source: { id: string; filename: string; sha256: string; importedAt: string },
): MedicalRecord {
  function rejectModifiers(v: unknown, depth = 0) {
    if (depth > 64)
      throw new Error("JSON nesting exceeds the supported depth.");
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) {
      v.forEach((x) => rejectModifiers(x, depth + 1));
      return;
    }
    const a = v as Obj;
    if (Array.isArray(a.modifierExtension) && a.modifierExtension.length)
      throw new Error(
        "Modifier extensions require a full FHIR processor; import blocked.",
      );
    Object.values(a).forEach((x) => rejectModifiers(x, depth + 1));
  }
  rejectModifiers(value);
  const bundle = obj(value);
  if (
    bundle.resourceType !== "Bundle" ||
    !["collection", "document", "searchset"].includes(str(bundle.type))
  )
    throw new Error(
      "Use a collection, document or searchset Bundle containing one DiagnosticReport.",
    );
  const entries = list(bundle.entry);
  if (entries.length > 5000)
    throw new Error("Use a Bundle with at most 5,000 entries.");
  if (list(bundle.link).some((x) => obj(x).relation === "next"))
    throw new Error(
      "This Bundle is paginated. Supply a complete single-report collection instead.",
    );
  const index = new Map<string, Obj>(),
    canonical = new Map<Obj, string>();
  const resources = entries.map((e) => {
    const entry = obj(e),
      r = obj(entry.resource);
    const aliases = [
      str(entry.fullUrl),
      r.id ? `${str(r.resourceType)}/${str(r.id)}` : "",
    ].filter(Boolean);
    for (const alias of new Set(aliases)) {
      if (index.has(alias))
        throw new Error(`Ambiguous duplicate resource identity: ${alias}`);
      index.set(alias, r);
    }
    return r;
  });
  entries.forEach((e, i) => {
    const entry = obj(e),
      r = resources[i];
    canonical.set(
      r,
      str(entry.fullUrl) || `${str(r.resourceType)}/${str(r.id)}`,
    );
  });
  const reports = resources.filter(
    (r) => r.resourceType === "DiagnosticReport",
  );
  if (reports.length !== 1)
    throw new Error(
      "Import exactly one DiagnosticReport per Bundle; split multi-report exports first.",
    );
  const report = reports[0];
  if (!str(report.id))
    throw new Error("The report needs a stable resource ID.");
  function subject(r: Obj) {
    const ref = str(obj(r.subject).reference);
    const patient = index.get(ref);
    if (patient) {
      if (patient.resourceType !== "Patient" || !patient.id)
        throw new Error("Only a Patient subject is supported.");
      return canonical.get(patient)!;
    }
    if (!/^Patient\/[A-Za-z0-9\-.]{1,64}$/.test(ref))
      throw new Error(
        "Use an in-Bundle Patient reference or Patient/id; no remote identity resolution is performed.",
      );
    return ref;
  }
  const patient = subject(report),
    seen = new Set<Obj>();
  if (report.effectivePeriod || report.effectiveTiming)
    throw new Error(
      "Report effective periods are not supported; collection time will not be guessed.",
    );
  const warnings = [
    "Only the supported report/observation projection is saved. Keep the original JSON file; this is not a source-document vault or a full FHIR export.",
  ];
  const observations = list(report.result).map((reference) => {
    const ref = str(obj(reference).reference),
      r = index.get(ref);
    if (!r || r.resourceType !== "Observation")
      throw new Error(
        `Unresolved Observation reference: ${ref || "missing"}. No network request was made.`,
      );
    if (seen.has(r)) throw new Error("Duplicate Observation result reference.");
    seen.add(r);
    if (subject(r) !== patient)
      throw new Error(
        "Report and Observation subjects disagree. Import blocked.",
      );
    if (
      r.component ||
      r.hasMember ||
      r.effectivePeriod ||
      r.effectiveTiming ||
      r.effectiveInstant ||
      Object.keys(r).some((k) => k.startsWith("value") && k !== "valueQuantity")
    )
      throw new Error(
        "Only flat valueQuantity or dataAbsentReason observations with optional effectiveDateTime are supported.",
      );
    const measurement = q(r.valueQuantity),
      absent = r.dataAbsentReason ? concept(r.dataAbsentReason) : "";
    return recordObservationSchema.parse({
      id: str(r.id) || ref,
      name: concept(r.code),
      codes: codes(r.code),
      status: status(r.status),
      at: r.effectiveDateTime ? clinicalDate.parse(r.effectiveDateTime) : null,
      quantity: measurement,
      absentReason: absent,
      ranges: list(r.referenceRange).map((range) => {
        const a = obj(range);
        if (Object.keys(a).some((k) => !["low", "high", "text"].includes(k)))
          throw new Error(
            "Conditional, age-specific or extended reference ranges need separate review; import blocked.",
          );
        return { text: str(a.text), low: q(a.low), high: q(a.high) };
      }),
    });
  });
  const unused = resources.filter(
    (r) => r.resourceType === "Observation" && !seen.has(r),
  ).length;
  if (unused)
    warnings.push(
      `${unused} unlinked Observation resources were not imported.`,
    );
  if (
    resources
      .filter((r) => r.resourceType === "Patient")
      .some((r) => canonical.get(r) !== patient)
  )
    throw new Error(
      "Multiple Patient identities in the Bundle; split the export by person first.",
    );
  if (report.presentedForm || report.conclusion || report.conclusionCode)
    warnings.push(
      "Narrative conclusions, attachments and embedded HTML are not imported or rendered; read the original report.",
    );
  if (!report.effectiveDateTime)
    warnings.push(
      "Collection date is unknown. Issue time is not substituted for collection time.",
    );
  return medicalRecordSchema.parse({
    id: source.id,
    name: concept(report.code),
    kind: list(report.category).some((c) =>
      codes(c).some((code) => code.code === "LAB"),
    )
      ? "Laboratory"
      : "Other",
    at: report.effectiveDateTime
      ? clinicalDate.parse(report.effectiveDateTime)
      : null,
    provider: list(report.performer)
      .map((p) => str(obj(p).display) || str(obj(p).reference))
      .join("; "),
    sourceUrl: "",
    notes: "",
    checkedAt: null,
    origin: "FHIR R4 subset",
    sourceFile: source.filename,
    sourceSha256: source.sha256,
    importedAt: source.importedAt,
    subject: patient,
    reportId: str(report.id),
    version: report.meta ? str(obj(report.meta).versionId) : "",
    status: status(report.status),
    observations,
    warnings,
  });
}

export function assertRecordCanAppend(
  current: MedicalRecord[],
  next: MedicalRecord,
) {
  const subjects = new Set(
    current.filter((r) => r.origin === "FHIR R4 subset").map((r) => r.subject),
  );
  if (
    next.origin === "FHIR R4 subset" &&
    subjects.size &&
    !subjects.has(next.subject)
  )
    throw new Error(
      "This workspace already contains a different FHIR Patient reference. Separate records by person/provider identity before importing.",
    );
  if (
    next.origin === "FHIR R4 subset" &&
    current.some(
      (r) =>
        r.id !== next.id &&
        r.origin === next.origin &&
        r.subject === next.subject &&
        r.reportId === next.reportId &&
        r.sourceSha256 === next.sourceSha256,
    )
  )
    throw new Error(
      "This exact report is already saved. Existing entries were kept.",
    );
}
export function validateRecordSet(records: MedicalRecord[]) {
  const subjects = new Set<string>(),
    signatures = new Set<string>();
  for (const r of records.filter((r) => r.origin === "FHIR R4 subset")) {
    subjects.add(r.subject);
    const signature = JSON.stringify([r.subject, r.reportId, r.sourceSha256]);
    if (signatures.has(signature))
      throw new Error(
        "This exact report is already saved. Existing entries were kept.",
      );
    signatures.add(signature);
  }
  if (subjects.size > 1)
    throw new Error(
      "Different FHIR Patient references cannot share this personal workspace.",
    );
}
export const quantityText = (v: z.infer<typeof quantity> | null) =>
  v
    ? `${v.comparator}${v.value} ${v.unit || v.code || "[unit not supplied]"}`
    : "Not reported";
export function medicalRecordsCsvRows(records: MedicalRecord[]): unknown[][] {
  return [
    [
      "record_id",
      "title",
      "kind",
      "collection_date_source_precision",
      "provider",
      "status",
      "checked_at",
      "origin",
      "source_file",
      "source_sha256",
      "subject_reference",
      "fhir_report_id",
      "version",
      "notes",
      "source_url",
      "method",
    ],
    ...records.map((r) => [
      r.id,
      r.name,
      r.kind,
      r.at,
      r.provider,
      r.status,
      r.checkedAt,
      r.origin,
      r.sourceFile,
      r.sourceSha256,
      r.subject,
      r.reportId,
      r.version,
      r.notes,
      r.sourceUrl,
      RECORD_METHOD,
    ]),
  ];
}
