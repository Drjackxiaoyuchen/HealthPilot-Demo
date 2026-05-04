"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { Flame, Clock, CheckCircle, Dumbbell, Calendar, TrendingUp, Play, Smartphone, Activity, Search, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";
import { WORKOUTS, WORKOUT_DEMOS } from "@/data/seed";

const tooltipStyle = { background: "white", border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };

// Mock glucose data (placeholder for future CGM integration)
const GLUCOSE_DATA = [
  { time: "06:00", value: 85 }, { time: "07:00", value: 92 }, { time: "08:00", value: 125 },
  { time: "09:00", value: 108 }, { time: "10:00", value: 95 }, { time: "11:00", value: 88 },
  { time: "12:00", value: 90 }, { time: "13:00", value: 132 }, { time: "14:00", value: 115 },
  { time: "15:00", value: 98 }, { time: "16:00", value: 92 }, { time: "17:00", value: 88 },
  { time: "18:00", value: 86 }, { time: "19:00", value: 128 }, { time: "20:00", value: 110 },
  { time: "21:00", value: 95 }, { time: "22:00", value: 88 },
];

export default function FitnessPage() {
  const workouts = WORKOUTS.map(w => ({ ...w, exercises: JSON.parse(w.exercises) }));
  const weekCals = workouts.reduce((s, w) => s + w.calories, 0);
  const weekDur = workouts.reduce((s, w) => s + w.duration_min, 0);
  const completed = workouts.filter(w => w.completed).length;
  const [demoFilter, setDemoFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [...new Set(WORKOUT_DEMOS.map(d => d.category))];
  const filteredDemos = WORKOUT_DEMOS.filter(d =>
    (demoFilter === "all" || d.category === demoFilter) &&
    (searchQuery === "" || d.exercise.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Weekly Burn" value={weekCals.toLocaleString()} unit="kcal" color="red" />
        <StatCard icon={Clock} label="Total Duration" value={weekDur} unit="min" color="blue" />
        <StatCard icon={CheckCircle} label="Completed" value={`${completed}/7`} color="green" />
        <StatCard icon={Dumbbell} label="Workout Days" value="5" unit="days" color="copper" />
      </div>

      {/* Weekly Program */}
      <Card>
        <SectionTitle icon={Calendar} title="Weekly Program" subtitle="Push/Pull/Legs + HIIT" />
        <div className="grid grid-cols-7 gap-3">
          {workouts.map((w, i) => (
            <div key={i} className={`p-3.5 rounded-xl flex flex-col gap-2 border transition-all hover:shadow-elevated ${w.completed ? "bg-sage-light border-sage/15" : "bg-cream-100 border-cream-300"}`}>
              <div className="flex justify-between items-center">
                <span className="text-caption font-semibold text-stone-700">{w.day_of_week.slice(0, 3)}</span>
                {w.completed ? <CheckCircle size={13} strokeWidth={1.5} className="text-sage" /> : <div className="w-3 h-3 rounded-full border-2 border-stone-200" />}
              </div>
              <span className="text-micro font-medium text-copper">{w.type}</span>
              <span className="text-micro text-stone-400 leading-snug">{w.exercises.slice(0, 3).join(", ")}{w.exercises.length > 3 ? "..." : ""}</span>
              <div className="mt-auto pt-1 flex justify-between text-micro text-stone-400 border-t border-cream-300">
                <span>{w.duration_min}min</span><span>{w.calories}cal</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Demo Videos */}
      <Card>
        <SectionTitle icon={Play} title="Exercise Demo Library" subtitle="Curated video guides from top fitness channels" />
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-2 bg-cream-100 rounded-xl border border-cream-300 flex-1">
            <Search size={14} strokeWidth={1.5} className="text-stone-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="bg-transparent text-body text-stone-800 placeholder-stone-300 outline-none flex-1" />
          </div>
          <div className="flex gap-1">
            {["all", ...categories].map(c => (
              <button key={c} onClick={() => setDemoFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-micro font-medium transition-all ${
                  demoFilter === c ? "bg-stone-800 text-white" : "bg-cream-200 text-stone-400 hover:text-stone-600"
                }`}>{c === "all" ? "All" : c}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredDemos.map((d, i) => (
            <a key={i} href={`https://www.youtube.com/watch?v=${d.videoId}`} target="_blank" rel="noopener noreferrer"
              className="group p-4 bg-cream-100 rounded-xl border border-cream-300 hover:shadow-elevated transition-all no-underline">
              <div className="flex items-start gap-4">
                {/* Thumbnail placeholder */}
                <div className="w-28 h-20 rounded-lg bg-cream-300 flex items-center justify-center shrink-0 relative overflow-hidden group-hover:bg-copper/10 transition-colors">
                  <Play size={24} strokeWidth={1.5} className="text-stone-400 group-hover:text-copper transition-colors" />
                  <div className="absolute bottom-1 right-1 bg-stone-800/80 text-white text-[9px] px-1 rounded">YT</div>
                </div>
                <div className="flex-1">
                  <div className="text-body font-medium text-stone-800 group-hover:text-copper transition-colors">{d.exercise}</div>
                  <div className="text-caption text-stone-500 mt-0.5">{d.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="info">{d.category}</Badge>
                    <span className="text-micro text-stone-400">{d.channel}</span>
                    <ExternalLink size={11} className="text-stone-300" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* Glucose Monitor + Health Data (Future Integration) */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <SectionTitle icon={Activity} title="Continuous Glucose Monitor" subtitle="Connect your CGM device for real-time data" />
          <div className="mb-4 p-3 bg-amber-light rounded-xl border border-amber/15 flex items-center gap-2">
            <Smartphone size={15} strokeWidth={1.5} className="text-amber" />
            <span className="text-caption text-amber-dark">Preview mode — connect Dexcom, Libre, or microneedle CGM to see live data</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={GLUCOSE_DATA}>
              <defs>
                <linearGradient id="glucGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B8906F" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#B8906F" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
              <XAxis dataKey="time" tick={{ fill: "#9B958E", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 150]} tick={{ fill: "#9B958E", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} mg/dL`, "Glucose"]} />
              {/* Target range band */}
              <Area isAnimationActive={false} type="monotone" dataKey="value" stroke="#B8906F" fill="url(#glucGrad)" strokeWidth={2}
                dot={{ fill: "#B8906F", r: 2, strokeWidth: 1.5, stroke: "white" }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-5 mt-3 text-micro text-stone-400">
            <span>Avg: 101 mg/dL</span>
            <span>Time in range: 94%</span>
            <span>Variability: Low</span>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Smartphone} title="Apple Health Integration" subtitle="Connect iPhone health data sources" />
          <div className="space-y-3">
            {[
              { name: "Heart Rate", icon: "❤️", status: "ready", value: "Connect Apple Watch" },
              { name: "Steps & Distance", icon: "👣", status: "ready", value: "Connect iPhone Motion" },
              { name: "Sleep Analysis", icon: "🌙", status: "ready", value: "Connect Apple Watch" },
              { name: "Blood Oxygen", icon: "🫁", status: "ready", value: "Connect Apple Watch" },
              { name: "Respiratory Rate", icon: "💨", status: "ready", value: "Connect Apple Watch" },
              { name: "HRV", icon: "📊", status: "ready", value: "Connect Apple Watch" },
            ].map((source, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-cream-100 rounded-xl border border-cream-300">
                <span className="text-lg">{source.icon}</span>
                <div className="flex-1">
                  <div className="text-body font-medium text-stone-700">{source.name}</div>
                  <div className="text-micro text-stone-400">{source.value}</div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-copper text-white text-micro font-medium hover:bg-copper-dark transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Weekly Burn Distribution */}
      <Card>
        <SectionTitle icon={TrendingUp} title="Weekly Burn Distribution" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={workouts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
            <XAxis dataKey="day_of_week" tick={{ fill: "#7A756F", fontSize: 11 }} tickFormatter={d => d.slice(0, 3)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9B958E", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar isAnimationActive={false} dataKey="calories" name="Calories" radius={[6, 6, 0, 0]}>
              {workouts.map((w, i) => <Cell key={i} fill={w.completed ? "#6B8F71" : "#E8E0D4"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
