"use client";

import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { Utensils, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MEALS, DAILY_LOGS } from "@/data/seed";

const tooltipStyle = { background: "white", border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };

export default function DietPage() {
  const totalCals = MEALS.reduce((s, m) => s + m.calories, 0);
  const totalProt = MEALS.reduce((s, m) => s + m.protein_g, 0);
  const totalCarbs = MEALS.reduce((s, m) => s + m.carbs_g, 0);
  const totalFat = MEALS.reduce((s, m) => s + m.fat_g, 0);
  const macros = [
    { name: "Protein", value: totalProt, target: 180, color: "#7B8FA4" },
    { name: "Carbs", value: totalCarbs, target: 200, color: "#C4956A" },
    { name: "Fat", value: totalFat, target: 70, color: "#B07070" },
  ];
  const weekData = DAILY_LOGS.map(d => ({ day: d.day.slice(5), calories: d.calories }));

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-4 gap-4">
        <Card accent className="flex flex-col items-center gap-2 py-5">
          <ProgressRing value={totalCals} max={2200} size={80} color="#C4956A" />
          <span className="text-caption text-stone-500 font-medium mt-1">Calories</span>
          <span className="text-micro text-stone-400">{totalCals} / 2200</span>
        </Card>
        {macros.map(m => (
          <Card key={m.name} className="flex flex-col items-center gap-2 py-5">
            <ProgressRing value={m.value} max={m.target} size={80} color={m.color} />
            <span className="text-caption text-stone-500 font-medium mt-1">{m.name}</span>
            <span className="text-micro text-stone-400">{m.value}g / {m.target}g</span>
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle icon={Utensils} title="Today's Meals" />
        <div className="flex flex-col gap-2.5">
          {MEALS.map(m => (
            <div key={m.id} className="flex items-center gap-4 p-4 bg-cream-100 rounded-xl border border-cream-300 hover:shadow-elevated transition-all">
              <span className="text-body text-stone-400 w-12 shrink-0 font-mono">{m.time}</span>
              <Badge className="w-[72px] justify-center">{m.meal_type}</Badge>
              <span className="flex-1 text-body text-stone-600">{m.description}</span>
              <span className="text-body text-amber-dark font-medium">{m.calories} cal</span>
              <span className="text-body text-slate-dark font-medium">{m.protein_g}g P</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={BarChart3} title="Weekly Calorie Trend" />
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weekData}>
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4956A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#C4956A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
            <XAxis dataKey="day" tick={{ fill: "#7A756F", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9B958E", fontSize: 11 }} axisLine={false} tickLine={false} domain={[1500, 2500]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="calories" stroke="#C4956A" fill="url(#calGrad)" strokeWidth={2} dot={{ fill: "#C4956A", r: 3, strokeWidth: 2, stroke: "white" }} name="Calories" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
