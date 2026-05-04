"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import {
  Upload, Activity, Dna, FlaskConical, CheckCircle2, AlertCircle,
  Trash2, FileSpreadsheet, FileText, Compass, ArrowRight, Lock, RefreshCcw,
} from "lucide-react";
import {
  KEYS,
  parseCgmCsv,
  parseCgmXlsx,
  parseGenomeText,
  matchKnownSnps,
  computeStats,
  buildDailyTrace,
  readJSON,
  writeJSON,
  clearKey,
  type CgmStored,
  type GenomeStored,
  type GenomeRow,
} from "@/lib/user-data";

type Status = { kind: "idle" } | { kind: "parsing" } | { kind: "ok"; msg: string } | { kind: "error"; msg: string };

export default function ImportPage() {
  // Existing uploads (loaded from localStorage)
  const [cgmStored, setCgmStored] = useState<CgmStored | null>(null);
  const [genomeStored, setGenomeStored] = useState<GenomeStored | null>(null);
  const [cgmStatus, setCgmStatus] = useState<Status>({ kind: "idle" });
  const [genomeStatus, setGenomeStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    setCgmStored(readJSON<CgmStored>(KEYS.cgm));
    setGenomeStored(readJSON<GenomeStored>(KEYS.genome));
  }, []);

  // ── CGM upload ────────────────────────────────────────────
  async function handleCgmFile(file: File) {
    setCgmStatus({ kind: "parsing" });
    const ext = file.name.toLowerCase().split(".").pop() || "";
    let result;
    try {
      if (ext === "xlsx" || ext === "xls") {
        result = await parseCgmXlsx(file);
      } else {
        const text = await file.text();
        result = parseCgmCsv(text);
      }
    } catch (e: any) {
      setCgmStatus({ kind: "error", msg: e?.message || "Failed to read file" });
      return;
    }
    if (!result.ok) {
      setCgmStatus({ kind: "error", msg: result.error });
      return;
    }
    const stored: CgmStored = {
      uploadedAt: new Date().toISOString(),
      count: result.readings.length,
      unit: result.unit,
      readings: result.readings,
    };
    writeJSON(KEYS.cgm, stored);
    setCgmStored(stored);
    setCgmStatus({ kind: "ok", msg: `Imported ${result.readings.length} readings (auto-converted from ${result.unit})` });
  }

  function clearCgm() {
    clearKey(KEYS.cgm);
    setCgmStored(null);
    setCgmStatus({ kind: "idle" });
  }

  // ── Genome upload ─────────────────────────────────────────
  async function handleGenomeFile(file: File) {
    setGenomeStatus({ kind: "parsing" });
    let text: string;
    try {
      text = await file.text();
    } catch (e: any) {
      setGenomeStatus({ kind: "error", msg: e?.message || "Failed to read file" });
      return;
    }
    const result = parseGenomeText(text);
    if (!result.ok) {
      setGenomeStatus({ kind: "error", msg: result.error });
      return;
    }
    const matched = matchKnownSnps(result.rows);
    const stored: GenomeStored = {
      uploadedAt: new Date().toISOString(),
      totalRows: result.rows.length,
      matchedSnps: matched,
    };
    writeJSON(KEYS.genome, stored);
    setGenomeStored(stored);
    setGenomeStatus({
      kind: "ok",
      msg: `Imported ${result.rows.length.toLocaleString()} variants — matched ${matched.length} of our annotated SNPs`,
    });
  }

  function clearGenome() {
    clearKey(KEYS.genome);
    setGenomeStored(null);
    setGenomeStatus({ kind: "idle" });
  }

  return (
    <div className="flex flex-col gap-7">
      {/* ──── Header ──── */}
      <Card className="p-7">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-copper flex items-center justify-center shrink-0">
            <Compass size={22} strokeWidth={1.7} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-micro text-stone-400 uppercase tracking-[0.12em] font-medium mb-1">Import Your Data</div>
            <h2 className="font-serif text-[26px] font-semibold text-stone-800 tracking-tight">Bring your own signals</h2>
            <p className="text-body text-stone-500 mt-1.5 max-w-2xl leading-relaxed">
              Health Compass works out of the box with demo data. Upload your own CGM trace and genome here and the
              dashboard, glucose page, and genomics page will switch to using yours instead. Everything stays on this device — nothing is sent to a server.
            </p>
            <div className="flex items-center gap-2 mt-3 text-micro text-stone-500">
              <Lock size={12} strokeWidth={1.7} />
              <span>Stored locally in your browser. Clear with one click. Never transmitted.</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ──── CGM upload ──── */}
      <Card>
        <SectionTitle
          icon={Activity}
          title="Continuous Glucose (CGM)"
          subtitle="Sibionics, Dexcom, Libre, Stelo — export your reading log and drop it here"
          action={
            cgmStored && (
              <button
                onClick={clearCgm}
                className="flex items-center gap-1.5 text-micro text-stone-500 hover:text-rose px-2.5 py-1 rounded-lg hover:bg-rose-light/40 transition-colors"
              >
                <Trash2 size={12} /> Clear
              </button>
            )
          }
        />

        {cgmStored ? (
          <UploadedCgmPanel stored={cgmStored} />
        ) : (
          <FileDrop
            label="Drop CGM file (.csv or .xlsx)"
            hint="Expected columns: timestamp, glucose value. mmol/L and mg/dL both supported (auto-detected)."
            accept=".csv,.xlsx,.xls,.txt"
            onFile={handleCgmFile}
            status={cgmStatus}
            icon={FileSpreadsheet}
          />
        )}

        {cgmStatus.kind === "ok" && (
          <div className="mt-3 flex items-start gap-2 text-caption text-sage-dark p-3 rounded-xl bg-sage-light/50 border border-sage/15">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> {cgmStatus.msg}
          </div>
        )}
        {cgmStatus.kind === "error" && (
          <div className="mt-3 flex items-start gap-2 text-caption text-rose-dark p-3 rounded-xl bg-rose-light/50 border border-rose/15">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {cgmStatus.msg}
          </div>
        )}
      </Card>

      {/* ──── Genome upload ──── */}
      <Card>
        <SectionTitle
          icon={Dna}
          title="Genome Variants"
          subtitle="23andMe, AncestryDNA, WeGene — drop the raw data file (.txt). We match against our 22 annotated SNPs."
          action={
            genomeStored && (
              <button
                onClick={clearGenome}
                className="flex items-center gap-1.5 text-micro text-stone-500 hover:text-rose px-2.5 py-1 rounded-lg hover:bg-rose-light/40 transition-colors"
              >
                <Trash2 size={12} /> Clear
              </button>
            )
          }
        />

        {genomeStored ? (
          <UploadedGenomePanel stored={genomeStored} />
        ) : (
          <FileDrop
            label="Drop genome raw data (.txt)"
            hint="23andMe-style format: one rsID per line, tab-separated (rsid  chromosome  position  genotype)."
            accept=".txt,.tsv,.csv"
            onFile={handleGenomeFile}
            status={genomeStatus}
            icon={FileText}
          />
        )}

        {genomeStatus.kind === "ok" && (
          <div className="mt-3 flex items-start gap-2 text-caption text-sage-dark p-3 rounded-xl bg-sage-light/50 border border-sage/15">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> {genomeStatus.msg}
          </div>
        )}
        {genomeStatus.kind === "error" && (
          <div className="mt-3 flex items-start gap-2 text-caption text-rose-dark p-3 rounded-xl bg-rose-light/50 border border-rose/15">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {genomeStatus.msg}
          </div>
        )}
      </Card>

      {/* ──── Bloodwork upload (placeholder for v2) ──── */}
      <Card className="opacity-60">
        <SectionTitle
          icon={FlaskConical}
          title="Blood Work"
          subtitle="Coming soon — paste lab values from your most recent panel"
        />
        <div className="text-caption text-stone-500 leading-relaxed">
          Manual entry and CSV import for biomarkers (HbA1c, lipids, hormones, vitamins) is on the roadmap.
          For now, the Blood Work module shows demo values you can&apos;t edit.
        </div>
      </Card>

      {/* ──── Step-by-step guide ──── */}
      <Card>
        <SectionTitle
          icon={ArrowRight}
          title="How to export your data"
          subtitle="Quick instructions for the most common providers"
        />
        <div className="grid grid-cols-2 gap-4">
          <ProviderGuide
            name="Sibionics CGM"
            steps={[
              "Open the Sibionics app",
              "Go to Settings → Data Export",
              "Choose date range (last 14 days recommended)",
              "Tap Export → save as .xlsx",
              "Upload here",
            ]}
          />
          <ProviderGuide
            name="Dexcom Clarity"
            steps={[
              "Sign in at clarity.dexcom.com",
              "Reports → Export Data",
              "Choose CSV format and date range",
              "Download, upload here",
            ]}
          />
          <ProviderGuide
            name="Abbott FreeStyle Libre"
            steps={[
              "Open the LibreView account online",
              "Glucose History → Download data",
              "Save the CSV file",
              "Upload here",
            ]}
          />
          <ProviderGuide
            name="23andMe / AncestryDNA"
            steps={[
              "Sign in to 23andMe (or AncestryDNA)",
              "Account Settings → Browse Raw Data → Download",
              "Confirm with email link, save the .txt or .zip",
              "Unzip if needed, upload the .txt",
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
function FileDrop({ label, hint, accept, onFile, status, icon: Icon }: {
  label: string; hint: string; accept: string; onFile: (f: File) => void;
  status: Status; icon: any;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault(); setHover(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 transition-all ${
        hover ? "border-copper bg-copper-50" : "border-cream-400 bg-cream-50 hover:border-copper/40 hover:bg-copper-50/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <div className="w-14 h-14 rounded-2xl bg-white border border-copper/20 flex items-center justify-center shadow-subtle">
        {status.kind === "parsing" ? (
          <RefreshCcw size={26} className="text-copper animate-spin" strokeWidth={1.5} />
        ) : (
          <Upload size={26} className="text-copper" strokeWidth={1.5} />
        )}
      </div>
      <div className="text-body font-medium text-stone-700">{label}</div>
      <div className="text-caption text-stone-400 max-w-md text-center leading-relaxed">{hint}</div>
    </div>
  );
}

function UploadedCgmPanel({ stored }: { stored: CgmStored }) {
  const stats = computeStats(stored.readings);
  const traceLength = buildDailyTrace(stored).length;
  const uploadedAt = new Date(stored.uploadedAt);
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-2xl bg-sage-light/40 border border-sage/15">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} className="text-sage" />
          <span className="text-caption font-medium text-sage-dark">Your data is loaded</span>
        </div>
        <div className="text-micro text-stone-500 leading-relaxed">
          Uploaded {uploadedAt.toLocaleString()}. {stored.count.toLocaleString()} readings ({stored.unit}).
          The Glucose page will use your most recent full day ({traceLength} sampled points) instead of the demo trace.
        </div>
      </div>
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Average" value={stats.avg.toFixed(1)} unit="mmol/L" />
          <Stat label="Time in Range" value={stats.tir.toFixed(0) + "%"} unit="3.9–7.8" />
          <Stat label="GMI" value={stats.gmi.toFixed(1) + "%"} unit="est. HbA1c" />
          <Stat label="Range" value={`${stats.min.toFixed(1)}–${stats.max.toFixed(1)}`} unit="min–max" />
        </div>
      )}
    </div>
  );
}

function UploadedGenomePanel({ stored }: { stored: GenomeStored }) {
  const uploadedAt = new Date(stored.uploadedAt);
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-2xl bg-sage-light/40 border border-sage/15">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} className="text-sage" />
          <span className="text-caption font-medium text-sage-dark">Your genome is loaded</span>
        </div>
        <div className="text-micro text-stone-500 leading-relaxed">
          Uploaded {uploadedAt.toLocaleString()}. {stored.totalRows.toLocaleString()} variants in file —
          matched {stored.matchedSnps.length} of our {22} annotated SNPs.
        </div>
      </div>
      {stored.matchedSnps.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {stored.matchedSnps.map((s) => (
            <div key={s.rsid} className="flex items-center gap-3 p-2.5 rounded-xl bg-cream-100 border border-cream-300">
              <div className="text-micro font-mono text-stone-400 w-[70px] truncate">{s.rsid}</div>
              <div className="flex-1 min-w-0">
                <div className="text-caption font-medium text-stone-800 truncate">{s.gene} <span className="text-stone-400 font-normal">— {s.variant}</span></div>
              </div>
              <Badge variant="default">{s.genotype}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="p-3 rounded-xl bg-cream-100 border border-cream-300">
      <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mb-1">{label}</div>
      <div className="text-[18px] font-serif font-semibold text-stone-800">{value}</div>
      <div className="text-[10px] text-stone-400 mt-0.5">{unit}</div>
    </div>
  );
}

function ProviderGuide({ name, steps }: { name: string; steps: string[] }) {
  return (
    <div className="p-4 rounded-xl bg-cream-100 border border-cream-300">
      <div className="text-caption font-medium text-stone-800 mb-2.5">{name}</div>
      <ol className="space-y-1.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2 text-micro text-stone-600 leading-relaxed">
            <span className="w-4 h-4 rounded-full bg-copper-50 border border-copper/15 text-copper-700 text-[9px] font-medium flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
