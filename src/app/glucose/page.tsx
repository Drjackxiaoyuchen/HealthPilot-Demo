"use client";
import { useMemo, useState } from "react";
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
import { toCsv } from "@/lib/tabular";

const DEMO: CgmStored = {
  uploadedAt: "2026-04-25T00:00:00Z",
  sourceFile: "Bundled example trace",
  count: CGM_TODAY.length,
  unit: "mmol/L",
  readings: CGM_TODAY.map((r) => ({ t: `2026-04-25T${r.t}:00`, v: r.v })),
};
const tooltip = { border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12 };
const axis = { fill: "#7A756F", fontSize: 10 };

export default function GlucosePage() {
  const uploaded = useLocalData<CgmStored>(KEYS.cgm);
  const stored = uploaded?.readings?.length ? uploaded : DEMO;
  const personal = stored !== DEMO;
  const [selected, setSelected] = useState("");
  const groups = useMemo(() => dailyReadings(stored.readings), [stored]);
  const dates = [...groups.keys()];
  const day = groups.has(selected) ? selected : dates.at(-1) || "";
  const rows = groups.get(day) || [];
  const stats = useMemo(() => computeStats(stored.readings), [stored]);
  const dayStats = computeStats(rows);
  const daily = dates.map((date) => ({
    day: date,
    ...computeStats(groups.get(date)!)!,
  }));
  const agp = useMemo(
    () =>
      buildAgp(stored.readings).map((bin) => ({
        ...bin,
        outer: bin.p05 === null ? null : [bin.p05, bin.p95],
        inner: bin.p25 === null ? null : [bin.p25, bin.p75],
      })),
    [stored],
  );
  if (!stats || !dayStats)
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
      Date.parse(rows[index + 1].t) - Date.parse(r.t) >
        dayStats.cadence * 60000 * 2
    )
      trace.push({ time: Date.parse(r.t) + dayStats.cadence * 60000, v: null });
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
      <Card>
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-micro uppercase tracking-widest text-copper-700">
              Glucose, with context
            </p>
            <h2 className="font-serif text-[30px] mt-1">
              A clearer view of your patterns
            </h2>
            <p className="text-caption text-stone-500 mt-2 break-words">
              {stored.sourceFile || "Imported CGM"} ·{" "}
              {stats.count.toLocaleString()} readings · {stats.days} calendar
              days represented
            </p>
            <p className="text-micro text-stone-400 mt-1">
              {new Date(stats.start).toLocaleString()} →{" "}
              {new Date(stats.end).toLocaleString()} · device time zone
            </p>
          </div>
          <button
            className="no-print inline-flex items-center self-start gap-2 px-4 py-2.5 rounded-xl bg-copper text-white text-caption"
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
              stats.gmi === null ? "Not reported" : stats.gmi.toFixed(1) + "%",
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
        <div className="bg-sage-light/50 border border-sage/20 rounded-xl p-4 mt-4">
          <div className="flex flex-wrap justify-between gap-2 text-caption">
            <span className="font-medium text-sage-dark">
              {stats.coverage.toFixed(1)}% coverage of the elapsed upload window
            </span>
            <span className="text-stone-500">
              {(stats.observedMinutes / 60).toFixed(1)} hours observed /{" "}
              {(stats.elapsedMinutes / 60).toFixed(1)} hours elapsed
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white mt-3 overflow-hidden">
            <div
              className="h-full bg-sage rounded-full"
              style={{ width: `${stats.coverage}%` }}
            />
          </div>
          <p className="text-micro text-stone-500 mt-2">
            Values are held for at most one inferred sensor interval (
            {stats.cadence.toFixed(1)} min). Longer gaps stay missing. Coverage
            does not imply a full 14-day record.
          </p>
        </div>
      </Card>

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
                stroke="#B8906F"
                fill="#B8906F"
                fillOpacity={0.12}
                strokeWidth={2}
                connectNulls={false}
                dot={rows.length < 10}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-micro text-stone-500 mt-3">
          <span>
            {rows.length} readings ·{" "}
            {((dayStats.observedMinutes / 1440) * 100).toFixed(1)}% of a 24-hour
            day observed
          </span>
          <span>
            Last on this day: {new Date(last.t).toLocaleTimeString()} ·{" "}
            {last.v.toFixed(2)} mmol/L
          </span>
        </div>
      </Card>

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
            subtitle="Each day uses its observed readings; missing days are not filled"
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
                  formatter={(value: number) => [
                    value.toFixed(1) + "%",
                    "In range",
                  ]}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="tir"
                  fill="#6B8F71"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-micro text-stone-400 mt-2">
            Compare duration and daily completeness before interpreting changes.
          </p>
        </Card>
      </div>

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
          Hourly bins use the device time zone and unweighted sample percentiles
          without interpolation. Uneven sampling can influence the bands; hover
          to check readings and days.{" "}
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

      <Card>
        <SectionTitle
          icon={Utensils}
          title={personal ? "Add context to your trace" : "Example meal diary"}
          subtitle={
            personal
              ? "Meal-response analysis needs dated personal meal logs"
              : "Illustrative food records, shown independently from the trace"
          }
        />
        {personal ? (
          <p className="text-body text-stone-500">
            This import contains glucose readings only. Meal events, nutrition
            totals and genetic recommendations are not inferred from it. Keep
            meal times and portions to support a future matched analysis.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-caption text-left">
              <thead>
                <tr>
                  {["Time", "Illustrative meal", "Energy", "Carbohydrate"].map(
                    (label) => (
                      <th
                        key={label}
                        className="pb-3 text-stone-400 font-medium"
                      >
                        {label}
                      </th>
                    ),
                  )}
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
                    <td className="py-3 whitespace-nowrap">{meal.carbs_g} g</td>
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
    </div>
  );
}
