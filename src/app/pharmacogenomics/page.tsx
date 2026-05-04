"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Pill,
  AlertTriangle,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PHARMACOGENOMIC_PROFILE } from "@/data/enrichr-data";

// ============================================================================
// COLORS & STYLING
// ============================================================================

const PHENOTYPE_COLORS: Record<string, { bar: string; text: string }> = {
  "Poor Metabolizer": { bar: "#E8A9A0", text: "text-rose" },
  "Intermediate Metabolizer": { bar: "#F5C86B", text: "text-amber" },
  "Normal Metabolizer": { bar: "#8B9D83", text: "text-sage" },
  "Fast Metabolizer": { bar: "#8B9D83", text: "text-sage" },
  "Ultra-Rapid Metabolizer": { bar: "#9B7DB8", text: "text-plum" },
  "Standard Opioid Response": { bar: "#8B9D83", text: "text-sage" },
  "High-Activity Metabolizer": { bar: "#8B9D83", text: "text-sage" },
  "Low-Activity Metabolizer": { bar: "#F5C86B", text: "text-amber" },
  "Normal/Intermediate Metabolizer": { bar: "#8B9D83", text: "text-sage" },
  "Normal Activity": { bar: "#8B9D83", text: "text-sage" },
};

const EVIDENCE_COLORS: Record<string, string> = {
  "1A": "#8B9D83",     // sage - highest
  "1B": "#8B9D83",     // sage
  "2A": "#F5C86B",     // amber - moderate
  "2B": "#F5C86B",     // amber
  "3": "#E8A9A0",      // rose - lower
};

const SOURCE_COLORS: Record<string, string> = {
  CPIC: "#C4956A",     // copper
  DPWG: "#7B8FA4",     // slate
  PharmGKB: "#9B7DB8", // plum
};

const tooltipStyle = {
  background: "white",
  border: "1px solid #E8E0D4",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
};

// ============================================================================
// THERAPEUTIC DRUG CLASSES
// ============================================================================

const THERAPEUTIC_CLASSES: Record<string, string[]> = {
  "Pain Management": ["codeine", "tramadol", "morphine", "oxycodone", "fentanyl"],
  "Psychiatric": ["fluoxetine", "paroxetine", "aripiprazole", "citalopram", "escitalopram", "clozapine"],
  "Cardiac": ["metoprolol"],
  "GI": ["omeprazole", "pantoprazole"],
  "Oncology": ["chemotherapy agents", "mitomycin C", "doxorubicin"],
  "Other": ["caffeine", "theophylline", "tizanidine", "dopamine", "norepinephrine", "estrogen", "acetaminophen", "clopidogrel"],
};

// ============================================================================
// SUMMARY CARDS
// ============================================================================

function SummaryCards() {
  const totalInteractions = new Set(
    PHARMACOGENOMIC_PROFILE.flatMap((p) => p.affected_drugs)
  ).size;

  const actionableAlerts = PHARMACOGENOMIC_PROFILE.filter(
    (p) => ["1A", "1B", "2A"].includes(p.evidence_level)
  ).length;

  const level1ACount = PHARMACOGENOMIC_PROFILE.filter(
    (p) => p.evidence_level === "1A"
  ).length;

  const personsCount = new Set(
    PHARMACOGENOMIC_PROFILE.map((p) => p.person)
  ).size;

  const cards = [
    {
      icon: Pill,
      label: "Total Drug-Gene Interactions",
      value: totalInteractions.toString(),
      color: "text-copper",
    },
    {
      icon: AlertTriangle,
      label: "Actionable Alerts",
      value: actionableAlerts.toString(),
      color: "text-amber",
    },
    {
      icon: Award,
      label: "Evidence Level 1A",
      value: level1ACount.toString(),
      color: "text-sage",
    },
    {
      icon: Users,
      label: "Persons Profiled",
      value: personsCount.toString(),
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

// ============================================================================
// METABOLIZER PHENOTYPE OVERVIEW
// ============================================================================

function MetabolizerPhenotypeOverview() {
  const genePhotypes = useMemo(() => {
    const unique: Record<string, { gene: string; phenotypes: Record<string, number> }> = {};

    PHARMACOGENOMIC_PROFILE.forEach((profile) => {
      if (!unique[profile.gene]) {
        unique[profile.gene] = { gene: profile.gene, phenotypes: {} };
      }
      unique[profile.gene].phenotypes[profile.phenotype] =
        (unique[profile.gene].phenotypes[profile.phenotype] || 0) + 1;
    });

    return Object.values(unique).sort((a, b) => a.gene.localeCompare(b.gene));
  }, []);

  const getPhenotypeActivityRange = (phenotype: string): [number, number] => {
    const phenotypeMap: Record<string, [number, number]> = {
      "Poor Metabolizer": [0, 25],
      "Intermediate Metabolizer": [25, 50],
      "Normal Metabolizer": [50, 75],
      "Standard Opioid Response": [50, 75],
      "High-Activity Metabolizer": [75, 100],
      "Fast Metabolizer": [75, 100],
      "Ultra-Rapid Metabolizer": [75, 100],
      "Low-Activity Metabolizer": [25, 50],
      "Normal/Intermediate Metabolizer": [50, 75],
      "Normal Activity": [50, 75],
    };
    return phenotypeMap[phenotype] || [50, 75];
  };

  return (
    <Card className="mb-8 p-8">
      <SectionTitle icon={Award} title="Metabolizer Phenotype Overview" />
      <p className="text-body text-stone-600 mb-8">Activity levels by gene and person</p>

      <div className="space-y-6">
        {genePhotypes.map((gp) => {
          const allProfiles = PHARMACOGENOMIC_PROFILE.filter(
            (p) => p.gene === gp.gene
          );
          const selfProfile = allProfiles.find((p) => p.person === "Alex");
          const partnerProfile = allProfiles.find((p) => p.person === "Jordan");

          return (
            <div key={gp.gene} className="border-b border-cream-300 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-title font-serif text-stone-800">{gp.gene}</h4>
                <div className="flex gap-3 text-caption">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-copper"></div>
                    <span className="text-stone-600">Alex</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-plum"></div>
                    <span className="text-stone-600">Jordan</span>
                  </div>
                </div>
              </div>

              {(selfProfile || partnerProfile) && (
                <div className="space-y-3">
                  {selfProfile && (
                    <ActivityMeterBar
                      person="Alex"
                      phenotype={selfProfile.phenotype}
                      personColor="bg-copper"
                    />
                  )}
                  {partnerProfile && (
                    <ActivityMeterBar
                      person="Jordan"
                      phenotype={partnerProfile.phenotype}
                      personColor="bg-plum"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ActivityMeterBar({
  person,
  phenotype,
  personColor,
}: {
  person: string;
  phenotype: string;
  personColor: string;
}) {
  const [min, max] = (() => {
    const phenotypeMap: Record<string, [number, number]> = {
      "Poor Metabolizer": [12, 25],
      "Intermediate Metabolizer": [25, 50],
      "Normal Metabolizer": [50, 75],
      "Standard Opioid Response": [50, 75],
      "High-Activity Metabolizer": [75, 90],
      "Fast Metabolizer": [75, 90],
      "Ultra-Rapid Metabolizer": [85, 100],
      "Low-Activity Metabolizer": [25, 50],
      "Normal/Intermediate Metabolizer": [50, 75],
      "Normal Activity": [50, 75],
    };
    return phenotypeMap[phenotype] || [50, 75];
  })();

  const midpoint = (min + max) / 2;
  const barColor = PHENOTYPE_COLORS[phenotype]?.bar || "#8B9D83";

  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-caption font-medium text-stone-600">{person}</div>
      <div className="flex-1">
        <div className="relative h-8 bg-cream-100 rounded-full overflow-hidden border border-cream-300">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all"
            style={{
              backgroundColor: barColor,
              width: `${midpoint}%`,
            }}
          ></div>
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white ${personColor} shadow-md`}
            style={{ left: `calc(${midpoint}% - 8px)` }}
          ></div>
        </div>
      </div>
      <div className="w-40 text-caption font-medium text-stone-600">
        {phenotype}
      </div>
    </div>
  );
}

// ============================================================================
// DRUG RESPONSE MATRIX
// ============================================================================

function DrugResponseMatrix() {
  const drugIndex = useMemo(() => {
    const drugs: Record<string, Set<string>> = {};
    PHARMACOGENOMIC_PROFILE.forEach((p) => {
      p.affected_drugs.forEach((drug) => {
        const lowerDrug = drug.toLowerCase();
        if (!drugs[lowerDrug]) {
          drugs[lowerDrug] = new Set();
        }
        drugs[lowerDrug].add(p.gene);
      });
    });
    return drugs;
  }, []);

  const drugsByClass = useMemo(() => {
    const result: Record<string, string[]> = {};
    Object.keys(THERAPEUTIC_CLASSES).forEach((cls) => {
      result[cls] = THERAPEUTIC_CLASSES[cls].filter((d) =>
        Object.keys(drugIndex).some(
          (indexed) => indexed.toLowerCase() === d.toLowerCase()
        )
      );
    });
    return result;
  }, [drugIndex]);

  return (
    <Card className="mb-8 p-8">
      <SectionTitle icon={Pill} title="Drug Response Matrix" />
      <p className="text-body text-stone-600 mb-6">Gene-drug interactions by therapeutic class</p>

      <div className="space-y-8">
        {Object.entries(drugsByClass).map(([cls, drugs]) => {
          if (drugs.length === 0) return null;
          return (
            <div key={cls}>
              <h4 className="text-title font-serif text-stone-800 mb-4">{cls}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-cream-300">
                      <th className="text-left py-3 px-4 font-serif text-stone-700">Drug</th>
                      <th className="text-left py-3 px-4 font-serif text-stone-700">Gene</th>
                      <th className="text-left py-3 px-4 font-serif text-stone-700">Status</th>
                      <th className="text-left py-3 px-4 font-serif text-stone-700">Person(s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drugs.map((drug) => {
                      const profiles = PHARMACOGENOMIC_PROFILE.filter((p) =>
                        p.affected_drugs.some(
                          (d) => d.toLowerCase() === drug.toLowerCase()
                        )
                      );
                      return profiles.map((profile, idx) => (
                        <tr
                          key={`${drug}-${idx}`}
                          className="border-b border-cream-200 hover:bg-cream-50"
                        >
                          <td className="py-3 px-4 font-medium text-stone-700">
                            {idx === 0 ? drug : ""}
                          </td>
                          <td className="py-3 px-4 text-stone-600">{profile.gene}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                PHENOTYPE_COLORS[profile.phenotype]?.text || "text-sage"
                              }`}
                            >
                              {profile.phenotype}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-600">{profile.person}</td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// EVIDENCE LEVEL DISTRIBUTION
// ============================================================================

function EvidenceLevelDistribution() {
  const data = useMemo(() => {
    const counts: Record<string, number> = {
      "1A": 0,
      "1B": 0,
      "2A": 0,
      "2B": 0,
      "3": 0,
    };
    PHARMACOGENOMIC_PROFILE.forEach((p) => {
      counts[p.evidence_level]++;
    });
    return Object.entries(counts)
      .map(([level, count]) => ({ level, count }))
      .filter((d) => d.count > 0);
  }, []);

  const evidenceExplanation: Record<string, string> = {
    "1A": "Guideline-based clinical recommendations",
    "1B": "Guideline-based clinical recommendations",
    "2A": "Moderate clinical evidence",
    "2B": "Limited clinical evidence",
    "3": "Emerging evidence",
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const item = payload[0].payload;
      return (
        <div style={tooltipStyle}>
          <div className="font-semibold text-stone-800">Evidence Level {item.level}</div>
          <div className="text-micro text-stone-600 mt-1">{evidenceExplanation[item.level]}</div>
          <div className="text-micro font-medium text-stone-700 mt-1">{item.count} profile(s)</div>
        </div>
      );
    }
    return null;
  };

  const colors = data.map((d) => EVIDENCE_COLORS[d.level] || "#999");

  return (
    <Card className="mb-8 p-8">
      <SectionTitle icon={Award} title="Evidence Level Distribution" />
      <p className="text-body text-stone-600 mb-6">Clinical evidence strength by guideline level</p>

      <div className="flex items-start gap-12">
        <div className="flex-1" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="level"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.level} (${entry.count})`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-4 py-8">
          {Object.entries(evidenceExplanation).map(([level, desc]) => {
            const count = data.find((d) => d.level === level)?.count || 0;
            return (
              <div key={level} className="flex items-start gap-3">
                <div
                  className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: EVIDENCE_COLORS[level] }}
                ></div>
                <div>
                  <div className="font-serif font-semibold text-stone-800">Level {level}</div>
                  <div className="text-caption text-stone-600">{desc}</div>
                  <div className="text-micro text-stone-500 mt-1">{count} profile(s)</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// SELF VS PARTNER COMPARISON
// ============================================================================

function ComparisonView() {
  const selfProfiles = PHARMACOGENOMIC_PROFILE.filter((p) => p.person === "Alex");
  const partnerProfiles = PHARMACOGENOMIC_PROFILE.filter((p) => p.person === "Jordan");

  const sharedGenes = Array.from(
    new Set(
      selfProfiles
        .map((p) => p.gene)
        .filter((g) => partnerProfiles.some((p) => p.gene === g))
    )
  );

  return (
    <Card className="mb-8 p-8">
      <SectionTitle icon={Users} title="Alex vs Jordan Comparison" />
      <p className="text-body text-stone-600 mb-8">Pharmacogenomic profile comparison</p>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Alex's Profile */}
        <div>
          <h4 className="text-title font-serif text-stone-800 mb-4">Alex Morgan</h4>
          <div className="space-y-3">
            {selfProfiles.map((profile) => (
              <div
                key={`alex-${profile.gene}`}
                className="p-4 bg-cream-50 rounded-lg border border-cream-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-serif font-semibold text-stone-800">{profile.gene}</div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      PHENOTYPE_COLORS[profile.phenotype]?.text || "text-sage"
                    }`}
                  >
                    {profile.phenotype}
                  </span>
                </div>
                <div className="text-caption text-stone-600">{profile.genotype}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Jordan's Profile */}
        <div>
          <h4 className="text-title font-serif text-stone-800 mb-4">Jordan Morgan</h4>
          <div className="space-y-3">
            {partnerProfiles.map((profile) => (
              <div
                key={`jordan-${profile.gene}`}
                className="p-4 bg-cream-50 rounded-lg border border-cream-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-serif font-semibold text-stone-800">{profile.gene}</div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      PHENOTYPE_COLORS[profile.phenotype]?.text || "text-sage"
                    }`}
                  >
                    {profile.phenotype}
                  </span>
                </div>
                <div className="text-caption text-stone-600">{profile.genotype}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shared Genes Highlight */}
      {sharedGenes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h5 className="font-serif font-semibold text-stone-800 mb-4">Shared Genes</h5>
          <div className="space-y-3">
            {sharedGenes.map((gene) => {
              const selfProfile = selfProfiles.find((p) => p.gene === gene);
              const partnerProfile = partnerProfiles.find((p) => p.gene === gene);

              const sameStatus = selfProfile?.phenotype === partnerProfile?.phenotype;

              return (
                <div key={gene} className="flex items-center justify-between">
                  <div>
                    <div className="font-serif font-semibold text-stone-800">{gene}</div>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-caption">
                      <div>
                        <div className="text-stone-500">Alex: {selfProfile?.phenotype}</div>
                      </div>
                      <div>
                        <div className="text-stone-500">Jordan: {partnerProfile?.phenotype}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-serif text-stone-400">
                    {sameStatus ? "=" : "≠"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// CLINICAL ACTION CARDS
// ============================================================================

function ClinicalActionCards() {
  const actionsByUrgency = useMemo(() => {
    const critical = PHARMACOGENOMIC_PROFILE.filter((p) =>
      ["1A", "1B"].includes(p.evidence_level)
    );
    const moderate = PHARMACOGENOMIC_PROFILE.filter((p) =>
      ["2A", "2B"].includes(p.evidence_level)
    );
    const emerging = PHARMACOGENOMIC_PROFILE.filter((p) => p.evidence_level === "3");

    return { critical, moderate, emerging };
  }, []);

  const ActionCardItem = ({
    profile,
    urgency,
  }: {
    profile: typeof PHARMACOGENOMIC_PROFILE[0];
    urgency: "critical" | "moderate" | "emerging";
  }) => {
    const [expanded, setExpanded] = useState(false);
    const borderColor =
      urgency === "critical"
        ? "border-rose-300"
        : urgency === "moderate"
        ? "border-amber-300"
        : "border-slate-300";
    const bgColor =
      urgency === "critical"
        ? "bg-rose-50"
        : urgency === "moderate"
        ? "bg-amber-50"
        : "bg-slate-50";

    return (
      <div className={`border-2 ${borderColor} ${bgColor} rounded-lg p-4 mb-3`}>
        <button
          className="w-full text-left flex items-start justify-between hover:opacity-75 transition"
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <div className="font-serif font-semibold text-stone-800 flex items-center gap-2">
              {profile.gene}
              {profile.affected_drugs.slice(0, 2).map((drug, i) => (
                <span key={i} className="text-caption font-medium text-stone-600">
                  {drug}
                </span>
              ))}
            </div>
            <div className="text-caption text-stone-600 mt-1">{profile.clinical_action}</div>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                PHENOTYPE_COLORS[profile.phenotype]?.text || "text-sage"
              }`}
            >
              {profile.evidence_level}
            </span>
            {expanded ? (
              <ChevronUp size={18} className="text-stone-400" />
            ) : (
              <ChevronDown size={18} className="text-stone-400" />
            )}
          </div>
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-3">
            <div>
              <div className="text-micro font-semibold text-stone-700 uppercase">Phenotype</div>
              <div className="text-caption text-stone-600">{profile.phenotype}</div>
            </div>
            <div>
              <div className="text-micro font-semibold text-stone-700 uppercase">Genotype</div>
              <div className="text-caption text-stone-600 font-mono">{profile.genotype}</div>
            </div>
            <div>
              <div className="text-micro font-semibold text-stone-700 uppercase">Affected Drugs</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.affected_drugs.map((drug, i) => (
                  <span
                    key={i}
                    className="text-caption bg-white px-2 py-1 rounded border border-current border-opacity-20"
                  >
                    {drug}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <div>
                <div className="text-micro font-semibold text-stone-700 uppercase">Source</div>
                <span className="text-caption font-medium px-2 py-1 rounded-full" style={{ color: SOURCE_COLORS[profile.source] }}>
                  {profile.source}
                </span>
              </div>
              <div>
                <div className="text-micro font-semibold text-stone-700 uppercase">Person</div>
                <div className="text-caption text-stone-600">{profile.person}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-8 p-8">
      <SectionTitle icon={AlertTriangle} title="Clinical Action Cards" />
      <p className="text-body text-stone-600 mb-6">Prioritized actions by evidence strength</p>

      <div className="space-y-8">
        {/* Critical */}
        {actionsByUrgency.critical.length > 0 && (
          <div>
            <h4 className="text-title font-serif text-rose mb-4">High Priority (Level 1A/1B)</h4>
            {actionsByUrgency.critical.map((profile, idx) => (
              <ActionCardItem key={idx} profile={profile} urgency="critical" />
            ))}
          </div>
        )}

        {/* Moderate */}
        {actionsByUrgency.moderate.length > 0 && (
          <div>
            <h4 className="text-title font-serif text-amber mb-4">Moderate Priority (Level 2A/2B)</h4>
            {actionsByUrgency.moderate.map((profile, idx) => (
              <ActionCardItem key={idx} profile={profile} urgency="moderate" />
            ))}
          </div>
        )}

        {/* Emerging */}
        {actionsByUrgency.emerging.length > 0 && (
          <div>
            <h4 className="text-title font-serif text-slate mb-4">Emerging Evidence (Level 3)</h4>
            {actionsByUrgency.emerging.map((profile, idx) => (
              <ActionCardItem key={idx} profile={profile} urgency="emerging" />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// PHARMACOGENOMIC ID CARD
// ============================================================================

function PharmacogenomicIDCard() {
  const selfProfiles = PHARMACOGENOMIC_PROFILE.filter((p) => p.person === "Alex").slice(0, 3);
  const partnerProfiles = PHARMACOGENOMIC_PROFILE.filter((p) => p.person === "Jordan").slice(0, 3);

  const IDCardMini = ({
    name,
    profiles,
    bgGradient,
  }: {
    name: string;
    profiles: typeof PHARMACOGENOMIC_PROFILE;
    bgGradient: string;
  }) => {
    return (
      <div
        className={`rounded-xl p-6 text-white shadow-lg border border-opacity-30 border-white`}
        style={{
          background: bgGradient,
        }}
      >
        <div className="mb-6 pb-4 border-b border-white border-opacity-30">
          <div className="text-lg font-serif font-semibold">{name}</div>
          <div className="text-xs opacity-90">Pharmacogenomic Profile</div>
        </div>

        <div className="space-y-4 mb-6">
          {profiles.map((profile, idx) => (
            <div key={idx} className="text-xs">
              <div className="font-semibold">{profile.gene}</div>
              <div className="opacity-90">{profile.phenotype}</div>
              <div className="opacity-75 mt-1">
                {profile.affected_drugs.slice(0, 2).join(", ")}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white border-opacity-30">
          <div className="text-xs font-semibold opacity-90">EMERGENCY CONTACT</div>
          <div className="text-xs opacity-75 mt-1">
            Carry this card. Present to healthcare providers before medication prescription.
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-8 p-8">
      <SectionTitle icon={Users} title="Pharmacogenomic ID Cards" />
      <p className="text-body text-stone-600 mb-8">Medical alert cards for quick reference</p>

      <div className="grid grid-cols-2 gap-8">
        <IDCardMini
          name="Alex Morgan"
          profiles={selfProfiles}
          bgGradient="linear-gradient(135deg, #C4956A 0%, #A0754D 100%)"
        />
        <IDCardMini
          name="Jordan Morgan"
          profiles={partnerProfiles}
          bgGradient="linear-gradient(135deg, #9B7DB8 0%, #7A5F99 100%)"
        />
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function PharmacogenomicsPage() {
  return (
    <div className="min-h-screen bg-cream-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display font-serif text-stone-900 mb-2">Pharmacogenomics</h1>
          <p className="text-body text-stone-600">
            Precision medicine insights for personalized drug response and treatment optimization
          </p>
        </div>

        <SummaryCards />
        <MetabolizerPhenotypeOverview />
        <DrugResponseMatrix />
        <EvidenceLevelDistribution />
        <ComparisonView />
        <ClinicalActionCards />
        <PharmacogenomicIDCard />
      </div>
    </div>
  );
}
