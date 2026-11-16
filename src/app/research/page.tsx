"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  RESEARCH_DATE,
  RESEARCH_SOURCES,
  SECTION_GUIDES,
  sourcesFor,
} from "@/data/research";
import { downloadFile } from "@/lib/download";

export default function ResearchPage() {
  const [query, setQuery] = useState(""),
    [group, setGroup] = useState("All sections");
  const sections = SECTION_GUIDES.filter(
    (section) =>
      (group === "All sections" || section.group === group) &&
      `${section.title} ${section.inputs} ${section.next} ${sourcesFor(section)
        .map((s) => s.title)
        .join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <Card>
        <p className="text-micro uppercase tracking-widest text-copper-700">
          An evolving evidence library
        </p>
        <h2 className="font-serif text-[30px] mt-1">
          Better signals. Clearer answers.
        </h2>
        <p className="text-body text-stone-500 mt-2 max-w-2xl">
          Public tools, papers, model cards and product patterns mapped to every
          Symphony AI section. Each note separates what works today from the
          next improvement.
        </p>
        <div className="flex flex-wrap gap-6 text-caption text-stone-500 mt-5">
          <span>{SECTION_GUIDES.length} sections reviewed</span>
          <span>{RESEARCH_SOURCES.length} public sources</span>
          <span>Reviewed {RESEARCH_DATE}</span>
        </div>
      </Card>
      <div className="flex flex-wrap gap-3 items-center">
        <label className="bg-white rounded-xl border border-cream-300 flex items-center gap-2 px-3 flex-1 min-w-[180px]">
          <Search size={16} className="text-stone-400" />
          <input
            aria-label="Search research"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sections, sources or next steps…"
            className="w-full text-caption border-none bg-transparent py-3"
          />
        </label>
        <select
          aria-label="Filter research group"
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          className="text-caption border-cream-300 rounded-xl py-3"
        >
          {[
            "All sections",
            "Overview",
            "Daily health",
            "Genetics",
            "Clinical & family",
          ].map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <button
          onClick={() =>
            downloadFile(
              "symphony-research-library.json",
              JSON.stringify(
                {
                  product: "Symphony AI",
                  reviewedAt: RESEARCH_DATE,
                  sections: SECTION_GUIDES,
                  sources: RESEARCH_SOURCES,
                },
                null,
                2,
              ),
              "application/json",
            )
          }
          className="text-caption text-copper-700 flex items-center gap-1.5 px-3 py-2"
        >
          <Download size={14} />
          Export library
        </button>
      </div>
      <p role="status" className="text-caption text-stone-500">
        Showing {sections.length} of {SECTION_GUIDES.length} sections
      </p>
      <div className="grid lg:grid-cols-2 gap-5">
        {sections.map((section) => (
          <article
            key={section.path}
            id={section.path.slice(1)}
            className="scroll-mt-28"
          >
            <Card className="h-full">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-micro uppercase tracking-wider text-stone-400">
                    {section.group}
                  </p>
                  <h3 className="font-serif text-[22px] mt-1">
                    {section.title}
                  </h3>
                </div>
                <Link
                  href={section.path}
                  aria-label={`Open ${section.title}`}
                  className="text-copper-700 p-2 rounded-lg bg-copper-50"
                >
                  <ArrowUpRight size={17} />
                </Link>
              </div>
              <p className="text-caption text-stone-600 mt-4">
                {section.current}
              </p>
              <ol className="mt-4 space-y-2">
                {section.pipeline.map((step, i) => (
                  <li
                    key={step}
                    className="text-caption text-stone-500 flex gap-2"
                  >
                    <span className="text-copper-700 font-medium">
                      {i + 1}.
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="p-3 rounded-xl bg-cream-100 text-caption text-stone-600 mt-4">
                <span className="font-medium text-stone-800">Output: </span>
                {section.output}
              </div>
              <p className="text-caption text-stone-600 mt-4">
                <span className="font-medium text-stone-800">Next: </span>
                {section.next}
              </p>
              <div className="mt-5 space-y-3 border-t border-cream-300 pt-4">
                {sourcesFor(section).map((source) => (
                  <div key={source.id}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-caption text-copper-700 font-medium inline-flex items-center gap-1"
                    >
                      {source.title}
                      <ArrowUpRight size={12} />
                    </a>
                    <span className="text-[10px] uppercase text-stone-400 ml-2">
                      {source.kind}
                    </span>
                    <p className="text-micro text-stone-500 mt-1">
                      {source.learning}
                    </p>
                    <p className="text-micro text-stone-400 mt-1">
                      {source.boundary}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </article>
        ))}
      </div>
      {!sections.length && (
        <Card>
          <p className="text-body text-stone-500">
            No sections match this search. Try a source name such as PharmCAT or
            a topic such as glucose.
          </p>
        </Card>
      )}
      <Card>
        <h3 className="font-serif text-title">Research, with context</h3>
        <p className="text-caption text-stone-500 mt-2">
          These are reviewed references, not connected services or reproduced
          pipelines. Public product descriptions do not disclose proprietary
          algorithms. Models are candidates for evaluation, not installed
          capabilities. External links open the source website; your saved
          datasets are not attached.
        </p>
      </Card>
    </div>
  );
}
