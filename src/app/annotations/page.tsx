"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { BookOpen, ExternalLink, Dna, Shield, ChevronDown, ChevronUp, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { RESEARCH_UPDATES, COMPOSITE_SCORES, GENOMIC_VARIANTS, GENE_PUBLICATION_TRENDS } from "@/data/seed";

const tooltipStyle = { background: "white", border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };

export default function AnnotationsPage() {
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedGene, setSelectedGene] = useState<string>("MTHFR");

  const filteredUpdates = filter === "all"
    ? RESEARCH_UPDATES
    : RESEARCH_UPDATES.filter(u => u.impact === filter);

  const moderatePathways = COMPOSITE_SCORES.filter(s => s.label === "Moderate");
  const currentTrend = GENE_PUBLICATION_TRENDS.find(g => g.gene === selectedGene);

  return (
    <div className="flex flex-col gap-7">
      {/* Sequencing summary */}
      <Card className="p-7">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-micro text-stone-400 uppercase tracking-[0.12em] font-medium mb-1">Genome Profile</div>
            <h2 className="font-serif text-[26px] font-semibold text-stone-800 tracking-tight">Alex Morgan</h2>
            <p className="text-body text-stone-500 mt-1">DemoGene Sequencing — GRCh37/hg19 — Generated 2026-03-31</p>
          </div>
          <div className="text-right space-y-1">
            <div className="text-micro text-stone-400 uppercase tracking-[0.08em] font-medium">Variants Analyzed</div>
            <div className="font-serif text-[26px] font-semibold text-stone-800 tabular-nums">12,101,066</div>
            <div className="flex gap-3 text-micro text-stone-400">
              <span>1,167,769 direct</span>
              <span className="text-cream-400">|</span>
              <span>10,933,297 imputed</span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Badge variant="success">APOE e2/e3 — Protective</Badge>
          <Badge variant="default">{GENOMIC_VARIANTS.length} Clinically Annotated SNPs</Badge>
          <Badge variant="info">{moderatePathways.length} Moderate Risk Pathways</Badge>
        </div>
      </Card>

      {/* Publication Trend Analysis */}
      <Card>
        <SectionTitle icon={TrendingUp} title="Gene Citation Landscape" subtitle="PubMed publication trends for your annotated genes (2015-2025)" />

        {/* Gene selector */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {GENE_PUBLICATION_TRENDS.map(g => (
            <button key={g.gene} onClick={() => setSelectedGene(g.gene)}
              className={`px-3 py-1.5 rounded-lg text-micro font-medium transition-all ${
                selectedGene === g.gene ? "bg-stone-800 text-white" : "bg-cream-200 text-stone-400 hover:text-stone-600"
              }`}>{g.gene}</button>
          ))}
        </div>

        {currentTrend && (
          <div>
            {/* Trend chart */}
            <div className="grid grid-cols-[2fr_1fr] gap-6">
              <div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={currentTrend.data}>
                    <defs>
                      <linearGradient id="pubGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B8906F" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#B8906F" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
                    <XAxis dataKey="year" tick={{ fill: "#7A756F", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9B958E", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(val: number, name: string) => [`${val} publications`, "Publications"]}
                      labelFormatter={(label) => {
                        const d = currentTrend.data.find(x => x.year === label);
                        return d ? `${label} — ${d.topic}` : `${label}`;
                      }} />
                    <Area type="monotone" dataKey="pubs" stroke="#B8906F" fill="url(#pubGrad)" strokeWidth={2}
                      dot={{ fill: "#B8906F", r: 3, strokeWidth: 2, stroke: "white" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Gene summary panel */}
              <div className="space-y-4">
                <div className="p-4 bg-cream-100 rounded-xl border border-cream-300">
                  <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mb-1">Total Publications</div>
                  <div className="text-[28px] font-serif font-semibold text-stone-800">{currentTrend.total.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-cream-100 rounded-xl border border-cream-300">
                  <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mb-1">Peak Year Topic</div>
                  <div className="text-body font-medium text-stone-700">
                    {currentTrend.data.reduce((a, b) => a.pubs > b.pubs ? a : b).topic}
                  </div>
                  <div className="text-micro text-stone-400 mt-0.5">
                    {currentTrend.data.reduce((a, b) => a.pubs > b.pubs ? a : b).year}
                  </div>
                </div>
                <div className="p-4 bg-cream-100 rounded-xl border border-cream-300">
                  <div className="text-micro text-stone-400 uppercase tracking-wide font-medium mb-1">2025 Focus</div>
                  <div className="text-body font-medium text-stone-700">
                    {currentTrend.data.find(d => d.year === 2025)?.topic}
                  </div>
                </div>
              </div>
            </div>

            {/* Mechanism summary — Nature-style */}
            <div className="mt-5 p-5 bg-copper-50 rounded-xl border border-copper/15">
              <div className="flex items-center gap-2 mb-2">
                <Dna size={15} strokeWidth={1.5} className="text-copper" />
                <span className="font-serif text-[15px] font-semibold text-copper-700">Molecular Mechanism — {selectedGene}</span>
              </div>
              <p className="text-body text-stone-600 leading-relaxed">{currentTrend.mechanism}</p>
            </div>

            {/* Year-by-year topic evolution */}
            <div className="mt-5">
              <h4 className="text-caption font-medium text-stone-400 uppercase tracking-wide mb-3">Research Topic Evolution</h4>
              <div className="flex flex-wrap gap-2">
                {currentTrend.data.map(d => (
                  <div key={d.year} className="flex items-center gap-1.5 px-2.5 py-1 bg-cream-100 rounded-lg border border-cream-300">
                    <span className="text-micro font-mono text-stone-400">{d.year}</span>
                    <span className="text-micro text-stone-600">{d.topic}</span>
                    <span className="text-micro text-stone-300">{d.pubs}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Pathway risk chart */}
      <Card>
        <SectionTitle icon={Shield} title="Pathway Risk Scores" subtitle="Composite scores across 14 biological pathways" />
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={COMPOSITE_SCORES} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
            <XAxis type="number" domain={[0, 50]} tick={{ fill: "#9B958E", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="pathway" type="category" tick={{ fill: "#5E5A55", fontSize: 11 }} axisLine={false} tickLine={false} width={150} />
            <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val.toFixed(1)}`, "Risk Score"]} />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
              {COMPOSITE_SCORES.map((s, i) => (
                <Cell key={i} fill={s.label === "Moderate" ? "#C4956A" : "#6B8F71"} opacity={s.score === 0 ? 0.25 : 0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Research feed */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <SectionTitle icon={BookOpen} title="Latest Research Annotations" subtitle="2025-2026 literature relevant to your genotype" />
          <div className="flex gap-1.5 -mt-4">
            {["all","positive","actionable","monitor"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-micro font-medium uppercase tracking-wide transition-all ${
                  filter === f ? "bg-stone-800 text-white" : "bg-cream-200 text-stone-400 hover:text-stone-600"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {filteredUpdates.map(u => {
            const isExpanded = expandedUpdate === u.id;
            return (
              <div key={u.id}
                className="p-4 bg-cream-100 rounded-xl border border-cream-300 hover:shadow-elevated transition-all cursor-pointer"
                onClick={() => setExpandedUpdate(isExpanded ? null : u.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-micro font-mono text-stone-400">{u.date}</span>
                      <Badge variant={u.impact === "positive" ? "success" : u.impact === "actionable" ? "default" : "warning"}>
                        {u.impact}
                      </Badge>
                      <span className="text-micro font-mono text-plum">{u.rsid}</span>
                    </div>
                    <h4 className="text-body font-medium text-stone-800 leading-snug">{u.title}</h4>
                    <p className="text-caption text-stone-400 mt-1">{u.source}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <Badge variant="purple">{u.gene}</Badge>
                    {isExpanded ? <ChevronUp size={15} strokeWidth={1.5} className="text-stone-300" /> : <ChevronDown size={15} strokeWidth={1.5} className="text-stone-300" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-cream-300">
                    <p className="text-body text-stone-600 leading-relaxed">{u.finding}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <ExternalLink size={12} strokeWidth={1.5} className="text-copper" />
                      <span className="text-micro text-copper font-medium">{u.url}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Variant table */}
      <Card>
        <SectionTitle icon={Dna} title="Annotated Variant Registry" subtitle={`${GENOMIC_VARIANTS.length} clinically significant SNPs with 2025-2026 ClinVar/gnomAD data`} />
        <div className="overflow-x-auto rounded-xl border border-cream-300">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cream-100">
                {["rsID", "Gene", "Genotype", "Activity", "Risk", "ClinVar", "gnomAD AF", "Updated"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-micro text-stone-400 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GENOMIC_VARIANTS.map((v, i) => (
                <tr key={i} className="border-t border-cream-300 hover:bg-cream-100 transition-colors">
                  <td className="px-3 py-2.5 text-caption font-mono text-plum">{v.rsid}</td>
                  <td className="px-3 py-2.5 text-caption font-medium text-stone-800">{v.gene}</td>
                  <td className="px-3 py-2.5"><code className="bg-cream-100 px-2 py-0.5 rounded-md text-micro font-mono text-stone-600">{v.genotype}</code></td>
                  <td className="px-3 py-2.5 text-micro text-stone-500">{v.enzyme_activity}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={v.risk_level === "moderate" ? "warning" : v.risk_level === "context-dependent" ? "info" : "success"}>
                      {v.risk_level}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-micro text-stone-500">{v.clinvar}</td>
                  <td className="px-3 py-2.5 text-micro font-mono text-stone-400">{v.gnomad_af}</td>
                  <td className="px-3 py-2.5 text-micro text-stone-400">{v.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
