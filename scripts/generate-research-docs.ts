import { writeFileSync } from "node:fs";
import {
  RESEARCH_DATE,
  RESEARCH_SOURCES,
  SECTION_GUIDES,
  sourcesFor,
} from "../src/data/research";

const lines = [
  "# Symphony AI: research-informed development",
  "",
  `Library updated: **${RESEARCH_DATE}**. Individual source review dates are retained below.`,
  "",
  "This pass reviews all 18 original sections. It adopts interface and data-quality patterns while keeping unimplemented integrations and clinical interpretation explicitly separate from imported observations. The catalog behind the app and this document is `src/data/research.ts`; regenerate this document with `npm run docs:research`.",
  "",
  "## Implemented in this pass",
  "",
  "- Symphony AI branding in navigation, metadata, package identity, documentation and reports; the repository URL and existing browser-storage keys retain compatibility.",
  "- A section-wide source/method panel, a searchable public Research Library, responsive navigation and working Import/Reports entry points.",
  "- Review-before-save imports; declared glucose units; stricter dates, duplicate handling and disclosed exclusions; a locally bundled Excel reader.",
  "- Personal CGM views computed from the full upload, with date selection, missing-data coverage, duration-weighted ranges, CV and exploratory hourly percentiles. GMI availability is gated on duration and estimated coverage.",
  "- Blood-work CSV import, source intervals, separate marker/unit/lab trends, searchable results and dated history.",
  "- A visible imported-genotype call table, separate from the illustrative genomics explorer; AncestryDNA two-column alleles and no-call exclusion.",
  "- A versioned personal JSON report, source and method notes, CSV exports and printable summary. Demo values never fill missing personal results.",
  "",
  "- Working supplement, meal and training ledgers with validated persistence, editing, removal/undo, reviewed backup restoration and CSV outputs. Ingredient totals preserve label basis and unsupported units; planned meals/sessions stay out of completed totals.",
  "- A personal dashboard replaces fixed health scores. Personal meals appear on CGM traces with explicit baseline, coverage and overlapping-meal gates. Report v2 includes entered ledgers and derived summaries.",
  "- 2026-11-19: shared visual refinements within one proposed copper/ivory theme, pending user acceptance; interactive day/hour observation audit, missing-duration TIR bounds and hourly CSV/JSON provenance. See [design baseline](design-system.md) and [versioned CGM method](methods/cgm-quality-v1.md).",
  "",
  "## Evidence and implementation boundaries",
  "",
  "No third-party application source code, exercise media, model weights or genomic databases were copied. Public references inform our own implementation. Source/data licenses and model terms need separate review before a future integration. wger is AGPL-3.0-or-later; PhenoTips' open repository is unmaintained and is retained only as a historical interface/model reference.",
  "",
  "MedGemma 1.5 is a model-evaluation candidate, not an installed capability. Its model card calls for use-case validation, and extracted fields would still require review. No model inference or paid service was run.",
  "",
  "Function's company announcement reports a $298 million Series B and describes unifying personal health sources. It supports a product-pattern comparison only: its proprietary analysis pipeline was not available for inspection. Funding is company-reported and is not evidence of clinical performance or a comparison benchmark.",
  "",
  "The CGM implementation uses a median short-interval cadence estimate and capped left-hold durations, rather than iglu's interpolation. An inferred cadence cannot identify every missing-sampling pattern. Coverage refers to the elapsed upload window, not a mandatory full-day denominator. Hourly bands use unweighted sample percentiles in the current device time zone, with sample/day counts; uneven sampling can affect them. No clinical equivalence to an AGP report is claimed.",
  "",
  "Lab values retain their original units and laboratory intervals. Missing intervals are unclassified. Genotype matching is not build/strand harmonization, PRS calculation, pharmacogene star-allele calling or disease-risk interpretation. Family data remains fictional and isolated from personal imports.",
  "",
  "Ingredient totals are derived from entered label amounts and planned servings, not actual intake or treatment needs. Vitamin D uses the specific NIH conversion of 40 IU to 1 mcg; unsupported IU and DFE/RAE stay separate. Nutrient totals scale per-100g values by entered portions. Completed external-load volume is reps times normalized kg; bodyweight mass is never inferred.",
  "",
  "Meal-context summaries use our own exploratory quality gates: two pre-meal readings spanning five minutes, latest within 15 minutes; four post-meal readings starting within 15 minutes and reaching 105 minutes; 80% observed coverage over two hours; and no overlapping logged eaten meal in the baseline/post-meal window. The output is observed peak minus pre-meal sample mean, without a causal food-effect or predictive claim. The 2025 paper informs the importance of timing and within-person variability, not validation of these gates.",
  "",
  "## Section-by-section work",
  "",
];
for (const section of SECTION_GUIDES) {
  lines.push(
    `### ${section.title}`,
    "",
    `Route: \`${section.path}\`.`,
    "",
    `**Inputs:** ${section.inputs}`,
    "",
    `**Method:** ${section.pipeline.join(" → ")}`,
    "",
    `**Output:** ${section.output}`,
    "",
    `**Current:** ${section.current}`,
    "",
    `**Next:** ${section.next}`,
    "",
    `**References:** ${sourcesFor(section)
      .map((source) => `[${source.title}](${source.url})`)
      .join(", ")}.`,
    "",
  );
}
lines.push("## Source register", "");
for (const source of RESEARCH_SOURCES)
  lines.push(
    `### ${source.title}`,
    "",
    `[${source.kind}](${source.url}) · reviewed ${source.reviewedAt || "2026-11-16"}.`,
    "",
    `Pattern: ${source.learning}`,
    "",
    `Boundary: ${source.boundary}`,
    "",
  );
lines.push(
  "## Next development sequence",
  "",
  "1. Collect user feedback on the proposed UI baseline and refine the same theme; visual acceptance remains pending.",
  "2. Turn Medical Records into a reviewed local record/observation workflow; then expand Genome Tracker with explicit provenance and validated annotation boundaries.",
  "3. Add user-confirmed CGM cadence/time zone and independent package reference comparisons, then reviewed analyte mappings and unit conversions preserving original values.",
  "4. Introduce isolated personal/family profiles and source-document review before sharing or family analyses; evaluate extraction on de-identified field-level references.",
  "5. Add versioned genomic annotation and validated external pipeline reports with explicit coverage, build, allele and cohort context.",
  "",
  "A normal app session does not perform background research or refresh external evidence. These are documented next steps, not completed capabilities.",
  "",
);
writeFileSync("docs/research-informed-development.md", lines.join("\n"));
