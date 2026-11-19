"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Grid2X2,
  Microscope,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { qualityCsvRows, type buildCgmQuality } from "@/lib/cgm-quality";
import { downloadFile } from "@/lib/download";
import { toCsv } from "@/lib/tabular";

type Quality = NonNullable<ReturnType<typeof buildCgmQuality>>;
type Metric = "coverage" | "mean" | "tir";
const METRICS: { key: Metric; label: string }[] = [
  { key: "coverage", label: "Coverage" },
  { key: "mean", label: "Mean glucose" },
  { key: "tir", label: "Time in range" },
];
const valueText = (value: number | null, metric: Metric) =>
  value === null
    ? "—"
    : metric === "mean"
      ? value.toFixed(1)
      : `${value.toFixed(0)}%`;

export default function GlucoseQuality({
  quality,
  day,
  onSelectDay,
  source,
}: {
  quality: Quality;
  day: string;
  onSelectDay: (day: string) => void;
  source: { filename: string; uploadedAt: string };
}) {
  const [metric, setMetric] = useState<Metric>("coverage");
  const [pageBack, setPageBack] = useState(0);
  const [selected, setSelected] = useState<{
    day: string;
    hour: number;
  } | null>(null);
  const pages = Math.ceil(quality.days.length / 14);
  const page = Math.min(pageBack, pages - 1);
  const end = quality.days.length - page * 14;
  const visible = quality.days.slice(Math.max(0, end - 14), end);
  const chosenDay = quality.days.find((row) => row.day === selected?.day);
  const cell = chosenDay && selected ? chosenDay.hours[selected.hour] : null;
  const bounds = quality.bounds;
  const minutes = (v: number) =>
    `${v.toLocaleString(undefined, { maximumFractionDigits: 1 })} min`;

  return (
    <section id="data-quality" className="scroll-mt-28 space-y-5">
      <Card>
        <SectionTitle
          icon={Grid2X2}
          title="Every hour, accounted for"
          subtitle={`Calendar coverage audit · ${quality.timeZone}`}
          action={
            <button
              className="symphony-button-secondary no-print"
              onClick={() =>
                downloadFile(
                  "symphony-glucose-hourly-audit.csv",
                  toCsv(qualityCsvRows(quality, source)),
                  "text/csv",
                )
              }
            >
              <Download size={15} /> Export audit
            </button>
          }
        />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div
            role="group"
            aria-label="Hourly audit metric"
            className="inline-flex flex-wrap gap-1 rounded-xl border border-cream-300 bg-cream-100 p-1"
          >
            {METRICS.map((item) => (
              <button
                key={item.key}
                aria-pressed={metric === item.key}
                onClick={() => setMetric(item.key)}
                className={`rounded-lg px-3 py-2 text-caption ${metric === item.key ? "bg-white text-copper-700 shadow-subtle font-medium" : "text-stone-500"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-micro text-stone-500">
            <button
              aria-label="Earlier audit dates"
              disabled={page >= pages - 1}
              onClick={() => setPageBack(page + 1)}
              className="rounded-lg border border-cream-300 p-2 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              {visible[0].day.slice(5)} – {visible.at(-1)!.day.slice(5)}
            </span>
            <button
              aria-label="Later audit dates"
              disabled={page === 0}
              onClick={() => setPageBack(page - 1)}
              className="rounded-lg border border-cream-300 p-2 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div
          className="relative overflow-x-auto pb-2"
          tabIndex={0}
          role="region"
          aria-label="Scrollable hourly glucose audit"
        >
          <table className="w-full min-w-[780px] border-separate border-spacing-1 text-micro">
            <caption className="sr-only">
              Hourly{" "}
              {metric === "mean"
                ? "mean glucose in mmol/L"
                : `${metric} in percent`}
              . Select a cell for exact durations and to change the trace date.
            </caption>
            <thead>
              <tr>
                <th className="text-left font-medium text-stone-500 pr-3">
                  Date
                </th>
                {Array.from({ length: 24 }, (_, hour) => (
                  <th
                    key={hour}
                    scope="col"
                    className="font-normal text-stone-500 pb-2"
                  >
                    {String(hour).padStart(2, "0")}
                  </th>
                ))}
                <th scope="col" className="font-medium text-stone-500 pl-3">
                  Day
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.day}>
                  <th
                    scope="row"
                    className="pr-3 text-left font-normal whitespace-nowrap"
                  >
                    <button
                      aria-pressed={day === row.day}
                      onClick={() => onSelectDay(row.day)}
                      className={`rounded-lg py-2 ${day === row.day ? "font-semibold text-copper-700" : "text-stone-500"}`}
                    >
                      {row.day.slice(5)}
                    </button>
                  </th>
                  {row.hours.map((hour) => {
                    const value = hour[metric];
                    const strength =
                      value === null
                        ? 0
                        : metric === "mean"
                          ? Math.min(1, Math.max(0, (value - 3) / 12))
                          : value / 100;
                    const selectedCell =
                      selected?.day === row.day && selected.hour === hour.hour;
                    const missing = hour.observedMinutes === 0;
                    const label = `${row.day} ${String(hour.hour).padStart(2, "0")}:00, ${METRICS.find((x) => x.key === metric)!.label} ${valueText(value, metric)}${metric === "mean" ? " mmol/L" : ""}, ${minutes(hour.observedMinutes)} observed, ${minutes(hour.windowMinutes)} in upload window`;
                    return (
                      <td key={hour.hour} className="p-0">
                        <button
                          title={label}
                          aria-label={label}
                          aria-pressed={selectedCell}
                          onClick={() => {
                            setSelected({ day: row.day, hour: hour.hour });
                            onSelectDay(row.day);
                          }}
                        className={`relative h-8 w-full min-w-[22px] rounded-md border transition-colors ${selectedCell ? "border-copper-700 ring-2 ring-copper-700 ring-offset-1" : "border-transparent"} ${missing ? "audit-missing" : ""}`}
                          style={
                            missing
                              ? {}
                              : {
                                  backgroundColor: `rgba(138, 100, 75, ${0.12 + strength * 0.78})`,
                                }
                          }
                        >
                          <span className="sr-only">{label}</span>
                        </button>
                      </td>
                    );
                  })}
                  <td className="pl-3 text-right tabular-nums font-medium text-stone-600">
                    {row.calendarCoverage.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-micro text-stone-500">
          <p>00–23 local hours · Day = observed / full calendar day</p>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm audit-missing border border-cream-300" />
            No observations<span className="ml-2">Lower</span>
            <span
              className="h-3 w-20 rounded-sm"
              style={{
                background:
                  "linear-gradient(to right, rgba(138,100,75,.12),rgba(138,100,75,.9))",
              }}
            />
            <span>Higher</span>
          </div>
        </div>
        <div
          aria-live="polite"
          className="mt-5 rounded-xl border border-cream-300 bg-cream-50 p-4"
        >
          {cell && chosenDay && selected ? (
            <>
              <p className="text-caption font-medium text-stone-800">
                {chosenDay.day} · {String(selected.hour).padStart(2, "0")}:00
                local hour
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-3 text-caption">
                <div>
                  <p className="text-stone-500">Observation support</p>
                  <p className="mt-1 font-medium">
                    {minutes(cell.observedMinutes)} /{" "}
                    {minutes(cell.windowMinutes)}
                  </p>
                </div>
                <div>
                  <p className="text-stone-500">Mean glucose</p>
                  <p className="mt-1 font-medium">
                    {cell.mean === null
                      ? "No observations"
                      : `${cell.mean.toFixed(2)} mmol/L`}
                  </p>
                </div>
                <div>
                  <p className="text-stone-500">Observed time in range</p>
                  <p className="mt-1 font-medium">
                    {cell.tir === null
                      ? "No observations"
                      : `${cell.tir.toFixed(1)}%`}
                  </p>
                </div>
              </div>
              <p className="text-micro text-stone-500 mt-3">
                {minutes(cell.calendarMinutes)} in this civil hour;{" "}
                {cell.windowMinutes === 0
                  ? "outside the upload window (or a skipped clock hour)."
                  : `${cell.coverage!.toFixed(1)}% of its upload-window duration observed.`}{" "}
                Repeated clock hours are combined.
              </p>
            </>
          ) : (
            <p className="text-caption text-stone-600">
              Select any hour to inspect exact observed duration, mean glucose
              and time in range. The daily trace follows your selected date.
            </p>
          )}
        </div>
        <p className="text-micro text-stone-500 mt-4">
          Hourly coverage uses only the overlap with the upload window. Full-day
          coverage includes all minutes in that calendar day, including time
          outside the upload. Skipped and repeated daylight-saving hours use
          actual elapsed minutes.{" "}
          {quality.detailTruncated &&
            `Detail is limited to the latest ${quality.maxDetailDays} calendar days; the summary and bounds still cover the full upload.`}
        </p>
      </Card>
      <Card>
        <SectionTitle
          icon={Microscope}
          title="How much could missing time change TIR?"
          subtitle="Sensitivity bounds over the full upload window · 3.9–10.0 mmol/L"
        />
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            [
              "Observed TIR",
              `${((100 * quality.inRangeMinutes) / quality.observedMinutes).toFixed(1)}%`,
              "Denominator: observed duration",
            ],
            [
              "Full-window bounds",
              `${bounds.lower.toFixed(1)}–${bounds.upper.toFixed(1)}%`,
              "All missing time outside / inside range",
            ],
            [
              "Unobserved duration",
              `${(bounds.missingMinutes / 60).toFixed(1)} h`,
              `${minutes(bounds.missingMinutes)} in the upload window`,
            ],
          ].map(([label, value, hint]) => (
            <div
              key={label}
              className="rounded-xl bg-cream-100 border border-cream-300 p-4"
            >
              <p className="text-micro text-stone-500">{label}</p>
              <p className="font-serif text-[26px] text-stone-800 my-1 tabular-nums">
                {value}
              </p>
              <p className="text-micro text-stone-500">{hint}</p>
            </div>
          ))}
        </div>
        <div
          role="img"
          aria-label={`Full-window time-in-range bounds ${bounds.lower.toFixed(1)} to ${bounds.upper.toFixed(1)} percent`}
          className="relative mt-6 h-3 rounded-full bg-cream-200"
        >
          <div
            className="absolute inset-y-0 rounded-full bg-copper/30 border-x-2 border-copper-700"
            style={{
              left: `${bounds.lower}%`,
              width: `${bounds.upper - bounds.lower}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-micro text-stone-500">
          <span>0% of full window in range</span>
          <span>100%</span>
        </div>
        <p className="text-caption text-stone-600 mt-5">
          These are identification bounds conditional on the sensor-support
          model. They quantify the possible effect of unobserved minutes; they
          do not measure statistical confidence, sensor error, or future
          glucose.
        </p>
        <details className="mt-4 border-t border-cream-300 pt-4">
          <summary className="cursor-pointer text-caption font-medium text-copper-700">
            Methods, assumptions & references
          </summary>
          <div className="mt-4 space-y-3 text-caption text-stone-600">
            <p>
              Let I = observed minutes in range, O = all observed minutes, W =
              elapsed upload-window minutes. Observed TIR = 100 × I/O.
              Full-window lower bound = 100 × I/W; upper bound = 100 × (I + W −
              O)/W. No missing-at-random assumption or glucose imputation is
              required for these bounds.
            </p>
            <p>
              Each valid reading supports at most one inferred sensor interval (
              {quality.cadenceMinutes.toFixed(1)} min;{" "}
              {quality.cadenceInferred
                ? "upper median of positive gaps ≤20 min"
                : "5 min fallback: sensor cadence cannot be inferred"}
              ). The final reading contributes one such interval. Coverage
              therefore describes this explicit support convention, rather than
              verified device wear.
            </p>
            <p>
              The window is first reading through last reading plus one
              interval. It does not assess missing time before or after the
              upload, clinically validate the glucose values, or correct
              informative missingness.
            </p>
            <p>
              Design reference:{" "}
              <a
                className="underline text-copper-700"
                href="https://irinagain.github.io/iglu/articles/lasagna_plots.html"
                target="_blank"
                rel="noreferrer"
              >
                iglu day-by-time visualizations
              </a>
              . Missingness motivation:{" "}
              <a
                className="underline text-copper-700"
                href="https://arxiv.org/abs/2410.03091"
                target="_blank"
                rel="noreferrer"
              >
                Yu et al., arXiv:2410.03091v1
              </a>
              . The paper's population-level inverse-probability estimator is
              not implemented here.
            </p>
          </div>
        </details>
      </Card>
    </section>
  );
}
