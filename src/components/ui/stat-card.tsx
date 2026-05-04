"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

const colorMap: Record<string, { icon: string; trend: string; trendBg: string }> = {
  copper: { icon: "text-copper",    trend: "text-copper-700",  trendBg: "bg-copper-50" },
  green:  { icon: "text-sage",      trend: "text-sage-dark",   trendBg: "bg-sage-light" },
  red:    { icon: "text-rose",      trend: "text-rose-dark",   trendBg: "bg-rose-light" },
  yellow: { icon: "text-amber",     trend: "text-amber-dark",  trendBg: "bg-amber-light" },
  blue:   { icon: "text-slate",     trend: "text-slate-dark",  trendBg: "bg-slate-light" },
  purple: { icon: "text-plum",      trend: "text-plum-dark",   trendBg: "bg-plum-light" },
  cyan:   { icon: "text-slate",     trend: "text-slate-dark",  trendBg: "bg-slate-light" },
  brand:  { icon: "text-copper",    trend: "text-copper-700",  trendBg: "bg-copper-50" },
};

export function StatCard({ icon: Icon, label, value, unit, trend, trendUp, color = "copper" }: StatCardProps) {
  const c = colorMap[color] || colorMap.copper;
  return (
    <div className="bg-white rounded-2xl p-5 border border-cream-300 hover:shadow-elevated transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <Icon size={20} strokeWidth={1.5} className={c.icon} />
        {trend && (
          <div className={`flex items-center gap-1 text-micro font-medium px-2 py-0.5 rounded-full ${trendUp ? "text-sage-dark bg-sage-light" : "text-rose-dark bg-rose-light"}`}>
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-caption text-stone-400 font-medium mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] font-serif font-semibold text-stone-800 tracking-tight">{value}</span>
        {unit && <span className="text-caption text-stone-400">{unit}</span>}
      </div>
    </div>
  );
}
