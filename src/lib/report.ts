import {
  CGM_METHOD,
  buildAgp,
  computeStats,
  validReadings,
  type CgmStored,
} from "./cgm";
import { labSeries, labStatus, type BloodworkStored } from "./bloodwork";
import type { GenomeStored } from "./user-data";
import {
  SECTION_GUIDES,
  RESEARCH_SOURCES,
  RESEARCH_DATE,
} from "../data/research";

export const REPORT_VERSION = "symphony-report-v1";
export function labCsvRows(stored: BloodworkStored): unknown[][] {
  return [
    [
      "marker",
      "value",
      "unit",
      "collected_at",
      "reference_low",
      "reference_high",
      "category",
      "lab",
      "loinc",
      "status",
      "source_file",
    ],
    ...stored.observations.map((row) => [
      row.marker,
      row.value,
      row.unit,
      row.collectedAt,
      row.referenceLow,
      row.referenceHigh,
      row.category,
      row.lab,
      row.loinc,
      labStatus(row),
      stored.sourceFile,
    ]),
  ];
}
export function createReport(
  data: {
    cgm: CgmStored | null;
    genome: GenomeStored | null;
    bloodwork: BloodworkStored | null;
  },
  generatedAt = new Date().toISOString(),
) {
  const cgm = data.cgm?.readings?.length ? data.cgm : null;
  const bloodwork = data.bloodwork?.observations?.length
    ? data.bloodwork
    : null;
  const genome = data.genome;
  return {
    schemaVersion: REPORT_VERSION,
    product: "Symphony AI",
    generatedAt,
    purpose:
      "Personal data summary and exploratory analysis. Illustrative section values are not included.",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cgm: cgm
      ? {
          source: {
            filename: cgm.sourceFile || "Previous upload",
            uploadedAt: cgm.uploadedAt,
            originalUnit: cgm.unit,
          },
          normalizedUnit: "mmol/L",
          method: CGM_METHOD,
          methodNotes: [
            "Duration weighted by left-holding each reading for at most one median short (≤20 min) sensor interval; 5 min fallback when no short interval exists.",
            "Coverage denominator: first reading to last reading plus one sensor interval; longer gaps are missing.",
            "Ranges (mmol/L): <3; 3–<3.9; 3.9–10; >10–13.9; >13.9.",
            "GMI reported only with ≥14 elapsed days and ≥70% observed coverage; not a laboratory HbA1c result.",
            "Hourly profile: unweighted sample percentiles in the exporting device's time zone; no interpolation.",
          ],
          summary: computeStats(cgm.readings),
          hourlyProfile: buildAgp(cgm.readings),
          warnings: cgm.warnings || [],
          readings: validReadings(cgm.readings),
        }
      : null,
    genome: genome
      ? {
          source: {
            filename: genome.sourceFile || "Previous upload",
            uploadedAt: genome.uploadedAt,
          },
          method: "rsID-only match to 22 curated records",
          totalCalledRows: genome.totalRows,
          matchedCalls: genome.matchedSnps,
          limitations:
            "Genome build, strand, phasing and pathogenicity are unresolved. No personal PRS, PGx phenotype, supplement recommendation or family risk is derived.",
        }
      : null,
    bloodwork: bloodwork
      ? {
          source: {
            filename: bloodwork.sourceFile,
            uploadedAt: bloodwork.uploadedAt,
          },
          method:
            "Supplied laboratory intervals; separate series by marker name, exact unit and laboratory",
          observations: bloodwork.observations.map((row) => ({
            ...row,
            status: labStatus(row),
          })),
          seriesCount: labSeries(bloodwork.observations).length,
          limitations:
            "No implicit unit conversion or analyte-name harmonization. Missing ranges remain unclassified. Reference intervals are not health scores.",
        }
      : null,
    sections: SECTION_GUIDES.map((section) => ({
      path: section.path,
      title: section.title,
      status:
        section.mode === "import"
          ? "local import workspace"
          : section.mode === "cgm" && cgm
            ? "imported observations"
            : section.mode === "bloodwork" && bloodwork
              ? "imported observations"
              : section.mode === "genome" && genome
                ? "imported calls; demo explorer separate"
                : "illustrative demo; values omitted",
    })),
    evidence: {
      reviewedAt: RESEARCH_DATE,
      references: RESEARCH_SOURCES.map((source) => ({
        title: source.title,
        type: source.kind,
        url: source.url,
      })),
    },
  };
}
