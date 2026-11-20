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
  supplementTotals,
  nutritionDays,
  fitnessDays,
  type Ledger,
  type Supplement,
  type Meal,
  type Workout,
} from "./personal-ledgers";
import { createMealContextAnalyzer, MEAL_CONTEXT_METHOD } from "./meal-context";
import { buildCgmQuality } from "./cgm-quality";
import { RECORD_METHOD, type MedicalRecord } from "./medical-records";
import {
  SECTION_GUIDES,
  RESEARCH_SOURCES,
  RESEARCH_DATE,
} from "../data/research";

export const REPORT_VERSION = "symphony-report-v2";
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
    supplements?: Ledger<Supplement> | null;
    meals?: Ledger<Meal> | null;
    workouts?: Ledger<Workout> | null;
    records?: Ledger<MedicalRecord> | null;
  },
  generatedAt = new Date().toISOString(),
) {
  const cgm = data.cgm?.readings?.length ? data.cgm : null;
  const bloodwork = data.bloodwork?.observations?.length
    ? data.bloodwork
    : null;
  const genome = data.genome;
  const analyzeMeal = createMealContextAnalyzer(cgm?.readings || []);
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
            "Hourly profile: unweighted sample percentiles in the report's device time zone; no interpolation.",
            "Quality audit: actual civil-day/hour durations, including missing days and daylight-saving transitions; hourly detail limited to the latest 366 calendar days.",
            "Missing-time TIR bounds: [I/W, (I+W-O)/W] × 100, conditional on declared sensor support; not confidence intervals or bias correction.",
          ],
          summary: computeStats(cgm.readings),
          hourlyProfile: buildAgp(cgm.readings),
          qualityAudit: buildCgmQuality(cgm.readings),
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
    supplements: data.supplements
      ? {
          ...data.supplements,
          method: "symphony-label-totals-v1",
          plannedDailyTotals: supplementTotals(data.supplements.entries),
          limitations:
            "Self-entered label amounts, not measured intake. Compatible mass units are normalized; vitamin D alone uses 40 IU = 1 mcg. Compound/unspecified amounts remain product-specific. No efficacy, upper-limit or medication-interaction assessment.",
        }
      : null,
    nutrition: data.meals
      ? {
          ...data.meals,
          method: "symphony-portion-nutrients-v1",
          dailyLoggedIntake: nutritionDays(data.meals.entries),
          mealContextMethod: MEAL_CONTEXT_METHOD,
          observedMealContexts: cgm
            ? data.meals.entries.map((meal) => ({
                mealId: meal.id,
                ...analyzeMeal(meal, data.meals!.entries),
              }))
            : [],
          limitations:
            "Label/database values scaled by entered grams. Planned meals are excluded from intake. Unknown fiber remains null. CGM summaries are quality-gated observed context, not food-effect estimates or predictions.",
        }
      : null,
    fitness: data.workouts
      ? {
          ...data.workouts,
          method: "symphony-training-log-v1",
          completedDays: fitnessDays(data.workouts.entries),
          limitations:
            "Only completed sessions enter activity totals. External-load volume is reps × external load in kg; bodyweight mass is not inferred. No calorie-burn or readiness estimate.",
        }
      : null,
    medicalRecords: data.records
      ? {
          ...data.records,
          method: RECORD_METHOD,
          limitations:
            "User-entered metadata and a supported FHIR R4 projection. Original files, narrative conclusions and attachments are not stored. No diagnosis, unit conversion, range classification, or extraction model is applied. Checked status means user source review, not clinical validation.",
        }
      : null,
    sections: SECTION_GUIDES.map((section) => ({
      path: section.path,
      title: section.title,
      status:
        section.mode === "dashboard"
          ? "personal overview; missing values remain missing"
          : section.mode === "records"
            ? data.records?.entries.length
              ? "saved personal source records; no clinical inference"
              : "working register; no personal records"
            : section.mode === "supplements"
              ? data.supplements?.entries.length
                ? "saved label records; planned totals"
                : "working ledger; no personal records"
              : section.mode === "meals"
                ? data.meals?.entries.length
                  ? "saved meal records; portion-derived nutrients"
                  : "working diary; no personal records"
                : section.mode === "workouts"
                  ? data.workouts?.entries.length
                    ? "saved session records; completed activity totals"
                    : "working training log; no personal records"
                  : section.mode === "import"
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
        reviewedAt: source.reviewedAt || "2026-11-16",
      })),
    },
  };
}
