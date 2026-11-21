// Reviewed public references. These are design/method references, not live integrations.
export const RESEARCH_DATE = "2026-11-21";
export type ResearchSource = {
  id: string;
  title: string;
  kind: "Repository" | "Paper" | "Documentation" | "Model card" | "Company";
  url: string;
  learning: string;
  boundary: string;
  reviewedAt?: string; // Original sources: 2026-11-16; newer reviews override this.
};
export const RESEARCH_SOURCES: ResearchSource[] = [
  {
    id: "clinvar-prototypes",
    title: "NCBI ClinVar public prototypes",
    kind: "Repository",
    url: "https://github.com/ncbi/clinvar",
    reviewedAt: "2026-11-21",
    learning:
      "Keep functional evidence, germline classification and somatic assertions separate; prototypes are not a production data contract.",
    boundary:
      "Reviewed at 2935a3a4e7fa359be4f69863d78f616a7136e37c. No root license was located; no code or data copied. Production identifier/review semantics follow NCBI documentation instead.",
  },
  {
    id: "dnabert2-screen",
    title: "DNABERT-2 model, implementation and ICLR 2024 paper",
    kind: "Model card",
    url: "https://huggingface.co/zhihan1996/DNABERT-2-117M",
    reviewedAt: "2026-11-21",
    learning:
      "Separate sequence embeddings and GUE task benchmarks from condition-specific clinical evidence; require endpoint-matched evaluation before integrating a genome model.",
    boundary:
      "Apache-2.0 model/code; paper arXiv:2306.15006v2, accepted ICLR 2024. Card and methods/evaluations reviewed; weights not downloaded, benchmark not reproduced, model not installed. GUE results do not validate personal pathogenicity or clinical risk.",
  },
  {
    id: "fhir-report",
    title: "HL7 FHIR R4 DiagnosticReport and Observation",
    kind: "Documentation",
    url: "https://hl7.org/fhir/R4/diagnosticreport.html",
    reviewedAt: "2026-11-20",
    learning:
      "Keep report context, referenced observations, statuses, exact units, date precision and subject identity separate.",
    boundary:
      "Symphony implements a narrow validated projection, not a general FHIR validator, clinical decision system or EHR connector.",
  },
  {
    id: "omh",
    title: "Open mHealth schemas",
    kind: "Repository",
    url: "https://github.com/openmhealth/schemas",
    learning:
      "Keep timestamps, units and acquisition metadata with every observation.",
    boundary:
      "The repository directs sleep/activity schemas to IEEE 1752.1; no device connector is installed.",
  },
  {
    id: "nightscout",
    title: "Nightscout",
    kind: "Repository",
    url: "https://github.com/nightscout/cgm-remote-monitor",
    learning: "Keep glucose traces, events and data age visible together.",
    boundary:
      "Symphony imports files; it does not connect to Nightscout or deliver live alarms.",
  },
  {
    id: "iglu",
    title: "iglu AGP documentation",
    kind: "Documentation",
    url: "https://irinagain.github.io/iglu/reference/agp.html",
    learning:
      "Pair time-of-day profiles with variability and data availability.",
    boundary:
      "Our hourly percentiles are exploratory, without iglu interpolation or clinical equivalence.",
  },
  {
    id: "cgm-consensus",
    title: "International Consensus on Time in Range (2019)",
    kind: "Paper",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6973648/",
    learning:
      "Display collection duration, active coverage, variability and explicit glucose ranges.",
    boundary:
      "The 3.9–10.0 mmol/L range is a diabetes reporting convention; individual goals depend on clinical context.",
  },
  {
    id: "cgm-missingness",
    reviewedAt: "2026-11-19",
    title: "Yu et al. — TIR with incompletely observed trajectories (arXiv v1)",
    kind: "Paper",
    url: "https://arxiv.org/abs/2410.03091v1",
    learning:
      "Define the full time window and show the effect of missingness before interpreting observed-only TIR.",
    boundary:
      "Preprint about population-level inpatient inference. Our individual-record missing-duration bounds are a separate algebraic sensitivity analysis; its IPW estimator is not implemented.",
  },
  {
    id: "iglu-lasagna",
    reviewedAt: "2026-11-19",
    title: "iglu day-by-time plots",
    kind: "Documentation",
    url: "https://irinagain.github.io/iglu/articles/lasagna_plots.html",
    learning:
      "Use calendar-day rows and time-of-day columns to reveal missing intervals and sampling structure.",
    boundary:
      "Design reference only; no GPL source copied. Our tiles show duration-based hourly coverage or summaries without iglu's interpolation.",
  },
  {
    id: "snps",
    title: "apriha/snps",
    kind: "Repository",
    url: "https://github.com/apriha/snps",
    learning:
      "Treat vendor parsing, genome build and allele orientation as explicit stages.",
    boundary:
      "Our raw-file matching is not a build/strand-harmonized clinical annotation pipeline.",
  },
  {
    id: "clinvar",
    reviewedAt: "2026-11-21",
    title: "ClinVar documentation",
    kind: "Documentation",
    url: "https://www.ncbi.nlm.nih.gov/clinvar/docs/",
    learning:
      "Keep accession, review status, condition and conflicting submissions with an interpretation.",
    boundary:
      "Demo variant interpretations have not been refreshed from ClinVar.",
  },
  {
    id: "ods",
    title: "NIH dietary supplement fact sheets",
    kind: "Documentation",
    url: "https://ods.od.nih.gov/factsheets/list-all/",
    learning:
      "Tie ingredient evidence and interaction context to a named reference.",
    boundary: "A SNP alone does not establish a supplement need or dose.",
  },
  {
    id: "off",
    title: "Open Food Facts",
    kind: "Repository",
    url: "https://github.com/openfoodfacts/openfoodfacts-server",
    learning:
      "Preserve serving size, per-100g values, product identity and source.",
    boundary:
      "Nutrition entries do not predict a person's post-meal glucose; data licensing is separate from server licensing.",
  },
  {
    id: "wger",
    title: "wger workout manager",
    kind: "Repository",
    url: "https://github.com/wger-project/wger",
    learning:
      "Separate exercise definitions, planned sessions and actual set/rep/weight logs.",
    boundary:
      "AGPL-3.0-or-later project; design reference only, no code or exercise media copied.",
  },
  {
    id: "medplum",
    reviewedAt: "2026-11-20",
    title: "Medplum results and review",
    kind: "Documentation",
    url: "https://www.medplum.com/docs/labs-imaging/results-and-review",
    learning:
      "Model reports as linked observations with collection time, units and reference intervals.",
    boundary:
      "Our local CSV schema is not a validated FHIR export or EHR connection.",
  },
  {
    id: "fhir-family",
    title: "FHIR FamilyMemberHistory",
    kind: "Documentation",
    url: "https://www.hl7.org/fhir/R4B/familymemberhistory-definitions.html",
    learning:
      "Record family relationship, condition, age context and provenance per relative.",
    boundary: "One person's upload never supplies evidence about a relative.",
  },
  {
    id: "phenotips",
    title: "PhenoTips pedigree and phenotype model",
    kind: "Repository",
    url: "https://github.com/phenotips/phenotips",
    learning:
      "Keep pedigree relationships and phenotype observations distinct from genetic interpretation.",
    boundary:
      "The open XWiki repository is no longer maintained; historical design reference, not an integration candidate.",
  },
  {
    id: "gprofiler",
    title: "g:Profiler 2023 methods update",
    kind: "Paper",
    url: "https://academic.oup.com/nar/article/51/W1/W207/7152869",
    learning:
      "Report the tested background, database release and multiple-testing method alongside overlaps.",
    boundary:
      "A curated SNP panel cannot establish unbiased genome-wide pathway enrichment.",
  },
  {
    id: "gwas",
    title: "GWAS Catalog data format",
    kind: "Documentation",
    url: "https://www.ebi.ac.uk/gwas/docs/summary-statistics-format/",
    learning:
      "Retain study ID, effect allele, effect size, genome build and study population.",
    boundary:
      "Association effects are population estimates, not personal disease probabilities.",
  },
  {
    id: "pgsc",
    title: "PGS Catalog Calculator",
    kind: "Repository",
    url: "https://github.com/PGScatalog/pgsc_calc",
    learning:
      "Match alleles and weights, expose matching QC, then use an appropriate ancestry reference for normalization.",
    boundary:
      "No personal PRS is computed here; demo distributions lack validated scoring files and a reference cohort.",
  },
  {
    id: "pharmcat",
    title: "PharmCAT",
    kind: "Repository",
    url: "https://github.com/PharmGKB/PharmCAT",
    learning:
      "Keep variant calls, haplotypes/diplotypes, phenotypes and guideline evidence as separate stages.",
    boundary:
      "A single consumer SNP cannot establish a complete star-allele or metabolizer profile.",
  },
  {
    id: "cpic",
    title: "CPIC guidelines",
    kind: "Documentation",
    url: "https://cpicpgx.org/guidelines/",
    learning:
      "Attach a specific gene–drug guideline and evidence version to any PGx statement.",
    boundary:
      "Drug and dosing decisions require an appropriate clinical assessment.",
  },
  {
    id: "medgemma",
    reviewedAt: "2026-11-20",
    title: "MedGemma 1.5 4B model card",
    kind: "Model card",
    url: "https://huggingface.co/google/medgemma-1.5-4b-it",
    learning:
      "Evaluate document extraction against reviewed values before considering a local model.",
    boundary:
      "Not installed or run. The model card requires use-case validation; a model answer is not a verified observation.",
  },
  {
    id: "function",
    title: "Function Medical Intelligence announcement",
    kind: "Company",
    url: "https://www.functionhealth.com/article/function-announcement",
    learning:
      "Use a longitudinal record with source context across labs, records and wearables.",
    boundary:
      "Public product positioning and company-reported funding; proprietary analysis methods were not disclosed.",
  },
  {
    id: "dsld",
    title: "NIH Dietary Supplement Label Database API",
    kind: "Documentation",
    url: "https://dsldapi.od.nih.gov/",
    learning:
      "Separate product label identity, servings and ingredient amounts from efficacy claims.",
    boundary:
      "Label data is a source for recorded contents; no live label lookup or efficacy scoring is installed.",
  },
  {
    id: "vitamin-d",
    title: "NIH Vitamin D fact sheet",
    kind: "Documentation",
    url: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/",
    learning:
      "Vitamin D has a specific conversion of 40 IU to 1 mcg; IU is not a generic mass unit.",
    boundary:
      "The app uses this conversion only for active vitamin D label amounts, without assigning a recommended dose.",
  },
  {
    id: "usda-fdc",
    title: "USDA FoodData Central API guide",
    kind: "Documentation",
    url: "https://fdc.nal.usda.gov/api-guide/",
    learning:
      "Keep food identity, nutrient units and a reference record with the portion calculation.",
    boundary:
      "Users enter reviewed per-100g values; there is no automatic database lookup or assumed volume-to-mass conversion.",
  },
  {
    id: "meal-variability",
    title:
      "Predicting Postprandial Glycemic Responses With Limited Data (2025)",
    kind: "Paper",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11883769/",
    learning:
      "Keep meal timing, personal observations and within-person variability visible in glucose analysis.",
    boundary:
      "Our fixed-window observed summaries and quality gates are an exploratory implementation, not a reproduction of the paper's predictive model.",
  },
];

export type SectionGuide = {
  path: string;
  title: string;
  group: "Overview" | "Daily health" | "Genetics" | "Clinical & family";
  mode:
    | "demo"
    | "cgm"
    | "genome"
    | "bloodwork"
    | "import"
    | "dashboard"
    | "supplements"
    | "meals"
    | "workouts"
    | "evidence"
    | "records";
  // Medical records are a local register, independent from the illustrative clinical pages.
  inputs: string;
  pipeline: [string, string, string];
  output: string;
  current: string;
  next: string;
  sources: string[];
};
export const SECTION_GUIDES: SectionGuide[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    group: "Overview",
    mode: "dashboard",
    inputs: "Dated observations from each connected domain",
    pipeline: [
      "Identify the source",
      "Separate measured and illustrative metrics",
      "Summarize available signals",
    ],
    output: "Domain summaries with data dates and completeness",
    current:
      "Personal overview of imported measurements and saved meals, products and completed sessions. Missing records stay missing; there is no composite health score.",
    next: "Add explicit daily observations and device-specific adapters, retaining coverage and timestamps.",
    sources: ["omh", "function"],
  },
  {
    path: "/genomics",
    title: "Genomics",
    group: "Genetics",
    mode: "genome",
    inputs: "23andMe-style or AncestryDNA raw text",
    pipeline: [
      "Validate allele calls",
      "Match a small rsID panel",
      "Show calls separately from interpretation",
    ],
    output: "Imported rsID/gene/genotype table; original demo explorer below",
    current:
      "Imported matches are visible. Build, strand, phasing and clinical significance are not resolved.",
    next: "Add build/strand metadata and versioned ClinVar accession-level annotations.",
    sources: ["snps", "clinvar"],
  },
  {
    path: "/glucose",
    title: "Glucose & Diet",
    group: "Daily health",
    mode: "cgm",
    inputs: "Timestamped CGM CSV / Excel with declared units",
    pipeline: [
      "Validate and normalize readings",
      "Measure coverage and duration-weighted ranges",
      "Audit hourly support, missing-time bounds and daily traces",
    ],
    output:
      "Date-selectable trace, interactive hourly coverage audit, missing-duration TIR bounds, exploratory hourly profile and CSV/JSON reports",
    current:
      "Local duration-weighted metrics, missing-calendar-day/hour audit including DST, algebraic TIR sensitivity bounds and reproducible hourly exports. Personal meal summaries retain observation quality gates.",
    next: "Add user-confirmed sensor cadence and report time zone, then reference-validation against an independent CGM package. Medical Records now has a local register; Genome Tracker is the next unfinished personal-data module.",
    sources: [
      "nightscout",
      "iglu",
      "cgm-consensus",
      "iglu-lasagna",
      "cgm-missingness",
      "meal-variability",
    ],
  },
  {
    path: "/supplements",
    title: "Supplements",
    group: "Daily health",
    mode: "supplements",
    inputs: "Ingredient, product, dose, schedule and medication context",
    pipeline: [
      "Normalize ingredient names",
      "Link an evidence source",
      "Review interactions and duplication",
    ],
    output: "Ingredient ledger with evidence and review status",
    current:
      "Persistent product and ingredient ledger with label sources, pause/resume, compatible-unit totals, overlap review, undo removal and reviewed JSON restore.",
    next: "Add versioned label lookups and ingredient-form resolution; medication interactions require a separately validated source.",
    sources: ["dsld", "vitamin-d", "ods"],
  },
  {
    path: "/diet",
    title: "Diet & Nutrition",
    group: "Daily health",
    mode: "meals",
    inputs: "Food identity, portion mass and nutrient source",
    pipeline: [
      "Resolve a food record",
      "Scale nutrients to the portion",
      "Aggregate recorded meals by day",
    ],
    output: "Dated meal diary with serving-based macro totals",
    current:
      "Persistent portion-based meal diary with nutrient sources, planned/eaten separation, dated totals, CSV/JSON outputs and quality-gated observed CGM context.",
    next: "Add reviewed food-database lookups and reusable food templates; evaluate extraction against field-level reference values.",
    sources: ["off", "wger", "usda-fdc", "meal-variability"],
  },
  {
    path: "/fitness",
    title: "Fitness",
    group: "Daily health",
    mode: "workouts",
    inputs: "Exercise definitions and completed sessions",
    pipeline: [
      "Separate plan and completion",
      "Record sets, reps and load",
      "Summarize comparable sessions",
    ],
    output: "Session history, volume trend and exercise details",
    current:
      "Persistent planned/completed sessions, editable exercise sets, kg/lb normalization, bodyweight separation, dated activity summaries and portable exports.",
    next: "Add exercise identifiers and activity-file import, preserving sensor provenance and recorded-versus-estimated measures.",
    sources: ["wger", "omh"],
  },
  {
    path: "/records",
    title: "Medical Records",
    group: "Clinical & family",
    mode: "records",
    inputs:
      "Manual source metadata or a local single-report FHIR R4 JSON Bundle",
    pipeline: [
      "Validate references and subject consistency",
      "Review source fields, units and statuses",
      "Save a traceable local report projection",
    ],
    output:
      "Searchable timeline, linked observations, source hash, metadata CSV and reviewed JSON backups",
    current:
      "Working local register with editing, remove/undo, source checks, strict single-report FHIR subset import, source fingerprints and personal report export. No fictional testing advice or hospital rankings are added.",
    next: "Add isolated person/provider profiles and evaluate source-document storage/extraction on de-identified field-level references. Genome Tracker now has a separate source evidence register.",
    sources: ["fhir-report", "medplum", "medgemma"],
  },
  {
    path: "/annotations",
    title: "Genome Tracker",
    group: "Genetics",
    mode: "evidence",
    inputs:
      "Manually reviewed germline SNV identity, one MedGen condition and versioned ClinVar RCV source fields",
    pipeline: [
      "Gate explicit assembly and forward SNV alleles",
      "Save condition-specific source versions",
      "Compare source fields without clinical inference",
    ],
    output:
      "Local evidence register, version transitions, source/conflict flags, CSV and reviewed JSON backups",
    current:
      "Working personal evidence ledger with numeric version ordering, same-version discrepancy checks, exact-context comparisons and report provenance. Manual source transcriptions are not independently verified, matched to uploaded genotypes or refreshed online.",
    next: "Validate a pinned ClinVar release adapter against independently checked reference records, including merged accessions, condition aliases and reference-allele checks. Medicine Checker is the next remaining demo module.",
    sources: ["clinvar", "clinvar-prototypes", "dnabert2-screen"],
  },
  {
    path: "/medicine",
    title: "Medicine Checker",
    group: "Clinical & family",
    mode: "demo",
    inputs: "Drug identity and a clinically established PGx result",
    pipeline: [
      "Resolve the gene–drug pair",
      "Check guideline coverage",
      "Show evidence and review needs",
    ],
    output: "Source-linked gene–drug evidence table",
    current: "Drug checks are illustrative and do not use your genome upload.",
    next: "Import validated PharmCAT reports with guideline version and coverage; distinguish drug–gene from drug–drug interactions.",
    sources: ["pharmcat", "cpic"],
  },
  {
    path: "/bloodwork",
    title: "Blood Work",
    group: "Clinical & family",
    mode: "bloodwork",
    inputs:
      "Lab CSV with values, units, collection dates and optional reference intervals",
    pipeline: [
      "Review parsed observations",
      "Preserve laboratory units and ranges",
      "Group comparable results by marker, unit and lab",
    ],
    output:
      "Searchable longitudinal biomarker table, dated history and CSV/JSON report",
    current:
      "Personal lab imports replace demo biomarker cards; missing reference ranges stay unclassified.",
    next: "Add explicit, reviewed analyte mapping and unit conversions, retaining the original measurement.",
    sources: ["medplum", "function"],
  },
  {
    path: "/family",
    title: "Family Hub",
    group: "Clinical & family",
    mode: "demo",
    inputs: "Separate records and relationships for each person",
    pipeline: [
      "Select a person",
      "Keep provenance per profile",
      "Summarize that person's observations",
    ],
    output: "Profile-specific overview with relationship context",
    current:
      "The Morgan family is fictional. Uploads apply only to the local personal workspace.",
    next: "Add isolated profiles and explicit ownership before family sharing.",
    sources: ["fhir-family", "phenotips"],
  },
  {
    path: "/offspring",
    title: "Offspring Risk",
    group: "Clinical & family",
    mode: "demo",
    inputs: "Confirmed parental genotypes and an explicit inheritance model",
    pipeline: [
      "Verify parental calls",
      "State Mendelian assumptions",
      "Show genotype transmission probabilities",
    ],
    output: "Illustrative inheritance table, not disease penetrance",
    current:
      "Punnett-square results use demo genotypes and do not estimate a child's disease probability.",
    next: "Require validated parental calls, linkage/phase context and appropriate counseling before personalized interpretation.",
    sources: ["phenotips", "clinvar"],
  },
  {
    path: "/enrichment",
    title: "Pathway Enrichment",
    group: "Genetics",
    mode: "demo",
    inputs: "Defined query genes and a defensible tested background",
    pipeline: [
      "Resolve gene identifiers",
      "Use a stated background",
      "Correct for multiple tests",
    ],
    output: "Term overlap table with adjusted p-values and database version",
    current:
      "Pathway plots and p-values are illustrative, not an analysis of your genome.",
    next: "Expose the background, query size, overlaps and correction method before enabling real results.",
    sources: ["gprofiler"],
  },
  {
    path: "/gwas",
    title: "GWAS & Disease",
    group: "Genetics",
    mode: "demo",
    inputs: "Study-level associations, effect alleles and ancestry metadata",
    pipeline: [
      "Harmonize allele and build",
      "Retain study population",
      "Show reported effects with uncertainty",
    ],
    output: "Study-linked association browser",
    current:
      "Disease associations are a fixed demonstration; no personal disease risk is calculated.",
    next: "Ingest versioned GWAS Catalog records with effect-allele and population context.",
    sources: ["gwas"],
  },
  {
    path: "/comparison",
    title: "Family Comparison",
    group: "Clinical & family",
    mode: "demo",
    inputs: "Two distinct profiles with harmonized, quality-controlled calls",
    pipeline: [
      "Keep profiles separate",
      "Match build and allele orientation",
      "Count callable concordant sites",
    ],
    output: "Variant comparison with missing and unresolved calls",
    current: "The self/partner comparison uses fictional profiles.",
    next: "Add separate profile imports and a denominator of jointly callable variants.",
    sources: ["snps", "fhir-family"],
  },
  {
    path: "/prs",
    title: "Polygenic Risk",
    group: "Genetics",
    mode: "demo",
    inputs:
      "A versioned PGS scoring file, harmonized genotypes and reference cohort",
    pipeline: [
      "Match effect alleles and weights",
      "Report matching QC",
      "Normalize against an appropriate reference",
    ],
    output:
      "Score, match coverage and ancestry/reference-specific distribution",
    current:
      "PRS percentiles and disease estimates are illustrative; no validated personal PRS has been computed.",
    next: "Integrate a reproducible scoring pipeline with score ID, build, matching QC and calibration evidence.",
    sources: ["pgsc", "gwas"],
  },
  {
    path: "/pharmacogenomics",
    title: "Pharmacogenomics",
    group: "Genetics",
    mode: "demo",
    inputs:
      "Validated pharmacogene calls including required structural-variant context",
    pipeline: [
      "Resolve haplotypes and diplotypes",
      "Translate to a supported phenotype",
      "Attach gene–drug guideline evidence",
    ],
    output: "Gene-level report with no-call/coverage and guideline versions",
    current:
      "Metabolizer profiles are demo examples. Imported consumer SNPs do not generate PGx phenotypes.",
    next: "Consume a versioned PharmCAT report and preserve ambiguous diplotypes and untested genes.",
    sources: ["pharmcat", "cpic"],
  },
  {
    path: "/import",
    title: "Import Data",
    group: "Overview",
    mode: "import",
    inputs: "CGM, raw genotype and laboratory CSV/text/Excel files",
    pipeline: [
      "Parse on this device",
      "Preview values and quality notes",
      "Save locally after review",
    ],
    output: "Reviewed local datasets with source filename and import date",
    current:
      "CGM, small-panel genome matching and blood-work CSV imports run locally.",
    next: "Add explicit provider adapters and format fixtures; evaluate document extraction independently.",
    sources: ["omh", "medplum", "snps", "medgemma"],
  },
];

export function sectionGuide(path: string) {
  return SECTION_GUIDES.find((section) => section.path === path);
}
export function sourcesFor(section: SectionGuide) {
  return RESEARCH_SOURCES.filter((source) =>
    section.sources.includes(source.id),
  );
}
