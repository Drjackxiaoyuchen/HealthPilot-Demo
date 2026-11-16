# Symphony AI: research-informed development

Public-source review: **2026-11-16**.

This pass reviews all 18 original sections. It adopts interface and data-quality patterns while keeping unimplemented integrations and clinical interpretation explicitly separate from imported observations. The catalog behind the app and this document is `src/data/research.ts`; regenerate this document with `npm run docs:research`.

## Implemented in this pass

- Symphony AI branding in navigation, metadata, package identity, documentation and reports; the repository URL and existing browser-storage keys retain compatibility.
- A section-wide source/method panel, a searchable public Research Library, responsive navigation and working Import/Reports entry points.
- Review-before-save imports; declared glucose units; stricter dates, duplicate handling and disclosed exclusions; a locally bundled Excel reader.
- Personal CGM views computed from the full upload, with date selection, missing-data coverage, duration-weighted ranges, CV and exploratory hourly percentiles. GMI availability is gated on duration and estimated coverage.
- Blood-work CSV import, source intervals, separate marker/unit/lab trends, searchable results and dated history.
- A visible imported-genotype call table, separate from the illustrative genomics explorer; AncestryDNA two-column alleles and no-call exclusion.
- A versioned personal JSON report, source and method notes, CSV exports and printable summary. Demo values never fill missing personal results.

## Evidence and implementation boundaries

No third-party application source code, exercise media, model weights or genomic databases were copied. Public references inform our own implementation. Source/data licenses and model terms need separate review before a future integration. wger is AGPL-3.0-or-later; PhenoTips' open repository is unmaintained and is retained only as a historical interface/model reference.

MedGemma 1.5 is a model-evaluation candidate, not an installed capability. Its model card calls for use-case validation, and extracted fields would still require review. No model inference or paid service was run.

Function's company announcement reports a $298 million Series B and describes unifying personal health sources. It supports a product-pattern comparison only: its proprietary analysis pipeline was not available for inspection. Funding is company-reported and is not evidence of clinical performance or a comparison benchmark.

The CGM implementation uses a median short-interval cadence estimate and capped left-hold durations, rather than iglu's interpolation. An inferred cadence cannot identify every missing-sampling pattern. Coverage refers to the elapsed upload window, not a mandatory full-day denominator. Hourly bands use unweighted sample percentiles in the current device time zone, with sample/day counts; uneven sampling can affect them. No clinical equivalence to an AGP report is claimed.

Lab values retain their original units and laboratory intervals. Missing intervals are unclassified. Genotype matching is not build/strand harmonization, PRS calculation, pharmacogene star-allele calling or disease-risk interpretation. Family data remains fictional and isolated from personal imports.

## Section-by-section work

### Dashboard

Route: `/dashboard`.

**Inputs:** Dated observations from each connected domain

**Method:** Identify the source → Separate measured and illustrative metrics → Summarize available signals

**Output:** Domain summaries with data dates and completeness

**Current:** The health score, wellness radar and activity tiles remain illustrative demo metrics.

**Next:** Build a measured-signal overview with a visible window for each domain, before adding any composite score.

**References:** [Open mHealth schemas](https://github.com/openmhealth/schemas), [Function Medical Intelligence announcement](https://www.functionhealth.com/article/function-announcement).

### Genomics

Route: `/genomics`.

**Inputs:** 23andMe-style or AncestryDNA raw text

**Method:** Validate allele calls → Match a small rsID panel → Show calls separately from interpretation

**Output:** Imported rsID/gene/genotype table; original demo explorer below

**Current:** Imported matches are visible. Build, strand, phasing and clinical significance are not resolved.

**Next:** Add build/strand metadata and versioned ClinVar accession-level annotations.

**References:** [apriha/snps](https://github.com/apriha/snps), [ClinVar documentation](https://www.ncbi.nlm.nih.gov/clinvar/docs/).

### Glucose & Diet

Route: `/glucose`.

**Inputs:** Timestamped CGM CSV / Excel with declared units

**Method:** Validate and normalize readings → Measure coverage and duration-weighted ranges → Explore daily traces and hourly percentiles

**Output:** Date-selectable trace, daily range summaries, hourly AGP-style profile and CSV/JSON report

**Current:** Personal traces, summaries and coverage recompute locally; demo meals are kept out of personal traces.

**Next:** Add dated personal meal logs and examine repeat-meal responses with coverage requirements.

**References:** [Nightscout](https://github.com/nightscout/cgm-remote-monitor), [iglu AGP documentation](https://irinagain.github.io/iglu/reference/agp.html), [International Consensus on Time in Range (2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6973648/).

### Supplements

Route: `/supplements`.

**Inputs:** Ingredient, product, dose, schedule and medication context

**Method:** Normalize ingredient names → Link an evidence source → Review interactions and duplication

**Output:** Ingredient ledger with evidence and review status

**Current:** Protocols and interactions are demo examples, not generated from your uploads.

**Next:** Add a local ingredient log with source-specific evidence; keep genotype associations separate from dose suggestions.

**References:** [NIH dietary supplement fact sheets](https://ods.od.nih.gov/factsheets/list-all/), [CPIC guidelines](https://cpicpgx.org/guidelines/).

### Diet & Nutrition

Route: `/diet`.

**Inputs:** Food identity, portion mass and nutrient source

**Method:** Resolve a food record → Scale nutrients to the portion → Aggregate recorded meals by day

**Output:** Dated meal diary with serving-based macro totals

**Current:** Meal and nutrition records are demo data.

**Next:** Add portion-aware manual food logging and local CSV export before a photo estimator.

**References:** [Open Food Facts](https://github.com/openfoodfacts/openfoodfacts-server), [wger workout manager](https://github.com/wger-project/wger).

### Fitness

Route: `/fitness`.

**Inputs:** Exercise definitions and completed sessions

**Method:** Separate plan and completion → Record sets, reps and load → Summarize comparable sessions

**Output:** Session history, volume trend and exercise details

**Current:** Workouts and progress are illustrative.

**Next:** Persist completed sessions and derive volume from actual sets.

**References:** [Open mHealth schemas](https://github.com/openmhealth/schemas), [wger workout manager](https://github.com/wger-project/wger).

### Medical Records

Route: `/records`.

**Inputs:** Original documents and reviewed extracted fields

**Method:** Retain original source → Review extracted fields → Link observations to the report

**Output:** Clinical timeline with source-linked observations

**Current:** The record timeline remains fictional; blood-work CSVs are handled in Blood Work.

**Next:** Add a source-document vault and human-reviewed extraction; evaluate MedGemma on de-identified fixtures first.

**References:** [Medplum results and review](https://www.medplum.com/docs/labs-imaging/results-and-review), [MedGemma 1.5 4B model card](https://huggingface.co/google/medgemma-1.5-4b-it).

### Genome Tracker

Route: `/annotations`.

**Inputs:** Versioned variant and publication identifiers

**Method:** Resolve variant identity → Capture accession and review date → Track interpretation changes

**Output:** Evidence ledger with dated changes and conflicts

**Current:** Research annotations are a fixed demo; there is no live literature refresh.

**Next:** Add a refreshable, versioned evidence cache with publication links and conflict flags.

**References:** [ClinVar documentation](https://www.ncbi.nlm.nih.gov/clinvar/docs/), [GWAS Catalog data format](https://www.ebi.ac.uk/gwas/docs/summary-statistics-format/).

### Medicine Checker

Route: `/medicine`.

**Inputs:** Drug identity and a clinically established PGx result

**Method:** Resolve the gene–drug pair → Check guideline coverage → Show evidence and review needs

**Output:** Source-linked gene–drug evidence table

**Current:** Drug checks are illustrative and do not use your genome upload.

**Next:** Import validated PharmCAT reports with guideline version and coverage; distinguish drug–gene from drug–drug interactions.

**References:** [PharmCAT](https://github.com/PharmGKB/PharmCAT), [CPIC guidelines](https://cpicpgx.org/guidelines/).

### Blood Work

Route: `/bloodwork`.

**Inputs:** Lab CSV with values, units, collection dates and optional reference intervals

**Method:** Review parsed observations → Preserve laboratory units and ranges → Group comparable results by marker, unit and lab

**Output:** Searchable longitudinal biomarker table, dated history and CSV/JSON report

**Current:** Personal lab imports replace demo biomarker cards; missing reference ranges stay unclassified.

**Next:** Add explicit, reviewed analyte mapping and unit conversions, retaining the original measurement.

**References:** [Medplum results and review](https://www.medplum.com/docs/labs-imaging/results-and-review), [Function Medical Intelligence announcement](https://www.functionhealth.com/article/function-announcement).

### Family Hub

Route: `/family`.

**Inputs:** Separate records and relationships for each person

**Method:** Select a person → Keep provenance per profile → Summarize that person's observations

**Output:** Profile-specific overview with relationship context

**Current:** The Morgan family is fictional. Uploads apply only to the local personal workspace.

**Next:** Add isolated profiles and explicit ownership before family sharing.

**References:** [FHIR FamilyMemberHistory](https://www.hl7.org/fhir/R4B/familymemberhistory-definitions.html), [PhenoTips pedigree and phenotype model](https://github.com/phenotips/phenotips).

### Offspring Risk

Route: `/offspring`.

**Inputs:** Confirmed parental genotypes and an explicit inheritance model

**Method:** Verify parental calls → State Mendelian assumptions → Show genotype transmission probabilities

**Output:** Illustrative inheritance table, not disease penetrance

**Current:** Punnett-square results use demo genotypes and do not estimate a child's disease probability.

**Next:** Require validated parental calls, linkage/phase context and appropriate counseling before personalized interpretation.

**References:** [ClinVar documentation](https://www.ncbi.nlm.nih.gov/clinvar/docs/), [PhenoTips pedigree and phenotype model](https://github.com/phenotips/phenotips).

### Pathway Enrichment

Route: `/enrichment`.

**Inputs:** Defined query genes and a defensible tested background

**Method:** Resolve gene identifiers → Use a stated background → Correct for multiple tests

**Output:** Term overlap table with adjusted p-values and database version

**Current:** Pathway plots and p-values are illustrative, not an analysis of your genome.

**Next:** Expose the background, query size, overlaps and correction method before enabling real results.

**References:** [g:Profiler 2023 methods update](https://academic.oup.com/nar/article/51/W1/W207/7152869).

### GWAS & Disease

Route: `/gwas`.

**Inputs:** Study-level associations, effect alleles and ancestry metadata

**Method:** Harmonize allele and build → Retain study population → Show reported effects with uncertainty

**Output:** Study-linked association browser

**Current:** Disease associations are a fixed demonstration; no personal disease risk is calculated.

**Next:** Ingest versioned GWAS Catalog records with effect-allele and population context.

**References:** [GWAS Catalog data format](https://www.ebi.ac.uk/gwas/docs/summary-statistics-format/).

### Family Comparison

Route: `/comparison`.

**Inputs:** Two distinct profiles with harmonized, quality-controlled calls

**Method:** Keep profiles separate → Match build and allele orientation → Count callable concordant sites

**Output:** Variant comparison with missing and unresolved calls

**Current:** The self/partner comparison uses fictional profiles.

**Next:** Add separate profile imports and a denominator of jointly callable variants.

**References:** [apriha/snps](https://github.com/apriha/snps), [FHIR FamilyMemberHistory](https://www.hl7.org/fhir/R4B/familymemberhistory-definitions.html).

### Polygenic Risk

Route: `/prs`.

**Inputs:** A versioned PGS scoring file, harmonized genotypes and reference cohort

**Method:** Match effect alleles and weights → Report matching QC → Normalize against an appropriate reference

**Output:** Score, match coverage and ancestry/reference-specific distribution

**Current:** PRS percentiles and disease estimates are illustrative; no validated personal PRS has been computed.

**Next:** Integrate a reproducible scoring pipeline with score ID, build, matching QC and calibration evidence.

**References:** [GWAS Catalog data format](https://www.ebi.ac.uk/gwas/docs/summary-statistics-format/), [PGS Catalog Calculator](https://github.com/PGScatalog/pgsc_calc).

### Pharmacogenomics

Route: `/pharmacogenomics`.

**Inputs:** Validated pharmacogene calls including required structural-variant context

**Method:** Resolve haplotypes and diplotypes → Translate to a supported phenotype → Attach gene–drug guideline evidence

**Output:** Gene-level report with no-call/coverage and guideline versions

**Current:** Metabolizer profiles are demo examples. Imported consumer SNPs do not generate PGx phenotypes.

**Next:** Consume a versioned PharmCAT report and preserve ambiguous diplotypes and untested genes.

**References:** [PharmCAT](https://github.com/PharmGKB/PharmCAT), [CPIC guidelines](https://cpicpgx.org/guidelines/).

### Import Data

Route: `/import`.

**Inputs:** CGM, raw genotype and laboratory CSV/text/Excel files

**Method:** Parse on this device → Preview values and quality notes → Save locally after review

**Output:** Reviewed local datasets with source filename and import date

**Current:** CGM, small-panel genome matching and blood-work CSV imports run locally.

**Next:** Add explicit provider adapters and format fixtures; evaluate document extraction independently.

**References:** [Open mHealth schemas](https://github.com/openmhealth/schemas), [apriha/snps](https://github.com/apriha/snps), [Medplum results and review](https://www.medplum.com/docs/labs-imaging/results-and-review), [MedGemma 1.5 4B model card](https://huggingface.co/google/medgemma-1.5-4b-it).

## Source register

### Open mHealth schemas

[Repository](https://github.com/openmhealth/schemas) · reviewed 2026-11-16.

Pattern: Keep timestamps, units and acquisition metadata with every observation.

Boundary: The repository directs sleep/activity schemas to IEEE 1752.1; no device connector is installed.

### Nightscout

[Repository](https://github.com/nightscout/cgm-remote-monitor) · reviewed 2026-11-16.

Pattern: Keep glucose traces, events and data age visible together.

Boundary: Symphony imports files; it does not connect to Nightscout or deliver live alarms.

### iglu AGP documentation

[Documentation](https://irinagain.github.io/iglu/reference/agp.html) · reviewed 2026-11-16.

Pattern: Pair time-of-day profiles with variability and data availability.

Boundary: Our hourly percentiles are exploratory, without iglu interpolation or clinical equivalence.

### International Consensus on Time in Range (2019)

[Paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC6973648/) · reviewed 2026-11-16.

Pattern: Display collection duration, active coverage, variability and explicit glucose ranges.

Boundary: The 3.9–10.0 mmol/L range is a diabetes reporting convention; individual goals depend on clinical context.

### apriha/snps

[Repository](https://github.com/apriha/snps) · reviewed 2026-11-16.

Pattern: Treat vendor parsing, genome build and allele orientation as explicit stages.

Boundary: Our raw-file matching is not a build/strand-harmonized clinical annotation pipeline.

### ClinVar documentation

[Documentation](https://www.ncbi.nlm.nih.gov/clinvar/docs/) · reviewed 2026-11-16.

Pattern: Keep accession, review status, condition and conflicting submissions with an interpretation.

Boundary: Demo variant interpretations have not been refreshed from ClinVar.

### NIH dietary supplement fact sheets

[Documentation](https://ods.od.nih.gov/factsheets/list-all/) · reviewed 2026-11-16.

Pattern: Tie ingredient evidence and interaction context to a named reference.

Boundary: A SNP alone does not establish a supplement need or dose.

### Open Food Facts

[Repository](https://github.com/openfoodfacts/openfoodfacts-server) · reviewed 2026-11-16.

Pattern: Preserve serving size, per-100g values, product identity and source.

Boundary: Nutrition entries do not predict a person's post-meal glucose; data licensing is separate from server licensing.

### wger workout manager

[Repository](https://github.com/wger-project/wger) · reviewed 2026-11-16.

Pattern: Separate exercise definitions, planned sessions and actual set/rep/weight logs.

Boundary: AGPL-3.0-or-later project; design reference only, no code or exercise media copied.

### Medplum results and review

[Documentation](https://www.medplum.com/docs/labs-imaging/results-and-review) · reviewed 2026-11-16.

Pattern: Model reports as linked observations with collection time, units and reference intervals.

Boundary: Our local CSV schema is not a validated FHIR export or EHR connection.

### FHIR FamilyMemberHistory

[Documentation](https://www.hl7.org/fhir/R4B/familymemberhistory-definitions.html) · reviewed 2026-11-16.

Pattern: Record family relationship, condition, age context and provenance per relative.

Boundary: One person's upload never supplies evidence about a relative.

### PhenoTips pedigree and phenotype model

[Repository](https://github.com/phenotips/phenotips) · reviewed 2026-11-16.

Pattern: Keep pedigree relationships and phenotype observations distinct from genetic interpretation.

Boundary: The open XWiki repository is no longer maintained; historical design reference, not an integration candidate.

### g:Profiler 2023 methods update

[Paper](https://academic.oup.com/nar/article/51/W1/W207/7152869) · reviewed 2026-11-16.

Pattern: Report the tested background, database release and multiple-testing method alongside overlaps.

Boundary: A curated SNP panel cannot establish unbiased genome-wide pathway enrichment.

### GWAS Catalog data format

[Documentation](https://www.ebi.ac.uk/gwas/docs/summary-statistics-format/) · reviewed 2026-11-16.

Pattern: Retain study ID, effect allele, effect size, genome build and study population.

Boundary: Association effects are population estimates, not personal disease probabilities.

### PGS Catalog Calculator

[Repository](https://github.com/PGScatalog/pgsc_calc) · reviewed 2026-11-16.

Pattern: Match alleles and weights, expose matching QC, then use an appropriate ancestry reference for normalization.

Boundary: No personal PRS is computed here; demo distributions lack validated scoring files and a reference cohort.

### PharmCAT

[Repository](https://github.com/PharmGKB/PharmCAT) · reviewed 2026-11-16.

Pattern: Keep variant calls, haplotypes/diplotypes, phenotypes and guideline evidence as separate stages.

Boundary: A single consumer SNP cannot establish a complete star-allele or metabolizer profile.

### CPIC guidelines

[Documentation](https://cpicpgx.org/guidelines/) · reviewed 2026-11-16.

Pattern: Attach a specific gene–drug guideline and evidence version to any PGx statement.

Boundary: Drug and dosing decisions require an appropriate clinical assessment.

### MedGemma 1.5 4B model card

[Model card](https://huggingface.co/google/medgemma-1.5-4b-it) · reviewed 2026-11-16.

Pattern: Evaluate document extraction against reviewed values before considering a local model.

Boundary: Not installed or run. The model card requires use-case validation; a model answer is not a verified observation.

### Function Medical Intelligence announcement

[Company](https://www.functionhealth.com/article/function-announcement) · reviewed 2026-11-16.

Pattern: Use a longitudinal record with source context across labs, records and wearables.

Boundary: Public product positioning and company-reported funding; proprietary analysis methods were not disclosed.

## Next development sequence

1. Add format-specific CGM fixtures, an explicit sensor-cadence option and dated personal meal logs.
2. Add reviewed analyte mappings and unit conversions while preserving original values.
3. Introduce isolated personal/family profiles before sharing or family analyses.
4. Add source-document review and evaluate local extraction on de-identified, field-level reference datasets.
5. Add versioned genomic annotation and validated external pipeline reports with explicit coverage, build, allele and cohort context.

A normal app session does not perform background research or refresh external evidence. These are documented next steps, not completed capabilities.
