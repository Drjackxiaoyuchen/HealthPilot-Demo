"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { ProgressRing } from "@/components/ui/progress-ring";
import {
  Activity, Camera, Search, Sparkles, Flame, Wheat, Beef, Droplet, Leaf,
  TrendingUp, TrendingDown, ChevronRight, Plus, X, Utensils, BarChart3,
  AlertCircle, CheckCircle2, Lightbulb, Dna, Target, Scan,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, ReferenceArea, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  CGM_TODAY, WEEK_SUMMARY, MEAL_LOG, FOOD_DB, GLUCOSE_INSIGHTS,
  NUTRIENT_TARGETS, GLUCOSE_REF, type FoodItem, type MealLog,
} from "@/data/glucose";

const tooltipStyle = { background: "white", border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };

// Map a glucose value to a semantic color
function glucoseColor(v: number) {
  if (v < GLUCOSE_REF.low) return "#7B8FA4";        // slate (low)
  if (v <= GLUCOSE_REF.high) return "#6B8F71";       // sage (in-range)
  if (v <= GLUCOSE_REF.veryHigh) return "#C4956A";   // amber (elevated)
  return "#B07070";                                   // rose (high)
}

function impactColor(impact: "low" | "moderate" | "high") {
  return impact === "low" ? "#6B8F71" : impact === "moderate" ? "#C4956A" : "#B07070";
}

function verdictVariant(v: MealLog["verdict"]) {
  return v === "excellent" || v === "good" ? "success" : v === "moderate" ? "warning" : "danger";
}

export default function GlucosePage() {
  const [scanOpen, setScanOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>("m3");
  const [foodFilter, setFoodFilter] = useState("");
  const [foodCategory, setFoodCategory] = useState<string>("All");

  // ── Derived stats ─────────────────────────────────────────
  const tirStats = useMemo(() => {
    const vals = CGM_TODAY.map(d => d.v);
    const inR = vals.filter(v => v >= GLUCOSE_REF.low && v <= GLUCOSE_REF.high).length;
    const high = vals.filter(v => v > GLUCOSE_REF.high && v <= GLUCOSE_REF.veryHigh).length;
    const veryHigh = vals.filter(v => v > GLUCOSE_REF.veryHigh).length;
    const low = vals.filter(v => v < GLUCOSE_REF.low).length;
    const total = vals.length;
    const avg = vals.reduce((s, v) => s + v, 0) / total;
    return {
      avg,
      tir: (inR / total) * 100,
      high: (high / total) * 100,
      veryHigh: (veryHigh / total) * 100,
      low: (low / total) * 100,
      min: Math.min(...vals),
      max: Math.max(...vals),
      gmi: 3.31 + 0.02392 * (avg * 18.0182),  // ADA GMI formula (mg/dL); avg already mmol/L → ×18 ≈ mg/dL
    };
  }, []);

  // Latest reading + delta
  const current = CGM_TODAY[CGM_TODAY.length - 1];
  const prev = CGM_TODAY[CGM_TODAY.length - 2];
  const delta = current.v - prev.v;

  // Daily macro totals
  const macros = useMemo(() => {
    return MEAL_LOG.reduce((s, m) => ({
      calories: s.calories + m.calories,
      carbs:    s.carbs    + m.carbs_g,
      protein:  s.protein  + m.protein_g,
      fat:      s.fat      + m.fat_g,
      fiber:    s.fiber    + m.fiber_g,
    }), { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 });
  }, []);

  // Selected meal
  const selectedMeal = MEAL_LOG.find(m => m.id === selectedMealId) || null;

  // Food filtering
  const categories = ["All", ...Array.from(new Set(FOOD_DB.map(f => f.category)))];
  const filteredFoods = FOOD_DB.filter(f =>
    (foodCategory === "All" || f.category === foodCategory) &&
    f.name.toLowerCase().includes(foodFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-7">
      {/* ─────────────────  HERO  ───────────────── */}
      <Card className="p-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-micro text-stone-400 uppercase tracking-[0.12em] font-medium mb-1">Continuous Glucose Monitoring</div>
            <h2 className="font-serif text-[26px] font-semibold text-stone-800 tracking-tight">Glucose &amp; Diet</h2>
            <p className="text-body text-stone-500 mt-1">
              Today: April 25, 2026 · Sibionics CGM · {CGM_TODAY.length} readings · Real-time food coaching
            </p>
          </div>
          <button
            onClick={() => setScanOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-copper text-white rounded-xl text-body font-medium hover:bg-copper-dark transition-colors shadow-subtle"
          >
            <Scan size={16} strokeWidth={2} />
            Scan Food
          </button>
        </div>

        {/* Current value + 3 KPI tiles */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3">
          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-micro text-stone-400 uppercase tracking-wide font-medium">Right Now</span>
              <Badge variant={current.v <= GLUCOSE_REF.high ? "success" : "warning"}>
                {current.v <= GLUCOSE_REF.high ? "In Range" : "Elevated"}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[40px] font-serif font-semibold tracking-tight" style={{ color: glucoseColor(current.v) }}>
                {current.v.toFixed(1)}
              </span>
              <span className="text-caption text-stone-400">mmol/L</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-micro text-stone-500">
              {delta >= 0 ? <TrendingUp size={12} className="text-amber" /> : <TrendingDown size={12} className="text-sage" />}
              <span className="font-mono">{delta >= 0 ? "+" : ""}{delta.toFixed(1)}</span>
              <span>vs 15 min ago</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sage-light border border-sage/15">
            <div className="text-micro text-stone-500 uppercase tracking-wide font-medium mb-2">Time in Range</div>
            <div className="text-[28px] font-serif font-semibold text-sage-dark tracking-tight">{tirStats.tir.toFixed(0)}%</div>
            <div className="text-micro text-stone-400 mt-1">Target ≥ 70% · 3.9–7.8 mmol/L</div>
          </div>

          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300">
            <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mb-2">Avg Glucose</div>
            <div className="text-[28px] font-serif font-semibold text-stone-800 tracking-tight">{tirStats.avg.toFixed(1)}</div>
            <div className="text-micro text-stone-400 mt-1">mmol/L · last 24h</div>
          </div>

          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300">
            <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mb-2">GMI (est. HbA1c)</div>
            <div className="text-[28px] font-serif font-semibold text-stone-800 tracking-tight">{tirStats.gmi.toFixed(1)}<span className="text-body font-sans text-stone-400">%</span></div>
            <div className="text-micro text-stone-400 mt-1">Lab HbA1c: 5.1%</div>
          </div>
        </div>
      </Card>

      {/* ─────────────────  24-HOUR CGM TRACE  ───────────────── */}
      <Card>
        <SectionTitle
          icon={Activity}
          title="24-Hour Glucose Trace"
          subtitle="Continuous reading · meal events overlaid"
          action={
            <div className="flex items-center gap-3 text-micro text-stone-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sage" /> In range</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber" /> Elevated</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose" /> High</span>
            </div>
          }
        />
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={CGM_TODAY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gluGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B8906F" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#B8906F" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {/* In-range band */}
            <ReferenceArea y1={GLUCOSE_REF.low} y2={GLUCOSE_REF.high} fill="#6B8F71" fillOpacity={0.06} ifOverflow="extendDomain" />
            <ReferenceLine y={GLUCOSE_REF.high} stroke="#C4956A" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={GLUCOSE_REF.low}  stroke="#7B8FA4" strokeDasharray="3 3" strokeOpacity={0.5} />
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fill: "#7A756F", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={11}     // ~every 3 hours
              tickFormatter={t => t.split(":")[0] + ":00"}
            />
            <YAxis
              domain={[3, 10]}
              tick={{ fill: "#9B958E", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              ticks={[4, 5.6, 7.8, 10]}
              tickFormatter={v => v.toString()}
              width={48}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${value} mmol/L`, "Glucose"]}
            />
            {/* Meal markers */}
            {MEAL_LOG.map(m => (
              <ReferenceLine key={m.id} x={roundToQuarter(m.time)} stroke="#B8906F" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="2 2"
                label={{ value: m.emoji, position: "top", fontSize: 13 }}
              />
            ))}
            <Area isAnimationActive={false} type="monotone" dataKey="v" stroke="#B8906F" fill="url(#gluGrad)" strokeWidth={2}
              dot={false} activeDot={{ r: 4, stroke: "white", strokeWidth: 2, fill: "#B8906F" }}
              name="Glucose"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ───────────────── TIR breakdown + 7-day trend ───────────────── */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <SectionTitle icon={Target} title="Time in Range" subtitle="Today · 24-hour distribution" />
          {/* Stacked horizontal bar */}
          <div className="h-7 rounded-xl overflow-hidden flex border border-cream-300 bg-cream-100">
            {tirStats.low > 0 &&      <div className="bg-slate"     style={{ width: `${tirStats.low}%` }}      title={`Low ${tirStats.low.toFixed(0)}%`} />}
            <div className="bg-sage"      style={{ width: `${tirStats.tir}%` }}      title={`In range ${tirStats.tir.toFixed(0)}%`} />
            {tirStats.high > 0 &&     <div className="bg-amber"     style={{ width: `${tirStats.high}%` }}     title={`Elevated ${tirStats.high.toFixed(0)}%`} />}
            {tirStats.veryHigh > 0 && <div className="bg-rose"      style={{ width: `${tirStats.veryHigh}%` }} title={`High ${tirStats.veryHigh.toFixed(0)}%`} />}
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            <TIRBlock label="Low"      pct={tirStats.low}      hint="< 3.9"     color="bg-slate" textColor="text-slate-dark" />
            <TIRBlock label="In Range" pct={tirStats.tir}      hint="3.9–7.8"   color="bg-sage"  textColor="text-sage-dark"  emphasize />
            <TIRBlock label="Elevated" pct={tirStats.high}     hint="7.8–10"    color="bg-amber" textColor="text-amber-dark" />
            <TIRBlock label="High"     pct={tirStats.veryHigh} hint="> 10"      color="bg-rose"  textColor="text-rose-dark" />
          </div>
          <div className="mt-5 p-3.5 bg-sage-light rounded-xl border border-sage/15 flex items-start gap-3">
            <CheckCircle2 size={16} className="text-sage mt-0.5 shrink-0" strokeWidth={2} />
            <div>
              <div className="text-caption font-medium text-sage-dark">{tirStats.tir.toFixed(0)}% in range — exceeds 70% ADA target</div>
              <div className="text-micro text-stone-500 mt-0.5">Min {tirStats.min.toFixed(1)} · Max {tirStats.max.toFixed(1)} mmol/L · Glucose variability is low</div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={BarChart3} title="7-Day Time-in-Range" subtitle="Daily TIR vs. 70% target" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEK_SUMMARY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#7A756F", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: "#9B958E", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "TIR"]} />
              <ReferenceLine y={70} stroke="#B8906F" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "Target 70%", fontSize: 10, fill: "#9A7458", position: "right" }} />
              <Bar isAnimationActive={false} dataKey="tir" radius={[6, 6, 0, 0]}>
                {WEEK_SUMMARY.map((d, i) => (
                  <Cell key={i} fill={d.tir >= 95 ? "#6B8F71" : d.tir >= 80 ? "#C4956A" : "#B07070"} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex justify-between text-micro text-stone-500">
            <span>Weekly avg: <span className="font-medium text-stone-700">{(WEEK_SUMMARY.reduce((s, d) => s + d.tir, 0) / WEEK_SUMMARY.length).toFixed(0)}%</span></span>
            <span>Avg glucose: <span className="font-medium text-stone-700">{(WEEK_SUMMARY.reduce((s, d) => s + d.avg, 0) / WEEK_SUMMARY.length).toFixed(2)} mmol/L</span></span>
          </div>
        </Card>
      </div>

      {/* ───────────────── Calorie scan + Macros ───────────────── */}
      <div className="grid grid-cols-[1.3fr_1fr] gap-6">
        <Card>
          <SectionTitle
            icon={Camera}
            title="Calorie Scan"
            subtitle="Snap a photo or pick a recent food — AI estimates calories, macros &amp; glucose impact"
          />
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setScanOpen(true)}
              className="aspect-[4/3] rounded-2xl border-2 border-dashed border-copper/30 bg-copper-50/40 flex flex-col items-center justify-center gap-2 text-copper-700 hover:bg-copper-50 hover:border-copper/50 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-copper/20 flex items-center justify-center shadow-subtle">
                <Camera size={26} strokeWidth={1.5} className="text-copper" />
              </div>
              <span className="text-body font-medium">Take a photo</span>
              <span className="text-micro text-stone-500">or upload from library</span>
            </button>
            <div className="aspect-[4/3] rounded-2xl bg-cream-100 border border-cream-300 p-4 flex flex-col">
              <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mb-3">Recent foods</div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                {FOOD_DB.slice(0, 4).map(f => (
                  <button
                    key={f.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white border border-cream-300 hover:border-copper/30 hover:shadow-subtle transition-all text-left"
                    onClick={() => setScanOpen(true)}
                  >
                    <span className="text-[18px]">{f.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-micro font-medium text-stone-700 truncate">{f.name}</div>
                      <div className="text-[10px] text-stone-400">{f.calories} cal</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recently scanned (mock) */}
          <div className="mt-5 p-4 rounded-xl bg-amber-light/50 border border-amber/15 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-amber/20 flex items-center justify-center text-[24px] shrink-0">🍚</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-body font-medium text-stone-800">Last scan: Lunch (13:00)</span>
                <Badge variant="warning">High GL · 58</Badge>
              </div>
              <div className="text-micro text-stone-500">780 cal · 95g carbs · 32g protein · likely +3.0–4.0 mmol/L spike</div>
            </div>
            <Sparkles size={20} className="text-amber" strokeWidth={1.5} />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Flame} title="Today's Nutrients" />
          <div className="grid grid-cols-3 gap-3">
            <MacroRing label="Calories" value={macros.calories} target={NUTRIENT_TARGETS.calories} unit="kcal" color="#C4956A" icon={Flame} />
            <MacroRing label="Carbs"    value={macros.carbs}    target={NUTRIENT_TARGETS.carbs_g}  unit="g"    color="#B8906F" icon={Wheat} />
            <MacroRing label="Protein"  value={macros.protein}  target={NUTRIENT_TARGETS.protein_g} unit="g"   color="#7B8FA4" icon={Beef} />
            <MacroRing label="Fat"      value={macros.fat}      target={NUTRIENT_TARGETS.fat_g}    unit="g"    color="#B07070" icon={Droplet} />
            <MacroRing label="Fiber"    value={macros.fiber}    target={NUTRIENT_TARGETS.fiber_g}  unit="g"    color="#6B8F71" icon={Leaf} />
            <div className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-cream-100 border border-cream-300">
              <Target size={18} className="text-copper" strokeWidth={1.5} />
              <div className="text-[18px] font-serif font-semibold text-stone-800">{Math.round(macros.calories / NUTRIENT_TARGETS.calories * 100)}%</div>
              <div className="text-micro text-stone-400">of goal</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ───────────────── Today's meals + glucose impact ───────────────── */}
      <Card>
        <SectionTitle
          icon={Utensils}
          title="Diet Logbook"
          subtitle="Each meal correlated with your glucose response"
        />
        <div className="grid grid-cols-[1.2fr_1fr] gap-5">
          {/* Meal list */}
          <div className="flex flex-col gap-2.5">
            {MEAL_LOG.map(m => {
              const isSelected = m.id === selectedMealId;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMealId(m.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-copper-50 border-copper/30 shadow-subtle"
                      : "bg-cream-100 border-cream-300 hover:border-copper/20 hover:shadow-subtle"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white border border-cream-300 flex items-center justify-center text-[22px] shrink-0">
                      {m.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-caption font-mono text-stone-400">{m.time}</span>
                        <Badge variant="default" className="capitalize">{m.type}</Badge>
                        <Badge variant={verdictVariant(m.verdict)}>{m.verdict}</Badge>
                      </div>
                      <div className="text-body text-stone-700 leading-snug">{m.description}</div>
                      <div className="flex items-center gap-3 mt-2 text-micro text-stone-500">
                        <span><span className="font-medium text-stone-700">{m.calories}</span> cal</span>
                        <span className="text-stone-300">·</span>
                        <span><span className="font-medium text-stone-700">{m.carbs_g}g</span> carbs</span>
                        <span className="text-stone-300">·</span>
                        <span><span className="font-medium text-stone-700">{m.protein_g}g</span> P</span>
                        <span className="text-stone-300">·</span>
                        <span>GL <span className="font-medium" style={{ color: impactColor(m.glycemicLoad >= 20 ? "high" : m.glycemicLoad >= 10 ? "moderate" : "low") }}>{m.glycemicLoad}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-[18px] font-serif font-semibold" style={{ color: glucoseColor(m.peakGlucose) }}>
                        {m.peakGlucose.toFixed(1)}
                      </span>
                      <span className="text-micro text-stone-400 whitespace-nowrap">+{m.spike.toFixed(1)} peak</span>
                    </div>
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => setScanOpen(true)}
              className="p-3.5 rounded-xl border border-dashed border-cream-400 text-stone-500 hover:text-copper hover:border-copper/40 hover:bg-copper-50/40 transition-all flex items-center justify-center gap-2 text-body"
            >
              <Plus size={16} strokeWidth={1.8} /> Log a meal or scan food
            </button>
          </div>

          {/* Selected meal detail */}
          {selectedMeal && (
            <div className="bg-cream-50 rounded-2xl border border-cream-300 p-5 sticky top-4 self-start">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-micro text-stone-400 uppercase tracking-wide font-medium">{selectedMeal.type} · {selectedMeal.time}</div>
                  <div className="text-title font-serif font-semibold text-stone-800 mt-0.5">{selectedMeal.emoji} {selectedMeal.description.split(",")[0]}</div>
                </div>
                <Badge variant={verdictVariant(selectedMeal.verdict)} className="capitalize shrink-0">{selectedMeal.verdict}</Badge>
              </div>

              {/* Glucose impact gauge */}
              <div className="bg-white rounded-xl border border-cream-300 p-4 mb-3">
                <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mb-3">Glucose Response</div>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="text-micro text-stone-500 mb-1">Baseline</div>
                    <div className="text-[22px] font-serif font-semibold text-stone-800">{selectedMeal.baselineGlucose.toFixed(1)}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <ChevronRight size={20} className="text-stone-300 mx-auto" />
                    <div className="text-micro font-medium mt-1" style={{ color: glucoseColor(selectedMeal.peakGlucose) }}>
                      +{selectedMeal.spike.toFixed(1)} mmol/L
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-micro text-stone-500 mb-1">Peak ({selectedMeal.peakTime})</div>
                    <div className="text-[22px] font-serif font-semibold" style={{ color: glucoseColor(selectedMeal.peakGlucose) }}>
                      {selectedMeal.peakGlucose.toFixed(1)}
                    </div>
                  </div>
                </div>
                {/* Inline mini-bar */}
                <div className="mt-3 h-1.5 bg-cream-200 rounded-full overflow-hidden relative">
                  <div className="absolute left-0 top-0 h-full bg-sage" style={{ width: `${(selectedMeal.baselineGlucose / 11) * 100}%` }} />
                  <div className="absolute top-0 h-full" style={{
                    left: `${(selectedMeal.baselineGlucose / 11) * 100}%`,
                    width: `${(selectedMeal.spike / 11) * 100}%`,
                    background: glucoseColor(selectedMeal.peakGlucose),
                    opacity: 0.65,
                  }} />
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <MiniStat label="cal"    value={selectedMeal.calories.toString()} />
                <MiniStat label="carbs"  value={`${selectedMeal.carbs_g}g`} />
                <MiniStat label="protein" value={`${selectedMeal.protein_g}g`} />
                <MiniStat label="fiber"  value={`${selectedMeal.fiber_g}g`} />
              </div>

              <div className="text-micro text-stone-500 leading-relaxed">
                Glycemic load: <span className="font-medium text-stone-700">{selectedMeal.glycemicLoad}</span> ·
                Carb-to-fiber ratio: <span className="font-medium text-stone-700">{(selectedMeal.carbs_g / Math.max(selectedMeal.fiber_g, 1)).toFixed(1)}:1</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ───────────────── AI insights ───────────────── */}
      <Card>
        <SectionTitle
          icon={Sparkles}
          title="Glycemic Insights"
          subtitle="Personalized to your CGM patterns and genome"
        />
        <div className="grid grid-cols-2 gap-3">
          {GLUCOSE_INSIGHTS.map(ins => {
            const cfg = ins.severity === "high"
              ? { Icon: AlertCircle,    bg: "bg-rose-light",  border: "border-rose/20",  iconColor: "text-rose-dark" }
              : ins.severity === "good"
              ? { Icon: CheckCircle2,   bg: "bg-sage-light",  border: "border-sage/20",  iconColor: "text-sage-dark" }
              : { Icon: Dna,            bg: "bg-cream-100",   border: "border-copper/15", iconColor: "text-copper" };
            return (
              <div key={ins.id} className={`p-4 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-start gap-3 mb-2">
                  <cfg.Icon size={18} strokeWidth={1.7} className={cfg.iconColor + " mt-0.5 shrink-0"} />
                  <div className="flex-1">
                    <div className="text-body font-medium text-stone-800 leading-snug">{ins.title}</div>
                  </div>
                </div>
                <div className="text-caption text-stone-600 leading-relaxed mb-2.5">{ins.body}</div>
                <div className="flex items-start gap-2 p-2.5 bg-white/60 rounded-lg border border-cream-300/50">
                  <Lightbulb size={13} strokeWidth={1.7} className="text-copper mt-0.5 shrink-0" />
                  <div className="text-micro text-stone-600 leading-relaxed">{ins.suggestion}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ───────────────── Food database ───────────────── */}
      <Card>
        <SectionTitle
          icon={Search}
          title="Food Database"
          subtitle={`Browse nutrient info and predicted glucose impact for ${FOOD_DB.length}+ foods`}
          action={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cream-100 border border-cream-300 w-[260px]">
              <Search size={14} className="text-stone-400" />
              <input
                value={foodFilter}
                onChange={e => setFoodFilter(e.target.value)}
                placeholder="Search foods…"
                className="bg-transparent flex-1 text-caption text-stone-700 placeholder:text-stone-400 outline-none border-none"
              />
            </div>
          }
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFoodCategory(c)}
              className={`px-3 py-1 rounded-full text-micro font-medium border transition-all ${
                foodCategory === c
                  ? "bg-copper text-white border-copper"
                  : "bg-white text-stone-600 border-cream-300 hover:border-copper/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredFoods.slice(0, 18).map(f => (
            <FoodCard key={f.id} food={f} />
          ))}
        </div>
        {filteredFoods.length === 0 && (
          <div className="py-12 text-center text-caption text-stone-400">No foods match your search</div>
        )}
      </Card>

      {/* ───────────────── Scan modal ───────────────── */}
      {scanOpen && <ScanModal onClose={() => setScanOpen(false)} />}
    </div>
  );
}

// ───────────────── Helper subcomponents ─────────────────

function TIRBlock({ label, pct, hint, color, textColor, emphasize }: {
  label: string; pct: number; hint: string; color: string; textColor: string; emphasize?: boolean;
}) {
  return (
    <div className={`p-3 rounded-xl border ${emphasize ? "bg-sage-light border-sage/20" : "bg-cream-100 border-cream-300"}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-micro text-stone-500 font-medium">{label}</span>
      </div>
      <div className={`text-[20px] font-serif font-semibold ${textColor}`}>{pct.toFixed(0)}<span className="text-caption font-sans">%</span></div>
      <div className="text-[10px] text-stone-400 font-mono mt-0.5">{hint}</div>
    </div>
  );
}

function MacroRing({ label, value, target, unit, color, icon: Icon }: any) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-cream-100 border border-cream-300">
      <ProgressRing value={value} max={target} size={64} strokeWidth={5} color={color} />
      <div className="flex items-center gap-1 text-micro text-stone-500 font-medium">
        <Icon size={11} strokeWidth={1.7} /> {label}
      </div>
      <div className="text-[10px] text-stone-400 font-mono">{Math.round(value)}/{target}{unit === "g" ? "g" : ""}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream-100 rounded-lg p-2 text-center border border-cream-300">
      <div className="text-body font-serif font-semibold text-stone-800">{value}</div>
      <div className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mt-0.5">{label}</div>
    </div>
  );
}

function FoodCard({ food }: { food: FoodItem }) {
  return (
    <div className="p-3 rounded-xl bg-cream-100 border border-cream-300 hover:border-copper/30 hover:shadow-subtle transition-all flex items-center gap-3 cursor-pointer group">
      <div className="w-10 h-10 rounded-lg bg-white border border-cream-300 flex items-center justify-center text-[20px] shrink-0">{food.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-caption font-medium text-stone-800 truncate">{food.name}</span>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0`} style={{ background: impactColor(food.glucoseImpact) }} />
        </div>
        <div className="text-[10px] text-stone-400 truncate mt-0.5">{food.serving} · GI {food.glycemicIndex}</div>
        <div className="flex gap-2 text-[10px] text-stone-500 mt-1">
          <span><span className="font-medium text-stone-700">{food.calories}</span>cal</span>
          <span><span className="font-medium text-stone-700">{food.carbs_g}</span>c</span>
          <span><span className="font-medium text-stone-700">{food.protein_g}</span>p</span>
        </div>
      </div>
      <Plus size={14} strokeWidth={1.8} className="text-stone-300 group-hover:text-copper transition-colors shrink-0" />
    </div>
  );
}

// ────────── Scan modal: simulated AI food recognition ──────────
function ScanModal({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<"capture" | "analyzing" | "result">("capture");
  const [pickedFood, setPickedFood] = useState<FoodItem | null>(null);

  function pickAndScan(f: FoodItem) {
    setPickedFood(f);
    setStage("analyzing");
    setTimeout(() => setStage("result"), 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl p-7 w-[520px] max-w-[92vw] shadow-elevated border border-cream-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-micro text-stone-400 uppercase tracking-wide font-medium">Calorie Scan</div>
            <h3 className="font-serif text-title text-stone-800 mt-0.5">
              {stage === "capture" ? "What did you eat?" : stage === "analyzing" ? "Analyzing photo…" : "Recognized!"}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-cream-100 flex items-center justify-center text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>

        {stage === "capture" && (
          <div className="flex flex-col gap-4">
            <div className="aspect-[16/10] rounded-2xl bg-cream-100 border-2 border-dashed border-copper/30 flex flex-col items-center justify-center gap-2 text-stone-500">
              <div className="w-14 h-14 rounded-2xl bg-white border border-copper/20 flex items-center justify-center">
                <Camera size={26} className="text-copper" strokeWidth={1.5} />
              </div>
              <div className="text-body">Camera preview</div>
              <div className="text-micro text-stone-400">point at food and tap a suggestion below</div>
            </div>
            <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mt-1">Or pick one to simulate</div>
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
              {FOOD_DB.slice(0, 12).map(f => (
                <button
                  key={f.id}
                  onClick={() => pickAndScan(f)}
                  className="p-3 rounded-xl bg-cream-100 border border-cream-300 hover:border-copper/30 hover:shadow-subtle transition-all flex flex-col items-center gap-1"
                >
                  <span className="text-[22px]">{f.emoji}</span>
                  <span className="text-micro font-medium text-stone-700 text-center leading-tight">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === "analyzing" && (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-copper-50 border border-copper/20 flex items-center justify-center">
              <Sparkles size={28} className="text-copper animate-pulse" strokeWidth={1.5} />
            </div>
            <div className="text-body text-stone-700">Identifying food &amp; estimating macros…</div>
            <div className="w-48 h-1 bg-cream-200 rounded-full overflow-hidden">
              <div className="h-full bg-copper rounded-full" style={{ width: "100%", animation: "pulse 1.4s ease-in-out infinite" }} />
            </div>
          </div>
        )}

        {stage === "result" && pickedFood && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-cream-100 border border-cream-300">
              <div className="w-16 h-16 rounded-2xl bg-white border border-cream-300 flex items-center justify-center text-[36px] shrink-0">{pickedFood.emoji}</div>
              <div className="flex-1">
                <div className="text-title font-serif font-semibold text-stone-800">{pickedFood.name}</div>
                <div className="text-caption text-stone-500 mt-0.5">{pickedFood.serving} · GI {pickedFood.glycemicIndex}</div>
              </div>
              <Badge variant={pickedFood.glucoseImpact === "low" ? "success" : pickedFood.glucoseImpact === "moderate" ? "warning" : "danger"} className="capitalize">
                {pickedFood.glucoseImpact} impact
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <MiniStat label="cal"     value={pickedFood.calories.toString()} />
              <MiniStat label="carbs"   value={`${pickedFood.carbs_g}g`} />
              <MiniStat label="protein" value={`${pickedFood.protein_g}g`} />
              <MiniStat label="fiber"   value={`${pickedFood.fiber_g}g`} />
            </div>

            <div className="p-3.5 rounded-xl bg-copper-50 border border-copper/15 flex items-start gap-3">
              <Lightbulb size={16} className="text-copper mt-0.5 shrink-0" strokeWidth={1.7} />
              <div className="text-caption text-stone-700 leading-relaxed">
                {pickedFood.glucoseImpact === "high"
                  ? `Likely +2.5 to +4.0 mmol/L spike. Consider pairing with protein and fiber, eating slower, or walking 10 min after.`
                  : pickedFood.glucoseImpact === "moderate"
                  ? `Likely +1.5 to +2.5 mmol/L spike. A short walk afterwards will help blunt it.`
                  : `Minimal glucose impact expected. Excellent choice for stable energy.`}
              </div>
            </div>

            <div className="flex gap-2 mt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-cream-300 text-body font-medium text-stone-600 hover:bg-cream-100">
                Cancel
              </button>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-copper text-white text-body font-medium hover:bg-copper-dark transition-colors">
                Add to log
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Snap an HH:MM time to the nearest 15-min slot present in the trace.
function roundToQuarter(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  const totalMin = hh * 60 + mm;
  const snapped = Math.round((totalMin - 1) / 15) * 15 + 1; // trace points are :01,:16,:31,:46
  const newH = Math.floor(snapped / 60);
  const newM = snapped % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}
