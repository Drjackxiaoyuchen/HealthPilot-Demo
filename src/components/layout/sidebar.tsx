"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home, Dna, Pill, Apple, Dumbbell, FileText,
  BookOpen, Stethoscope, FlaskConical, Users, Baby,
  HeartPulse, UserCircle, ChevronRight,
  Network, BarChart3, GitCompareArrows, Gauge, Syringe,
  Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/genomics", label: "Genomics", icon: Dna },
  { href: "/glucose", label: "Glucose & Diet", icon: Activity },
  { href: "/supplements", label: "Supplements", icon: Pill },
  { href: "/diet", label: "Diet & Nutrition", icon: Apple },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/records", label: "Medical Records", icon: FileText },
  { href: "/annotations", label: "Genome Tracker", icon: BookOpen },
  { href: "/medicine", label: "Medicine Checker", icon: Stethoscope },
  { href: "/bloodwork", label: "Blood Work", icon: FlaskConical },
  { href: "/family", label: "Family Hub", icon: Users },
  { href: "/offspring", label: "Offspring Risk", icon: Baby },
  { href: "/enrichment", label: "Pathway Enrichment", icon: Network },
  { href: "/gwas", label: "GWAS & Disease", icon: BarChart3 },
  { href: "/comparison", label: "Family Comparison", icon: GitCompareArrows },
  { href: "/prs", label: "Polygenic Risk", icon: Gauge },
  { href: "/pharmacogenomics", label: "Pharmacogenomics", icon: Syringe },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] flex flex-col bg-cream-100 border-r border-cream-300 z-50">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-cream-300">
        <Link href="/dashboard" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-xl bg-copper flex items-center justify-center">
            <HeartPulse size={18} className="text-white" strokeWidth={1.8} />
          </div>
          <div>
            <div className="font-serif text-[17px] font-semibold text-stone-800 tracking-tight">HealthPilot</div>
            <div className="text-[10px] text-stone-400 tracking-[0.08em] uppercase font-medium">Precision Health</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-body no-underline transition-all duration-150 group",
                isActive
                  ? "bg-white text-copper-700 font-medium shadow-subtle border border-cream-300"
                  : "text-stone-500 hover:text-stone-700 hover:bg-cream-200/60"
              )}
            >
              <item.icon size={17} strokeWidth={isActive ? 1.8 : 1.5} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={13} className="text-copper/40" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-5 border-t border-cream-300">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-cream-200/60 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-copper-50 flex items-center justify-center">
            <UserCircle size={18} className="text-copper" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body font-medium text-stone-700 truncate">Alex Morgan</div>
            <div className="text-micro text-stone-400">Premium</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
