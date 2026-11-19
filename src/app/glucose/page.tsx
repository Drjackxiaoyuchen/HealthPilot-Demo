"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Download,
  Calendar,
  Utensils,
  ArrowUpRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { CGM_TODAY, MEAL_LOG } from "@/data/glucose";
import { KEYS } from "@/lib/user-data";
import {
  CGM_METHOD,
  computeStats,
  buildAgp,
  dailyReadings,
  type CgmStored,
} from "@/lib/cgm";
import { useLocalData } from "@/lib/use-local-data";
import { downloadFile } from "@/lib/download";
import { toCsv, localDay } from "@/lib/tabular";
import { useLedger } from "@/lib/use-ledger";
import { mealSchema } from "@/lib/personal-ledgers";
import { createMealContextAnalyzer } from "@/lib/meal-context";
import { buildCgmQuality } from "@/lib/cgm-quality";
import GlucoseQuality from "@/components/glucose-quality";

const DEMO: CgmStored = {
  uploadedAt: "2026-04-25T00:00:00Z",
  sourceFile: "Bundled example trace",
  count: CGM_TODAY.length,
  unit: "mmol/L",
  readings: CGM_TODAY.map((r) => ({ t: `2026-04-25T${r.t}:00`, v: r.v })),
};
const tooltip = { border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12 };
const axis = { fill: "#7A756F", fontSize: 12 };

export default function GlucosePage() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const uploaded = useLocalData<CgmStored>(KEYS.cgm);
  const meals = useLedger(KEYS.meals, "meals", mealSchema);
  const analyzeMeal = useMemo(
    () => createMealContextAnalyzer(uploaded?.readings || []),
    [uploaded],
  );
  const stored = uploaded?.readings?.length ? uploaded : DEMO;
  const personal = stored !== DEMO;
  const [selected, setSelected] = useState("");
  const groups = useMemo(() => dailyReadings(stored.readings), [stored]);
  const quality = useMemo(() => buildCgmQuality(stored.readings), [stored]);
  const dates = quality?.days.map((row) => row.day) || [...groups.keys()];
  const day = dates.includes(selected)
    ? selected
    : [...groups.keys()].at(-1) || "";
  const rows = groups.get(day) || [];
  const datedMeals = personal
    ? meals.entries
        .filter(
          (meal) =>
            meal.status === "eaten" && localDay(new Date(meal.at)) === day,
        )
        .sort((a, b) => a.at.localeCompare(b.at))
    : [];
  const stats = useMemo(() => computeStats(stored.readings), [stored]);
  const dayAudit = quality?.days.find((row) => row.day === day);
  const daily = quality?.days || [];
  const agp = useMemo(
    () =>
      buildAgp(stored.readings).map((bin) => ({
        ...bin,
        outer: bin.p05 === null ? null : [bin.p05, bin.p95],
        inner: bin.p25 === null ? null : [bin.p25, bin.p75],
      })),
    [stored],
  );
  // Calendar grouping belongs to the browser's time zone, never the build host.
  if (!ready)
    return (
      <Card>
        <p role="status" className="text-body text-stone-500">
          Preparing your local glucose workspace…
        </p>
      </Card>
    );
  if (!stats || !quality)
    return (
      <Card>
        <p>No valid glucose readings in this dataset.</p>
        <Link href="/import" className="underline text-copper-700">
          Review your import
        </Link>
      </Card>
    );
  const trace: { time: number; v: number | null }[] = [];
  rows.forEach((r, index) => {
    trace.push({ time: Date.parse(r.t), v: r.v });
    if (
      index + 1 < rows.length &&
      Date.parse(rows[index + 1].t) - Date.parse(r.t) > stats.cadence * 60000
    )
      trace.push({ time: Date.parse(r.t) + stats.cadence * 60000, v: null });
  });
  const zones = [
    {
      label: "Very low",
      range: "< 3.0",
      value: stats.veryLow,
      color: "#7B8FA4",
    },
    {
      label: "Low",
      range: "3.0–<3.9",
      value: stats.low - stats.veryLow,
      color: "#A9BAC8",
    },
    {
      label: "In range",
      range: "3.9–10.0",
      value: stats.tir,
      color: "#6B8F71",
    },
    { label: "High", range: ">10.0–13.9", value: stats.high, color: "#C4956A" },
    {
      label: "Very high",
      range: ">13.9",
      value: stats.veryHigh,
      color: "#B07070",
    },
  ];
  const last = rows.at(-1)!;
  return (
    <div className="space-y-6">
      <nav
        aria-label="Glucose workspace sections"
        className="flex flex-wrap gap-2 no-print"
      >
        {[
          ["#overview", "Overview"],
          ["#daily-trace", "Daily trace"],
          ["#data-quality", "Data quality"],
          ["#hourly-profile", "Hourly patterns"],
          ["#meal-context", "Meal context"],
        ].map(([href, label]) => (
          <a
            href={href}
            key={href}
            className="rounded-full border border-cream-300 bg-white px-4 py-2 text-caption text-stone-600 hover:border-copper/40 hover:text-copper-700"
          >
            {label}
          </a>
        ))}
      </nav>
      <section id="overview" className="scroll-mt-28">
        <Card>
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-micro uppercase tracking-widest text-copper-700">
                Glucose, with context
              </p>
              <h2 className="font-serif text-[30px] sm:text-[36px] leading-tight tracking-tight mt-2">
                Your glucose, in detail
              </h2>
              <p className="text-caption text-stone-500 mt-2 break-words">
                {stored.sourceFile || "Imported CGM"} ·{" "}
                {stats.count.toLocaleString()} readings · {stats.days} days with
                observations
              </p>
              <p className="text-micro text-stone-400 mt-1">
                {new Date(stats.start).toLocaleString()} →{" "}
                {new Date(stats.end).toLocaleString()} · {quality.timeZone}
              </p>
            </div>
            <button
              className="no-print inline-flex items-center self-start gap-2 px-4 py-2.5 rounded-xl bg-copper text-white text-caption font-medium"
              onClick={() =>
                downloadFile(
                  "symphony-glucose-readings.csv",
                  toCsv([
                    ["timestamp", "glucose_mmol_l"],
                    ...stored.readings.map((r) => [r.t, r.v]),
                  ]),
                  "text/csv",
                )
              }
            >
              <Download size={14} />
              Export readings
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {[
              ["Mean glucose", stats.avg.toFixed(2), "mmol/L · full upload"],
              ["Time in range", stats.tir.toFixed(1) + "%", "3.9–10.0 mmol/L"],
              [
                "Variability (CV)",
                stats.cv.toFixed(1) + "%",
                "Duration-weighted population SD / mean",
              ],
              [
                "GMI",
                stats.gmi === null
                  ? "Not reported"
                  : stats.gmi.toFixed(1) + "%",
                stats.gmi === null
                  ? "Needs ≥14 days and ≥70% coverage"
                  : "CGM-derived estimate; not lab HbA1c",
              ],
            ].map(([label, value, hint]) => (
              <div
                className="rounded-xl bg-cream-100 border border-cream-300 p-4"
                key={label}
              >
                <p className="text-micro text-stone-500">{label}</p>
                <p className="font-serif text-[26px] mt-1 text-stone-800">
                  {value}
                </p>
                <p className="text-micro text-stone-400 mt-1">{hint}</p>
              </div>
            ))}
          </div>
          <div className="bg-cream-50 border border-cream-300 rounded-xl p-4 mt-4">
            <div className="flex flex-wrap justify-between gap-2 text-caption">
              <span className="font-medium text-copper-700">
                {stats.coverage.toFixed(1)}% coverage of the elapsed upload
                window
              </span>
              <span className="text-stone-500">
                {(stats.observedMinutes / 60).toFixed(1)} hours observed /{" "}
                {(stats.elapsedMinutes / 60).toFixed(1)} hours elapsed
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white mt-3 overflow-hidden">
              <div
                className="h-full bg-copper rounded-full"
                style={{ width: `${stats.coverage}%` }}
              />
            </div>
            <p className="text-micro text-stone-500 mt-2">
              Values are held for at most one inferred sensor interval (
              {stats.cadence.toFixed(1)} min). Longer gaps stay missing.
              Coverage does not imply a full 14-day record.
            </p>
          </div>
        </Card>
      </section>

      <section id="daily-trace" className="scroll-mt-28">
        <Card>
          <SectionTitle
            icon={Activity}
            title="Daily glucose trace"
            subtitle="Missing intervals remain visible; values are in mmol/L"
            action={
              <label className="flex gap-2 items-center text-caption">
                <Calendar size={14} />
                <select
                  aria-label="Glucose trace date"
                  value={day}
                  onChange={(event) => setSelected(event.target.value)}
                  className="rounded-lg border-cream-300 text-caption"
                >
                  {dates.map((date) => (
                    <option key={date}>{date}</option>
                  ))}
                </select>
              </label>
            }
          />
          {rows.length ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer>
                <AreaChart
                  data={trace}
                  margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#E8E0D4"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <ReferenceArea
                    y1={3.9}
                    y2={10}
                    fill="#6B8F71"
                    fillOpacity={0.07}
                  />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(time) =>
                      new Date(time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    tick={axis}
                  />
                  <YAxis domain={[0, "auto"]} tick={axis} width={45} />
                  <Tooltip
                    contentStyle={tooltip}
                    labelFormatter={(time) =>
                      new Date(Number(time)).toLocaleString()
                    }
                    formatter={(value: number) => [
                      value.toFixed(2) + " mmol/L",
                      "Glucose",
                    ]}
                  />
                  <Area
                    isAnimationActive={false}
                    type="linear"
                    dataKey="v"
                    stroke="#8A644B"
                    fill="#8A644B"
                    fillOpacity={0.12}
                    strokeWidth={2}
                    connectNulls={false}
                    dot={rows.length < 10}
                  />
                  {datedMeals.map((meal) => (
                    <ReferenceLine
                      key={meal.id}
                      x={Date.parse(meal.at)}
                      stroke="#9A7458"
                      strokeDasharray="3 3"
                      label={{
                        value: meal.name.slice(0, 18),
                        position: "insideTopRight",
                        fontSize: 10,
                        fill: "#9A7458",
                      }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="min-h-[180px] flex items-center justify-center rounded-xl border border-dashed border-cream-400 bg-cream-50 p-6 text-center text-body text-stone-500">
              No readings timestamped on {day}.{" "}
              {dayAudit?.observedMinutes
                ? "The audit includes support allocated from the previous day's final reading."
                : "This day remains missing in the audit and analysis."}
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-2 text-micro text-stone-500 mt-3">
            <span>
              {rows.length} readings ·{" "}
              {(dayAudit?.calendarCoverage || 0).toFixed(1)}% of this calendar
              day observed
            </span>
            <span>
              {last
                ? `Last on this day: ${new Date(last.t).toLocaleTimeString()} · ${last.v.toFixed(2)} mmol/L`
                : "Missing values stay missing"}
            </span>
          </div>
        </Card>
      </section>

      <GlucoseQuality
        quality={quality}
        day={day}
        onSelectDay={setSelected}
        source={{
          filename: stored.sourceFile || "Previous upload",
          uploadedAt: stored.uploadedAt,
        }}
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle
            icon={BarChart3}
            title="Time in range"
            subtitle="Full upload · percentage of observed duration"
          />
          <div className="h-7 flex rounded-xl overflow-hidden bg-cream-100">
            {zones.map((zone) => (
              <div
                key={zone.label}
                title={`${zone.label}: ${zone.value.toFixed(1)}%`}
                style={{ width: `${zone.value}%`, background: zone.color }}
              />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.label}
                className="flex items-center gap-2 text-caption"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: zone.color }}
                />
                <span className="flex-1 text-stone-600">
                  {zone.label}{" "}
                  <span className="text-stone-400 text-micro ml-1">
                    {zone.range} mmol/L
                  </span>
                </span>
                <strong className="font-medium text-stone-700">
                  {zone.value.toFixed(1)}%
                </strong>
              </div>
            ))}
          </div>
          <p className="text-micro text-stone-500 mt-5">
            The range follows a common diabetes reporting convention. Individual
            goals depend on clinical context; this view does not assign a health
            score.
          </p>
        </Card>
        <Card>
          <SectionTitle
            icon={Calendar}
            title="Daily range summary"
            subtitle="TIR uses observed duration; completeness uses the full calendar day"
          />
          <div className="h-[220px]">
            <ResponsiveContainer>
              <BarChart data={daily}>
                <CartesianGrid
                  stroke="#E8E0D4"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={axis}
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis domain={[0, 100]} tick={axis} width={32} />
                <Tooltip
                  contentStyle={tooltip}
                  formatter={(value: number, name: string) => [
                    value.toFixed(1) + "%",
                    name,
                  ]}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="tir"
                  name="Observed TIR"
                  fill="#6B8F71"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={38}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="calendarCoverage"
                  name="Day completeness"
                  fill="#D4CFC7"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-micro text-stone-400 mt-2">
            Sage: observed TIR · stone: calendar-day completeness. A
            zero-coverage day has no TIR estimate. Detail covers the latest{" "}
            {quality.maxDetailDays} calendar days at most.
          </p>
        </Card>
      </div>

      <section id="hourly-profile" className="scroll-mt-28">
        <Card>
          <SectionTitle
            icon={Activity}
            title="Hourly glucose profile"
            subtitle="AGP-style exploratory view · median with 25–75% and 5–95% bands"
          />
          <div className="h-[280px]">
            <ResponsiveContainer>
              <ComposedChart data={agp} margin={{ left: -15, right: 10 }}>
                <CartesianGrid
                  stroke="#E8E0D4"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis dataKey="hour" tick={axis} interval={3} />
                <YAxis domain={[0, "auto"]} tick={axis} />
                <Tooltip
                  contentStyle={tooltip}
                  content={({ active, payload, label }) => {
                    const bin = payload?.[0]?.payload;
                    return active && bin ? (
                      <div className="rounded-xl border border-cream-300 bg-white p-3 text-caption">
                        <strong>{label}</strong>
                        <p>Median: {bin.median?.toFixed(2)} mmol/L</p>
                        <p>
                          {bin.n} readings · {bin.days} days
                        </p>
                        <p>
                          5–95%: {bin.p05?.toFixed(2)}–{bin.p95?.toFixed(2)}
                        </p>
                      </div>
                    ) : null;
                  }}
                />
                <Area
                  isAnimationActive={false}
                  type="linear"
                  dataKey="outer"
                  stroke="none"
                  fill="#B8906F"
                  fillOpacity={0.12}
                  connectNulls={false}
                />
                <Area
                  isAnimationActive={false}
                  type="linear"
                  dataKey="inner"
                  stroke="none"
                  fill="#B8906F"
                  fillOpacity={0.25}
                  connectNulls={false}
                />
                <Line
                  isAnimationActive={false}
                  type="linear"
                  dataKey="median"
                  stroke="#9A7458"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-micro text-stone-500 mt-3">
            Hourly bins use the device time zone and unweighted sample
            percentiles without interpolation. Uneven sampling can influence the
            bands; hover to check readings and days.{" "}
            {stats.days < 14
              ? "This short record is exploratory; repeated-day patterns need more data."
              : "These bands describe this record, not a prediction."}
          </p>
          <p className="text-micro text-stone-400 mt-2">
            Methods: {CGM_METHOD} ·{" "}
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6973648/"
              target="_blank"
              rel="noreferrer"
              className="text-copper-700 underline"
            >
              Time-in-range consensus
            </a>{" "}
            ·{" "}
            <Link href="/reports" className="text-copper-700 underline">
              Download full report
            </Link>
          </p>
        </Card>
      </section>

      <section id="meal-context" className="scroll-mt-28">
        <Card>
          <SectionTitle
            icon={Utensils}
            title={personal ? "Your dated meal context" : "Example meal diary"}
            subtitle={
              personal
                ? "Recorded eaten meals for the selected date · observed CGM context"
                : "Illustrative food records, shown independently from the trace"
            }
          />
          {personal ? (
            <div className="space-y-3">
              {meals.error && (
                <p role="alert" className="text-caption text-rose-dark">
                  {meals.error}
                </p>
              )}
              {!datedMeals.length && (
                <p className="text-body text-stone-500">
                  No eaten meals logged for {day}.{" "}
                  <Link href="/diet" className="text-copper-700 underline">
                    Log a dated meal
                  </Link>{" "}
                  to add context to your own trace.
                </p>
              )}
              {datedMeals.map((meal) => {
                const result = analyzeMeal(meal, meals.entries);
                return (
                  <div
                    key={meal.id}
                    className="rounded-xl border border-cream-300 bg-cream-100 p-4"
                  >
                    <p className="text-caption font-medium text-stone-700">
                      {meal.name} ·{" "}
                      {new Date(meal.at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {result.status === "available" && (
                      <p className="text-caption text-stone-600 mt-1">
                        Pre-meal mean {result.baseline!.toFixed(2)} → 2-hour
                        observed peak {result.peak!.toFixed(2)} mmol/L ·
                        difference {result.delta! >= 0 ? "+" : ""}
                        {result.delta!.toFixed(2)} mmol/L
                      </p>
                    )}
                    <p className="text-micro text-stone-500 mt-2">
                      {result.reason}
                    </p>
                    <p className="text-micro text-stone-400 mt-1">
                      {result.beforeCount} baseline and {result.afterCount}{" "}
                      post-meal readings · {result.coverage.toFixed(1)}% window
                      coverage
                    </p>
                  </div>
                );
              })}
              <Link
                className="inline-flex text-caption text-copper-700 underline"
                href="/diet"
              >
                Manage your food diary
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-caption text-left">
                <thead>
                  <tr>
                    {[
                      "Time",
                      "Illustrative meal",
                      "Energy",
                      "Carbohydrate",
                    ].map((label) => (
                      <th
                        key={label}
                        className="pb-3 text-stone-400 font-medium"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEAL_LOG.map((meal) => (
                    <tr key={meal.id} className="border-t border-cream-300">
                      <td className="py-3 pr-3">{meal.time}</td>
                      <td className="py-3 pr-3">
                        {meal.emoji} {meal.description}
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        {meal.calories} kcal
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        {meal.carbs_g} g
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Link
            href="/research#glucose"
            className="inline-flex items-center gap-1 text-caption text-copper-700 mt-4"
          >
            Methods & next improvements
            <ArrowUpRight size={12} />
          </Link>
        </Card>
      </section>
    </div>
  );
}
