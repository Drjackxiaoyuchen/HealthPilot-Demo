"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Utensils,
  Dumbbell,
  Pill,
  FlaskConical,
  Dna,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { KEYS, type GenomeStored } from "@/lib/user-data";
import { useLocalData } from "@/lib/use-local-data";
import { useLedger } from "@/lib/use-ledger";
import {
  supplementSchema,
  mealSchema,
  workoutSchema,
  nutritionDays,
  fitnessDays,
} from "@/lib/personal-ledgers";
import { computeStats, type CgmStored } from "@/lib/cgm";
import { labSeries, type BloodworkStored } from "@/lib/bloodwork";
export default function DashboardPage() {
  const supplements = useLedger(
      KEYS.supplements,
      "supplements",
      supplementSchema,
    ),
    meals = useLedger(KEYS.meals, "meals", mealSchema),
    workouts = useLedger(KEYS.workouts, "workouts", workoutSchema),
    cgm = useLocalData<CgmStored>(KEYS.cgm),
    labs = useLocalData<BloodworkStored>(KEYS.bloodwork),
    genome = useLocalData<GenomeStored>(KEYS.genome);
  const nutrition = nutritionDays(meals.entries),
    fitness = fitnessDays(workouts.entries),
    dates = [
      ...new Set([
        ...nutrition.map((row) => row.day),
        ...fitness.map((row) => row.day),
      ]),
    ].sort(),
    [day, setDay] = useState(""),
    selected = dates.includes(day) ? day : dates.at(-1) || "",
    n = nutrition.find((row) => row.day === selected),
    f = fitness.find((row) => row.day === selected),
    stats = cgm?.readings?.length ? computeStats(cgm.readings) : null;
  const tiles = [
    {
      title: "Logged meal energy",
      value: n ? n.kcal.toFixed(1) + " kcal" : "Not recorded",
      detail: n
        ? `${n.meals} eaten meals · ${selected}`
        : "Add eaten meals for the selected date",
      href: "/diet",
      icon: Utensils,
    },
    {
      title: "Recorded training",
      value: f ? f.duration + " min" : "Not recorded",
      detail: f
        ? `${f.sessions} completed sessions · ${selected}`
        : "Plans do not count as completed activity",
      href: "/fitness",
      icon: Dumbbell,
    },
    {
      title: "Supplement plan",
      value:
        String(supplements.entries.filter((row) => row.active).length) +
        " active products",
      detail: "Planned label amounts; not actual intake",
      href: "/supplements",
      icon: Pill,
    },
    {
      title: "Imported mean glucose",
      value: stats ? stats.avg.toFixed(2) + " mmol/L" : "Not imported",
      detail: stats
        ? `${stats.days} days represented · ${stats.coverage.toFixed(1)}% elapsed-window coverage`
        : "Import your own CGM export",
      href: "/glucose",
      icon: Activity,
    },
    {
      title: "Laboratory history",
      value: labs?.observations?.length
        ? `${labs.observations.length} observations`
        : "Not imported",
      detail: labs?.observations?.length
        ? `${labSeries(labs.observations).length} marker / unit / lab series`
        : "Source intervals and units stay with results",
      href: "/bloodwork",
      icon: FlaskConical,
    },
    {
      title: "Genome panel calls",
      value: genome ? `${genome.matchedSnps.length} matches` : "Not imported",
      detail: "Raw calls; clinical significance unresolved",
      href: "/genomics",
      icon: Dna,
    },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <p className="text-micro uppercase tracking-widest text-copper-700">
          Symphony AI / Your signals, together
        </p>
        <h2 className="font-serif text-[32px] mt-1">
          A view built from your records
        </h2>
        <p className="text-body text-stone-500 max-w-2xl mt-2">
          Your logged meals, completed training, supplement plan and imported
          measurements. Every summary keeps its time window and source; there is
          no inferred health score.
        </p>
        <div className="flex flex-wrap justify-between items-center gap-3 mt-5">
          <label className="text-caption text-stone-600">
            Daily log date{" "}
            <select
              aria-label="Dashboard log date"
              className="ml-2 rounded-xl text-caption border-cream-300"
              value={selected}
              onChange={(event) => setDay(event.target.value)}
              disabled={!dates.length}
            >
              {dates.length ? (
                dates.map((date) => <option key={date}>{date}</option>)
              ) : (
                <option value="">No daily logs yet</option>
              )}
            </select>
          </label>
          <Link
            href="/reports"
            className="text-caption text-copper-700 underline"
          >
            Open your report
          </Link>
        </div>
      </Card>
      {[supplements.error, meals.error, workouts.error]
        .filter(Boolean)
        .map((error, index) => (
          <p role="alert" className="text-caption text-rose-dark" key={index}>
            {error}
          </p>
        ))}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href}>
            <Card className="h-full">
              <div className="flex justify-between gap-3 items-center">
                <tile.icon size={20} className="text-copper" />
                <ArrowUpRight size={15} className="text-stone-400" />
              </div>
              <h3 className="text-caption font-sans font-medium mt-4 text-stone-500">
                {tile.title}
              </h3>
              <p className="font-serif text-[25px] mt-2">{tile.value}</p>
              <p className="text-micro text-stone-400 mt-2">{tile.detail}</p>
            </Card>
          </Link>
        ))}
      </div>
      <Card>
        <h3 className="font-serif text-title mb-4">
          Data windows & next steps
        </h3>
        <div className="space-y-3 text-caption text-stone-500">
          {stats ? (
            <p>
              CGM: {new Date(stats.start).toLocaleString()} →{" "}
              {new Date(stats.end).toLocaleString()} ·{" "}
              {cgm?.sourceFile || "Previous upload"}. This upload-wide summary
              is independent of the daily log date.
            </p>
          ) : (
            <p>
              CGM: no personal dataset.{" "}
              <Link href="/import" className="text-copper-700 underline">
                Import readings
              </Link>{" "}
              to populate the overview.
            </p>
          )}
          {labs?.observations?.length ? (
            <p>
              Labs: {labs.sourceFile} · latest collection{" "}
              {labs.observations
                .map((row) => row.collectedAt)
                .sort()
                .at(-1)}
              . Different units and laboratories remain separate.
            </p>
          ) : (
            <p>Labs: no personal observations imported.</p>
          )}
          <p>
            Daily records: {meals.entries.length} meal records and{" "}
            {workouts.entries.length} sessions saved. Missing dates do not imply
            zero intake, inactivity or recovery.
          </p>
          <p>
            Remaining research sections show their current status in{" "}
            <Link href="/research" className="text-copper-700 underline">
              Research Library
            </Link>
            . Personal uploads do not populate unimplemented clinical estimates.
          </p>
        </div>
      </Card>
    </div>
  );
}
