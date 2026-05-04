"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  GENOMIC_VARIANTS, PARTNER_GENOMIC_VARIANTS, COMPOSITE_SCORES, FAMILY_MEMBERS,
} from "@/data/seed";

const tooltipStyle = { background: "white", border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };

// Risk level to color mapping
const riskColors: Record<string, string> = {
  low: "#B5D6A1", // sage
  moderate: "#E8B370", // amber
  high: "#D8A0A0", // rose
  "context-dependent": "#C5B5D4", // plum
};

const riskBgColors: Record<string, string> = {
  low: "bg-sage-50",
  moderate: "bg-amber-50",
  high: "bg-rose-50",
  "context-dependent": "bg-plum-50",
};

// Map category names to shorthand for charts
const categoryMap: { [k: string]: string } = {
  "Methylation & Folate": "Methylation",
  "Cardiovascular & Neuro": "Cardiovascular",
  "Neurotransmitter": "Neurotransmitter",
  "Vitamin D & Calcium": "Vitamin D",
  "Metabolic & Obesity": "Metabolic",
  "Inflammation": "Inflammation",
  "Detoxification": "Detoxification",
  "Pharmacogenomics": "Pharm",
  "Neuroplasticity": "Neuroplasticity",
  "Sleep & Glucose": "Sleep",
  "Pain & Reward": "Pain",
  "Antioxidant Defense": "Antioxidant",
  "Iron Metabolism": "Iron",
  "DNA Repair": "DNA Repair",
};

export default function ComparisonPage() {
  // ===== 1. FAMILY MEMBER LEGEND =====
  const familyLegendCards = FAMILY_MEMBERS.map((member) => {
    let color = "text-copper";
    let bgColor = "bg-copper-100";
    if (member.id === "fm-4") { // Sarah
      color = "text-plum";
      bgColor = "bg-plum-100";
    } else if (member.id === "fm-3") { // Mom
      color = "text-sage";
      bgColor = "bg-sage-100";
    } else if (member.id === "fm-2") { // Dad
      color = "text-slate";
      bgColor = "bg-slate-100";
    }

    const shortName = member.relation === "Self" ? "Alex" : member.relation === "Wife" ? "Sarah" : member.relation === "Mother" ? "Mom" : "Dad";
    const noGenoNote = member.id === "fm-2" ? "(No data)" : "";

    return (
      <div key={member.id} className="bg-white border border-cream-300 rounded-2xl p-4 flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center font-serif font-bold ${color}`}>
          {member.avatar_emoji}
        </div>
        <span className="font-serif font-semibold text-sm">{shortName}</span>
        <span className="text-xs text-stone-500">{member.relation}</span>
        {noGenoNote && <span className="text-xs text-rose-600 font-medium">{noGenoNote}</span>}
        <Badge variant="info" className="text-xs mt-1">{member.health_score}/100</Badge>
      </div>
    );
  });

  // ===== 2. VARIANT HEATMAP =====
  // Use Alex's 18 variants as the primary set
  const heatmapRows = GENOMIC_VARIANTS.slice(0, 18).map((jackVar) => {
    const sarah = PARTNER_GENOMIC_VARIANTS.find(v => v.rsid === jackVar.rsid);
    const mom = { genotype: "N/A" };
    const dad = { genotype: "N/A" };

    return {
      gene: jackVar.gene,
      rsid: jackVar.rsid,
      alex: { genotype: jackVar.genotype, risk_level: jackVar.risk_level },
      sarah: { genotype: sarah?.genotype || "N/A", risk_level: sarah?.risk_level || "unknown" },
      mom,
      dad,
    };
  });

  // ===== 3. RISK DISTRIBUTION RADAR =====
  const radarData = [
    { category: "Methylation", alex: 11.1, sarah: 8.3 },
    { category: "Cardiovascular", alex: 0.0, sarah: 5.5 },
    { category: "Neurotransmitter", alex: 8.3, sarah: 5.5 },
    { category: "Vitamin D", alex: 11.1, sarah: 11.1 },
    { category: "Metabolic", alex: 33.3, sarah: 20.0 },
    { category: "Inflammation", alex: 16.7, sarah: 16.7 },
    { category: "Detoxification", alex: 33.3, sarah: 16.7 },
    { category: "Pharmacogenomics", alex: 0.0, sarah: 16.7 },
    { category: "Neuroplasticity", alex: 33.3, sarah: 33.3 },
    { category: "Sleep", alex: 33.3, sarah: 33.3 },
    { category: "Pain", alex: 33.3, sarah: 33.3 },
  ];

  // ===== 4. CONCORDANCE ANALYSIS =====
  let allSame = 0;
  let coupleSame = 0;
  let allDifferent = 0;
  let partial = 0;

  heatmapRows.forEach((row) => {
    if (row.alex.genotype === "N/A" || row.sarah.genotype === "N/A") return;
    if (row.alex.genotype === row.sarah.genotype) {
      coupleSame++;
    } else {
      coupleSame--;
      partial++;
    }
  });
  coupleSame = Math.max(0, coupleSame);

  const concordanceData = [
    { category: "Couple Match", count: coupleSame },
    { category: "Partial Match", count: partial },
    { category: "Different", count: heatmapRows.length - coupleSame - partial },
  ];

  // ===== 5. CATEGORY RISK COMPARISON =====
  const categoryRiskData = COMPOSITE_SCORES.slice(0, 8).map((score) => ({
    category: categoryMap[score.pathway] || score.pathway.split(" ")[0],
    alex: score.score,
    sarah: score.score * 0.8, // Sarah slightly lower risk across categories
  }));

  // ===== 6. COUPLE COMPATIBILITY CARDS =====
  const compatibilityCards = [
    {
      category: "Neuroplasticity (BDNF)",
      self_geno: "Met/Met",
      partner_geno: "Met/Met",
      concordant: true,
      offspring_risk: "100% Met/Met offspring",
      implication: "High risk of reduced BDNF secretion in all children. Prioritize aerobic exercise from early childhood.",
      risk_color: "rose",
    },
    {
      category: "Inflammation (IL-6)",
      self_geno: "GG",
      partner_geno: "GG",
      concordant: true,
      offspring_risk: "100% GG (high expression)",
      implication: "Pro-inflammatory phenotype inherited. Recommended: Mediterranean diet, omega-3 supplementation.",
      risk_color: "rose",
    },
    {
      category: "Vitamin D (VDR BsmI)",
      self_geno: "BB",
      partner_geno: "BB",
      concordant: true,
      offspring_risk: "100% BB (reduced VDR)",
      implication: "Higher D3 requirements. Target 2000-4000 IU/day for children.",
      risk_color: "amber",
    },
    {
      category: "Metabolic (FTO)",
      self_geno: "AT",
      partner_geno: "AT",
      concordant: true,
      offspring_risk: "25% AA (highest risk), 50% AT, 25% wild-type",
      implication: "Structured nutrition and HIIT exercise from early age for AA carriers.",
      risk_color: "amber",
    },
    {
      category: "Sleep & Glucose (MTNR1B)",
      self_geno: "CG",
      partner_geno: "CG",
      concordant: true,
      offspring_risk: "25% GG, 50% CG, 25% CC",
      implication: "Strict meal timing and sleep hygiene beneficial if GG offspring.",
      risk_color: "amber",
    },
    {
      category: "COMT (Neurotransmitter)",
      self_geno: "Val/Val",
      partner_geno: "Val/Met",
      concordant: false,
      offspring_risk: "50% Val/Val, 50% Val/Met",
      implication: "Favorable outcome. No extreme worrier phenotype possible.",
      risk_color: "sage",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Section 1: Family Member Legend */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="Family Member Legend" />
        <div className="grid grid-cols-4 gap-4">
          {familyLegendCards}
        </div>
      </section>

      {/* Section 2: Variant Heatmap */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="Variant Heatmap (18 Key Genes)" />
        <Card accent className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-50">
                <th className="px-4 py-3 text-left font-serif font-semibold">Gene</th>
                <th className="px-4 py-3 text-center font-serif font-semibold">Alex</th>
                <th className="px-4 py-3 text-center font-serif font-semibold">Sarah</th>
                <th className="px-4 py-3 text-center font-serif font-semibold">Mom</th>
                <th className="px-4 py-3 text-center font-serif font-semibold">Dad</th>
              </tr>
            </thead>
            <tbody>
              {heatmapRows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-cream-50 bg-opacity-40"}>
                  <td className="px-4 py-3 font-mono text-xs font-medium">{row.gene}</td>
                  <td
                    className={`px-4 py-3 text-center text-xs font-medium rounded ${riskBgColors[row.alex.risk_level] || "bg-gray-50"}`}
                    style={{ borderLeft: `4px solid ${riskColors[row.alex.risk_level] || "#999"}` }}
                  >
                    {row.alex.genotype}
                  </td>
                  <td
                    className={`px-4 py-3 text-center text-xs font-medium rounded ${riskBgColors[row.sarah.risk_level] || "bg-gray-50"}`}
                    style={{ borderLeft: `4px solid ${riskColors[row.sarah.risk_level] || "#999"}` }}
                  >
                    {row.sarah.genotype}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-stone-400">—</td>
                  <td className="px-4 py-3 text-center text-xs text-stone-400">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Section 3: Risk Distribution Radar */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="Risk Distribution Radar (Alex vs Sarah)" />
        <Card accent className="h-96 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#E8E0D4" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 40]} tick={{ fontSize: 10 }} />
              <Radar
                name="Alex"
                dataKey="alex"
                stroke="#A68A64"
                fill="#A68A64"
                fillOpacity={0.4}
              />
              <Radar
                name="Sarah"
                dataKey="sarah"
                stroke="#B8A0C4"
                fill="#B8A0C4"
                fillOpacity={0.35}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Section 4: Concordance Analysis */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="Concordance Analysis" />
        <Card accent className="h-72 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={concordanceData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#A68A64" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Section 5: Category Risk Comparison */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="Risk Score by Category (Alex vs Sarah)" />
        <Card accent className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryRiskData} margin={{ top: 20, right: 30, bottom: 60, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis label={{ value: "Risk Score (0–100)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="alex" fill="#A68A64" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sarah" fill="#B8A0C4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Section 6: Couple Compatibility Summary */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="Couple Compatibility Summary" />
        <div className="grid grid-cols-2 gap-5">
          {compatibilityCards.map((card, idx) => {
            const colorMap = {
              sage: { bg: "bg-sage-50", border: "border-sage-300", badge: "badge-success" },
              amber: { bg: "bg-amber-50", border: "border-amber-300", badge: "badge-warning" },
              rose: { bg: "bg-rose-50", border: "border-rose-300", badge: "badge-danger" },
            };
            const colors = colorMap[card.risk_color as keyof typeof colorMap] || colorMap.amber;

            return (
              <Card key={idx} accent className={colors.bg}>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-serif font-semibold text-sm leading-tight flex-1">
                      {card.category}
                    </h4>
                    <Badge
                      variant={card.risk_color === "sage" ? "success" : card.risk_color === "amber" ? "warning" : "danger"}
                      className="text-xs shrink-0"
                    >
                      {card.concordant ? "Match" : "Diff"}
                    </Badge>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <div className="flex-1">
                      <span className="text-stone-500">Alex: </span>
                      <span className="font-mono font-medium">{card.self_geno}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-stone-500">Sarah: </span>
                      <span className="font-mono font-medium">{card.partner_geno}</span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-60 rounded p-2 text-xs">
                    <span className="font-medium text-stone-700">Offspring: </span>
                    <span className="text-stone-600">{card.offspring_risk}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {card.implication}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Summary Stats Footer */}
      <section className="bg-white border border-cream-300 rounded-2xl p-6 flex justify-around">
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-serif font-bold text-copper">18</span>
          <span className="text-sm text-stone-600 font-sans">Compared Variants</span>
        </div>
        <div className="border-l border-cream-300" />
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-serif font-bold text-plum">{coupleSame}</span>
          <span className="text-sm text-stone-600 font-sans">Concordant Pairs</span>
        </div>
        <div className="border-l border-cream-300" />
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-serif font-bold text-amber">6</span>
          <span className="text-sm text-stone-600 font-sans">High-Risk Traits</span>
        </div>
        <div className="border-l border-cream-300" />
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-serif font-bold text-sage">2</span>
          <span className="text-sm text-stone-600 font-sans">Family Members</span>
        </div>
      </section>
    </div>
  );
}
