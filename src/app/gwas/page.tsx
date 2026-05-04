"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { Dna, Database, TrendingUp, Users, AlertCircle, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { GWAS_DISEASE_ASSOCIATIONS, DISGENET_DISEASES, ENRICHMENT_SUMMARY } from "@/data/enrichr-data";

const tooltipStyle = { background: "white", border: "1px solid #E8E0D4", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  "Metabolic": "#C4956A",      // amber
  "Neurological": "#B19CD9",   // plum
  "Cardiovascular": "#E8989E", // rose
  "Immune": "#6B8F71",         // sage
  "Cancer": "#7B8FA4",         // slate
};

// Convert Manhattan plot data
function getManhattanData() {
  return GWAS_DISEASE_ASSOCIATIONS.map((assoc, i) => ({
    id: assoc.rsid,
    gene: assoc.gene,
    log10p: -Math.log10(assoc.pvalue),
    category: assoc.category,
    trait: assoc.trait,
    study: assoc.study,
    year: assoc.year,
    sample_size: assoc.sample_size,
    x: i,
  })).sort((a, b) => b.log10p - a.log10p);
}

// Disease category treemap data
function getCategoryTreemapData() {
  const categoryMap: Record<string, { count: number; diseases: Set<string> }> = {};
  DISGENET_DISEASES.forEach(d => {
    if (!categoryMap[d.disease_class]) {
      categoryMap[d.disease_class] = { count: 0, diseases: new Set() };
    }
    categoryMap[d.disease_class].count++;
    categoryMap[d.disease_class].diseases.add(d.disease);
  });

  return Object.entries(categoryMap).map(([cls, data]) => ({
    category: cls,
    count: data.count,
    representative: Array.from(data.diseases)[0] || "N/A",
  }));
}

// Population distribution
function getPopulationData() {
  const popMap: Record<string, number> = {};
  GWAS_DISEASE_ASSOCIATIONS.forEach(assoc => {
    popMap[assoc.population] = (popMap[assoc.population] || 0) + 1;
  });
  return Object.entries(popMap).map(([pop, count]) => ({
    name: pop,
    value: count,
  }));
}

// Evidence by gene (stacked bar)
function getEvidenceByGene() {
  const geneMap: Record<string, { curated: number; literature: number; animal_model: number }> = {};
  DISGENET_DISEASES.forEach(d => {
    if (!geneMap[d.gene]) {
      geneMap[d.gene] = { curated: 0, literature: 0, animal_model: 0 };
    }
    if (d.source === "curated") geneMap[d.gene].curated++;
    else if (d.source === "literature") geneMap[d.gene].literature++;
    else geneMap[d.gene].animal_model++;
  });

  return Object.entries(geneMap)
    .map(([gene, counts]) => ({ gene, ...counts }))
    .sort((a, b) => (b.curated + b.literature + b.animal_model) - (a.curated + a.literature + a.animal_model));
}

// Sort disGeNET diseases by score descending
function getSortedDiseases() {
  return [...DISGENET_DISEASES].sort((a, b) => b.score - a.score);
}

export default function GWASPage() {
  const [sortBy, setSortBy] = useState<"score" | "evidence" | "gene">("score");
  const manhattanData = getManhattanData();
  const categoryData = getCategoryTreemapData();
  const populationData = getPopulationData();
  const evidenceData = getEvidenceByGene();
  const sortedDiseases = getSortedDiseases();

  // Stats
  const totalAssociations = GWAS_DISEASE_ASSOCIATIONS.length;
  const diseaseCategories = new Set(DISGENET_DISEASES.map(d => d.disease_class)).size;

  // Calculate most studied gene
  const geneCounts: Record<string, number> = {};
  DISGENET_DISEASES.forEach(d => {
    geneCounts[d.gene] = (geneCounts[d.gene] || 0) + 1;
  });
  const mostStudiedGene = Object.entries(geneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Calculate top population
  const popCounts: Record<string, number> = {};
  GWAS_DISEASE_ASSOCIATIONS.forEach(assoc => {
    popCounts[assoc.population] = (popCounts[assoc.population] || 0) + 1;
  });
  const topPopulation = Object.entries(popCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const sortedDisplayDiseases = sortBy === "score"
    ? sortedDiseases
    : sortBy === "evidence"
      ? [...sortedDiseases].sort((a, b) => b.evidence_count - a.evidence_count)
      : [...sortedDiseases].sort((a, b) => a.gene.localeCompare(b.gene));

  const genomeWideSigLine = -Math.log10(5e-8);

  return (
    <div className="flex flex-col gap-7">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center py-6">
          <Database size={22} strokeWidth={1.5} className="text-copper mx-auto mb-3" />
          <div className="text-[28px] font-serif font-semibold text-stone-800">{totalAssociations}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">GWAS Associations</div>
        </Card>
        <Card className="text-center py-6">
          <AlertCircle size={22} strokeWidth={1.5} className="text-plum mx-auto mb-3" />
          <div className="text-[28px] font-serif font-semibold text-stone-800">{diseaseCategories}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Disease Categories</div>
        </Card>
        <Card className="text-center py-6">
          <Dna size={22} strokeWidth={1.5} className="text-sage mx-auto mb-3" />
          <div className="text-[28px] font-serif font-semibold text-stone-800">{mostStudiedGene}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Most Studied Gene</div>
        </Card>
        <Card className="text-center py-6">
          <Users size={22} strokeWidth={1.5} className="text-rose mx-auto mb-3" />
          <div className="text-[28px] font-serif font-semibold text-stone-800">{topPopulation}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Top Population</div>
        </Card>
      </div>

      {/* Manhattan-Style Plot */}
      <Card>
        <SectionTitle
          icon={BarChart3}
          title="Manhattan-Style GWAS Plot"
          subtitle="All GWAS associations by gene & p-value significance (colored by category)"
        />
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
              <XAxis
                type="number"
                dataKey="x"
                name="Gene Index"
                tick={{ fill: "#9B958E", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="log10p"
                name="-log10(p-value)"
                domain={[0, 150]}
                tick={{ fill: "#9B958E", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              {/* Genome-wide significance line */}
              <line
                x1="0"
                y1={genomeWideSigLine}
                x2="100%"
                y2={genomeWideSigLine}
                stroke="#E8989E"
                strokeDasharray="5 5"
              />

              <Tooltip
                contentStyle={tooltipStyle}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2">
                        <p className="font-medium text-stone-800">{data.gene}</p>
                        <p className="text-micro text-stone-600">{data.trait}</p>
                        <p className="text-micro text-stone-500">{data.study}, {data.year}</p>
                        <p className="text-micro text-stone-400">n={data.sample_size.toLocaleString()}</p>
                        <p className="text-micro font-mono text-copper mt-1">-log10(p)={data.log10p.toFixed(1)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                <Scatter
                  key={category}
                  name={category}
                  data={manhattanData.filter(d => d.category === category)}
                  fill={color}
                  fillOpacity={0.7}
                  isAnimationActive={false}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-micro">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              {cat}
            </span>
          ))}
          <span className="text-stone-300 mx-2">|</span>
          <span className="text-stone-400">Red dashed line = genome-wide significance (p=5×10⁻⁸)</span>
        </div>
      </Card>

      {/* Disease Category Treemap */}
      <Card>
        <SectionTitle
          icon={AlertCircle}
          title="Disease Category Treemap"
          subtitle="Distribution of disease associations by category"
        />
        <div className="grid grid-cols-2 gap-4">
          {categoryData.map((cat, i) => {
            const colors = ["bg-amber-light", "bg-plum-light", "bg-rose-light", "bg-sage-light", "bg-slate-light"];
            const borderColors = ["border-amber/20", "border-plum/20", "border-rose/20", "border-sage/20", "border-slate/20"];
            const textColors = ["text-amber-700", "text-plum-700", "text-rose-700", "text-sage-700", "text-slate-700"];

            return (
              <div key={cat.category} className={`${colors[i % 5]} ${borderColors[i % 5]} border rounded-2xl p-5 hover:shadow-md transition-shadow`}>
                <div className={`text-[24px] font-serif font-semibold ${textColors[i % 5]} mb-1`}>
                  {cat.count}
                </div>
                <div className="text-body font-medium text-stone-800 mb-2">{cat.category}</div>
                <div className="text-micro text-stone-600">Representative: {cat.representative}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* DisGeNET Disease Network — Interactive Table */}
      <Card>
        <div className="mb-5">
          <SectionTitle
            icon={TrendingUp}
            title="DisGeNET Disease Associations"
            subtitle="Gene-disease links with evidence strength and disease classification"
          />
          <div className="mt-3 flex gap-2">
            {(["score", "evidence", "gene"] as const).map(key => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1.5 rounded-lg text-micro font-medium transition-all ${
                  sortBy === key
                    ? "bg-copper/15 text-copper-700 border border-copper/30"
                    : "bg-cream-100 text-stone-600 hover:bg-cream-200"
                }`}
              >
                Sort by {key === "score" ? "Score" : key === "evidence" ? "Evidence" : "Gene"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-cream-300">
          <table className="w-full">
            <thead>
              <tr className="bg-cream-100">
                {["Disease", "Gene", "Score", "Evidence Count", "Source", "Disease Class"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-micro text-stone-400 uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedDisplayDiseases.map((disease, i) => {
                const scoreColor = disease.score > 0.5 ? "bg-rose-light" : disease.score > 0.3 ? "bg-amber-light" : "bg-sage-light";
                const scoreBar = disease.score > 0.5 ? "bg-rose" : disease.score > 0.3 ? "bg-amber" : "bg-sage";

                return (
                  <tr key={`${disease.disease}-${disease.gene}-${i}`} className="border-t border-cream-300 hover:bg-cream-100 transition-colors">
                    <td className="px-4 py-3 text-body font-medium text-stone-800">{disease.disease}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{disease.gene}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`${scoreColor} rounded-lg px-2 py-1 inline-flex items-center gap-2`}>
                        <div className="w-20 h-2 bg-stone-300 rounded-full overflow-hidden">
                          <div className={`${scoreBar} h-full`} style={{ width: `${disease.score * 100}%` }} />
                        </div>
                        <span className="text-micro font-mono text-stone-700">{disease.score.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body font-medium text-stone-700">{disease.evidence_count}</td>
                    <td className="px-4 py-3">
                      <Badge variant={disease.source === "curated" ? "success" : "info"}>
                        {disease.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-body text-stone-600">{disease.disease_class}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Population Distribution Pie Chart */}
      <Card>
        <SectionTitle
          icon={Users}
          title="Population Distribution"
          subtitle="Study population composition across GWAS cohorts"
        />
        <div className="flex items-center justify-center h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={populationData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {populationData.map((entry, index) => {
                  const colors = ["#C4956A", "#6B8F71", "#7B8FA4"];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Evidence Strength by Gene — Stacked Bar */}
      <Card>
        <SectionTitle
          icon={BarChart3}
          title="Evidence Strength by Gene"
          subtitle="Breakdown of evidence types (curated, literature, animal model) from DisGeNET"
        />
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={evidenceData}
              margin={{ top: 20, right: 20, bottom: 20, left: 50 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
              <XAxis type="number" tick={{ fill: "#9B958E", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="gene"
                tick={{ fill: "#5E5A55", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val: number) => val.toString()}
              />
              <Bar dataKey="curated" stackId="a" fill="#6B8F71" radius={[0, 6, 6, 0]} />
              <Bar dataKey="literature" stackId="a" fill="#C4956A" />
              <Bar dataKey="animal_model" stackId="a" fill="#E8989E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex gap-6 text-micro">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sage" />
            Curated
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber" />
            Literature
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose" />
            Animal Model
          </span>
        </div>
      </Card>
    </div>
  );
}
