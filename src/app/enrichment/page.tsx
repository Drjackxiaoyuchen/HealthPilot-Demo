"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  NetworkIcon,
  Microscope,
  Calendar,
  GitBranch,
} from "lucide-react";
import {
  KEGG_ENRICHMENT,
  REACTOME_ENRICHMENT,
  GO_BIOLOGICAL_PROCESSES,
  ENRICHMENT_SUMMARY,
} from "@/data/enrichr-data";

const tooltipStyle = {
  background: "white",
  border: "1px solid #E8E0D4",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
};

// Library colors for consistency
const LIBRARY_COLORS: Record<string, string> = {
  KEGG: "#C4956A",      // copper
  Reactome: "#9B7DB8",  // plum
  "GO": "#6B8F71",      // sage
};

const CATEGORY_COLORS: Record<string, string> = {
  Metabolism: "#C4956A",
  Signaling: "#9B7DB8",
  "Neurotransmitter": "#7B8FA4",
  "Stress Response": "#F59D6B",
  Transport: "#D4AC5C",
  "Gene Expression": "#8B9D83",
  Immune: "#C97B5C",
  Sleep: "#A89F9E",
  "Ion Homeostasis": "#B5A196",
  "Carbohydrate": "#D4CFC7",
};

const PIE_COLORS = [
  "#C4956A",
  "#9B7DB8",
  "#6B8F71",
  "#7B8FA4",
  "#F59D6B",
  "#D4AC5C",
  "#8B9D83",
];

// Summary Cards Component
function SummaryCards() {
  const significantCount = KEGG_ENRICHMENT.length + REACTOME_ENRICHMENT.length + GO_BIOLOGICAL_PROCESSES.length;

  const cards = [
    {
      icon: TrendingUp,
      label: "Total Pathways Significant",
      value: significantCount.toString(),
      color: "text-copper",
    },
    {
      icon: GitBranch,
      label: "Top Library",
      value: "KEGG 2021",
      color: "text-plum",
    },
    {
      icon: Microscope,
      label: "Genes Analyzed",
      value: ENRICHMENT_SUMMARY.total_genes_analyzed.toString(),
      color: "text-sage",
    },
    {
      icon: Calendar,
      label: "Analysis Date",
      value: ENRICHMENT_SUMMARY.analysis_date,
      color: "text-slate",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card key={i} className="text-center py-6 hover:shadow-elevated transition-shadow">
            <Icon size={22} strokeWidth={1.5} className={`${card.color} mx-auto mb-3`} />
            <div className="text-[24px] font-serif font-semibold text-stone-800">
              {card.value}
            </div>
            <div className="text-caption text-stone-400 font-medium mt-2">
              {card.label}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// KEGG Pathway Chart
function KEGGPathwayChart() {
  // Sort by combined_score descending and take top 15
  const data = useMemo(
    () =>
      [...KEGG_ENRICHMENT]
        .map((item) => ({ ...item, pathway: item.term }))
        .sort((a, b) => b.combined_score - a.combined_score)
        .slice(0, 15),
    []
  );

  const truncateName = (name: string, length: number = 35) =>
    name.length > length ? name.substring(0, length) + "…" : name;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div style={tooltipStyle}>
          <div className="font-semibold text-stone-800">{data.pathway}</div>
          <div className="text-micro text-stone-500 mt-1">
            p-value: {data.pvalue.toExponential(2)}
          </div>
          <div className="text-micro text-stone-500">
            Overlap: {data.overlap}
          </div>
          <div className="text-micro text-stone-600 mt-1">
            Genes: {data.genes.join(", ")}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-8">
      <SectionTitle
        icon={NetworkIcon}
        title="KEGG Pathway Enrichment"
        subtitle="Top 15 pathways by combined score · metabolic & disease-related pathways"
      />
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 250, right: 30, top: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
          <XAxis type="number" tick={{ fill: "#9B958E", fontSize: 11 }} />
          <YAxis
            dataKey="pathway"
            type="category"
            tick={{ fill: "#5E5A55", fontSize: 10 }}
            width={240}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar isAnimationActive={false} dataKey="combined_score" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={CATEGORY_COLORS[entry.category] || "#C4956A"}
                opacity={0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Reactome Pathway Chart
function ReactomePathwayChart() {
  const data = useMemo(
    () =>
      [...REACTOME_ENRICHMENT]
        .map((item) => ({
          ...item,
          pathway: item.term,
          combined_score: -Math.log10(item.pvalue) * 10,
        }))
        .sort((a, b) => b.combined_score - a.combined_score)
        .slice(0, 12),
    []
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div style={tooltipStyle}>
          <div className="font-semibold text-stone-800">{data.pathway}</div>
          <div className="text-micro text-stone-500 mt-1">
            p-value: {data.pvalue.toExponential(2)}
          </div>
          <div className="text-micro text-stone-500">
            Gene count: {data.genes.length}
          </div>
          <div className="text-micro text-stone-600 mt-1">
            Genes: {data.genes.join(", ")}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-8">
      <SectionTitle
        icon={GitBranch}
        title="Reactome Pathway Enrichment"
        subtitle="Top 12 pathways · cellular processes & signaling cascades"
      />
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 220, right: 30, top: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
          <XAxis type="number" tick={{ fill: "#9B958E", fontSize: 11 }} />
          <YAxis
            dataKey="pathway"
            type="category"
            tick={{ fill: "#5E5A55", fontSize: 10 }}
            width={210}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar isAnimationActive={false} dataKey="combined_score" radius={[0, 6, 6, 0]} barSize={14}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={CATEGORY_COLORS[entry.category] || "#9B7DB8"}
                opacity={0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// GO Biological Processes Chart
function GOBiologicalProcessChart() {
  const data = useMemo(
    () =>
      [...GO_BIOLOGICAL_PROCESSES]
        .map((item) => ({
          ...item,
          combined_score: -Math.log10(item.pvalue) * 10,
        }))
        .sort((a, b) => b.combined_score - a.combined_score)
        .slice(0, 10),
    []
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div style={tooltipStyle}>
          <div className="font-semibold text-stone-800">{data.term}</div>
          <div className="text-micro text-stone-500 mt-1">
            GO ID: {data.go_id}
          </div>
          <div className="text-micro text-stone-500">
            p-value: {data.pvalue.toExponential(2)}
          </div>
          <div className="text-micro text-stone-500">
            Gene count: {data.genes.length}
          </div>
          <div className="text-micro text-stone-600 mt-1">
            Genes: {data.genes.join(", ")}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-8">
      <SectionTitle
        icon={Microscope}
        title="GO Biological Processes"
        subtitle="Top 10 enriched biological functions · Sage-colored by significance"
      />
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 200, right: 30, top: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
          <XAxis type="number" tick={{ fill: "#9B958E", fontSize: 11 }} />
          <YAxis
            dataKey="term"
            type="category"
            tick={{ fill: "#5E5A55", fontSize: 10 }}
            width={190}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar isAnimationActive={false} dataKey="combined_score" radius={[0, 6, 6, 0]} barSize={12}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={CATEGORY_COLORS[entry.category] || "#6B8F71"}
                opacity={0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Enrichment Bubble Plot (Scatter Chart)
function EnrichmentBubblePlot() {
  // Combine all pathways with library source
  const bubbleData = useMemo(() => {
    const keggPoints = KEGG_ENRICHMENT.map((item) => ({
      pValue: item.pvalue,
      logPValue: -Math.log10(item.pvalue),
      oddsRatio: item.combined_score / 25, // normalize
      geneCount: item.genes.length,
      library: "KEGG",
      name: item.term,
    }));

    const reactomePoints = REACTOME_ENRICHMENT.map((item) => ({
      pValue: item.pvalue,
      logPValue: -Math.log10(item.pvalue),
      oddsRatio: (-Math.log10(item.pvalue) * 10) / 25,
      geneCount: item.genes.length,
      library: "Reactome",
      name: item.term,
    }));

    const goPoints = GO_BIOLOGICAL_PROCESSES.map((item) => ({
      pValue: item.pvalue,
      logPValue: -Math.log10(item.pvalue),
      oddsRatio: (-Math.log10(item.pvalue) * 10) / 25,
      geneCount: item.genes.length,
      library: "GO",
      name: item.term,
    }));

    return [...keggPoints, ...reactomePoints, ...goPoints];
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div style={tooltipStyle}>
          <div className="font-semibold text-stone-800 text-sm">{data.name}</div>
          <div className="text-micro text-stone-500 mt-1">
            -log10(p): {data.logPValue.toFixed(2)}
          </div>
          <div className="text-micro text-stone-500">
            Score: {data.oddsRatio.toFixed(2)}
          </div>
          <div className="text-micro text-stone-500">
            Genes: {data.geneCount}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-8">
      <SectionTitle
        icon={TrendingUp}
        title="Enrichment Bubble Plot"
        subtitle="X-axis: -log10(p-value) · Y-axis: combined score · bubble size: gene count"
      />
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ left: 60, right: 30, top: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
          <XAxis
            type="number"
            dataKey="logPValue"
            label={{ value: "-log10(p-value)", position: "bottom", offset: 10 }}
            tick={{ fill: "#9B958E", fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="oddsRatio"
            label={{ value: "Combined Score", angle: -90, position: "insideLeft" }}
            tick={{ fill: "#9B958E", fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          {Object.entries(LIBRARY_COLORS).map(([lib, color]) => (
            <Scatter
              key={lib}
              name={lib}
              data={bubbleData.filter((d) => d.library === lib)}
              fill={color}
              opacity={0.6}
              shape="circle"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Pathway Category Distribution Pie Chart
function PathwayCategoryDistribution() {
  // Count pathways by category across all libraries
  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};

    [...KEGG_ENRICHMENT, ...REACTOME_ENRICHMENT, ...GO_BIOLOGICAL_PROCESSES].forEach(
      (item) => {
        const cat = item.category;
        counts[cat] = (counts[cat] || 0) + 1;
      }
    );

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0];
      return (
        <div style={tooltipStyle}>
          <div className="font-semibold text-stone-800">{data.name}</div>
          <div className="text-micro text-stone-500 mt-1">
            {data.value} pathway{data.value > 1 ? "s" : ""}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <SectionTitle
        icon={NetworkIcon}
        title="Pathway Category Distribution"
        subtitle="Classification of all enriched pathways across functional categories"
      />
      <div className="flex items-center justify-center gap-12">
        <ResponsiveContainer width={300} height={300}>
          <PieChart>
            <Pie
              data={categoryCount}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {categoryCount.map((entry, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.8} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-col gap-3">
          {categoryCount.map((cat, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                  opacity: 0.8,
                }}
              />
              <span className="text-body text-stone-700">
                {cat.name}
              </span>
              <span className="text-micro text-stone-400 ml-2">
                ({cat.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Main Page
export default function EnrichmentPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-display font-serif font-bold text-stone-800 mb-2">
          Pathway Enrichment Analysis
        </h1>
        <p className="text-body text-stone-500">
          Gene ontology enrichment across KEGG, Reactome, and GO Biological Processes
          · Functional interpretation of your genomic variants
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* KEGG Enrichment */}
      <KEGGPathwayChart />

      {/* Reactome Enrichment */}
      <ReactomePathwayChart />

      {/* GO Biological Processes */}
      <GOBiologicalProcessChart />

      {/* Enrichment Bubble Plot */}
      <EnrichmentBubblePlot />

      {/* Category Distribution */}
      <PathwayCategoryDistribution />
    </div>
  );
}
