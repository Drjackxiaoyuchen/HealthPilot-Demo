"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { Search, Pill, AlertTriangle, Clock, Dna, Activity } from "lucide-react";

// Extended medication data with pharmacokinetics
const MEDICATIONS = [
  {
    name: "Metformin XR", dose: "500mg", frequency: "Once daily", purpose: "Metabolic optimization / insulin sensitivity",
    gene: "FTO rs90000006", halfLife: "6.2 hours", bioavailability: "50-60%",
    mechanism: "Activates AMPK → suppresses hepatic glucose production, increases insulin sensitivity in muscle/adipose tissue",
    sideEffects: ["GI disturbance (10-25%)", "Vitamin B12 depletion (long-term)", "Lactic acidosis (rare)", "Metallic taste"],
    snpFit: "good",
    snpNote: "FTO AT carrier — metformin directly counteracts FTO-driven insulin resistance. MTHFR het — monitor B12 as metformin reduces absorption. CYP2D6 normal — no dosing adjustment needed.",
    bodyTarget: "liver",
    absorption: "Small intestine → portal circulation → liver (primary target) → skeletal muscle → adipose tissue",
  },
];

const DRUG_INTERACTIONS = [
  { drug1: "Metformin", drug2: "Vitamin B12", severity: "moderate" as const, note: "May reduce B12 absorption by 30%. Monitor serum B12 annually. Critical for MTHFR het carriers.", gene: "MTHFR" },
  { drug1: "Metformin", drug2: "Alcohol", severity: "serious" as const, note: "Increases risk of lactic acidosis. Limit alcohol intake. IL-6 GG may compound hepatic inflammation.", gene: "IL-6" },
  { drug1: "Caffeine", drug2: "CYP1A2 Variant", severity: "pharmacogenomic" as const, note: "SLOW metabolizer (CYP1A2 AC). Caffeine half-life extended ~40%. Max 200mg/day recommended.", gene: "CYP1A2" },
  { drug1: "Codeine", drug2: "CYP2D6", severity: "pharmacogenomic" as const, note: "Your CYP2D6 normal metabolizer status allows standard dosing. OPRM1 AG — may need higher doses for pain relief.", gene: "CYP2D6" },
  { drug1: "SSRIs", drug2: "COMT Val/Val", severity: "pharmacogenomic" as const, note: "Val/Val fast COMT → rapid dopamine clearance. SSRIs targeting serotonin may be more effective than dopaminergic agents.", gene: "COMT" },
  { drug1: "Statins", drug2: "CoQ10 Depletion", severity: "moderate" as const, note: "Statins inhibit CoQ10 synthesis. NQO1 AG already reduces CoQ10 regeneration 2-4x. If statin added, increase CoQ10 to 400mg.", gene: "NQO1" },
];

// SVG coordinates for body diagram regions
const BODY_REGIONS: Record<string, { cx: number; cy: number; label: string }> = {
  brain: { cx: 100, cy: 45, label: "Brain" },
  liver: { cx: 75, cy: 155, label: "Liver" },
  heart: { cx: 110, cy: 125, label: "Heart" },
  stomach: { cx: 100, cy: 175, label: "GI Tract" },
  kidney: { cx: 130, cy: 170, label: "Kidneys" },
  muscle: { cx: 55, cy: 220, label: "Muscle" },
  adipose: { cx: 145, cy: 200, label: "Adipose" },
};

function HumanDiagram({ activeRegion }: { activeRegion: string }) {
  return (
    <svg viewBox="0 0 200 360" className="w-full max-w-[200px] mx-auto">
      {/* Simple human outline */}
      {/* Head */}
      <ellipse cx={100} cy={35} rx={22} ry={26} fill="#F9F5EE" stroke="#D4CFC7" strokeWidth={1.2} />
      {/* Neck */}
      <rect x={92} y={60} width={16} height={15} fill="#F9F5EE" stroke="#D4CFC7" strokeWidth={1} />
      {/* Torso */}
      <path d="M 65 75 Q 60 75 58 80 L 50 160 Q 48 175 60 190 L 75 210 Q 80 215 80 225 L 80 285 Q 80 295 75 300 L 65 340 Q 63 350 70 350 L 85 350 Q 90 350 90 345 L 95 285 Q 97 280 100 280 Q 103 280 105 285 L 110 345 Q 110 350 115 350 L 130 350 Q 137 350 135 340 L 125 300 Q 120 295 120 285 L 120 225 Q 120 215 125 210 L 140 190 Q 152 175 150 160 L 142 80 Q 140 75 135 75 Z"
        fill="#F9F5EE" stroke="#D4CFC7" strokeWidth={1.2} />
      {/* Arms */}
      <path d="M 58 80 Q 45 85 35 120 Q 25 155 30 180 Q 32 190 35 190 Q 38 190 40 180 Q 45 155 48 135 Q 50 125 55 110"
        fill="none" stroke="#D4CFC7" strokeWidth={1.2} />
      <path d="M 142 80 Q 155 85 165 120 Q 175 155 170 180 Q 168 190 165 190 Q 162 190 160 180 Q 155 155 152 135 Q 150 125 145 110"
        fill="none" stroke="#D4CFC7" strokeWidth={1.2} />

      {/* Organ highlights */}
      {Object.entries(BODY_REGIONS).map(([key, region]) => {
        const isActive = key === activeRegion;
        return (
          <g key={key}>
            <circle cx={region.cx} cy={region.cy} r={isActive ? 14 : 10}
              fill={isActive ? "rgba(184, 144, 111, 0.25)" : "rgba(184, 144, 111, 0.08)"}
              stroke={isActive ? "#B8906F" : "#D4B896"}
              strokeWidth={isActive ? 1.5 : 0.8}
              className="transition-all duration-300" />
            {isActive && (
              <>
                <circle cx={region.cx} cy={region.cy} r={18}
                  fill="none" stroke="#B8906F" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.5} />
                <circle cx={region.cx} cy={region.cy} r={4} fill="#B8906F" />
              </>
            )}
            <text x={region.cx} y={region.cy + (isActive ? 26 : 22)} textAnchor="middle"
              style={{ fontSize: isActive ? 9 : 8, fill: isActive ? "#9A7458" : "#9B958E", fontFamily: "Inter, sans-serif", fontWeight: isActive ? 600 : 400 }}>
              {region.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function MedicinePage() {
  const [search, setSearch] = useState("");
  const [selectedMed, setSelectedMed] = useState(0);
  const med = MEDICATIONS[selectedMed];

  return (
    <div className="flex flex-col gap-7">
      {/* Search */}
      <Card>
        <SectionTitle icon={Search} title="Drug Interaction Checker" subtitle="Search medications and check pharmacogenomic interactions" />
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drug name..."
            className="flex-1 px-4 py-3 bg-cream-100 border border-cream-300 rounded-xl text-body text-stone-800 placeholder-stone-300 outline-none focus:border-copper/40 focus:ring-2 focus:ring-copper/10 transition-all" />
          <button className="bg-copper text-white px-6 py-3 rounded-xl font-medium text-body hover:bg-copper-dark transition-colors">Check</button>
        </div>
      </Card>

      {/* Medication detail with body diagram */}
      <div className="grid grid-cols-[1fr_2fr] gap-6">
        <Card className="flex flex-col items-center">
          <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mb-3">Drug Target Map</div>
          <HumanDiagram activeRegion={med.bodyTarget} />
          <div className="mt-4 text-center">
            <div className="text-body font-serif font-semibold text-stone-800">{med.name}</div>
            <div className="text-caption text-stone-400 mt-1">{med.dose} — {med.frequency}</div>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Pill} title={med.name} subtitle={med.purpose} />

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="p-3 bg-cream-100 rounded-xl border border-cream-300">
              <div className="text-micro text-stone-400 uppercase tracking-wide font-medium">Half-Life</div>
              <div className="text-[20px] font-serif font-semibold text-stone-800 mt-1">{med.halfLife}</div>
            </div>
            <div className="p-3 bg-cream-100 rounded-xl border border-cream-300">
              <div className="text-micro text-stone-400 uppercase tracking-wide font-medium">Bioavailability</div>
              <div className="text-[20px] font-serif font-semibold text-stone-800 mt-1">{med.bioavailability}</div>
            </div>
            <div className="p-3 bg-cream-100 rounded-xl border border-cream-300">
              <div className="text-micro text-stone-400 uppercase tracking-wide font-medium">SNP Compatibility</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-sage" />
                <span className="text-body font-medium text-sage-dark capitalize">{med.snpFit}</span>
              </div>
            </div>
          </div>

          {/* Mechanism */}
          <div className="mb-4">
            <h4 className="text-caption font-medium text-stone-400 uppercase tracking-wide mb-2">Mechanism of Action</h4>
            <p className="text-body text-stone-600 leading-relaxed">{med.mechanism}</p>
          </div>

          {/* Absorption pathway */}
          <div className="mb-4">
            <h4 className="text-caption font-medium text-stone-400 uppercase tracking-wide mb-2">Absorption Pathway</h4>
            <p className="text-body text-stone-600 leading-relaxed">{med.absorption}</p>
          </div>

          {/* Side effects */}
          <div className="mb-4">
            <h4 className="text-caption font-medium text-stone-400 uppercase tracking-wide mb-2">Known Side Effects</h4>
            <div className="flex flex-wrap gap-2">
              {med.sideEffects.map((se, i) => (
                <span key={i} className="px-2.5 py-1 bg-rose-light rounded-lg text-micro text-rose-dark border border-rose/15">{se}</span>
              ))}
            </div>
          </div>

          {/* SNP compatibility note */}
          <div className="p-4 bg-copper-50 rounded-xl border border-copper/15">
            <div className="flex items-center gap-2 mb-2">
              <Dna size={14} strokeWidth={1.5} className="text-copper" />
              <span className="text-body font-serif font-semibold text-copper-700">Genomic Compatibility Analysis</span>
            </div>
            <p className="text-body text-stone-600 leading-relaxed">{med.snpNote}</p>
          </div>
        </Card>
      </div>

      {/* Interactions */}
      <Card>
        <SectionTitle icon={AlertTriangle} title="Drug Interactions & Pharmacogenomics" subtitle="Based on your genomic profile — 18 annotated SNPs" />
        <div className="flex flex-col gap-2.5">
          {DRUG_INTERACTIONS.map((d, i) => (
            <div key={i} className={`p-4 rounded-xl border ${
              d.severity === "serious" ? "bg-rose-light border-rose/15" :
              d.severity === "pharmacogenomic" ? "bg-plum-light border-plum/15" :
              "bg-amber-light border-amber/15"
            }`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700 text-body">{d.drug1}</span>
                  <span className="text-stone-300 text-body">x</span>
                  <span className="font-medium text-stone-700 text-body">{d.drug2}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="purple">{d.gene}</Badge>
                  <Badge variant={d.severity === "serious" ? "danger" : d.severity === "pharmacogenomic" ? "purple" : "warning"}>{d.severity}</Badge>
                </div>
              </div>
              <p className="text-caption text-stone-500 leading-relaxed">{d.note}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
