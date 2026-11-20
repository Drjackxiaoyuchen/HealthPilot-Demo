"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, Download } from "lucide-react";
import { sectionGuide, sourcesFor, RESEARCH_DATE } from "@/data/research";
import { KEYS, type GenomeStored } from "@/lib/user-data";
import { type CgmStored } from "@/lib/cgm";
import { type BloodworkStored } from "@/lib/bloodwork";
import { useLocalData } from "@/lib/use-local-data";
import { downloadFile } from "@/lib/download";
import { useLedger } from "@/lib/use-ledger";
import { medicalRecordSchema, validateRecordSet } from "@/lib/medical-records";
import {
  supplementSchema,
  mealSchema,
  workoutSchema,
} from "@/lib/personal-ledgers";

export default function SectionContext() {
  const path = usePathname();
  const guide = sectionGuide(path || "");
  const cgm = useLocalData<CgmStored>(KEYS.cgm),
    genome = useLocalData<GenomeStored>(KEYS.genome),
    labs = useLocalData<BloodworkStored>(KEYS.bloodwork);
  const supplements = useLedger(
    KEYS.supplements,
    "supplements",
    supplementSchema,
  );
  const meals = useLedger(KEYS.meals, "meals", mealSchema);
  const workouts = useLedger(KEYS.workouts, "workouts", workoutSchema);
  const records = useLedger(
    KEYS.records,
    "medical-records",
    medicalRecordSchema,
    validateRecordSet,
  );
  if (!guide) return null;
  const saved =
    guide.mode === "records"
      ? records.entries.length
      : guide.mode === "supplements"
        ? supplements.entries.length
        : guide.mode === "meals"
          ? meals.entries.length
          : guide.mode === "workouts"
            ? workouts.entries.length
            : 0;
  const workingLedger = [
    "supplements",
    "meals",
    "workouts",
    "records",
  ].includes(guide.mode);
  const personal =
    guide.mode === "cgm"
      ? !!cgm?.readings?.length
      : guide.mode === "genome"
        ? !!genome
        : guide.mode === "bloodwork"
          ? !!labs?.observations?.length
          : saved > 0;
  const status =
    guide.mode === "dashboard"
      ? "Your personal overview"
      : workingLedger
        ? personal
          ? "Your saved records"
          : "Ready for your records"
        : guide.mode === "import"
          ? "Local workspace"
          : personal
            ? guide.mode === "genome"
              ? "Imported calls + demo explorer"
              : "Your imported data"
            : "Illustrative demo data";
  return (
    <section
      aria-label="Section data and methods"
      className="mb-6 rounded-2xl border border-cream-300 bg-white"
    >
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span
          className={`inline-flex items-center gap-2 text-caption font-medium ${personal ? "text-sage-dark" : "text-copper-700"}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${personal ? "bg-sage" : "bg-copper"}`}
          />
          {status}
        </span>
        <span className="text-micro text-stone-500 flex-1 min-w-[180px]">
          {guide.mode === "demo"
            ? guide.current
            : workingLedger || guide.mode === "dashboard"
              ? "Saved records and imported measurements; missing values stay missing."
              : guide.mode === "genome"
                ? "Uploaded genotypes appear as calls; illustrative risk and pathway views remain below."
                : guide.mode === "import"
                  ? "Preview → review → save on this browser"
                  : "Source, date window and methods travel with your report."}
        </span>
        <Link
          href="/reports"
          className="text-caption text-copper-700 inline-flex items-center gap-1"
        >
          <Download size={13} />
          Reports
        </Link>
      </div>
      <details className="border-t border-cream-300 px-4 py-3">
        <summary className="text-caption text-stone-600 cursor-pointer">
          How this section works · sources & next improvements
        </summary>
        <div className="pt-4 space-y-4 text-caption text-stone-600">
          <p>
            <strong className="text-stone-800">Inputs.</strong> {guide.inputs}
          </p>
          <ol className="grid sm:grid-cols-3 gap-2">
            {guide.pipeline.map((step, index) => (
              <li className="rounded-xl bg-cream-100 p-3" key={step}>
                <span className="text-copper-700 font-medium mr-2">
                  0{index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p>
            <strong className="text-stone-800">Output.</strong> {guide.output}
          </p>
          <p>
            <strong className="text-stone-800">Available today.</strong>{" "}
            {guide.current}
          </p>
          <div className="flex flex-wrap gap-3">
            {sourcesFor(guide).map((source) => (
              <a
                href={source.url}
                key={source.id}
                target="_blank"
                rel="noreferrer"
                className="text-copper-700 underline inline-flex items-center gap-1"
              >
                {source.title}
                <ArrowUpRight size={12} />
              </a>
            ))}
          </div>
          <p>
            <strong className="text-stone-800">Next improvement.</strong>{" "}
            {guide.next}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-micro">
            <Link
              href={`/research#${guide.path.slice(1)}`}
              className="text-copper-700 inline-flex items-center gap-1"
            >
              <BookOpen size={12} />
              Research library · updated {RESEARCH_DATE}
            </Link>
            <button
              className="underline"
              onClick={() =>
                downloadFile(
                  `symphony-${guide.path.slice(1)}-methods.json`,
                  JSON.stringify(
                    {
                      product: "Symphony AI",
                      reviewedAt: RESEARCH_DATE,
                      ...guide,
                      references: sourcesFor(guide),
                    },
                    null,
                    2,
                  ),
                  "application/json",
                )
              }
            >
              Download methods
            </button>
          </div>
        </div>
      </details>
    </section>
  );
}
