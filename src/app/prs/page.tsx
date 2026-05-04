"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { PRS_ESTIMATES } from "@/data/enrichr-data";
import {
  Activity, AlertTriangle, Globe, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useState, useMemo } from "react";

// ============================================================================
// GAUGE CHART COMPONENT
// ============================================================================
interface GaugeChartProps {
  percentile: number;
  trait: string;
  risk_category: "low" | "average" | "elevated" | "high";
  contributing_snps: number;
}

function GaugeChart({ percentile, trait, risk_category, contributing_snps }: GaugeChartProps) {
  // Determine arc color based on risk category
  const getArcColor = (category: string) => {
    switch (category) {
      case "low":
        return "#6B8F71"; // sage
      case "average":
        return "#C4956A"; // amber
      case "elevated":
        return "#C4956A"; // amber
      case "high":
        return "#B07070"; // rose
      default:
        return "#7B8FA4"; // slate
    }
  };

  const arcColor = getArcColor(risk_category);

  // SVG dimensions
  const size = 160;
  const radius = 60;
  const cx = size / 2;
  const cy = size / 2;

  // Arc path calculation (semicircle from -90° to 90°, 180°)
  // Map percentile (0-100) to angle (-90 to 90 degrees)
  const angle = -90 + (percentile / 100) * 180;
  const angleRad = (angle * Math.PI) / 180;

  // Arc endpoints
  const x = cx + radius * Math.cos(angleRad);
  const y = cy + radius * Math.sin(angleRad);

  // SVG arc command for the filled portion
  const largeArc = percentile > 50 ? 1 : 0;
  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y}`;

  // Background arc (full semicircle)
  const bgPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="#E8E0D4" strokeWidth="8" strokeLinecap="round" />

        {/* Filled arc */}
        <path d={arcPath} fill="none" stroke={arcColor} strokeWidth="8" strokeLinecap="round" />

        {/* Center text */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="font-serif font-bold"
          fontSize="32"
          fill="#2D2A26"
        >
          {percentile}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          className="font-sans"
          fontSize="11"
          fill="#9B958E"
        >
          percentile
        </text>
      </svg>

      {/* Trait label and badge */}
      <div className="text-center">
        <p className="text-title text-center leading-snug">{trait}</p>
        <Badge
          variant={
            risk_category === "low"
              ? "success"
              : risk_category === "high"
                ? "danger"
                : risk_category === "elevated"
                  ? "warning"
                  : "info"
          }
          className="mt-2"
        >
          {risk_category.charAt(0).toUpperCase() + risk_category.slice(1)}
        </Badge>
      </div>

      {/* Contributing SNPs */}
      <p className="text-caption text-stone-400">
        <span className="font-semibold text-stone-500">{contributing_snps}</span> SNPs
      </p>
    </div>
  );
}

// ============================================================================
// NORMAL DISTRIBUTION CURVE (for detailed view)
// ============================================================================
interface NormalCurveProps {
  zscore: number;
  trait: string;
}

function NormalDistributionCurve({ zscore, trait }: NormalCurveProps) {
  // Simple bell curve visualization
  const width = 300;
  const height = 80;
  const centerX = width / 2;
  const centerY = height * 0.7;

  // Generate curve points (normal distribution)
  const points: [number, number][] = [];
  for (let i = -3; i <= 3; i += 0.1) {
    const y = height * 0.6 * Math.exp(-(i * i) / 2);
    const x = centerX + (i * (width / 8));
    points.push([x, centerY - y]);
  }

  const pathData = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

  // Alex's position
  const selfX = centerX + (zscore * (width / 8));

  return (
    <svg width={width} height={height} className="bg-cream-50 rounded-lg border border-cream-300">
      {/* Curve */}
      <path d={pathData} fill="none" stroke="#B8906F" strokeWidth="2" />

      {/* Zero line */}
      <line x1={centerX} y1={centerY - 5} x2={centerX} y2={centerY + 10} stroke="#E8E0D4" strokeWidth="1" />

      {/* Alex's position marker */}
      <circle cx={selfX} cy={centerY - 5} r="4" fill="#B07070" />
      <line x1={selfX} y1={centerY - 5} x2={selfX} y2={centerY + 8} stroke="#B07070" strokeWidth="1" strokeDasharray="2,2" />

      {/* Labels */}
      <text x="10" y={height - 5} fontSize="10" fill="#9B958E">
        -3σ
      </text>
      <text x={centerX - 8} y={height - 5} fontSize="10" fill="#9B958E">
        0
      </text>
      <text x={width - 20} y={height - 5} fontSize="10" fill="#9B958E">
        +3σ
      </text>
    </svg>
  );
}

// ============================================================================
// EXPANDABLE TRAIT CARD
// ============================================================================
interface TraitCardProps {
  item: typeof PRS_ESTIMATES[0];
}

function TraitCard({ item }: TraitCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case "low":
        return "success";
      case "high":
        return "danger";
      case "elevated":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <div className="bg-white border border-cream-300 rounded-2xl p-4 transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex-1 text-left">
          <p className="text-title font-semibold text-stone-800">{item.trait}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={getBadgeVariant(item.risk_category)}>
              {item.risk_category.charAt(0).toUpperCase() + item.risk_category.slice(1)}
            </Badge>
            <span className="text-body text-stone-600">
              <span className="font-semibold">{item.percentile}</span>th percentile
            </span>
            <span className="text-caption text-stone-400">z={item.score.toFixed(2)}</span>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-copper" />
          ) : (
            <ChevronDown className="w-5 h-5 text-copper" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-cream-200 space-y-4">
          {/* Distribution curve */}
          <div>
            <p className="text-caption font-semibold text-stone-500 mb-2">Your Position in Population</p>
            <NormalDistributionCurve zscore={item.score} trait={item.trait} />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-caption text-stone-400 uppercase tracking-wide">Contributing SNPs</p>
              <p className="text-heading font-semibold text-copper mt-1">{item.contributing_snps}</p>
            </div>
            <div>
              <p className="text-caption text-stone-400 uppercase tracking-wide">Population</p>
              <p className="text-body text-stone-700 mt-1">{item.population_reference}</p>
            </div>
          </div>

          {/* Interpretation */}
          <div>
            <p className="text-caption text-stone-400 uppercase tracking-wide mb-2">Clinical Interpretation</p>
            <p className="text-body text-stone-700 leading-relaxed italic">{item.interpretation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function PRSPage() {
  // Sort by percentile descending (highest risk first)
  const sortedTraits = useMemo(() => {
    return [...PRS_ESTIMATES].sort((a, b) => b.percentile - a.percentile);
  }, []);

  // Calculate summary statistics
  const totalTraits = PRS_ESTIMATES.length;
  const elevatedRisks = PRS_ESTIMATES.filter(
    (p) => p.risk_category === "elevated" || p.risk_category === "high"
  ).length;

  // Risk category breakdown for summary bar
  const riskBreakdown = useMemo(() => {
    const low = PRS_ESTIMATES.filter((p) => p.risk_category === "low").length;
    const average = PRS_ESTIMATES.filter((p) => p.risk_category === "average").length;
    const elevated = PRS_ESTIMATES.filter((p) => p.risk_category === "elevated").length;
    const high = PRS_ESTIMATES.filter((p) => p.risk_category === "high").length;
    return { low, average, elevated, high };
  }, []);

  // Distribution plot data
  const distributionData = useMemo(() => {
    return sortedTraits.map((trait) => ({
      name: trait.trait.split(" ").slice(0, 2).join(" "),
      score: trait.score,
      category: trait.risk_category,
    }));
  }, [sortedTraits]);

  // Bar colors based on category
  const getBarColor = (category: string) => {
    switch (category) {
      case "low":
        return "#6B8F71";
      case "average":
        return "#C4956A";
      case "elevated":
        return "#C4956A";
      case "high":
        return "#B07070";
      default:
        return "#7B8FA4";
    }
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Page title */}
      <div>
        <h1 className="text-display font-serif text-stone-900">Polygenic Risk Scores</h1>
        <p className="text-body text-stone-500 mt-2">
          Genetic risk assessment across multiple health traits based on common variants
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-slate-light rounded-xl">
              <Activity className="w-5 h-5 text-slate-dark" />
            </div>
            <div className="flex-1">
              <p className="text-caption text-stone-400 uppercase tracking-wide">Total Traits Assessed</p>
              <p className="text-display font-serif text-copper mt-1">{totalTraits}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-rose-light rounded-xl">
              <AlertTriangle className="w-5 h-5 text-rose-dark" />
            </div>
            <div className="flex-1">
              <p className="text-caption text-stone-400 uppercase tracking-wide">Elevated Risks</p>
              <p className="text-display font-serif text-rose mt-1">{elevatedRisks}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-plum-light rounded-xl">
              <Globe className="w-5 h-5 text-plum-dark" />
            </div>
            <div className="flex-1">
              <p className="text-caption text-stone-400 uppercase tracking-wide">Population Reference</p>
              <p className="text-title font-semibold text-stone-700 mt-1">East Asian</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Risk Category Summary Bar */}
      <Card>
        <p className="text-caption text-stone-400 uppercase tracking-wide mb-3">Risk Distribution</p>
        <div className="flex items-center gap-2 h-12 bg-cream-50 rounded-xl p-1 overflow-hidden">
          {riskBreakdown.low > 0 && (
            <div
              style={{ width: `${(riskBreakdown.low / totalTraits) * 100}%` }}
              className="h-full bg-sage rounded-lg flex items-center justify-center"
            >
              {riskBreakdown.low > 1 && <span className="text-micro font-bold text-white">{riskBreakdown.low}</span>}
            </div>
          )}
          {riskBreakdown.average > 0 && (
            <div
              style={{ width: `${(riskBreakdown.average / totalTraits) * 100}%` }}
              className="h-full bg-amber rounded-lg flex items-center justify-center"
            >
              {riskBreakdown.average > 1 && <span className="text-micro font-bold text-white">{riskBreakdown.average}</span>}
            </div>
          )}
          {riskBreakdown.elevated > 0 && (
            <div
              style={{ width: `${(riskBreakdown.elevated / totalTraits) * 100}%` }}
              className="h-full bg-amber rounded-lg flex items-center justify-center"
            >
              {riskBreakdown.elevated > 1 && <span className="text-micro font-bold text-white">{riskBreakdown.elevated}</span>}
            </div>
          )}
          {riskBreakdown.high > 0 && (
            <div
              style={{ width: `${(riskBreakdown.high / totalTraits) * 100}%` }}
              className="h-full bg-rose rounded-lg flex items-center justify-center"
            >
              {riskBreakdown.high > 1 && <span className="text-micro font-bold text-white">{riskBreakdown.high}</span>}
            </div>
          )}
        </div>
        <div className="flex gap-6 mt-3 text-caption text-stone-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sage"></div>
            <span>Low ({riskBreakdown.low})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber"></div>
            <span>Average ({riskBreakdown.average})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose"></div>
            <span>Elevated+ ({riskBreakdown.elevated + riskBreakdown.high})</span>
          </div>
        </div>
      </Card>

      {/* Gauge Charts Grid — Visual Centerpiece */}
      <Card>
        <SectionTitle icon={Activity} title="Risk Gauge Dashboard" subtitle="Interactive health metrics" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mt-6">
          {PRS_ESTIMATES.map((prs) => (
            <GaugeChart
              key={prs.trait}
              percentile={prs.percentile}
              trait={prs.trait}
              risk_category={prs.risk_category}
              contributing_snps={prs.contributing_snps}
            />
          ))}
        </div>
      </Card>

      {/* Z-Score Distribution Plot */}
      <Card>
        <SectionTitle icon={Activity} title="Z-Score Distribution" subtitle="Positive = elevated, Negative = protective" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={distributionData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 200, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
            <XAxis type="number" tick={{ fill: "#7A756F", fontSize: 12 }} axisLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fill: "#7A756F", fontSize: 11 }} axisLine={false} width={190} />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid #E8E0D4",
                borderRadius: 12,
                fontSize: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
            />
            <Bar dataKey="score" fill="#B8906F" radius={[0, 6, 6, 0]}>
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Trait Table */}
      <Card>
        <SectionTitle icon={Activity} title="Detailed Trait Analysis" subtitle="Sorted by percentile (highest risk first)" />
        <div className="space-y-3 mt-4">
          {sortedTraits.map((trait) => (
            <TraitCard key={trait.trait} item={trait} />
          ))}
        </div>
      </Card>

      {/* Methodology Note */}
      <Card accent className="bg-slate-light/10 border-slate/20">
        <div className="flex gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <AlertTriangle className="w-5 h-5 text-slate-dark" />
          </div>
          <div className="flex-1">
            <p className="text-title font-semibold text-slate-dark">PRS Limitations</p>
            <p className="text-body text-slate-dark/75 mt-2 leading-relaxed">
              Polygenic Risk Scores estimate disease risk based on common genetic variants identified in genome-wide association studies (GWAS). They do not account for environmental factors, gene-gene interactions, or rare variants. PRS are population-specific (calibrated for East Asian ancestry here) and should not be used for diagnosis. Results should be interpreted in the context of family history, lifestyle, and clinical assessment by a healthcare provider.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
