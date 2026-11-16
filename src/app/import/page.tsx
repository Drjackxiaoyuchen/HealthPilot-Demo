"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Upload,
  Activity,
  Dna,
  FlaskConical,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  KEYS,
  parseGenomeText,
  matchKnownSnps,
  writeJSON,
  clearKey,
  type GenomeStored,
} from "@/lib/user-data";
import {
  parseCgmCsv,
  parseCgmXlsx,
  computeStats,
  type CgmStored,
  type GlucoseUnit,
} from "@/lib/cgm";
import {
  parseBloodworkCsv,
  BLOODWORK_TEMPLATE,
  type BloodworkStored,
} from "@/lib/bloodwork";
import { useLocalData } from "@/lib/use-local-data";
import { downloadFile } from "@/lib/download";

type Kind = "cgm" | "genome" | "bloodwork";
type Pending =
  | { kind: "cgm"; data: CgmStored; warnings: string[] }
  | { kind: "genome"; data: GenomeStored; warnings: string[] }
  | { kind: "bloodwork"; data: BloodworkStored; warnings: string[] };
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-cream-300 bg-white px-4 py-2 text-caption font-medium hover:border-copper text-stone-700";
const CGM_TEMPLATE =
  "timestamp,glucose_mmol_l\n2026-11-15T08:00:00+08:00,5.2\n2026-11-15T08:05:00+08:00,5.4\n2026-11-15T08:10:00+08:00,5.3\n";

export default function ImportPage() {
  const cgm = useLocalData<CgmStored>(KEYS.cgm);
  const genome = useLocalData<GenomeStored>(KEYS.genome);
  const bloodwork = useLocalData<BloodworkStored>(KEYS.bloodwork);
  const [unit, setUnit] = useState<GlucoseUnit | "">("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState<Kind | null>(null);
  const [message, setMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);

  async function preview(kind: Kind, file: File) {
    setMessage(null);
    setPending(null);
    setBusy(kind);
    try {
      if (file.size > 30 * 1024 * 1024)
        throw new Error(
          "Use a file under 30 MB. Split larger exports into a smaller date window.",
        );
      const uploadedAt = new Date().toISOString();
      if (kind === "cgm") {
        const parsed = /\.xlsx?$/i.test(file.name)
          ? await parseCgmXlsx(file, unit || undefined)
          : parseCgmCsv(await file.text(), unit || undefined);
        if (!parsed.ok) throw new Error(parsed.error);
        setPending({
          kind,
          data: {
            uploadedAt,
            sourceFile: file.name,
            count: parsed.readings.length,
            unit: parsed.unit,
            readings: parsed.readings,
            warnings: parsed.warnings,
          },
          warnings: parsed.warnings,
        });
      } else if (kind === "genome") {
        const parsed = parseGenomeText(await file.text());
        if (!parsed.ok) throw new Error(parsed.error);
        setPending({
          kind,
          data: {
            uploadedAt,
            sourceFile: file.name,
            totalRows: parsed.rows.length,
            matchedSnps: matchKnownSnps(parsed.rows),
          },
          warnings: [
            "Only called A/C/G/T genotypes are retained. Missing calls are excluded.",
            "This is an rsID match against 22 records, without build/strand harmonization or clinical interpretation. Only panel matches are saved.",
          ],
        });
      } else {
        const parsed = parseBloodworkCsv(await file.text());
        if (!parsed.ok) throw new Error(parsed.error);
        setPending({
          kind,
          data: {
            uploadedAt,
            sourceFile: file.name,
            observations: parsed.observations,
          },
          warnings: parsed.warnings,
        });
      }
    } catch (error) {
      setMessage({
        error: true,
        text:
          error instanceof Error ? error.message : "Unable to read this file.",
      });
    } finally {
      setBusy(null);
    }
  }

  function save() {
    if (!pending) return;
    try {
      writeJSON(KEYS[pending.kind], pending.data);
      setMessage({
        error: false,
        text: "Saved on this browser. Your reviewed upload replaces the previous dataset for this type.",
      });
      setPending(null);
    } catch {
      setMessage({
        error: true,
        text: "Browser storage is full or unavailable. Nothing was saved. Try a smaller file or free space.",
      });
    }
  }
  function clear(kind: Kind) {
    try {
      clearKey(KEYS[kind]);
      if (pending?.kind === kind) setPending(null);
      setMessage({
        error: false,
        text: "Local dataset cleared. The corresponding view returns to clearly labeled demo data.",
      });
    } catch {
      setMessage({
        error: true,
        text: "The browser could not clear this dataset. Check storage permissions.",
      });
    }
  }
  const stats =
    pending?.kind === "cgm" ? computeStats(pending.data.readings) : null;

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-micro uppercase tracking-widest text-copper-700 font-medium">
          Your data, in harmony
        </div>
        <h2 className="font-serif text-[30px] mt-1">Bring your own signals</h2>
        <p className="text-body text-stone-500 mt-2 max-w-2xl">
          Preview an export, check the values, then save it to this browser.
          Personal CGM, lab results and matched genome calls appear in their own
          views. Other sections remain labeled demonstrations.
        </p>
        <p className="flex items-center gap-2 text-caption text-stone-500 mt-4">
          <Lock size={14} /> Files are processed on this device. Saved data is
          unencrypted browser storage; shared browser profiles can access it.
        </p>
      </Card>

      {message && (
        <div
          role={message.error ? "alert" : "status"}
          className={`p-4 rounded-xl border flex gap-2 text-body ${message.error ? "border-rose/30 bg-rose-light text-rose-dark" : "border-sage/30 bg-sage-light text-sage-dark"}`}
        >
          {message.error ? (
            <AlertCircle size={18} className="shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <ImportCard
          title="Continuous glucose"
          icon={Activity}
          description="CSV / TSV or the first Excel worksheet. Use an ISO timestamp and a glucose column. Provider exports may need column/date cleanup."
          accept=".csv,.tsv,.txt,.xlsx,.xls"
          busy={busy !== null}
          onFile={(file) => preview("cgm", file)}
          stored={
            cgm
              ? `${cgm.count.toLocaleString()} readings · ${cgm.sourceFile || "Previous upload"}`
              : undefined
          }
          onClear={() => clear("cgm")}
        >
          <label className="block text-caption text-stone-600">
            File glucose unit
            <select
              aria-label="File glucose unit"
              value={unit}
              onChange={(event) =>
                setUnit(event.target.value as GlucoseUnit | "")
              }
              className="mt-1 w-full rounded-lg border-cream-300 text-caption"
            >
              <option value="">Read from column header</option>
              <option value="mmol/L">mmol/L</option>
              <option value="mg/dL">mg/dL</option>
            </select>
          </label>
          <button
            className="text-copper-700 text-caption underline mt-3"
            onClick={() =>
              downloadFile("symphony-cgm-example.csv", CGM_TEMPLATE, "text/csv")
            }
          >
            <Download size={12} className="inline mr-1" />
            Example CSV
          </button>
        </ImportCard>
        <ImportCard
          title="Genome calls"
          icon={Dna}
          description="Raw text in rsID, chromosome, position, genotype format. AncestryDNA's two allele columns are also supported. Unzip exports first."
          accept=".txt,.tsv,.csv"
          busy={busy !== null}
          onFile={(file) => preview("genome", file)}
          stored={
            genome
              ? `${genome.matchedSnps.length} panel matches · ${genome.sourceFile || "Previous upload"}`
              : undefined
          }
          onClear={() => clear("genome")}
        />
        <ImportCard
          title="Blood work"
          icon={FlaskConical}
          description="CSV with marker, value, unit and collected_at. Optional laboratory ranges, category, lab and LOINC are preserved. Dates: YYYY-MM-DD."
          accept=".csv,.tsv"
          busy={busy !== null}
          onFile={(file) => preview("bloodwork", file)}
          stored={
            bloodwork
              ? `${bloodwork.observations.length} results · ${bloodwork.sourceFile}`
              : undefined
          }
          onClear={() => clear("bloodwork")}
        >
          <button
            className="text-copper-700 text-caption underline"
            onClick={() =>
              downloadFile(
                "symphony-lab-example.csv",
                BLOODWORK_TEMPLATE,
                "text/csv",
              )
            }
          >
            <Download size={12} className="inline mr-1" />
            Example CSV
          </button>
        </ImportCard>
      </div>

      {busy && (
        <p role="status" className="text-body text-stone-500">
          Reading {busy} file…
        </p>
      )}
      {pending && (
        <Card accent>
          <h3 className="font-serif text-title">Review before saving</h3>
          <p className="text-caption text-stone-500 mt-1 break-all">
            {pending.data.sourceFile} · replaces your existing {pending.kind}{" "}
            dataset
          </p>
          <ul className="my-4 space-y-1 text-caption text-stone-600 list-disc pl-5">
            {pending.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
          {stats && (
            <div className="grid sm:grid-cols-4 gap-3 mb-4">
              {[
                ["Readings", stats.count],
                ["Days represented", stats.days],
                ["Mean (mmol/L)", stats.avg.toFixed(2)],
                ["Coverage of elapsed window", stats.coverage.toFixed(1) + "%"],
              ].map(([label, value]) => (
                <div key={label} className="bg-cream-100 p-3 rounded-xl">
                  <p className="text-micro text-stone-500">{label}</p>
                  <strong className="text-title font-serif">{value}</strong>
                </div>
              ))}
            </div>
          )}
          <div className="overflow-auto max-h-72 border border-cream-300 rounded-xl mb-4">
            <table className="w-full text-caption text-left">
              <thead className="bg-cream-100">
                <tr>
                  {(pending.kind === "cgm"
                    ? ["Timestamp", "Glucose (mmol/L)"]
                    : pending.kind === "genome"
                      ? ["rsID", "Gene", "Call"]
                      : [
                          "Marker",
                          "Value",
                          "Unit",
                          "Collected",
                          "Reference interval",
                          "Lab",
                        ]
                  ).map((label) => (
                    <th className="p-3 whitespace-nowrap" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(pending.kind === "cgm"
                  ? pending.data.readings
                      .slice(0, 8)
                      .map((r) => [r.t, r.v.toFixed(2)])
                  : pending.kind === "genome"
                    ? pending.data.matchedSnps.map((r) => [
                        r.rsid,
                        r.gene,
                        r.genotype,
                      ])
                    : pending.data.observations
                        .slice(0, 12)
                        .map((r) => [
                          r.marker,
                          r.value,
                          r.unit,
                          r.collectedAt,
                          `${r.referenceLow ?? "—"} – ${r.referenceHigh ?? "—"}`,
                          r.lab,
                        ])
                ).map((row, index) => (
                  <tr key={index} className="border-t border-cream-300">
                    {row.map((cell, i) => (
                      <td className="p-3 whitespace-nowrap" key={i}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pending.kind === "genome" && !pending.data.matchedSnps.length && (
            <p className="text-caption mb-3">
              No calls match the small reference panel. Saving records this
              import with zero matches.
            </p>
          )}
          <div className="flex gap-3">
            <button
              className={`${button} !bg-copper !text-white`}
              onClick={save}
            >
              Save reviewed data
            </button>
            <button className={button} onClick={() => setPending(null)}>
              Discard preview
            </button>
          </div>
        </Card>
      )}
      <Card>
        <h3 className="font-serif text-title mb-2">Keep the original export</h3>
        <p className="text-body text-stone-500">
          Browser storage can be cleared by your browser. Keep your original
          files and use{" "}
          <Link href="/reports" className="text-copper-700 underline">
            Reports
          </Link>{" "}
          to download normalized data and analysis notes. Lab trends compare
          matching marker names, units and laboratories; they do not silently
          convert units.
        </p>
      </Card>
    </div>
  );
}

function ImportCard({
  title,
  description,
  icon: Icon,
  accept,
  busy,
  stored,
  onFile,
  onClear,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Activity;
  accept: string;
  busy: boolean;
  stored?: string;
  onFile: (file: File) => void;
  onClear: () => void;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-copper" />
        <h3 className="font-serif text-title">{title}</h3>
      </div>
      <p className="text-caption text-stone-500 flex-1">{description}</p>
      {stored && (
        <div className="bg-sage-light p-3 rounded-lg text-caption text-sage-dark break-words">
          {stored}
          <button
            className="flex items-center gap-1 mt-2 underline"
            onClick={onClear}
            disabled={busy}
          >
            <Trash2 size={12} />
            Clear saved data
          </button>
        </div>
      )}
      {children}
      <input
        aria-label={`Upload ${title}`}
        ref={ref}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
      <button
        disabled={busy}
        className={`${button} disabled:opacity-50`}
        onClick={() => ref.current?.click()}
      >
        <Upload size={14} />
        {stored ? "Preview replacement" : "Choose file to preview"}
      </button>
    </Card>
  );
}
