# Medical Records: reviewed source register

Implemented 2026-11-20. Method: `symphony-medical-records-v1`. UI acceptance remains pending user review within the existing copper/ivory scheme.

## What works

The Medical Records page starts empty. Users can create/edit visit or report metadata, mark their own source check, search/filter a timeline, remove/undo entries, export a metadata CSV, and review/restore a versioned JSON backup. The personal JSON report includes linked observations and provenance. The old fictional testing schedules, flags and nearby-hospital rankings are removed from this section.

A local FHIR JSON import accepts **one DiagnosticReport per collection/document/searchset Bundle**, plus flat linked Observation resources containing numeric `valueQuantity` or an explicit `dataAbsentReason`. This is a deliberately narrow projection and consistency checker, **not a general FHIR validator**. No API connection or original-document vault is provided.

## Scientific/data contract

- Result references must resolve to unique in-file Observations. Both relative resource references and entry `fullUrl` aliases are indexed. No network requests resolve references. Duplicate identities/results, multiple reports, paginated exports and mixed Patient identities block the entire import; no partially parsed report is saved.
- Report and result subjects must agree. A resolved Patient retains its fullUrl authority when supplied. Literal Patient/id is accepted without remote resolution. Existing imported records must have one subject reference. This does not prove identity across organizations; references can differ for one person or collide if source authority is absent. Users must check the subject against their original. Isolated profiles remain future work.
- Numeric zero, negative values, inequalities, original unit text, unit system/code, marker coding, report/resource status, source ranges and exact collection-date precision are retained. No unit conversion, normal/abnormal classification, diagnosis or clinical recommendation is derived. JSON numbers use JavaScript binary64 precision; arbitrary-precision decimal lexemes are not retained. Keep the original for precision-sensitive reconciliation. Absent results remain null with their source reason. Issue time is never substituted for unknown collection time.
- Unsupported value types, component/member groups, effective periods/timing/instants, conditional/age-specific/extended ranges, modifier extensions, cancelled/entered-in-error resources and ambiguous dates block import. Unknown and preliminary statuses remain explicitly labeled. A rejected valid FHIR resource may simply be outside this app's subset; it is not necessarily invalid FHIR.
- Source SHA-256 is computed over original file bytes in the browser. File name, import time, report ID and version are retained. A hash detects byte-level changes; it does not authenticate a source or establish clinical accuracy. Another version is retained separately, never silently replacing an earlier report. Exact duplicate report/file projections are blocked at save/restore time.
- Imported measurements are read-only. Editing title/provider/category/notes does not amend source results and clears the previous source-check flag. Checking means the user reviewed source fields, not that a clinician validated them.
- Narratives, conclusions, attachments, raw Patient demographics and unrelated observations are not stored. Omission warnings accompany the projection. Keep the original JSON/PDF independently. Raw reports and personal data must not be committed to the public repository. Browser localStorage is unencrypted.
- Metadata CSV contains one row per record; JSON backups/full reports retain observations and provenance. CSV formulas are escaped by the shared exporter. Date-only entries are not assigned midnight or an invented time zone. The timeline groups by the source calendar date, with unknown dates last.

Limits: 10 MB per structured input, 5,000 Bundle entries, 1,000 linked observations per report, and existing backup-size/ledger validation. This implementation is source organization and data-quality checking; no sensitivity, specificity, patient-outcome accuracy or clinical interoperability claim is established by the tests.

## References reviewed

1. [HL7 FHIR R4 DiagnosticReport](https://hl7.org/fhir/R4/diagnosticreport.html) and [Observation](https://hl7.org/fhir/R4/observation.html), **4.0.1**, accessed 2026-11-20. Adopted explicit report/result references, subject context, statuses, quantity/comparator and absence semantics. This subset does not reproduce a complete validator or all FHIR content.
2. [Medplum repository](https://github.com/medplum/medplum), README blob `ffe7aa2cb826c5e81cb48cee74addf702d41ad88`, Apache-2.0 license header verified (`0e52542130a761bf130022f620b2e8fe20a981c5`), accessed 2026-11-20. Adopted the separation between source reports, atomic observations and review workflows. No server, SDK, identity system or third-party application code was integrated.
3. [MedGemma 1.5 model card](https://huggingface.co/google/medgemma-1.5-4b-it) and [technical report arXiv:2604.05081v1](https://arxiv.org/html/2604.05081v1), accessed 2026-11-20; reviewed document-extraction evaluation and limitations. The reported field-level evaluation motivates preserving units, collection times and human review. Those metrics are not Symphony results. The model requires separate terms and use-case validation; no terms were accepted, model downloaded, inference run or private document uploaded. OCR remains an evaluation candidate. The bioRxiv search supplied no implementation adopted for this deterministic workflow.

## Validation and next work

Synthetic fixtures exercise zero/negative/inequality values, absent results, date precision, unit provenance, aliases, patient mismatch, ambiguous/duplicate identities, missing references, unsupported shapes/ranges, withdrawn statuses, duplicate-source backups and personal-report isolation. Entry-order invariance checks identity resolution independently of file order. UI checks cover reviewed import, manual create/edit, filter/search, read-only observations, remove/undo, JSON restore, metadata CSV/full JSON export, reload persistence and desktop/mobile layout. These are implementation checks, not clinical validation.

Next: Genome Tracker's personal evidence ledger; then isolated source/person profiles, broader reference fixtures and a separately evaluated document-storage/extraction workflow. Preserve the same UI scheme and obtain the user's visual acceptance separately.
