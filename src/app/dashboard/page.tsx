"use client";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import {
  Activity, Flame, Moon, Footprints, Droplets, Dumbbell, BarChart3, Shield, Weight,
} from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { DAILY_LOGS, MEALS } from "@/data/seed";

const tooltipStyle = { background: "white", border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };

export default function DashboardPage() {
  const weekData = DAILY_LOGS.map(d => ({
    day: d.day.slice(8),
    calories: d.calories,
    protein: d.protein_g,
    score: d.health_score,
    steps: d.steps,
  }));
  const today = DAILY_LOGS[DAILY_LOGS.length - 1];
  const totalCals = MEALS.reduce((s, m) => s + m.calories, 0);
  const totalProt = MEALS.reduce((s, m) => s + m.protein_g, 0);

  const radarData = [
    { subject: "Sleep", value: 88 },
    { subject: "Nutrition", value: 82 },
    { subject: "Exercise", value: 78 },
    { subject: "Genomic Rx", value: 92 },
    { subject: "Stress", value: 75 },
    { subject: "Biomarkers", value: 90 },
  ];

  return (
    <div className="flex flex-col gap-7">
      {/* Health Score + KPIs */}
      <div className="flex gap-6">
        <Card accent className="w-[200px] flex flex-col items-center justify-center gap-3 shrink-0">
          <span className="text-micro text-stone-400 uppercase tracking-[0.1em] font-medium">Health Score</span>
          <ProgressRing value={86} max={100} size={100} strokeWidth={7} color="#6B8F71" />
          <Badge variant="success">Excellent</Badge>
          <span className="text-micro text-stone-400">+4 pts this month</span>
        </Card>
        <div className="flex-1 grid grid-cols-3 gap-4">
          <StatCard icon={Weight} label="Weight" value="78.0" unit="kg" trend="-0.5kg" trendUp={false} color="blue" />
          <StatCard icon={Moon} label="Sleep" value="7.9" unit="hrs" trend="+0.4h" trendUp={true} color="purple" />
          <StatCard icon={Footprints} label="Steps" value="7,800" trend="+12%" trendUp={true} color="green" />
          <StatCard icon={Flame} label="Calories" value={totalCals.toLocaleString()} unit="kcal" color="yellow" />
          <StatCard icon={Dumbbell} label="Protein" value={totalProt} unit="g" trend="97%" trendUp={true} color="red" />
          <StatCard icon={Droplets} label="Water" value="3.1" unit="L" trend="97%" trendUp={true} color="cyan" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[2fr_1fr] gap-6">
        <Card>
          <SectionTitle icon={BarChart3} title="Weekly Trends" subtitle="Last 7 days" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
              <XAxis dataKey="day" tick={{ fill: "#7A756F", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9B958E", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar isAnimationActive={false} dataKey="calories" fill="#C4956A" radius={[6, 6, 0, 0]} name="Calories" opacity={0.75} />
              <Bar isAnimationActive={false} dataKey="protein" fill="#7B8FA4" radius={[6, 6, 0, 0]} name="Protein (g)" opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle icon={Shield} title="Wellness Radar" />
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E8E0D4" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#7A756F", fontSize: 10 }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar isAnimationActive={false} dataKey="value" stroke="#B8906F" fill="#B8906F" fillOpacity={0.1} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Health Score trend */}
      <Card>
        <SectionTitle icon={Activity} title="Health Score Trend" subtitle="Daily composite score" />
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weekData}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B8F71" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6B8F71" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
            <XAxis dataKey="day" tick={{ fill: "#7A756F", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 100]} tick={{ fill: "#9B958E", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area isAnimationActive={false} type="monotone" dataKey="score" stroke="#6B8F71" fill="url(#scoreGrad)" strokeWidth={2} dot={{ fill: "#6B8F71", r: 3, strokeWidth: 2, stroke: "white" }} name="Score" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
