"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Upload, BookOpen } from "lucide-react";
import { sectionGuide } from "@/data/research";
export default function Header() {
  const pathname = usePathname() || "/dashboard";
  const guide = sectionGuide(pathname);
  const title =
    guide?.title ||
    (pathname === "/reports"
      ? "Reports & Export"
      : pathname === "/research"
        ? "Research Library"
        : "Symphony AI");
  return (
    <header className="app-header sticky top-0 z-30 min-h-[76px] flex flex-wrap gap-3 items-center justify-between px-8 py-3 bg-cream-100/95 backdrop-blur-md border-b border-cream-300">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-stone-400">
          Symphony AI / {guide?.group || "Workspace"}
        </p>
        <h1 className="font-serif text-[24px] text-stone-800">{title}</h1>
      </div>
      <div className="flex items-center gap-4 text-caption">
        <Link
          href="/research"
          className="flex gap-1.5 items-center text-stone-500"
        >
          <BookOpen size={14} />
          Sources
        </Link>
        <Link
          href="/import"
          className="flex gap-1.5 items-center text-copper-700 rounded-xl border border-copper/20 bg-white px-3 py-2"
        >
          <Upload size={14} />
          Import data
        </Link>
      </div>
    </header>
  );
}
