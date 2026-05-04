"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { Dna, AlertTriangle, CheckCircle, FlaskConical, Zap, BookOpen, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { GENOMIC_VARIANTS, COMPOSITE_SCORES } from "@/data/seed";

const tooltipStyle = { background: "white", border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };

// Chromosome data for ideogram (GRCh37 approximate sizes in Mb)
const CHROMOSOMES = [
  { chr: "1", size: 249 }, { chr: "2", size: 243 }, { chr: "3", size: 198 }, { chr: "4", size: 191 },
  { chr: "5", size: 181 }, { chr: "6", size: 171 }, { chr: "7", size: 159 }, { chr: "8", size: 146 },
  { chr: "9", size: 141 }, { chr: "10", size: 136 }, { chr: "11", size: 135 }, { chr: "12", size: 134 },
  { chr: "13", size: 115 }, { chr: "14", size: 107 }, { chr: "15", size: 103 }, { chr: "16", size: 90 },
  { chr: "17", size: 83 }, { chr: "18", size: 78 }, { chr: "19", size: 59 }, { chr: "20", size: 64 },
  { chr: "21", size: 47 }, { chr: "22", size: 51 }, { chr: "X", size: 155 }, { chr: "Y", size: 59 },
];

const CHR_COLORS: Record<string, string> = {
  "low": "#6B8F71", "moderate": "#C4956A", "context-dependent": "#7B8FA4",
};

// Pathway enrichment data (mock HPA-style)
const PATHWAY_ENRICHMENT = [
  { pathway: "One-carbon metabolism", genes: ["MTHFR", "MTRR"], pValue: 2.3e-6, fdr: 1.1e-4, source: "KEGG" },
  { pathway: "Catecholamine biosynthesis", genes: ["COMT"], pValue: 4.5e-4, fdr: 8.2e-3, source: "Reactome" },
  { pathway: "Neurotrophin signaling", genes: ["BDNF"], pValue: 1.2e-3, fdr: 1.5e-2, source: "KEGG" },
  { pathway: "Xenobiotic metabolism", genes: ["CYP2D6", "NQO1", "GSTP1"], pValue: 8.9e-7, fdr: 5.3e-5, source: "Reactome" },
  { pathway: "Vitamin D receptor signaling", genes: ["VDR"], pValue: 3.1e-4, fdr: 6.8e-3, source: "WikiPathways" },
  { pathway: "Iron homeostasis", genes: ["HFE"], pValue: 7.2e-3, fdr: 4.5e-2, source: "Reactome" },
  { pathway: "Opioid signaling", genes: ["OPRM1"], pValue: 2.8e-3, fdr: 2.1e-2, source: "KEGG" },
  { pathway: "Lipid metabolism / transport", genes: ["APOE", "FTO"], pValue: 1.5e-5, fdr: 4.2e-4, source: "KEGG" },
  { pathway: "Circadian rhythm / melatonin", genes: ["MTNR1B"], pValue: 5.6e-4, fdr: 9.1e-3, source: "Reactome" },
  { pathway: "JAK-STAT / IL-6 signaling", genes: ["IL-6"], pValue: 9.4e-5, fdr: 2.8e-3, source: "KEGG" },
  { pathway: "Antioxidant defense", genes: ["SOD2", "NQO1"], pValue: 1.8e-4, fdr: 4.6e-3, source: "Reactome" },
];

function ChromosomeIdeogram() {
  const maxSize = 249;
  const [hoveredSNP, setHoveredSNP] = useState<string | null>(null);

  // Only show chromosomes that have SNPs
  const snpsByChr: Record<string, typeof GENOMIC_VARIANTS> = {};
  GENOMIC_VARIANTS.forEach(v => {
    if (!snpsByChr[v.chr]) snpsByChr[v.chr] = [];
    snpsByChr[v.chr].push(v);
  });
  const activeChrList = CHROMOSOMES.filter(c => snpsByChr[c.chr]);

  // Wide layout: each chromosome gets generous horizontal space
  const chrWidth = 18;
  const chrSpacing = 72; // wide gap for labels
  const marginLeft = 50;
  const maxBarHeight = 320;
  const totalWidth = marginLeft + activeChrList.length * chrSpacing + 40;

  return (
    <div className="relative overflow-x-auto pb-4">
      <svg width={totalWidth} height={maxBarHeight + 90} className="block" style={{ minWidth: totalWidth }}>
        {/* Title */}
        <text x={totalWidth / 2} y={16} textAnchor="middle" className="fill-stone-400"
          style={{ fontSize: 11, fontFamily: "Inter, sans-serif" }}>
          GRCh37/hg19 — {GENOMIC_VARIANTS.length} Clinically Annotated SNPs across {activeChrList.length} chromosomes
        </text>

        {activeChrList.map((c, i) => {
          const x = marginLeft + i * chrSpacing;
          const barHeight = (c.size / maxSize) * maxBarHeight;
          const y = 35 + (maxBarHeight - barHeight);
          const snps = snpsByChr[c.chr] || [];

          // Sort SNPs by position for label stacking
          const sortedSnps = [...snps].sort((a, b) => parseInt(a.pos) - parseInt(b.pos));

          return (
            <g key={c.chr}>
              {/* Chromosome bar */}
              <rect x={x} y={y} width={chrWidth} height={barHeight} rx={9} ry={9}
                fill="#F0E9DF" stroke="#D4CFC7" strokeWidth={0.8} />

              {/* Centromere notch */}
              <ellipse cx={x + chrWidth / 2} cy={y + barHeight * 0.38} rx={chrWidth / 2 + 1} ry={3.5}
                fill="#E8E0D4" />

              {/* p/q arm labels */}
              <text x={x + chrWidth / 2} y={y + barHeight * 0.18} textAnchor="middle"
                style={{ fontSize: 7, fill: "#B8ADA0", fontFamily: "Inter, sans-serif" }}>p</text>
              <text x={x + chrWidth / 2} y={y + barHeight * 0.7} textAnchor="middle"
                style={{ fontSize: 7, fill: "#B8ADA0", fontFamily: "Inter, sans-serif" }}>q</text>

              {/* SNP markers — always visible labels */}
              {sortedSnps.map((snp, si) => {
                const pos = parseInt(snp.pos);
                const rawY = y + (pos / (c.size * 1e6)) * barHeight;
                // Prevent overlapping labels: ensure minimum 22px vertical gap
                const minY = y + 6;
                const maxY = y + barHeight - 6;
                const baseY = Math.max(minY, Math.min(rawY, maxY));
                // Offset stacked labels if too close
                const clampedY = Math.max(minY, Math.min(baseY + si * 22 - ((sortedSnps.length - 1) * 11), maxY));
                const isHovered = hoveredSNP === snp.rsid;
                const color = CHR_COLORS[snp.risk_level] || "#B8906F";

                return (
                  <g key={snp.rsid}
                    onMouseEnter={() => setHoveredSNP(snp.rsid)}
                    onMouseLeave={() => setHoveredSNP(null)}
                    style={{ cursor: "pointer" }}>

                    {/* Position indicator on chromosome */}
                    <line x1={x - 2} y1={rawY} x2={x} y2={rawY}
                      stroke={color} strokeWidth={1.5} opacity={0.4} />

                    {/* Connecting line from chromosome to label */}
                    <line x1={x + chrWidth} y1={rawY} x2={x + chrWidth + 6} y2={clampedY}
                      stroke={color} strokeWidth={isHovered ? 1.5 : 0.8} opacity={isHovered ? 1 : 0.5}
                      strokeDasharray={rawY !== clampedY ? "2 1" : "none"} />
                    <line x1={x + chrWidth + 6} y1={clampedY} x2={x + chrWidth + 12} y2={clampedY}
                      stroke={color} strokeWidth={isHovered ? 1.5 : 0.8} />

                    {/* Dot */}
                    <circle cx={x + chrWidth + 15} cy={clampedY} r={isHovered ? 4.5 : 3}
                      fill={color} stroke="white" strokeWidth={1.5} />

                    {/* Gene name — always visible */}
                    <text x={x + chrWidth + 22} y={clampedY - 4}
                      style={{
                        fontSize: isHovered ? 12 : 10,
                        fontWeight: isHovered ? 700 : 600,
                        fill: isHovered ? "#2D2A26" : "#5E5A55",
                        fontFamily: "Playfair Display, serif",
                      }}>
                      {snp.gene}
                    </text>
                    {/* rsID + position — always visible */}
                    <text x={x + chrWidth + 22} y={clampedY + 8}
                      style={{
                        fontSize: 8,
                        fill: isHovered ? "#7A756F" : "#9B958E",
                        fontFamily: "JetBrains Mono, monospace",
                      }}>
                      {snp.rsid}
                    </text>

                    {/* Risk badge — always visible */}
                    <rect x={x + chrWidth + 22} y={clampedY + 12} width={snp.risk_level.length * 5.5 + 8} height={13} rx={6}
                      fill={isHovered ? color : `${color}20`} opacity={isHovered ? 0.15 : 1} />
                    <text x={x + chrWidth + 26} y={clampedY + 22}
                      style={{
                        fontSize: 7,
                        fill: color,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.05em",
                      }}>
                      {snp.risk_level}
                    </text>

                    {/* Expanded tooltip on hover */}
                    {isHovered && (
                      <g>
                        <rect x={x + chrWidth + 20} y={clampedY + 30} width={180} height={40} rx={6}
                          fill="white" stroke="#E8E0D4" strokeWidth={0.5}
                          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.1))" }} />
                        <text x={x + chrWidth + 26} y={clampedY + 44}
                          style={{ fontSize: 9, fill: "#5E5A55", fontFamily: "Inter, sans-serif" }}>
                          {snp.genotype} · {snp.enzyme_activity}
                        </text>
                        <text x={x + chrWidth + 26} y={clampedY + 58}
                          style={{ fontSize: 8, fill: "#9B958E", fontFamily: "JetBrains Mono, monospace" }}>
                          chr{snp.chr}:{parseInt(snp.pos).toLocaleString()} · gnomAD {snp.gnomad_af}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Chromosome label */}
              <text x={x + chrWidth / 2} y={35 + maxBarHeight + 18} textAnchor="middle"
                style={{ fontSize: 11, fontWeight: 600, fill: "#5E5A55", fontFamily: "Inter, sans-serif" }}>
                {c.chr}
              </text>
              <text x={x + chrWidth / 2} y={35 + maxBarHeight + 30} textAnchor="middle"
                style={{ fontSize: 8, fill: "#9B958E", fontFamily: "Inter, sans-serif" }}>
                {c.size} Mb
              </text>
              {/* SNP count badge */}
              <text x={x + chrWidth / 2} y={35 + maxBarHeight + 42} textAnchor="middle"
                style={{ fontSize: 8, fill: "#B8906F", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                {snps.length} SNP{snps.length > 1 ? "s" : ""}
              </text>
            </g>
          );
        })}

        {/* Y-axis scale */}
        {[0, 50, 100, 150, 200, 250].map(mb => {
          const y = 35 + maxBarHeight - (mb / maxSize) * maxBarHeight;
          return (
            <g key={mb}>
              <line x1={35} y1={y} x2={42} y2={y} stroke="#D4CFC7" strokeWidth={0.5} />
              <text x={33} y={y + 3} textAnchor="end" className="fill-stone-400"
                style={{ fontSize: 9, fontFamily: "Inter, sans-serif" }}>
                {mb}
              </text>
            </g>
          );
        })}
        <text x={12} y={35 + maxBarHeight / 2} textAnchor="middle"
          transform={`rotate(-90, 12, ${35 + maxBarHeight / 2})`}
          style={{ fontSize: 9, fill: "#9B958E", fontFamily: "Inter, sans-serif" }}>
          Position (Mb)
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-micro text-stone-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sage inline-block" /> Low risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber inline-block" /> Moderate risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate inline-block" /> Context-dependent
        </span>
        <span className="text-stone-300">|</span>
        <span>Showing {activeChrList.length} of 24 chromosomes (with annotated SNPs only)</span>
      </div>
    </div>
  );
}

export default function GenomicsPage() {
  const [selectedGene, setSelectedGene] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"ideogram" | "pathways" | "variants">("ideogram");
  const moderateCount = GENOMIC_VARIANTS.filter(v => v.risk_level === "moderate").length;
  const lowCount = GENOMIC_VARIANTS.filter(v => v.risk_level === "low").length;

  return (
    <div className="flex flex-col gap-7">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4">
        <Card accent className="text-center py-6">
          <Dna size={22} strokeWidth={1.5} className="text-copper mx-auto mb-3" />
          <div className="text-[28px] font-serif font-semibold text-stone-800">{GENOMIC_VARIANTS.length}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Annotated SNPs</div>
        </Card>
        <Card className="text-center py-6">
          <AlertTriangle size={22} strokeWidth={1.5} className="text-amber mx-auto mb-3" />
          <div className="text-[28px] font-serif font-semibold text-stone-800">{moderateCount}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Moderate Risk</div>
        </Card>
        <Card className="text-center py-6">
          <CheckCircle size={22} strokeWidth={1.5} className="text-sage mx-auto mb-3" />
          <div className="text-[28px] font-serif font-semibold text-stone-800">{lowCount}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Low Risk</div>
        </Card>
        <Card className="text-center py-6">
          <FlaskConical size={22} strokeWidth={1.5} className="text-plum mx-auto mb-3" />
          <div className="text-[28px] font-serif font-semibold text-stone-800">{PATHWAY_ENRICHMENT.length}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Enriched Pathways</div>
        </Card>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-cream-200 rounded-xl p-1 w-fit">
        {([["ideogram", "Chromosome Map"], ["pathways", "Pathway Enrichment"], ["variants", "Variant Table"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-body font-medium transition-all ${
              activeTab === key ? "bg-white text-stone-800 shadow-subtle" : "text-stone-400 hover:text-stone-600"
            }`}>{label}</button>
        ))}
      </div>

      {/* Chromosome Ideogram — Nature-style */}
      {activeTab === "ideogram" && (
        <Card>
          <SectionTitle icon={Dna} title="Genome-Wide SNP Distribution" subtitle="Chromosomal positions of 18 clinically annotated variants · GRCh37/hg19" />
          <ChromosomeIdeogram />
        </Card>
      )}

      {/* Pathway Enrichment — HPA-style */}
      {activeTab === "pathways" && (
        <Card>
          <SectionTitle icon={BarChart3} title="Pathway Enrichment Analysis" subtitle="Gene ontology enrichment via KEGG, Reactome & WikiPathways" />
          <div className="overflow-x-auto rounded-xl border border-cream-300">
            <table className="w-full">
              <thead>
                <tr className="bg-cream-100">
                  {["Pathway", "Source", "Genes", "p-value", "FDR q-value", "Significance"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-micro text-stone-400 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PATHWAY_ENRICHMENT.sort((a, b) => a.pValue - b.pValue).map((p, i) => (
                  <tr key={i} className="border-t border-cream-300 hover:bg-cream-100 transition-colors">
                    <td className="px-3 py-3 text-body font-medium text-stone-800">{p.pathway}</td>
                    <td className="px-3 py-3"><Badge variant="info">{p.source}</Badge></td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.genes.map(g => <Badge key={g} variant="purple">{g}</Badge>)}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-micro text-stone-500">{p.pValue.toExponential(1)}</td>
                    <td className="px-3 py-3 font-mono text-micro text-stone-500">{p.fdr.toExponential(1)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, Math.ceil(-Math.log10(p.pValue))) }).map((_, j) => (
                          <div key={j} className="w-2 h-2 rounded-full bg-copper" style={{ opacity: 0.4 + j * 0.15 }} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pathway risk scores bar chart */}
          <div className="mt-8">
            <h4 className="font-serif text-[15px] font-semibold text-stone-800 mb-4">Composite Pathway Risk Scores</h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={COMPOSITE_SCORES} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
                <XAxis type="number" domain={[0, 50]} tick={{ fill: "#9B958E", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="pathway" type="category" tick={{ fill: "#5E5A55", fontSize: 10 }} axisLine={false} tickLine={false} width={140} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val.toFixed(1)}`, "Risk Score"]} />
                <Bar isAnimationActive={false} dataKey="score" radius={[0, 6, 6, 0]} barSize={14}>
                  {COMPOSITE_SCORES.map((s, i) => (
                    <Cell key={i} fill={s.label === "Moderate" ? "#C4956A" : "#6B8F71"} opacity={s.score === 0 ? 0.2 : 0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Variant Table */}
      {activeTab === "variants" && (
        <Card>
          <SectionTitle icon={BookOpen} title="Variant Registry" subtitle="Click any row for clinical action · ClinVar/gnomAD 2025-2026" />
          <div className="overflow-x-auto rounded-xl border border-cream-300">
            <table className="w-full">
              <thead>
                <tr className="bg-cream-100">
                  {["rsID", "Gene", "Variant", "Genotype", "Activity", "Risk", "Category", "ClinVar", "gnomAD"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-micro text-stone-400 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GENOMIC_VARIANTS.map((v, i) => (
                  <tr key={i} onClick={() => setSelectedGene(selectedGene === i ? null : i)}
                    className={`cursor-pointer transition-colors border-t border-cream-300 ${selectedGene === i ? "bg-copper-50" : "hover:bg-cream-100"}`}>
                    <td className="px-3 py-2.5 text-micro font-mono text-plum">{v.rsid}</td>
                    <td className="px-3 py-2.5 font-medium text-copper-700 text-body">{v.gene}</td>
                    <td className="px-3 py-2.5 text-caption text-stone-600">{v.variant}</td>
                    <td className="px-3 py-2.5"><code className="bg-cream-100 px-2 py-0.5 rounded-md text-micro font-mono text-stone-600">{v.genotype}</code></td>
                    <td className="px-3 py-2.5 text-micro text-stone-500">{v.enzyme_activity}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={v.risk_level === "moderate" ? "warning" : v.risk_level === "context-dependent" ? "info" : "success"}>
                        {v.risk_level}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-micro text-stone-500">{v.category}</td>
                    <td className="px-3 py-2.5 text-micro text-stone-500">{v.clinvar}</td>
                    <td className="px-3 py-2.5 text-micro font-mono text-stone-400">{v.gnomad_af}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedGene !== null && (
            <div className="mt-5 p-5 bg-copper-50 rounded-2xl border border-copper/15">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={15} strokeWidth={1.5} className="text-copper" />
                <span className="text-body font-serif font-semibold text-copper-700">{GENOMIC_VARIANTS[selectedGene].gene} — Clinical Action</span>
                <span className="text-micro font-mono text-stone-400 ml-auto">chr{GENOMIC_VARIANTS[selectedGene].chr}:{parseInt(GENOMIC_VARIANTS[selectedGene].pos).toLocaleString()}</span>
              </div>
              <p className="text-body text-stone-600 leading-relaxed mb-2">{GENOMIC_VARIANTS[selectedGene].impact}</p>
              <p className="text-body text-stone-700 font-medium">{GENOMIC_VARIANTS[selectedGene].action}</p>
              <div className="mt-2 flex gap-2 text-micro text-stone-400">
                {GENOMIC_VARIANTS[selectedGene].pmids.map(p => <span key={p} className="font-mono bg-cream-200 px-1.5 py-0.5 rounded">{p}</span>)}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
