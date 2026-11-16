"use client";
import { useState } from "react";
import Link from "next/link";
import { Download, Search, FlaskConical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import DemoBloodwork from "@/components/bloodwork-demo";
import { KEYS } from "@/lib/user-data";
import { useLocalData } from "@/lib/use-local-data";
import { labSeries, labStatus, type BloodworkStored } from "@/lib/bloodwork";
import { downloadFile } from "@/lib/download";
import { toCsv } from "@/lib/tabular";
import { labCsvRows } from "@/lib/report";

export default function BloodworkPage() {
  const stored = useLocalData<BloodworkStored>(KEYS.bloodwork);
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All results"),
    [selected, setSelected] = useState("");
  if (!stored?.observations?.length) return <DemoBloodwork />;
  const series = labSeries(stored.observations);
  const abnormal = series.filter((group) =>
    ["Below range", "Above range"].includes(labStatus(group.latest)),
  );
  const visible = series.filter(
    (group) =>
      `${group.latest.marker} ${group.latest.category} ${group.latest.lab}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "All results" || labStatus(group.latest) === filter),
  );
  const active = series.find((group) => group.key === selected);
  const interval = (low: number | null, high: number | null, unit: string) =>
    low === null && high === null
      ? "Not supplied"
      : `${low ?? "—"} – ${high ?? "—"} ${unit}`;
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-4 justify-between">
          <div>
            <p className="text-micro uppercase tracking-widest text-copper-700">
              A record that stays traceable
            </p>
            <h2 className="font-serif text-[30px] mt-1">
              Your laboratory timeline
            </h2>
            <p className="text-caption text-stone-500 mt-2 break-all">
              {stored.sourceFile} · saved{" "}
              {new Date(stored.uploadedAt).toLocaleString()}
            </p>
          </div>
          <button
            className="inline-flex self-start items-center gap-2 text-caption bg-copper text-white px-4 py-2.5 rounded-xl"
            onClick={() =>
              downloadFile(
                "symphony-lab-results.csv",
                toCsv(labCsvRows(stored)),
                "text/csv",
              )
            }
          >
            <Download size={14} />
            Export results
          </button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {[
            ["Observations", stored.observations.length],
            ["Marker / unit / lab series", series.length],
            ["Latest results outside supplied range", abnormal.length],
          ].map(([label, value]) => (
            <div
              className="p-4 rounded-xl border border-cream-300 bg-cream-100"
              key={label}
            >
              <p className="text-micro text-stone-500">{label}</p>
              <p className="font-serif text-[30px]">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-micro text-stone-500 mt-4">
          Reference intervals come from your file. A result within an interval
          does not establish overall health; missing intervals remain
          unclassified. Different units and laboratories stay in separate
          trends.
        </p>
      </Card>
      <div className="flex flex-wrap gap-3">
        <label className="flex-1 min-w-[180px] bg-white rounded-xl border border-cream-300 px-3 flex gap-2 items-center">
          <Search size={15} className="text-stone-400" />
          <input
            aria-label="Search biomarkers"
            placeholder="Find a marker, category or laboratory…"
            className="border-none bg-transparent text-caption w-full py-3"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select
          aria-label="Filter lab status"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="text-caption rounded-xl border-cream-300"
        >
          {[
            "All results",
            "Within range",
            "Below range",
            "Above range",
            "No range supplied",
          ].map((label) => (
            <option key={label}>{label}</option>
          ))}
        </select>
      </div>
      <p role="status" className="text-caption text-stone-500">
        {visible.length} matching series · select a marker to inspect its dated
        history
      </p>
      <div className="grid lg:grid-cols-2 gap-4">
        {visible.map((group) => {
          const row = group.latest,
            status = labStatus(row),
            color =
              status === "Within range"
                ? "#6B8F71"
                : status === "No range supplied"
                  ? "#7B8FA4"
                  : "#B07070";
          return (
            <button
              key={group.key}
              className={`text-left bg-white border rounded-2xl p-5 hover:border-copper ${selected === group.key ? "border-copper" : "border-cream-300"}`}
              onClick={() => setSelected(group.key)}
              aria-pressed={selected === group.key}
            >
              <div className="flex gap-3 justify-between items-start">
                <div>
                  <p className="text-micro text-stone-400">{row.category}</p>
                  <h3 className="font-serif text-[20px]">{row.marker}</h3>
                </div>
                <span
                  className="text-micro px-2 py-1 rounded-full bg-cream-100"
                  style={{ color }}
                >
                  {status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-4 gap-3">
                <div>
                  <p className="font-serif text-[28px]">
                    {row.value}{" "}
                    <span className="font-sans text-caption text-stone-400">
                      {row.unit}
                    </span>
                  </p>
                  <p className="text-micro text-stone-500 mt-1">
                    {row.collectedAt} · {row.lab}
                  </p>
                </div>
                {group.history.length > 1 ? (
                  <Sparkline
                    data={group.history.map((result) => result.value)}
                    color={color}
                    width={100}
                    height={40}
                  />
                ) : (
                  <span className="text-micro text-stone-400">
                    One observation
                  </span>
                )}
              </div>
              <p className="text-micro text-stone-500 mt-3">
                Lab range:{" "}
                {interval(row.referenceLow, row.referenceHigh, row.unit)}
              </p>
            </button>
          );
        })}
      </div>
      {active && (
        <Card accent>
          <div className="flex gap-2 items-center">
            <FlaskConical size={18} className="text-copper" />
            <h3 className="font-serif text-title">
              {active.latest.marker} · dated history
            </h3>
          </div>
          <p className="text-caption text-stone-500 mt-2">
            {active.latest.lab} · {active.latest.unit} · source:{" "}
            {stored.sourceFile}
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-caption">
              <thead>
                <tr>
                  {[
                    "Collected",
                    "Result",
                    "Supplied interval",
                    "Status",
                    "LOINC",
                  ].map((label) => (
                    <th className="p-3 text-stone-400 font-medium" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {active.history.map((row) => (
                  <tr key={row.id} className="border-t border-cream-300">
                    <td className="p-3 whitespace-nowrap">{row.collectedAt}</td>
                    <td className="p-3 whitespace-nowrap">
                      {row.value} {row.unit}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {interval(row.referenceLow, row.referenceHigh, row.unit)}
                    </td>
                    <td className="p-3">{labStatus(row)}</td>
                    <td className="p-3">{row.loinc || "Not supplied"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {!visible.length && (
        <Card>
          <p className="text-stone-500">No markers match these filters.</p>
        </Card>
      )}
      <p className="text-caption text-stone-500">
        <Link href="/import" className="text-copper-700 underline">
          Manage this import
        </Link>{" "}
        ·{" "}
        <Link href="/reports" className="text-copper-700 underline">
          Download report with methods
        </Link>
      </p>
    </div>
  );
}
