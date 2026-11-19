# Symphony AI

**Your health signals, together.**

Symphony AI is a local personal health workspace for glucose, laboratory results, genomic calls, nutrition, activity and family context. It combines an exploratory demo with reviewed imports and source-linked methods.

Personal measurements and illustrative results have distinct labels. The daily-record modules work with saved personal data. Remaining research sections are labeled demonstrations; their scores, risk estimates and recommendations are not validated personal results.

![Symphony AI glucose workspace — proposed UI with synthetic data](docs/screenshots/symphony-glucose-overview-2026-11-19.jpg)

## Latest revision for UI review — 2026-11-19

One shared copper/ivory visual scheme, with larger text and clearer controls. The glucose workspace now includes an interactive day-by-hour coverage audit, missing-calendar-day inspection, actual daylight-saving durations, and explicit missing-time TIR sensitivity bounds. **UI acceptance remains with the user; this revision is a proposal.**

![Symphony AI glucose audit — proposed UI with synthetic data](docs/screenshots/symphony-glucose-audit-2026-11-19.jpg)

See the [visual baseline](docs/design-system.md), [scientific method and assumptions](docs/methods/cgm-quality-v1.md), and [synthetic CGM example](docs/examples/cgm-quality-synthetic.csv). Import the synthetic CSV through **Import Data**, then open **Glucose & Diet → Data quality** to try the audit. The file contains no personal measurements.

## Run locally

```bash
git clone https://github.com/Drjackxiaoyuchen/Symphony-AI.git
cd Symphony-AI
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Node.js 20 or newer is recommended. Files are parsed in the browser; no account or external AI service is required.

## What works with your data

| Section | Current behavior |
| --- | --- |
| Import Data | Preview CGM, raw genotype and laboratory files; review notes before replacing the saved dataset |
| Glucose & Diet | Date-selectable trace, duration-weighted metrics, hourly coverage audit, missing-time TIR bounds, calendar completeness and exploratory hourly bands |
| Blood Work | CSV import, searchable marker/unit/lab series, source reference intervals and dated histories |
| Genomics | Display uploaded calls that match a small 22-record rsID panel; keep the original demo explorer visibly separate |
| Supplements | Saved products and ingredients, declared label amounts, planned daily totals, overlap review, pause/resume and portable backups |
| Diet & Nutrition | Dated meals, gram-based portions, label/database nutrient sources, planned/eaten separation and observed CGM context |
| Fitness | Planned/completed sessions, editable sets, normalized external-load volume and dated activity summaries |
| Dashboard | Personal daily records and imported measurements with their own windows; no fixed health score |
| Reports & Export | Personal JSON report, normalized CGM/lab/matched-call CSVs, hourly profile CSV and printable summary |
| Research Library | Searchable methods, public references and next improvements for all 18 original sections |
| Other sections | Labeled, fixed illustrative data; personal uploads do not generate their scores, recommendations or family profiles |

The interface, metadata and exported reports use **Symphony AI**. The sidebar includes section search and mobile navigation.

## Import formats

Use **Import Data** in the sidebar. Choose a file, inspect the preview and quality notes, then select **Save reviewed data**. Replacements affect only the corresponding dataset type. Example CSV downloads are available in the app and in [docs/examples](docs/examples).

### Continuous glucose

CSV / TSV / semicolon-delimited files, or the first worksheet of an Excel workbook:

```csv
timestamp,glucose_mmol_l
2026-11-15T08:00:00+08:00,5.2
2026-11-15T08:05:00+08:00,5.4
```

Use an unambiguous `YYYY-MM-DD HH:mm` or ISO 8601 timestamp. Offset-free timestamps use the device time zone. Explicit offsets identify instants, which are displayed in the device time zone. Ambiguous dates such as `04/05/2026` require normalization before import.

`glucose_mg_dl` is also supported. A generic `glucose` / `value` column needs an explicit unit selection. Units are never inferred from the values. Timestamp and glucose columns can be reordered; recognized timestamp names include `timestamp`, `datetime` and `device timestamp`. Provider-specific exports may need column/date cleanup. Glucose values outside 1–40 mmol/L or equivalent and invalid rows are excluded with a count. Duplicate timestamps keep the last row. Excel parsing is bundled locally, with no runtime CDN script.

Statistics use all valid imported readings. Each reading is held for at most one inferred sensor interval, leaving longer gaps missing. Coverage is observed duration divided by the elapsed upload window, including one final interval. The interval is the median positive gap of at most 20 minutes, or a 5-minute fallback when unavailable. This estimate cannot distinguish every missing-sampling pattern from a sensor's true cadence. CV uses duration-weighted population SD divided by the mean.

The default reporting range is 3.9–10.0 mmol/L, following a common diabetes convention, without assigning a universal personal target. GMI is withheld until at least 14 elapsed days and 70% estimated coverage. It is a CGM-derived estimate, not a laboratory HbA1c. Hourly bands are unweighted sample percentiles without interpolation; they are exploratory and are not validated as an equivalent to a clinical AGP report. Personal traces do not include demo meal overlays or inferred food/genome advice.

The day/hour audit splits the same capped observation support across local calendar boundaries. Whole missing days remain visible, repeated/skipped daylight-saving hours use their true duration, and incomplete first/last days have distinct calendar-day and upload-window denominators. The exact IANA time zone, method, durations and null values travel with the hourly CSV and report JSON. Detail is capped at the latest 366 calendar days and disclosed; summary bounds always use the full upload. Missing-duration bounds quantify full-window TIR if all unobserved time were outside or inside range. They are identification bounds conditional on the support model, not confidence intervals or a correction for informative missingness. See the [full derivation and validation scope](docs/methods/cgm-quality-v1.md).

### Laboratory results

```csv
marker,value,unit,collected_at,reference_low,reference_high,category,lab,loinc
HbA1c,5.4,%,2026-10-15,4,5.6,Metabolic,Example Lab,4548-4
HbA1c,5.2,%,2026-11-15,4,5.6,Metabolic,Example Lab,4548-4
```

Required: `marker`, `value`, `unit`, `collected_at` (YYYY-MM-DD). Other columns are optional. Numeric zero is retained. Missing reference limits remain missing; one-sided intervals are supported. Invalid rows block saving until corrected. Duplicate marker/unit/date/lab rows keep the last row and are disclosed in the preview.

Marker names, units, laboratory names and intervals come from the file. Trend series use the marker name (case-insensitive), **exact unit and laboratory**. No automatic analyte harmonization or unit conversion is applied. A reference-range flag is descriptive, not a diagnosis or overall-health score. PDF/image extraction remains future work.

### Genome calls

Unzipped 23andMe-style text (`rsid chromosome position genotype`) or AncestryDNA-style text with two allele columns. Only A/C/G/T calls are retained; no-calls are excluded. Only matches to the 22-record panel are saved, rather than the entire raw genome.

This is rsID matching, without build/strand harmonization, phasing or clinical interpretation. It does not calculate PRS, pharmacogene diplotypes, supplement needs or offspring disease risk. Imported calls are shown above the separate demo genomics explorer.

## Working daily records

Supplements, Diet & Nutrition and Fitness start empty and save your records locally. Each module supports editing, removal with undo, CSV output and a versioned JSON backup. Importing a backup validates its module, values, URLs and record IDs, then shows its contents for review before replacing records. Invalid stored data blocks ordinary edits and remains available as a raw backup; a reviewed valid backup can repair the ledger. Storage failures are shown without silently reporting a successful save.

- **Supplements:** enter product label amounts per serving and planned servings per day. Only active products contribute. Compatible mass units are normalized; active vitamin D alone uses the NIH conversion of 40 IU = 1 mcg. Other IU, DFE and RAE units are not converted to generic mass units. Compound/unspecified amounts remain separate by product. Overlap means the same entered ingredient occurs in multiple products, not a diagnosis of excess or an interaction check. No recommended dose is assigned.
- **Meals:** enter each food's grams, weighed/estimated portion basis, per-100g nutrients and source. Energy and macros scale by grams / 100. Unknown fiber stays null. Planned meals do not enter logged intake totals. There is no automatic photo recognition, food-database connection or volume-to-mass assumption.
- **Fitness:** record session time, duration, status and sets. Only completed sessions enter activity totals. External-load volume is repetitions × load in kg (1 lb = 0.45359237 kg); bodyweight mass is not inferred. Days without logs are missing. There is no calorie-burn or recovery score.
- **Dashboard:** combine the above with imported CGM, labs and genotype calls. The daily date selector applies to logged intake/training; CGM retains its full-upload window. No composite health score is generated.

Dated eaten meals appear on personal CGM traces, with a fixed exploratory context window. A numeric summary requires at least two pre-meal readings spanning five minutes (latest within 15 minutes), at least four post-meal readings starting within 15 minutes and reaching 105 minutes, at least 80% observed coverage over two hours, and no overlapping logged meal from −30 to +120 minutes. Baseline is the pre-meal sample mean, peak is the maximum observed post-meal value, and the difference is reported in mmol/L. These are our transparent quality gates, not a reproduction of a published prediction model. Sensor error, prior intake, activity and unlogged meals remain potential influences; repeated observations are needed before inferring stable food responses.

The full personal report is now `symphony-report-v2` and includes these ledgers, their source notes, derived summaries and method boundaries. Use module-specific JSON backups for restoration.

## Research-informed development

The [Research Library](http://localhost:3000/research) maps 25 public references to all 18 original sections. [Development notes](docs/research-informed-development.md) record the adopted patterns, remaining work and evidence boundaries. References include Nightscout, iglu, Open mHealth, Open Food Facts, wger, Medplum, ClinVar, GWAS Catalog, PGS Catalog Calculator, PharmCAT, CPIC, a Hugging Face MedGemma model card and Function's public product announcement.

Sources inform design and method choices; their code, models, databases and proprietary algorithms are not installed or reproduced. Links open source websites without attaching uploaded datasets. The initial references were reviewed on **2026-11-16**, with glucose-audit references added on **2026-11-19** and individual review dates retained. A separate local Codex task is scheduled daily at 09:00 Asia/Shanghai for incremental research and implementation; normal app sessions do not refresh evidence in the background.

## Storage and exports

Uploads are processed locally and stored in unencrypted browser `localStorage`. New daily ledgers use `symphony:supplements:v1`, `symphony:meals:v1` and `symphony:workouts:v1`. Existing `hp:*:v1` keys are retained for compatibility after the rename. Same-origin scripts and people using the browser profile can access the data. The app bundles its Excel reader and uses system fonts; it does not load an external AI model or send uploaded files to an analysis API.

Browser storage is not a backup and may be cleared. Keep original files. Clear uploaded CGM/genome/lab datasets on Import Data; daily modules support record removal and reviewed backup replacement. Reports explicitly export personal data when requested; demo values are omitted from the personal JSON report. Reports include source filename, upload time, normalization units, methods, quality notes and references.

Do not commit personal data. `.gitignore` excludes `data/`, `imports/`, `exports/`, private environment files and local test artifacts. Files elsewhere still need review before committing.

## Checks

```bash
npm test
npm run typecheck
npm run build
```

Tests also cover label unit/basis handling, planned/completed separation, missing nutrient values, external-load normalization, backup validation and observed meal-window gates. Tests cover parsing, declared units, invalid dates, missing data, time weighting, range boundaries, GMI availability, local-day grouping, lab reference intervals, unit/lab separation, genome no-calls, CSV exports and demo/personal report boundaries. CI runs these checks against a clean install.

## Use and limitations

The demo includes a fictional Morgan family and illustrative genetic, clinical and lifestyle interpretations. These examples have not been validated for clinical decisions. Imported measurements are useful for personal organization and exploration; the application does not diagnose conditions or recommend medication changes.

Demo / educational use only. No warranty. The `symphony-*.jpg` screenshots show the refreshed interface with synthetic examples. Other screenshots in `docs/screenshots` predate the refresh and are historical references.
