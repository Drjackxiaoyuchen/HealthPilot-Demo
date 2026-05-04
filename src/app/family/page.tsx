"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SectionTitle } from "@/components/ui/section-title";
import { Users, Shield, AlertTriangle, Dna, CheckCircle, ChevronDown, ChevronUp, Heart, Baby } from "lucide-react";
import { FAMILY_MEMBERS, GENOMIC_VARIANTS } from "@/data/seed";
import Link from "next/link";

// Family tree node positions (expanded for wife)
const TREE_NODES = [
  { id: "fm-2", x: 130, y: 40, label: "Father" },     // Robert Morgan
  { id: "fm-3", x: 330, y: 40, label: "Mother" },      // Linda Morgan
  { id: "fm-1", x: 180, y: 200, label: "Self" },       // Alex Morgan
  { id: "fm-4", x: 380, y: 200, label: "Wife" },       // Sarah Morgan
];

// Shared genomic traits analysis (updated with wife)
const SHARED_TRAITS = [
  {
    title: "BDNF Met/Met — Both Partners Carry",
    type: "couple",
    members: ["Alex Morgan", "Sarah Morgan"],
    detail: "Both Alex and Sarah are BDNF Val66Met TT (Met/Met). This means 100% of offspring will be Met/Met with significantly reduced activity-dependent BDNF secretion. Aerobic exercise is the single most effective upregulator. Early enriched environments and omega-3 from infancy are critical.",
    risk: "high",
  },
  {
    title: "FTO AT × AT — 25% Chance of AA Offspring",
    type: "couple",
    members: ["Alex Morgan", "Sarah Morgan"],
    detail: "Both partners carry one FTO risk allele (AT heterozygous). Offspring outcomes: 25% AA (highest obesity risk, 1.7x), 50% AT (moderate), 25% TT (no risk). Early screening and nutritional intervention if AA.",
    risk: "high",
  },
  {
    title: "IL-6 GG × GG — Pro-inflammatory Offspring",
    type: "couple",
    members: ["Alex Morgan", "Sarah Morgan"],
    detail: "Both parents are IL-6 -174 GG (high expression). All offspring will be GG — guaranteed pro-inflammatory baseline. Mediterranean diet pattern, omega-3, and anti-inflammatory lifestyle essential from early life.",
    risk: "high",
  },
  {
    title: "APOE — Excellent Outlook",
    type: "couple",
    members: ["Alex Morgan", "Sarah Morgan"],
    detail: "Alex is APOE e2/e3 (protective), Sarah is e3/e3. No e4 allele from either parent. 50% of offspring inherit the protective e2 from Alex. Zero APOE-mediated Alzheimer's risk — the best possible outcome.",
    risk: "low",
  },
  {
    title: "MTHFR — Sarah Wildtype Protects",
    type: "couple",
    members: ["Alex Morgan", "Sarah Morgan"],
    detail: "Alex is MTHFR C677T heterozygous but Sarah is wildtype (GG). No TT homozygous offspring possible. Worst case is 50% chance of mild heterozygosity like Alex. Standard prenatal folate sufficient.",
    risk: "low",
  },
  {
    title: "VDR BsmI BB — Shared by Both",
    type: "shared",
    members: ["Alex Morgan", "Sarah Morgan", "Linda Morgan"],
    detail: "Both partners and Alex's mother carry VDR BsmI CC (BB genotype) — reduced VDR expression. All offspring will be BB. Family-wide vitamin D3 supplementation recommended. Monitor 25-OH-D every 6 months.",
    risk: "moderate",
  },
  {
    title: "APOE e3/e4 — Paternal Risk (Not Passed)",
    type: "paternal",
    members: ["Robert Morgan"],
    detail: "Alex's father carries APOE e3/e4 — elevated cardiovascular and Alzheimer's risk. Currently on statin therapy. Alex did NOT inherit e4 — he got e2 from maternal line. The e4 risk stops with Alex's father in this lineage.",
    risk: "moderate",
  },
  {
    title: "HFE H63D — Maternal Iron Variant",
    type: "maternal",
    members: ["Linda Morgan"],
    detail: "Alex's mother is HFE H63D heterozygous — mild increase in iron absorption. Combined with osteopenia, calcium/iron timing is critical. Alex's HFE is normal, so this allele was not passed to Alex. Sarah's HFE is also normal.",
    risk: "low",
  },
];

function FamilyTree() {
  const members = FAMILY_MEMBERS.map(f => ({ ...f, conditions: JSON.parse(f.conditions) }));
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="relative">
      <svg viewBox="0 0 520 310" className="w-full max-w-[640px] mx-auto block">
        {/* Parents horizontal connector */}
        <line x1={170} y1={60} x2={330} y2={60} stroke="#D4CFC7" strokeWidth={1.5} />
        {/* Parents marriage symbol */}
        <circle cx={230} cy={60} r={4} fill="#B8906F" stroke="white" strokeWidth={1.5} />

        {/* Parent to child vertical */}
        <line x1={230} y1={64} x2={230} y2={140} stroke="#D4CFC7" strokeWidth={1.5} />
        <line x1={230} y1={140} x2={180} y2={180} stroke="#D4CFC7" strokeWidth={1.5} />

        {/* DNA helix decoration on vertical line */}
        {[80, 100, 120].map((y, i) => (
          <g key={`helix-parent-${i}`}>
            <circle cx={226 + (i % 2 === 0 ? -4 : 4)} cy={y} r={2} fill="#E8E0D4" />
            <circle cx={234 + (i % 2 === 0 ? 4 : -4)} cy={y} r={2} fill="#E8E0D4" />
          </g>
        ))}

        {/* Couple horizontal connector (Alex to Sarah) */}
        <line x1={220} y1={220} x2={380} y2={220} stroke="#D4CFC7" strokeWidth={1.5} />
        {/* Couple marriage symbol with heart */}
        <circle cx={280} cy={220} r={5} fill="#B07070" stroke="white" strokeWidth={1.5} />
        <text x={280} y={223} textAnchor="middle" style={{ fontSize: 7, fill: "white" }}>♥</text>

        {/* Couple to offspring placeholder */}
        <line x1={280} y1={225} x2={280} y2={270} stroke="#D4CFC7" strokeWidth={1.5} strokeDasharray="4,3" />
        {/* Offspring placeholder node */}
        <rect x={255} y={270} width={50} height={28} rx={8} fill="#FAF5F0" stroke="#E4CFBA" strokeWidth={1} strokeDasharray="4,3" />
        <text x={280} y={286} textAnchor="middle" style={{ fontSize: 9, fill: "#B8906F", fontFamily: "Inter, sans-serif" }}>Future</text>
        <text x={280} y={296} textAnchor="middle" style={{ fontSize: 7, fill: "#9B958E", fontFamily: "Inter, sans-serif" }}>Gen 3</text>

        {/* Tree nodes */}
        {TREE_NODES.map(node => {
          const member = members.find(m => m.id === node.id);
          if (!member) return null;
          const isHovered = hoveredNode === node.id;
          const scoreColor = member.health_score >= 85 ? "#6B8F71" : member.health_score >= 75 ? "#C4956A" : "#B07070";
          const isCouple = node.id === "fm-1" || node.id === "fm-4";

          return (
            <g key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: "pointer" }}>
              {/* Node background */}
              <rect x={node.x - 60} y={node.y - 20} width={120} height={80} rx={12}
                fill="white" stroke={isHovered ? "#B8906F" : isCouple ? "#E4CFBA" : "#E8E0D4"}
                strokeWidth={isHovered ? 1.5 : 1}
                style={{ filter: isHovered ? "drop-shadow(0 4px 8px rgba(0,0,0,0.08))" : "none" }} />

              {/* Health score ring */}
              <circle cx={node.x} cy={node.y + 5} r={16} fill="none" stroke="#F0E9DF" strokeWidth={3} />
              <circle cx={node.x} cy={node.y + 5} r={16} fill="none" stroke={scoreColor} strokeWidth={3}
                strokeDasharray={`${(member.health_score / 100) * 100.5} 100.5`}
                strokeLinecap="round" transform={`rotate(-90, ${node.x}, ${node.y + 5})`} />
              <text x={node.x} y={node.y + 9} textAnchor="middle"
                style={{ fontSize: 11, fontWeight: 600, fill: "#2D2A26", fontFamily: "Playfair Display, serif" }}>
                {member.health_score}
              </text>

              {/* Name */}
              <text x={node.x} y={node.y + 35} textAnchor="middle"
                style={{ fontSize: 11, fontWeight: 500, fill: "#2D2A26", fontFamily: "Inter, sans-serif" }}>
                {member.name.split("(")[0].trim()}
              </text>

              {/* Relation */}
              <text x={node.x} y={node.y + 48} textAnchor="middle"
                style={{ fontSize: 9, fill: "#9B958E", fontFamily: "Inter, sans-serif" }}>
                {member.relation} · {member.sex === "M" ? "Male" : "Female"} · {member.age}
              </text>

              {/* Alert badge */}
              {member.alerts > 0 && (
                <g>
                  <circle cx={node.x + 50} cy={node.y - 12} r={8} fill="#B07070" />
                  <text x={node.x + 50} y={node.y - 8.5} textAnchor="middle"
                    style={{ fontSize: 9, fontWeight: 600, fill: "white", fontFamily: "Inter, sans-serif" }}>
                    {member.alerts}
                  </text>
                </g>
              )}

              {/* Sex indicator */}
              {member.sex === "M" ? (
                <rect x={node.x - 55} y={node.y - 15} width={6} height={6} rx={1}
                  fill="none" stroke="#7B8FA4" strokeWidth={1.2} />
              ) : (
                <circle cx={node.x - 52} cy={node.y - 12} r={3.5}
                  fill="none" stroke="#B07070" strokeWidth={1.2} />
              )}
            </g>
          );
        })}

        {/* Generation labels */}
        <text x={20} y={60} style={{ fontSize: 9, fill: "#9B958E", fontFamily: "Inter, sans-serif" }} textAnchor="start">Gen 1</text>
        <text x={20} y={220} style={{ fontSize: 9, fill: "#9B958E", fontFamily: "Inter, sans-serif" }} textAnchor="start">Gen 2</text>
        <text x={20} y={288} style={{ fontSize: 9, fill: "#9B958E", fontFamily: "Inter, sans-serif" }} textAnchor="start">Gen 3</text>
      </svg>
    </div>
  );
}

export default function FamilyPage() {
  const members = FAMILY_MEMBERS.map(f => ({ ...f, conditions: JSON.parse(f.conditions) }));
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-7">
      {/* Family Tree */}
      <Card>
        <SectionTitle icon={Users} title="Family Pedigree" subtitle="4 members across 2 generations — genomic health profiles" />
        <FamilyTree />
      </Card>

      {/* Member detail cards — 2x2 grid */}
      <div className="grid grid-cols-2 gap-4">
        {members.map((m, i) => (
          <Card key={i} accent={m.relation === "Self" || m.relation === "Wife"}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-semibold ${
                m.relation === "Wife" ? "bg-rose-light text-rose" : "bg-copper-50 text-copper"
              }`}>
                {m.avatar_emoji}
              </div>
              <div className="flex-1">
                <div className="text-body font-medium text-stone-800">{m.name}</div>
                <div className="text-caption text-stone-400">{m.relation} — {m.sex === "M" ? "Male" : "Female"} · Age {m.age}</div>
              </div>
              {m.alerts > 0 && (
                <div className="w-5 h-5 rounded-full bg-rose flex items-center justify-center text-micro font-semibold text-white">{m.alerts}</div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-micro text-stone-400 font-medium uppercase tracking-wide">Health Score</div>
                <div className={`text-[24px] font-serif font-semibold ${m.health_score >= 85 ? "text-sage" : m.health_score >= 75 ? "text-amber" : "text-rose"}`}>
                  {m.health_score}
                </div>
              </div>
              <ProgressRing value={m.health_score} max={100} size={52} strokeWidth={4}
                color={m.health_score >= 85 ? "#6B8F71" : m.health_score >= 75 ? "#C4956A" : "#B07070"} />
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {m.conditions.map((c: string, j: number) => (
                <Badge key={j} variant={
                  c.includes("protective") || c.includes("Val/Val") || c.includes("wildtype") || c.includes("(protective)")
                    ? "success"
                    : c.includes("e4") || c.includes("Hypertension")
                      ? "danger"
                      : c.includes("intermediate") || c.includes("het")
                        ? "warning"
                        : "purple"
                }>
                  {c}
                </Badge>
              ))}
            </div>
            <div className="text-micro text-stone-400 pt-2 border-t border-cream-300">Last checkup: {m.last_checkup}</div>
          </Card>
        ))}
      </div>

      {/* Genomic Insights */}
      <Card>
        <SectionTitle icon={Dna} title="Family Genomic Insights" subtitle="Inherited patterns, couple analysis & actionable recommendations" />
        <div className="flex flex-col gap-3">
          {SHARED_TRAITS.map((trait, i) => {
            const isExpanded = expandedInsight === i;
            return (
              <div key={i}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-elevated ${
                  trait.risk === "high" ? "bg-rose-light border-rose/15" :
                  trait.risk === "moderate" ? "bg-amber-light border-amber/15" :
                  "bg-sage-light border-sage/15"
                }`}
                onClick={() => setExpandedInsight(isExpanded ? null : i)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {trait.risk === "high" ? <AlertTriangle size={14} strokeWidth={1.5} className="text-rose" /> :
                       trait.risk === "moderate" ? <Dna size={14} strokeWidth={1.5} className="text-amber" /> :
                       <CheckCircle size={14} strokeWidth={1.5} className="text-sage" />}
                      <span className="text-body font-medium text-stone-800">{trait.title}</span>
                    </div>
                    <div className="flex gap-1.5 ml-[22px]">
                      {trait.members.map(m => <Badge key={m} variant="info">{m}</Badge>)}
                      <Badge variant={trait.type === "couple" ? "danger" : trait.type === "shared" ? "purple" : trait.type === "paternal" ? "default" : trait.type === "maternal" ? "success" : "info"}>
                        {trait.type}
                      </Badge>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={15} className="text-stone-300 mt-1" /> : <ChevronDown size={15} className="text-stone-300 mt-1" />}
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-cream-300/50">
                    <p className="text-body text-stone-600 leading-relaxed">{trait.detail}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Offspring link card */}
      <Link href="/offspring">
        <Card>
          <div className="flex items-center gap-4 p-2">
            <div className="w-14 h-14 rounded-2xl bg-copper-50 flex items-center justify-center">
              <Baby size={24} strokeWidth={1.5} className="text-copper" />
            </div>
            <div className="flex-1">
              <div className="font-serif text-title text-stone-800">Offspring Genomic Risk Analysis</div>
              <div className="text-body text-stone-500 mt-0.5">
                Detailed mutation potential analysis for Alex × Sarah offspring — Mendelian inheritance predictions, harmful variant risks, and preconception recommendations.
              </div>
            </div>
            <div className="text-copper text-[20px]">→</div>
          </div>
        </Card>
      </Link>

      {/* Updated inheritance summary */}
      <Card>
        <SectionTitle icon={Shield} title="Couple Genomic Compatibility" subtitle="Alex Morgan × Sarah Morgan — preconception summary" />
        <div className="p-5 bg-copper-50 rounded-xl border border-copper/15">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={15} strokeWidth={1.5} className="text-copper" />
            <span className="font-serif text-[15px] font-semibold text-copper-700">Preconception Summary</span>
          </div>
          <div className="space-y-3 text-body text-stone-600 leading-relaxed">
            <p>
              <strong className="text-stone-800">APOE:</strong> Excellent — Alex e2/e3 × Sarah e3/e3 = no e4 possible. 50% of children get protective e2.
            </p>
            <p>
              <strong className="text-stone-800">MTHFR:</strong> Good — Sarah is wildtype GG, protecting offspring from TT homozygous risk. Standard prenatal folate sufficient.
            </p>
            <p>
              <strong className="text-stone-800">BDNF:</strong> <span className="text-rose font-medium">Alert</span> — Both Met/Met. All offspring will have reduced BDNF secretion. Prioritize aerobic exercise, omega-3, enriched environments.
            </p>
            <p>
              <strong className="text-stone-800">FTO:</strong> <span className="text-amber font-medium">Monitor</span> — Both AT heterozygous. 25% chance of AA (highest obesity risk). Screen early.
            </p>
            <p>
              <strong className="text-stone-800">IL-6:</strong> <span className="text-rose font-medium">Alert</span> — Both GG. All offspring will have pro-inflammatory phenotype. Anti-inflammatory diet from infancy.
            </p>
            <p>
              <strong className="text-stone-800">VDR BsmI:</strong> Both BB — offspring guaranteed reduced VDR expression. Vitamin D3 from birth.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
