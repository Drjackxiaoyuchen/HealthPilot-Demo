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
  `Public-source review: **${RESEARCH_DATE}**.`,
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
    `[${source.kind}](${source.url}) · reviewed ${RESEARCH_DATE}.`,
    "",
    `Pattern: ${source.learning}`,
    "",
    `Boundary: ${source.boundary}`,
    "",
  );
lines.push(
  "## Next development sequence",
  "",
  "1. Add format-specific CGM fixtures, an explicit sensor-cadence option and dated personal meal logs.",
  "2. Add reviewed analyte mappings and unit conversions while preserving original values.",
  "3. Introduce isolated personal/family profiles before sharing or family analyses.",
  "4. Add source-document review and evaluate local extraction on de-identified, field-level reference datasets.",
  "5. Add versioned genomic annotation and validated external pipeline reports with explicit coverage, build, allele and cohort context.",
  "",
  "A normal app session does not perform background research or refresh external evidence. These are documented next steps, not completed capabilities.",
  "",
);
writeFileSync("docs/research-informed-development.md", lines.join("\n"));
