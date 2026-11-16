"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Download,
  Printer,
  Activity,
  Dna,
  FlaskConical,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { KEYS, type GenomeStored } from "@/lib/user-data";
import type { CgmStored } from "@/lib/cgm";
import type { BloodworkStored } from "@/lib/bloodwork";
import { useLocalData } from "@/lib/use-local-data";
import { downloadFile } from "@/lib/download";
import { toCsv } from "@/lib/tabular";
import { createReport, labCsvRows, REPORT_VERSION } from "@/lib/report";
import { useLedger } from "@/lib/use-ledger";
import {
  supplementSchema,
  mealSchema,
  workoutSchema,
} from "@/lib/personal-ledgers";

export default function ReportsPage() {
  const cgm = useLocalData<CgmStored>(KEYS.cgm),
    genome = useLocalData<GenomeStored>(KEYS.genome),
    bloodwork = useLocalData<BloodworkStored>(KEYS.bloodwork);
  const [generatedAt, setGeneratedAt] = useState("");
  const supplements = useLedger(
      KEYS.supplements,
      "supplements",
      supplementSchema,
    ),
    meals = useLedger(KEYS.meals, "meals", mealSchema),
    workouts = useLedger(KEYS.workouts, "workouts", workoutSchema);
  useEffect(() => setGeneratedAt(new Date().toISOString()), []);
  const report = createReport(
    {
      cgm,
      genome,
      bloodwork,
      supplements: supplements.stored,
      meals: meals.stored,
      workouts: workouts.stored,
    },
    generatedAt,
  );
  const button =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border border-cream-300 bg-white text-caption text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-micro uppercase tracking-widest text-copper-700">
              Symphony AI / Personal data report
            </p>
            <h2 className="font-serif text-[30px] mt-1">
              Your signals, ready to review
            </h2>
            <p className="text-body text-stone-500 mt-2 max-w-2xl">
              A local export of imported observations, source details, data
              quality and methods. The report keeps demo scores out of your
              personal record.
            </p>
            <p className="text-micro text-stone-400 mt-2">
              {generatedAt
                ? `Generated ${new Date(generatedAt).toLocaleString()} · ${report.timeZone}`
                : "Preparing local report…"}{" "}
              · {REPORT_VERSION}
            </p>
          </div>
          <FileText className="text-copper" size={30} />
        </div>
        <div className="no-print mt-5 flex flex-wrap gap-3">
          <button
            className={`${button} !bg-copper !text-white`}
            onClick={() =>
              downloadFile(
                "symphony-personal-report.json",
                JSON.stringify(report, null, 2),
                "application/json",
              )
            }
          >
            <Download size={14} />
            Download full JSON report
          </button>
          <button className={button} onClick={() => window.print()}>
            <Printer size={14} />
            Print / save as PDF
          </button>
          <Link href="/import" className={button}>
            Manage imports
          </Link>
        </div>
        <p className="no-print text-micro text-stone-500 mt-3">
          Downloads include personal health data from this browser. Save or
          share them intentionally.
        </p>
      </Card>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="print-card">
          <div className="flex gap-2 items-center mb-3">
            <Activity size={18} className="text-copper" />
            <h3 className="font-serif text-title">Continuous glucose</h3>
          </div>
          {report.cgm?.summary ? (
            <>
              <p className="text-caption text-stone-500 break-all">
                {report.cgm.source.filename}
              </p>
              <dl className="space-y-2 text-caption mt-4">
                <Metric
                  name="Readings"
                  value={report.cgm.summary.count.toLocaleString()}
                />
                <Metric
                  name="Days represented"
                  value={report.cgm.summary.days}
                />
                <Metric
                  name="Mean"
                  value={`${report.cgm.summary.avg.toFixed(2)} mmol/L`}
                />
                <Metric
                  name="In range (3.9–10)"
                  value={`${report.cgm.summary.tir.toFixed(1)}%`}
                />
                <Metric
                  name="Elapsed-window coverage"
                  value={`${report.cgm.summary.coverage.toFixed(1)}%`}
                />
                <Metric
                  name="CV"
                  value={`${report.cgm.summary.cv.toFixed(1)}%`}
                />
                <Metric
                  name="GMI"
                  value={
                    report.cgm.summary.gmi === null
                      ? "Insufficient record"
                      : `${report.cgm.summary.gmi.toFixed(1)}%`
                  }
                />
              </dl>
              <p className="text-micro text-stone-400 mt-4">
                {new Date(report.cgm.summary.start).toLocaleString()} →{" "}
                {new Date(report.cgm.summary.end).toLocaleString()}
              </p>
              <button
                className={`${button} mt-4 no-print`}
                onClick={() =>
                  downloadFile(
                    "symphony-cgm.csv",
                    toCsv([
                      ["timestamp", "glucose_mmol_l"],
                      ...report.cgm!.readings.map((row) => [row.t, row.v]),
                    ]),
                    "text/csv",
                  )
                }
              >
                <Download size={12} />
                Readings CSV
              </button>
              <button
                className={`${button} mt-2 no-print`}
                onClick={() =>
                  downloadFile(
                    "symphony-hourly-profile.csv",
                    toCsv([
                      [
                        "hour",
                        "readings",
                        "days",
                        "p05",
                        "p25",
                        "median",
                        "p75",
                        "p95",
                      ],
                      ...report.cgm!.hourlyProfile.map((row) => [
                        row.hour,
                        row.n,
                        row.days,
                        row.p05,
                        row.p25,
                        row.median,
                        row.p75,
                        row.p95,
                      ]),
                    ]),
                    "text/csv",
                  )
                }
              >
                <Download size={12} />
                Hourly profile CSV
              </button>
            </>
          ) : (
            <Empty />
          )}
        </Card>
        <Card className="print-card">
          <div className="flex gap-2 items-center mb-3">
            <FlaskConical size={18} className="text-copper" />
            <h3 className="font-serif text-title">Laboratory results</h3>
          </div>
          {report.bloodwork ? (
            <>
              <p className="text-caption text-stone-500 break-all">
                {report.bloodwork.source.filename}
              </p>
              <p className="font-serif text-[30px] mt-4">
                {report.bloodwork.observations.length}
                <span className="font-sans text-caption text-stone-500 ml-2">
                  observations
                </span>
              </p>
              <p className="text-caption text-stone-500 mt-2">
                {report.bloodwork.seriesCount} marker / unit / lab series
              </p>
              <p className="text-caption text-stone-500 mt-4">
                {report.bloodwork.limitations}
              </p>
              <button
                className={`${button} mt-4 no-print`}
                onClick={() =>
                  downloadFile(
                    "symphony-labs.csv",
                    toCsv(labCsvRows(bloodwork!)),
                    "text/csv",
                  )
                }
              >
                <Download size={12} />
                Laboratory CSV
              </button>
            </>
          ) : (
            <Empty />
          )}
        </Card>
        <Card className="print-card">
          <div className="flex gap-2 items-center mb-3">
            <Dna size={18} className="text-copper" />
            <h3 className="font-serif text-title">Genome calls</h3>
          </div>
          {report.genome ? (
            <>
              <p className="text-caption text-stone-500 break-all">
                {report.genome.source.filename}
              </p>
              <p className="font-serif text-[30px] mt-4">
                {report.genome.matchedCalls.length}
                <span className="font-sans text-caption text-stone-500 ml-2">
                  panel matches
                </span>
              </p>
              <p className="text-caption text-stone-500 mt-2">
                {report.genome.totalCalledRows.toLocaleString()} called rows
                read
              </p>
              <p className="text-caption text-stone-500 mt-4">
                {report.genome.limitations}
              </p>
              <button
                className={`${button} mt-4 no-print`}
                onClick={() =>
                  downloadFile(
                    "symphony-genome-calls.csv",
                    toCsv([
                      ["rsid", "gene", "variant", "genotype"],
                      ...report.genome!.matchedCalls.map((row) => [
                        row.rsid,
                        row.gene,
                        row.variant,
                        row.genotype,
                      ]),
                    ]),
                    "text/csv",
                  )
                }
              >
                <Download size={12} />
                Matched calls CSV
              </button>
            </>
          ) : (
            <Empty />
          )}
        </Card>
      </div>
      <Card className="print-card">
        <h3 className="font-serif text-title mb-3">
          Daily records & label sources
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-caption text-stone-600">
          <div>
            <strong>Supplement products</strong>
            <p>
              {report.supplements?.entries.length || 0} saved ·{" "}
              {report.supplements?.plannedDailyTotals.length || 0} active
              ingredient totals
            </p>
            <Link
              href="/supplements"
              className="text-copper-700 underline no-print"
            >
              Open supplement ledger
            </Link>
          </div>
          <div>
            <strong>Meal diary</strong>
            <p>
              {report.nutrition?.entries.length || 0} saved meals ·{" "}
              {report.nutrition?.dailyLoggedIntake.length || 0} days with logged
              intake
            </p>
            <Link href="/diet" className="text-copper-700 underline no-print">
              Open food diary
            </Link>
          </div>
          <div>
            <strong>Training sessions</strong>
            <p>
              {report.fitness?.entries.length || 0} saved ·{" "}
              {report.fitness?.completedDays.length || 0} days with completed
              sessions
            </p>
            <Link
              href="/fitness"
              className="text-copper-700 underline no-print"
            >
              Open training log
            </Link>
          </div>
        </div>
        <p className="text-micro text-stone-500 mt-4">
          The full JSON report includes these records, their sources, methods
          and derived summaries. Use each module's JSON backup for reviewed
          restoration. Missing records are not filled with examples.
        </p>
        {[supplements.error, meals.error, workouts.error]
          .filter(Boolean)
          .map((error, i) => (
            <p
              role="alert"
              key={i}
              className="text-caption text-rose-dark mt-2"
            >
              {error}
            </p>
          ))}
      </Card>
      <Card className="print-card">
        <h3 className="font-serif text-title mb-4">Methods & completeness</h3>
        <ul className="list-disc pl-5 space-y-2 text-caption text-stone-600">
          {(
            report.cgm?.methodNotes || ["No personal CGM dataset is included."]
          ).map((note) => (
            <li key={note}>{note}</li>
          ))}
          <li>
            Lab intervals and units come from the uploaded file; no implicit
            conversion or diagnosis is applied.
          </li>
          <li>
            Genome output is a small-panel rsID match. Illustrative risk,
            pathway and drug-response views are not personal results.
          </li>
          <li>
            Supplement totals describe the entered daily plan; meal nutrients
            scale source values by recorded portions. Planned meals and workouts
            do not count as completed intake or activity. Bodyweight load and
            unknown fiber are not invented.
          </li>
        </ul>
      </Card>
      {report.bloodwork && (
        <Card>
          <h3 className="font-serif text-title mb-4">
            Laboratory observations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-caption">
              <thead>
                <tr>
                  {[
                    "Marker",
                    "Result",
                    "Date",
                    "Lab",
                    "Supplied range status",
                  ].map((label) => (
                    <th className="p-2 text-stone-400 font-medium" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.bloodwork.observations.map((row) => (
                  <tr key={row.id} className="border-t border-cream-300">
                    <td className="p-2">{row.marker}</td>
                    <td className="p-2 whitespace-nowrap">
                      {row.value} {row.unit}
                    </td>
                    <td className="p-2 whitespace-nowrap">{row.collectedAt}</td>
                    <td className="p-2">{row.lab}</td>
                    <td className="p-2">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Card>
        <h3 className="font-serif text-title mb-4">Section data status</h3>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {report.sections.map((section) => (
            <div
              className="flex justify-between gap-3 border-b border-cream-300 py-2 text-micro"
              key={section.path}
            >
              <span className="text-stone-600">{section.title}</span>
              <span className="text-stone-400 text-right">
                {section.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
function Empty() {
  return (
    <p className="text-caption text-stone-400">
      No personal data imported. Demo values are omitted.
    </p>
  );
}
function Metric({ name, value }: { name: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-stone-500">{name}</dt>
      <dd className="font-medium text-stone-700">{value}</dd>
    </div>
  );
}
