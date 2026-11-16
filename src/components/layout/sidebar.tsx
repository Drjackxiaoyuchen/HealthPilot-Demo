"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Compass,
  Menu,
  X,
  Search,
  ArrowUpRight,
  FlaskConical,
  FileText,
  Upload,
} from "lucide-react";
import { SECTION_GUIDES } from "@/data/research";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState("");
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <div className="mobile-navigation fixed top-0 inset-x-0 h-14 z-50 bg-cream-100 border-b border-cream-300 px-4 items-center justify-between hidden">
        <Link
          href="/dashboard"
          className="font-serif text-lg text-stone-800 flex gap-2 items-center"
        >
          <Compass size={19} className="text-copper" />
          Symphony AI
        </Link>
        <button
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
          className="p-2"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <button
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
          className="mobile-navigation fixed inset-0 bg-black/25 z-40 hidden"
        />
      )}
      <aside
        id="main-navigation"
        className={cn(
          "app-sidebar fixed left-0 top-0 h-screen w-[250px] flex flex-col bg-cream-100 border-r border-cream-300 z-50",
          open && "is-open",
        )}
      >
        <Link
          href="/dashboard"
          className="px-6 py-6 border-b border-cream-300 flex gap-3 items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-copper text-white flex items-center justify-center">
            <Compass size={22} />
          </div>
          <div>
            <div className="font-serif text-[21px] text-stone-800">
              Symphony AI
            </div>
            <div className="text-[10px] uppercase tracking-widest text-stone-500">
              Your signals, together
            </div>
          </div>
        </Link>
        <div className="mx-4 mt-4 flex gap-2 items-center bg-white rounded-xl border border-cream-300 px-3">
          <Search size={14} className="text-stone-400" />
          <input
            aria-label="Find a section"
            placeholder="Find a section…"
            className="w-full bg-transparent border-none text-caption py-2.5 focus:shadow-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <nav
          aria-label="Main navigation"
          className="flex-1 min-h-0 overflow-auto px-3 py-4 space-y-0.5"
        >
          {SECTION_GUIDES.filter(
            (item) =>
              item.path !== "/import" &&
              item.title.toLowerCase().includes(query.toLowerCase()),
          ).map((item) => (
            <Link
              key={item.path}
              href={item.path}
              aria-current={pathname === item.path ? "page" : undefined}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-caption border border-transparent",
                pathname === item.path
                  ? "bg-white text-copper-700 !border-cream-300 font-medium"
                  : "text-stone-500 hover:bg-cream-200",
              )}
            >
              <span>{item.title}</span>
              {pathname === item.path && <ArrowUpRight size={13} />}
            </Link>
          ))}
          {query &&
            !SECTION_GUIDES.some(
              (item) =>
                item.path !== "/import" &&
                item.title.toLowerCase().includes(query.toLowerCase()),
            ) && (
              <p className="text-caption p-3 text-stone-500">
                No matching sections.
              </p>
            )}
        </nav>
        <div className="p-3 border-t border-cream-300 space-y-1">
          {[
            { path: "/import", title: "Import Data", icon: Upload },
            { path: "/reports", title: "Reports & Export", icon: FileText },
            {
              path: "/research",
              title: "Research Library",
              icon: FlaskConical,
            },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              aria-current={pathname === item.path ? "page" : undefined}
              className={cn(
                "flex gap-2.5 items-center px-3 py-2 rounded-xl text-caption",
                pathname === item.path
                  ? "bg-white text-copper-700 border border-cream-300"
                  : "text-stone-600 hover:bg-cream-200",
              )}
            >
              <item.icon size={15} />
              {item.title}
            </Link>
          ))}
          <p className="px-3 pt-2 text-[10px] text-stone-400">
            Local workspace · Demo sections labeled
          </p>
        </div>
      </aside>
    </>
  );
}
