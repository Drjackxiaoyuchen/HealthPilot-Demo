"use client";
import { useRef, useState } from "react";
import {
  Dna,
  BookOpen,
  History,
  Download,
  ArrowUpRight,
  Plus,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import {
  Field,
  LedgerTools,
  actionClass,
  primaryClass,
  fieldClass,
  messageOf,
} from "@/components/ui/ledger-tools";
import { useLedger } from "@/lib/use-ledger";
import { KEYS } from "@/lib/user-data";
import { downloadFile } from "@/lib/download";
import { toCsv } from "@/lib/tabular";
import {
  REVIEW_STATUSES,
  GENOME_EVIDENCE_METHOD,
  genomeEvidenceSchema,
  validateEvidenceSet,
  buildEvidenceHistory,
  variantKey,
  sourceUrl,
  reviewStars,
  genomeEvidenceCsvRows,
  type GenomeEvidence,
} from "@/lib/genome-evidence";

const blank = () => ({
  name: "",
  assembly: "GRCh38",
  chromosome: "",
  position: "",
  ref: "",
  alt: "",
  rsid: "",
  conditionId: "",
  condition: "",
  accession: "",
  classification: "",
  reviewStatus: "not recorded",
  evaluatedOn: "",
  pmids: "",
  notes: "",
});
export default function AnnotationsPage() {
  const ledger = useLedger(
    KEYS.evidence,
    "genome-evidence",
    genomeEvidenceSchema,
    validateEvidenceSet,
  );
  const [draft, setDraft] = useState(blank),
    [search, setSearch] = useState(""),
    [attentionOnly, setAttentionOnly] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [removed, setRemoved] = useState<GenomeEvidence | null>(null);
  const [page, setPage] = useState(0);
  const editor = useRef<HTMLDetailsElement>(null);
  const histories = buildEvidenceHistory(ledger.error ? [] : ledger.entries);
  const needsReview = (h: (typeof histories)[number]) =>
    h.sourceConflict || h.sameVersionDiscrepancy || h.savedDisagreement;
  const visible = histories.filter(
    (h) =>
      (!attentionOnly || needsReview(h)) &&
      `${h.latest.name} ${h.key} ${h.latest.condition} ${h.latest.classification} ${h.latest.rsid}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(visible.length / 20));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = visible.slice(currentPage * 20, (currentPage + 1) * 20);
  function update(key: keyof ReturnType<typeof blank>, value: string) {
    setDraft({ ...draft, [key]: value });
    setConfirmed(false);
  }
  function followUp(r: GenomeEvidence) {
    setDraft({
      name: r.name,
      ...r.variant,
      position: String(r.variant.position),
      rsid: r.rsid,
      conditionId: r.conditionId,
      condition: r.condition,
      accession: r.accession,
      classification: r.classification,
      reviewStatus: r.reviewStatus,
      evaluatedOn: r.evaluatedOn || "",
      pmids: r.citationPmids.join(", "),
      notes: "",
    });
    setConfirmed(false);
    setError("");
    if (editor.current) {
      editor.current.open = true;
      editor.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-micro uppercase tracking-widest text-copper-700">
              Symphony AI / Genome Tracker
            </p>
            <h2 className="font-serif text-[30px] mt-1">
              Evidence, with a history
            </h2>
            <p className="text-body text-stone-600 mt-2">
              Keep the source, condition and version behind a variant
              annotation. See what changed across your saved snapshots, with
              uncertainty and disagreements kept visible.
            </p>
          </div>
          <Dna
            size={30}
            className="hidden sm:block shrink-0 text-copper"
            aria-hidden="true"
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href="#evidence-register" className={actionClass}>
            Browse evidence
          </a>
          <button
            className={primaryClass}
            onClick={() => {
              if (editor.current) {
                editor.current.open = true;
                editor.current.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <Plus size={14} />
            Add snapshot
          </button>
          <a href="#evidence-method" className={actionClass}>
            Method & boundaries
          </a>
        </div>
        <p className="text-caption text-stone-500 mt-4">
          Source notebook · no connection to uploaded genotype calls · no live
          refresh. Entries are manual transcriptions, not independently verified
          ClinVar results. Stored unencrypted in this browser; export backups
          intentionally and avoid shared devices.
        </p>
      </Card>
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          {
            label: "Tracked contexts",
            n: histories.length,
            help: "Exact SNV + condition + RCV",
          },
          {
            label: "Saved snapshots",
            n: ledger.error ? 0 : ledger.entries.length,
            help: "Versions and capture dates",
          },
          {
            label: "Source-field transitions",
            n: histories.reduce(
              (n, h) => n + h.changes.filter((c) => c.fields.length > 0).length,
              0,
            ),
            help: "Class, review status or evaluation date",
          },
          {
            label: "Contexts to inspect",
            n: histories.filter(needsReview).length,
            help: "Source conflicts or saved discrepancies",
          },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-caption text-stone-500">{s.label}</p>
            <p className="font-serif text-[30px] mt-1">
              {ledger.ready ? s.n : "…"}
            </p>
            <p className="text-micro text-stone-500 mt-1">{s.help}</p>
          </Card>
        ))}
      </div>
      {(ledger.error || error) && (
        <p
          role="alert"
          className="rounded-xl border border-rose/30 bg-white p-4 text-caption text-rose-dark"
        >
          {ledger.error || error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-caption text-sage-dark">
          {notice}
        </p>
      )}
      {removed && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 text-caption"
        >
          <span>Snapshot removed.</span>
          <button
            className={actionClass}
            onClick={() => {
              try {
                ledger.save(removed);
                setRemoved(null);
              } catch (e) {
                setError(messageOf(e));
              }
            }}
          >
            Undo removal
          </button>
        </div>
      )}
      <Card>
        <details ref={editor} className="scroll-mt-6">
          <summary className="font-serif text-title cursor-pointer">
            Add evidence snapshot
          </summary>
          <p className="text-caption text-stone-500 mt-3">
            Supported: one germline SNV, forward genomic strand, 1-based
            position, one MedGen condition and a versioned ClinVar RCV. Copy the
            condition-specific record. Indels, haplotypes, somatic assertions
            and build conversion need a separate validated workflow.
          </p>
          <form
            className="mt-5 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              setNotice("");
              try {
                if (!confirmed)
                  throw new Error(
                    "Review the source transcription before saving.",
                  );
                ledger.save(
                  genomeEvidenceSchema.parse({
                    id: crypto.randomUUID(),
                    name: draft.name,
                    variant: {
                      assembly: draft.assembly,
                      chromosome: draft.chromosome.trim(),
                      position: Number(draft.position),
                      ref: draft.ref.toUpperCase().trim(),
                      alt: draft.alt.toUpperCase().trim(),
                    },
                    rsid: draft.rsid.trim().toLowerCase(),
                    conditionId: draft.conditionId.trim(),
                    condition: draft.condition,
                    accession: draft.accession.trim().toUpperCase(),
                    classification: draft.classification,
                    reviewStatus: draft.reviewStatus,
                    evaluatedOn: draft.evaluatedOn || null,
                    capturedAt: new Date().toISOString(),
                    citationPmids: draft.pmids.split(/[,;\s]+/).filter(Boolean),
                    notes: draft.notes,
                    origin: "manual source transcription",
                    assertionType: "germline",
                  }),
                );
                setDraft(blank());
                setConfirmed(false);
                setNotice(
                  "Snapshot saved locally. Previous versions remain in the register.",
                );
              } catch (e) {
                setError(messageOf(e));
              }
            }}
          >
            <fieldset
              disabled={!ledger.ready || !!ledger.error}
              className="space-y-4 disabled:opacity-50"
            >
              <legend className="text-caption font-medium mb-3">
                01 / Variant identity
              </legend>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Record label / gene">
                  <input
                    className={fieldClass}
                    required
                    value={draft.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </Field>
                <Field label="Assembly">
                  <select
                    className={fieldClass}
                    value={draft.assembly}
                    onChange={(e) => update("assembly", e.target.value)}
                  >
                    <option>GRCh38</option>
                    <option>GRCh37</option>
                  </select>
                </Field>
                <Field label="Chromosome (1–22, X, Y, MT)">
                  <input
                    className={fieldClass}
                    required
                    value={draft.chromosome}
                    onChange={(e) =>
                      update("chromosome", e.target.value.toUpperCase())
                    }
                  />
                </Field>
                <Field label="Position (1-based)">
                  <input
                    className={fieldClass}
                    type="number"
                    min="1"
                    max="250000000"
                    step="1"
                    required
                    value={draft.position}
                    onChange={(e) => update("position", e.target.value)}
                  />
                </Field>
                <Field label="Reference allele (A/C/G/T)">
                  <input
                    className={fieldClass}
                    required
                    maxLength={1}
                    value={draft.ref}
                    onChange={(e) => update("ref", e.target.value)}
                  />
                </Field>
                <Field label="Alternate allele (A/C/G/T)">
                  <input
                    className={fieldClass}
                    required
                    maxLength={1}
                    value={draft.alt}
                    onChange={(e) => update("alt", e.target.value)}
                  />
                </Field>
                <Field label="rsID (optional; not used for matching)">
                  <input
                    className={fieldClass}
                    value={draft.rsid}
                    onChange={(e) => update("rsid", e.target.value)}
                  />
                </Field>
              </div>
            </fieldset>
            <fieldset
              disabled={!ledger.ready || !!ledger.error}
              className="space-y-4 disabled:opacity-50"
            >
              <legend className="text-caption font-medium mb-3">
                02 / Condition-specific source
              </legend>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Condition name">
                  <input
                    className={fieldClass}
                    required
                    value={draft.condition}
                    onChange={(e) => update("condition", e.target.value)}
                  />
                </Field>
                <Field label="Condition identifier (MedGen:C…)">
                  <input
                    className={fieldClass}
                    required
                    value={draft.conditionId}
                    onChange={(e) => update("conditionId", e.target.value)}
                  />
                </Field>
                <Field label="RCV accession.version">
                  <input
                    className={fieldClass}
                    required
                    placeholder="RCV000000001.1"
                    value={draft.accession}
                    onChange={(e) => update("accession", e.target.value)}
                  />
                </Field>
                <Field label="Germline classification (copy exact text)">
                  <input
                    className={fieldClass}
                    required
                    value={draft.classification}
                    onChange={(e) => update("classification", e.target.value)}
                  />
                </Field>
                <Field label="Source review status">
                  <select
                    className={fieldClass}
                    value={draft.reviewStatus}
                    onChange={(e) => update("reviewStatus", e.target.value)}
                  >
                    {REVIEW_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Last evaluated (optional source date)">
                  <input
                    className={fieldClass}
                    type="date"
                    value={draft.evaluatedOn}
                    onChange={(e) => update("evaluatedOn", e.target.value)}
                  />
                </Field>
                <Field label="PubMed IDs (optional, comma separated)">
                  <input
                    className={fieldClass}
                    value={draft.pmids}
                    onChange={(e) => update("pmids", e.target.value)}
                  />
                </Field>
                <Field label="Review notes">
                  <textarea
                    className={fieldClass}
                    value={draft.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </Field>
              </div>
              <label className="flex items-start gap-3 text-caption text-stone-600">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-cream-300 text-copper"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  required
                />
                <span>
                  I checked the assembly, forward alleles, condition and version
                  against my source. This records my transcription, not a
                  clinical validation.
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className={primaryClass}>
                  Save evidence snapshot
                </button>
                <button
                  type="button"
                  className={actionClass}
                  onClick={() => {
                    setDraft(blank());
                    setConfirmed(false);
                    setError("");
                  }}
                >
                  Clear form
                </button>
              </div>
            </fieldset>
          </form>
        </details>
      </Card>
      <section id="evidence-register" className="scroll-mt-6">
        <Card>
          <SectionTitle
            icon={BookOpen}
            title="Your evidence register"
            subtitle="Highest saved source version per exact context; this does not establish the current online classification."
          />
          <div className="flex flex-wrap gap-3 mb-5 no-print">
            <label className="flex items-center gap-2 flex-1 min-w-[180px] rounded-xl border border-cream-300 px-3">
              <Search size={15} className="text-stone-500" />
              <input
                className="w-full border-0 text-caption focus:ring-0 bg-transparent"
                aria-label="Search evidence"
                placeholder="Gene, condition, RCV or allele…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </label>
            <label className="flex gap-2 items-center text-caption text-stone-600">
              <input
                type="checkbox"
                className="rounded border-cream-300 text-copper"
                checked={attentionOnly}
                onChange={(e) => {
                  setAttentionOnly(e.target.checked);
                  setPage(0);
                }}
              />
              Only contexts to inspect
            </label>
          </div>
          {!ledger.ready ? (
            <p role="status">Loading saved evidence…</p>
          ) : !histories.length ? (
            <div className="rounded-xl border border-dashed border-cream-400 bg-cream-100 p-6">
              <h3 className="font-serif text-title">
                Start with one source you can trace
              </h3>
              <p className="text-caption text-stone-600 mt-2">
                No evidence snapshots saved. Open a condition-specific ClinVar
                record, copy its version and identity, then add a snapshot.
                Future captures stay alongside the original.
              </p>
              <p className="text-micro text-stone-500 mt-3">
                Imported raw SNP calls are kept separate: build, allele
                orientation and clinical applicability have not been
                established.
              </p>
            </div>
          ) : !visible.length ? (
            <p className="text-caption text-stone-500">
              No contexts match these filters.
            </p>
          ) : (
            <div className="space-y-4">
              {pageRows.map((h) => {
                const r = h.latest,
                  stars = reviewStars(r.reviewStatus);
                return (
                  <article
                    className="rounded-xl border border-cream-300 p-4 sm:p-5"
                    key={h.key}
                  >
                    <div className="flex flex-wrap justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-micro text-copper-700 uppercase tracking-wide">
                          Germline source record · {r.accession}
                        </p>
                        <h3 className="font-serif text-title mt-1">{r.name}</h3>
                        <p className="font-mono text-caption text-stone-600 break-all mt-1">
                          {variantKey(r.variant)}
                        </p>
                        <p className="text-caption text-stone-500 mt-1">
                          {r.condition} · {r.conditionId}
                        </p>
                      </div>
                      <a
                        href={sourceUrl(r)}
                        target="_blank"
                        rel="noreferrer"
                        className={`${actionClass} self-start`}
                      >
                        Open source
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4 rounded-xl bg-cream-100 p-4">
                      <div>
                        <p className="text-micro uppercase tracking-wide text-stone-500">
                          Transcribed classification
                        </p>
                        <p className="text-body font-medium mt-1">
                          {r.classification}
                        </p>
                      </div>
                      <div>
                        <p className="text-micro uppercase tracking-wide text-stone-500">
                          Source review status{" "}
                          {stars === null
                            ? "· stars unknown"
                            : `· ${stars}/4 stars`}
                        </p>
                        <p className="text-caption mt-1">{r.reviewStatus}</p>
                      </div>
                    </div>
                    {needsReview(h) && (
                      <div className="mt-3 rounded-xl border border-amber/30 bg-amber/10 p-3 text-caption text-stone-700">
                        <strong>Inspect the source.</strong>{" "}
                        {h.sourceConflict &&
                          "The saved source reports conflicting classifications. "}
                        {h.sameVersionDiscrepancy &&
                          "Different fields were captured under the same version; check transcription and source history. "}
                        {h.savedDisagreement &&
                          "Separate RCV records in this exact context have different saved classifications. "}
                        These flags do not resolve the evidence or determine
                        personal risk.
                      </div>
                    )}
                    <p className="text-micro text-stone-500 mt-3">
                      Last evaluated: {r.evaluatedOn || "not recorded"} ·
                      Captured: {new Date(r.capturedAt).toLocaleString()} ·{" "}
                      {h.snapshots.length} saved snapshot
                      {h.snapshots.length === 1 ? "" : "s"}
                    </p>
                    <details className="mt-4">
                      <summary className="text-caption text-copper-700 cursor-pointer flex items-center gap-2">
                        <History size={14} />
                        Version history & source notes
                      </summary>
                      <ol className="mt-4 space-y-3">
                        {h.snapshots.length > 20 && (
                          <li className="text-micro text-stone-500">
                            Showing the latest 20 of {h.snapshots.length}{" "}
                            snapshots. CSV and JSON exports include the complete
                            history.
                          </li>
                        )}
                        {h.snapshots.slice(-20).map((s, localIndex) => {
                          const i =
                            Math.max(0, h.snapshots.length - 20) + localIndex;
                          const change = i ? h.changes[i - 1] : null;
                          return (
                            <li
                              key={s.id}
                              className="border-l-2 border-cream-300 pl-4 space-y-2 text-caption"
                            >
                              <p className="font-medium">
                                {s.accession} · {s.classification}
                              </p>
                              <p className="text-stone-500">
                                {s.reviewStatus} · evaluated{" "}
                                {s.evaluatedOn || "unknown"} · captured{" "}
                                {new Date(s.capturedAt).toLocaleString()}
                              </p>
                              <p className="text-micro text-stone-500">
                                {!change
                                  ? "First saved source snapshot."
                                  : `${change.sameVersion ? "Same source version" : "Next saved version"}: ${change.fields.length ? change.fields.map((f) => ({ classification: "classification", reviewStatus: "source review status", evaluatedOn: "last-evaluated date" })[f]).join(", ") + " changed" : "no classification/review/evaluation change"}${change.citationsChanged ? "; citation list changed" : ""}. Intervening versions may be missing.`}
                              </p>
                              {s.notes && (
                                <p className="whitespace-pre-wrap break-words">
                                  {s.notes}
                                </p>
                              )}
                              {!!s.citationPmids.length && (
                                <div className="flex flex-wrap gap-3">
                                  {s.citationPmids.map((p) => (
                                    <a
                                      href={`https://pubmed.ncbi.nlm.nih.gov/${p}/`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline text-copper-700"
                                      key={p}
                                    >
                                      PMID {p}
                                    </a>
                                  ))}
                                </div>
                              )}
                              <button
                                className={`${actionClass} no-print`}
                                disabled={!!ledger.error}
                                onClick={() => {
                                  try {
                                    setRemoved(ledger.remove(s.id) || null);
                                    setError("");
                                  } catch (e) {
                                    setError(messageOf(e));
                                  }
                                }}
                              >
                                Remove {s.accession}
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    </details>
                    <button
                      className={`${actionClass} mt-4 no-print`}
                      disabled={!!ledger.error}
                      onClick={() => followUp(r)}
                    >
                      Add follow-up snapshot
                    </button>
                  </article>
                );
              })}
            </div>
          )}
          {visible.length > 20 && (
            <nav
              aria-label="Evidence pages"
              className="flex flex-wrap items-center gap-3 mt-5"
            >
              <button
                className={actionClass}
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous contexts
              </button>
              <span className="text-caption">
                Page {currentPage + 1} of {pageCount} · {visible.length}{" "}
                matching contexts
              </span>
              <button
                className={actionClass}
                disabled={currentPage + 1 === pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                Next contexts
              </button>
            </nav>
          )}
        </Card>
      </section>
      <Card className="relative">
        <SectionTitle
          icon={Download}
          title="Portable evidence"
          subtitle="CSV contains every snapshot; JSON backup supports reviewed restoration."
        />
        <div className="mb-3">
          <button
            className={actionClass}
            disabled={!ledger.ready || !!ledger.error || !ledger.entries.length}
            onClick={() =>
              downloadFile(
                "symphony-genome-evidence.csv",
                toCsv(genomeEvidenceCsvRows(ledger.entries)),
                "text/csv",
              )
            }
          >
            Export evidence CSV
          </button>
        </div>
        <LedgerTools
          kind="genome-evidence"
          storageKey={KEYS.evidence}
          schema={genomeEvidenceSchema}
          stored={ledger.error ? null : ledger.stored}
          disabled={!ledger.ready}
          onRestore={(value) => {
            ledger.restore(value);
            setNotice("Reviewed evidence backup restored.");
            setRemoved(null);
          }}
          summarize={(r) =>
            `${variantKey(r.variant)} · ${r.conditionId} · ${r.accession} · ${r.classification}`
          }
        />
      </Card>
      <section id="evidence-method" className="scroll-mt-6">
        <Card>
          <SectionTitle
            icon={Dna}
            title="How changes are compared"
            subtitle={GENOME_EVIDENCE_METHOD}
          />
          <ul className="list-disc pl-5 space-y-2 text-caption text-stone-600">
            <li>
              The unit is one assembly + chromosome + 1-based position + REF/ALT
              + MedGen condition + RCV base accession + germline assertion.
              rsIDs and gene names never join evidence.
            </li>
            <li>
              Histories sort by numeric source version, then capture time. We
              compare transcribed classification, review status and
              last-evaluated date without averaging classes or assigning a
              probability. Missing dates stay unknown; review stars describe
              source review, not confidence or disease risk.
            </li>
            <li>
              Same-version field differences and different saved RCV
              classifications are inspection flags. ClinVar may update some
              metadata without incrementing a version. A version change alone is
              not evidence of clinical reclassification. Capturing a source
              today does not establish its evaluation date.
            </li>
            <li>
              Identity is syntax-checked only. Coordinates, reference alleles,
              MedGen membership, accessions and citations are not checked
              against a reference database. Different builds, conditions and
              accession histories remain separate, including unmapped aliases.
            </li>
            <li>
              No patient diagnosis, pathogenicity prediction, treatment advice,
              literature extraction or model inference is performed. Use the
              original record and qualified clinical review for interpretation.
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-4 text-caption">
            <a
              href="https://www.ncbi.nlm.nih.gov/clinvar/docs/identifiers/"
              target="_blank"
              rel="noreferrer"
              className="underline text-copper-700"
            >
              ClinVar identifiers & versions
            </a>
            <a
              href="https://www.ncbi.nlm.nih.gov/clinvar/docs/review_status/"
              target="_blank"
              rel="noreferrer"
              className="underline text-copper-700"
            >
              Review status
            </a>
            <a href="/reports" className="underline text-copper-700">
              Personal report
            </a>
          </div>
        </Card>
      </section>
    </div>
  );
}
