"use client";

import { usePathname } from "next/navigation";
import { Bell, Settings, Search } from "lucide-react";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":   { title: "Dashboard",           subtitle: "Your health at a glance" },
  "/genomics":    { title: "Genomics Portal",     subtitle: "SNP analysis & risk profiling" },
  "/supplements": { title: "Supplement Manager",   subtitle: "Genetically personalized stack" },
  "/diet":        { title: "Diet & Nutrition",     subtitle: "Macros, meals & planning" },
  "/fitness":     { title: "Fitness Planner",      subtitle: "Workouts & progress tracking" },
  "/records":     { title: "Medical Records",      subtitle: "Clinical timeline & documents" },
  "/annotations": { title: "Genome Tracker",       subtitle: "Latest research annotations" },
  "/medicine":    { title: "Medicine Checker",     subtitle: "Drug interactions & pharmacogenomics" },
  "/bloodwork":   { title: "Blood Work Analytics", subtitle: "Biomarkers & trends" },
  "/family":      { title: "Family Health Hub",    subtitle: "Multi-profile management" },
  "/offspring":       { title: "Offspring Genomics",       subtitle: "Mutation potential & inheritance analysis" },
  "/enrichment":      { title: "Pathway Enrichment",       subtitle: "KEGG, Reactome & GO biological process analysis" },
  "/gwas":            { title: "GWAS & Disease",            subtitle: "Genome-wide associations & DisGeNET network" },
  "/comparison":      { title: "Family Comparison",         subtitle: "Cross-family variant heatmap & concordance" },
  "/prs":             { title: "Polygenic Risk Scores",     subtitle: "Multi-trait genetic risk estimation" },
  "/pharmacogenomics": { title: "Pharmacogenomics",         subtitle: "Drug-gene interactions & metabolizer profiles" },
};

export default function Header() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname || "/dashboard"] || PAGE_TITLES["/dashboard"];

  return (
    <header className="sticky top-0 z-40 h-[68px] flex items-center justify-between px-8 bg-cream-100/80 backdrop-blur-md border-b border-cream-300">
      <div>
        <h1 className="font-serif text-[22px] font-semibold text-stone-800 tracking-tight">{page.title}</h1>
        <p className="text-micro text-stone-400 mt-0.5">{page.subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-cream-300 text-stone-400 text-body mr-2 cursor-pointer hover:border-copper/30 transition-colors">
          <Search size={15} strokeWidth={1.5} />
          <span className="text-body text-stone-400">Search...</span>
          <kbd className="ml-4 text-micro px-1.5 py-0.5 rounded-md bg-cream-100 border border-cream-300 text-stone-400 font-mono">/</kbd>
        </div>
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-cream-300 transition-all">
          <Bell size={17} strokeWidth={1.5} className="text-stone-500" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose" />
        </button>
        {/* Settings */}
        <button className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-cream-300 transition-all">
          <Settings size={17} strokeWidth={1.5} className="text-stone-500" />
        </button>
      </div>
    </header>
  );
}
