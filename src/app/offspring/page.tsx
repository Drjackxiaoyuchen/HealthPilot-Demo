"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { Baby, AlertTriangle, Shield, Dna, CheckCircle, ChevronDown, ChevronUp, Activity, Brain, Flame, Droplets, Pill, HeartPulse, Syringe, BookOpen, Stethoscope } from "lucide-react";
import { OFFSPRING_RISK_ANALYSIS, OFFSPRING_DISEASE_MAP } from "@/data/seed";

// Categorize risks
const HIGH_RISK = OFFSPRING_RISK_ANALYSIS.filter(r => r.risk_level === "high");
const MODERATE_RISK = OFFSPRING_RISK_ANALYSIS.filter(r => r.risk_level === "moderate");
const LOW_RISK = OFFSPRING_RISK_ANALYSIS.filter(r => r.risk_level === "low");

// Category icon map
const CATEGORY_ICONS: Record<string, any> = {
  "Neuroplasticity": Brain,
  "Metabolic & Obesity": Activity,
  "Inflammation": Flame,
  "Vitamin D & Calcium": Droplets,
  "Sleep & Glucose": HeartPulse,
  "Pain & Reward": Pill,
  "Methylation & Folate": Dna,
  "Cardiovascular & Neuro": Shield,
  "Neurotransmitter": Brain,
  "Antioxidant Defense": Shield,
  "Detoxification": Droplets,
  "Pharmacogenomics": Pill,
  "Metabolic": Activity,
  "DNA Repair": Dna,
};

function PunnettSquare({ alex, sarah, gene }: { alex: string; sarah: string; gene: string }) {
  // Parse genotypes into alleles
  const selfAlleles = alex.length === 2 ? [alex[0], alex[1]] : ["?", "?"];
  const partnerAlleles = sarah.length === 2 ? [sarah[0], sarah[1]] : ["?", "?"];

  const outcomes = [
    selfAlleles[0] + partnerAlleles[0],
    selfAlleles[0] + partnerAlleles[1],
    selfAlleles[1] + partnerAlleles[0],
    selfAlleles[1] + partnerAlleles[1],
  ];

  // Count unique outcomes
  const counts: Record<string, number> = {};
  outcomes.forEach(o => {
    const sorted = o.split("").sort().join("");
    counts[sorted] = (counts[sorted] || 0) + 1;
  });

  return (
    <div className="inline-block">
      <table className="text-micro border-collapse">
        <thead>
          <tr>
            <th className="w-8 h-8 border border-cream-300 bg-cream-100 text-stone-400 font-medium"></th>
            <th className="w-10 h-8 border border-cream-300 bg-copper-50 text-copper-700 font-semibold text-center">{partnerAlleles[0]}</th>
            <th className="w-10 h-8 border border-cream-300 bg-copper-50 text-copper-700 font-semibold text-center">{partnerAlleles[1]}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="w-8 h-10 border border-cream-300 bg-slate-light text-slate-dark font-semibold text-center">{selfAlleles[0]}</td>
            <td className="w-10 h-10 border border-cream-300 text-center font-mono text-body font-medium text-stone-700">{outcomes[0]}</td>
            <td className="w-10 h-10 border border-cream-300 text-center font-mono text-body font-medium text-stone-700">{outcomes[1]}</td>
          </tr>
          <tr>
            <td className="w-8 h-10 border border-cream-300 bg-slate-light text-slate-dark font-semibold text-center">{selfAlleles[1]}</td>
            <td className="w-10 h-10 border border-cream-300 text-center font-mono text-body font-medium text-stone-700">{outcomes[2]}</td>
            <td className="w-10 h-10 border border-cream-300 text-center font-mono text-body font-medium text-stone-700">{outcomes[3]}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-1 flex gap-2 flex-wrap">
        {Object.entries(counts).map(([genotype, count]) => (
          <span key={genotype} className="text-micro text-stone-500">
            <span className="font-mono font-medium text-stone-700">{genotype}</span>: {(count / 4 * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function RiskCard({ risk, expanded, onToggle }: { risk: typeof OFFSPRING_RISK_ANALYSIS[0]; expanded: boolean; onToggle: () => void }) {
  const Icon = CATEGORY_ICONS[risk.category] || Dna;
  const bgClass = risk.risk_level === "high" ? "bg-rose-light border-rose/15" :
                  risk.risk_level === "moderate" ? "bg-amber-light border-amber/15" :
                  "bg-sage-light border-sage/15";

  // Extract raw genotype letters for Punnett square
  const selfRaw = risk.self_genotype.match(/^([A-Z]{2})/)?.[1] || "";
  const partnerRaw = risk.partner_genotype.match(/^([A-Z]{2})/)?.[1] || "";

  return (
    <div className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-elevated ${bgClass}`} onClick={onToggle}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            {risk.risk_level === "high" ? <AlertTriangle size={14} strokeWidth={1.5} className="text-rose" /> :
             risk.risk_level === "moderate" ? <Icon size={14} strokeWidth={1.5} className="text-amber" /> :
             <CheckCircle size={14} strokeWidth={1.5} className="text-sage" />}
            <span className="font-serif text-[15px] font-semibold text-stone-800">{risk.gene} — {risk.variant}</span>
            <Badge variant={risk.risk_level === "high" ? "danger" : risk.risk_level === "moderate" ? "warning" : "success"}>
              {risk.risk_level}
            </Badge>
          </div>

          <div className="text-caption text-stone-500 mb-2">{risk.category} · {risk.rsid}</div>

          {/* Parent genotypes side by side */}
          <div className="flex gap-4 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-micro font-medium text-slate uppercase tracking-wide">Alex</span>
              <span className="font-mono text-body text-stone-700 bg-white/60 px-2 py-0.5 rounded">{risk.self_genotype}</span>
            </div>
            <span className="text-stone-300">×</span>
            <div className="flex items-center gap-1.5">
              <span className="text-micro font-medium text-rose uppercase tracking-wide">Sarah</span>
              <span className="font-mono text-body text-stone-700 bg-white/60 px-2 py-0.5 rounded">{risk.partner_genotype}</span>
            </div>
          </div>

          {/* Offspring prediction */}
          <div className="flex items-center gap-2 mb-1">
            <Baby size={13} strokeWidth={1.5} className="text-copper" />
            <span className="text-body font-medium text-copper-700">Offspring: {risk.offspring_prediction}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={15} className="text-stone-300 mt-1" /> : <ChevronDown size={15} className="text-stone-300 mt-1" />}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-cream-300/50 space-y-4">
          {/* Punnett square */}
          {selfRaw.length === 2 && partnerRaw.length === 2 && (
            <div>
              <div className="text-micro font-medium text-stone-400 uppercase tracking-wide mb-2">Punnett Square</div>
              <div className="flex items-start gap-6">
                <div>
                  <div className="text-micro text-stone-400 mb-1">
                    <span className="text-slate font-medium">↓ Alex</span> / <span className="text-rose font-medium">Sarah →</span>
                  </div>
                  <PunnettSquare alex={selfRaw} sarah={partnerRaw} gene={risk.gene} />
                </div>
                <div className="flex-1">
                  <div className="text-micro font-medium text-stone-400 uppercase tracking-wide mb-1">Inheritance Pattern</div>
                  <p className="text-body text-stone-600">{risk.inheritance}</p>
                </div>
              </div>
            </div>
          )}

          {/* Clinical impact */}
          <div>
            <div className="text-micro font-medium text-stone-400 uppercase tracking-wide mb-1">Clinical Impact</div>
            <p className="text-body text-stone-600 leading-relaxed">{risk.impact}</p>
          </div>

          {/* Recommended action */}
          <div className="p-3 bg-copper-50 rounded-lg border border-copper/10">
            <div className="text-micro font-medium text-copper-700 uppercase tracking-wide mb-1">Recommended Action</div>
            <p className="text-body text-stone-600 leading-relaxed">{risk.action}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Risk summary visualization
function RiskSummaryBar() {
  const total = OFFSPRING_RISK_ANALYSIS.length;
  const high = HIGH_RISK.length;
  const moderate = MODERATE_RISK.length;
  const low = LOW_RISK.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex-1 h-4 rounded-full overflow-hidden flex bg-cream-200">
          <div className="bg-rose h-full transition-all" style={{ width: `${(high / total) * 100}%` }} />
          <div className="bg-amber h-full transition-all" style={{ width: `${(moderate / total) * 100}%` }} />
          <div className="bg-sage h-full transition-all" style={{ width: `${(low / total) * 100}%` }} />
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-rose" />
          <span className="text-caption text-stone-500">{high} high-risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber" />
          <span className="text-caption text-stone-500">{moderate} moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-sage" />
          <span className="text-caption text-stone-500">{low} low/favorable</span>
        </div>
      </div>
    </div>
  );
}

// Disease association panel for a single gene
function DiseasePanel({ entry, isOpen, onToggle }: {
  entry: typeof OFFSPRING_DISEASE_MAP[0]; isOpen: boolean; onToggle: () => void;
}) {
  const [expandedDisease, setExpandedDisease] = useState<number | null>(null);
  const [showPrevention, setShowPrevention] = useState(false);

  const severityOrder = { high: 0, moderate: 1, low: 2 };
  const sortedDiseases = [...entry.diseases].sort((a, b) =>
    (severityOrder[a.severity as keyof typeof severityOrder] || 2) - (severityOrder[b.severity as keyof typeof severityOrder] || 2)
  );

  return (
    <div className="border border-cream-300 rounded-xl overflow-hidden">
      {/* Gene header */}
      <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-cream-50 transition-colors" onClick={onToggle}>
        <div className="w-12 h-12 rounded-xl bg-plum-light flex items-center justify-center">
          <span className="font-serif text-[15px] font-bold text-plum">{entry.gene}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-serif text-title text-stone-800">{entry.gene} — Disease Associations</span>
            <Badge variant="purple">{entry.offspring_genotype}</Badge>
          </div>
          <div className="text-caption text-stone-500 mt-0.5">
            {entry.probability} offspring probability · {entry.diseases.length} associated conditions · {entry.prevention.length} prevention strategies
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-micro font-medium text-plum bg-plum-light px-2 py-1 rounded-md">{entry.rsid}</span>
          {isOpen ? <ChevronUp size={15} className="text-stone-300" /> : <ChevronDown size={15} className="text-stone-300" />}
        </div>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 space-y-4">
          {/* Disease list */}
          <div>
            <div className="flex items-center gap-2 mb-3 pt-3 border-t border-cream-200">
              <Stethoscope size={14} strokeWidth={1.5} className="text-rose" />
              <span className="text-micro font-medium text-stone-400 uppercase tracking-wide">Associated Diseases & Conditions</span>
            </div>
            <div className="space-y-2">
              {sortedDiseases.map((disease, i) => (
                <div key={i}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-subtle ${
                    disease.severity === "high" ? "bg-rose-light/50 border-rose/10" :
                    disease.severity === "moderate" ? "bg-amber-light/50 border-amber/10" :
                    "bg-cream-50 border-cream-300"
                  }`}
                  onClick={(e) => { e.stopPropagation(); setExpandedDisease(expandedDisease === i ? null : i); }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-body font-medium text-stone-800">{disease.name}</span>
                        <Badge variant={disease.severity === "high" ? "danger" : disease.severity === "moderate" ? "warning" : "default"}>
                          {disease.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-caption text-stone-500">
                        <span>Risk: <strong className="text-stone-700">{disease.risk_increase}</strong></span>
                        <span>Onset: <strong className="text-stone-700">{disease.onset}</strong></span>
                      </div>
                    </div>
                    {expandedDisease === i ? <ChevronUp size={13} className="text-stone-300 mt-1" /> : <ChevronDown size={13} className="text-stone-300 mt-1" />}
                  </div>

                  {expandedDisease === i && (
                    <div className="mt-3 pt-3 border-t border-cream-300/50 space-y-2">
                      <div>
                        <div className="text-micro font-medium text-stone-400 uppercase tracking-wide mb-1">Molecular Mechanism</div>
                        <p className="text-body text-stone-600 leading-relaxed">{disease.mechanism}</p>
                      </div>
                      <div>
                        <div className="text-micro font-medium text-stone-400 uppercase tracking-wide mb-1">Evidence</div>
                        <p className="text-caption text-stone-500 italic">{disease.evidence}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prevention strategies */}
          <div>
            <div className="flex items-center justify-between mb-3 pt-3 border-t border-cream-200">
              <div className="flex items-center gap-2">
                <Shield size={14} strokeWidth={1.5} className="text-sage" />
                <span className="text-micro font-medium text-stone-400 uppercase tracking-wide">Prevention & Intervention Strategies</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowPrevention(!showPrevention); }}
                className="text-micro font-medium text-copper hover:text-copper-dark transition-colors">
                {showPrevention ? "Hide" : "Show all"} ({entry.prevention.length})
              </button>
            </div>

            {/* Always show top 2 */}
            <div className="space-y-2">
              {(showPrevention ? entry.prevention : entry.prevention.slice(0, 2)).map((prev, i) => (
                <div key={i} className="p-3 rounded-lg bg-sage-light/40 border border-sage/10">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-body font-medium text-stone-800">{prev.strategy}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={prev.effectiveness === "High" ? "success" : "warning"}>{prev.effectiveness}</Badge>
                      <span className="text-micro text-stone-400">{prev.timing}</span>
                    </div>
                  </div>
                  <p className="text-caption text-stone-600 leading-relaxed">{prev.detail}</p>
                </div>
              ))}
              {!showPrevention && entry.prevention.length > 2 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowPrevention(true); }}
                  className="w-full p-2 rounded-lg border border-dashed border-cream-400 text-caption text-stone-400 hover:text-copper hover:border-copper/30 transition-colors">
                  + {entry.prevention.length - 2} more strategies
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OffspringPage() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [expandedDisease, setExpandedDisease] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <Card accent>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-copper-50 flex items-center justify-center">
            <Baby size={28} strokeWidth={1.5} className="text-copper" />
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-heading text-stone-800">Offspring Genomic Risk Analysis</h1>
            <p className="text-body text-stone-500 mt-1">
              Mendelian inheritance predictions for <strong className="text-stone-700">Alex Morgan × Sarah Morgan</strong> —
              analyzing {OFFSPRING_RISK_ANALYSIS.length} gene loci for harmful mutation potential
            </p>
          </div>
        </div>
      </Card>

      {/* Risk summary */}
      <Card>
        <SectionTitle icon={Activity} title="Risk Overview" subtitle="Distribution across all analyzed loci" />
        <RiskSummaryBar />
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-rose-light border border-rose/10">
            <div className="text-micro text-rose font-medium uppercase tracking-wide">Guaranteed Risk</div>
            <div className="font-serif text-[28px] font-semibold text-rose mt-1">{HIGH_RISK.length}</div>
            <div className="text-caption text-stone-500 mt-1">BDNF, FTO, IL-6 — 100% or 25% high-risk offspring</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-light border border-amber/10">
            <div className="text-micro text-amber font-medium uppercase tracking-wide">Monitor</div>
            <div className="font-serif text-[28px] font-semibold text-amber mt-1">{MODERATE_RISK.length}</div>
            <div className="text-caption text-stone-500 mt-1">VDR, MTNR1B, OPRM1 — shared variants need monitoring</div>
          </div>
          <div className="p-4 rounded-xl bg-sage-light border border-sage/10">
            <div className="text-micro text-sage font-medium uppercase tracking-wide">Favorable</div>
            <div className="font-serif text-[28px] font-semibold text-sage mt-1">{LOW_RISK.length}</div>
            <div className="text-caption text-stone-500 mt-1">APOE, MTHFR, COMT, SOD2 — protected by parental genotypes</div>
          </div>
        </div>
      </Card>

      {/* High risk section */}
      {HIGH_RISK.length > 0 && (
        <Card>
          <SectionTitle icon={AlertTriangle} title="High-Risk Variants" subtitle="Offspring guaranteed or highly likely to carry harmful genotypes" />
          <div className="flex flex-col gap-3">
            {HIGH_RISK.map((risk, i) => (
              <RiskCard key={risk.rsid} risk={risk}
                expanded={expandedCard === i}
                onToggle={() => setExpandedCard(expandedCard === i ? null : i)} />
            ))}
          </div>
        </Card>
      )}

      {/* Moderate risk section */}
      {MODERATE_RISK.length > 0 && (
        <Card>
          <SectionTitle icon={Dna} title="Moderate-Risk Variants" subtitle="Shared variants requiring monitoring in offspring" />
          <div className="flex flex-col gap-3">
            {MODERATE_RISK.map((risk, i) => {
              const idx = HIGH_RISK.length + i;
              return (
                <RiskCard key={risk.rsid} risk={risk}
                  expanded={expandedCard === idx}
                  onToggle={() => setExpandedCard(expandedCard === idx ? null : idx)} />
              );
            })}
          </div>
        </Card>
      )}

      {/* Low risk / favorable section */}
      {LOW_RISK.length > 0 && (
        <Card>
          <SectionTitle icon={CheckCircle} title="Favorable Variants" subtitle="Protected by complementary parental genotypes" />
          <div className="flex flex-col gap-3">
            {LOW_RISK.map((risk, i) => {
              const idx = HIGH_RISK.length + MODERATE_RISK.length + i;
              return (
                <RiskCard key={risk.rsid} risk={risk}
                  expanded={expandedCard === idx}
                  onToggle={() => setExpandedCard(expandedCard === idx ? null : idx)} />
              );
            })}
          </div>
        </Card>
      )}

      {/* Disease Association & Prevention Panel */}
      <Card>
        <SectionTitle icon={Stethoscope} title="Disease Associations & Prevention"
          subtitle={`${OFFSPRING_DISEASE_MAP.reduce((acc, e) => acc + e.diseases.length, 0)} conditions across ${OFFSPRING_DISEASE_MAP.length} risk genes — with evidence-based prevention strategies`} />

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="p-3 rounded-lg bg-plum-light border border-plum/10 text-center">
            <div className="font-serif text-[22px] font-semibold text-plum">{OFFSPRING_DISEASE_MAP.length}</div>
            <div className="text-micro text-stone-400">Risk Genes</div>
          </div>
          <div className="p-3 rounded-lg bg-rose-light border border-rose/10 text-center">
            <div className="font-serif text-[22px] font-semibold text-rose">
              {OFFSPRING_DISEASE_MAP.reduce((acc, e) => acc + e.diseases.filter(d => d.severity === "high").length, 0)}
            </div>
            <div className="text-micro text-stone-400">High-Severity</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-light border border-amber/10 text-center">
            <div className="font-serif text-[22px] font-semibold text-amber">
              {OFFSPRING_DISEASE_MAP.reduce((acc, e) => acc + e.diseases.filter(d => d.severity === "moderate").length, 0)}
            </div>
            <div className="text-micro text-stone-400">Moderate</div>
          </div>
          <div className="p-3 rounded-lg bg-sage-light border border-sage/10 text-center">
            <div className="font-serif text-[22px] font-semibold text-sage">
              {OFFSPRING_DISEASE_MAP.reduce((acc, e) => acc + e.prevention.length, 0)}
            </div>
            <div className="text-micro text-stone-400">Preventions</div>
          </div>
        </div>

        {/* Gene-by-gene disease panels */}
        <div className="space-y-3">
          {OFFSPRING_DISEASE_MAP.map((entry, i) => (
            <DiseasePanel key={entry.rsid} entry={entry}
              isOpen={expandedDisease === i}
              onToggle={() => setExpandedDisease(expandedDisease === i ? null : i)} />
          ))}
        </div>
      </Card>

      {/* Preconception action plan */}
      <Card>
        <SectionTitle icon={Shield} title="Preconception Action Plan" subtitle="Evidence-based recommendations for Alex × Sarah" />
        <div className="space-y-4">
          <div className="p-5 bg-rose-light rounded-xl border border-rose/15">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} strokeWidth={1.5} className="text-rose" />
              <span className="font-serif text-[15px] font-semibold text-rose-dark">Critical — Act Before Conception</span>
            </div>
            <div className="space-y-2 text-body text-stone-600 leading-relaxed">
              <p>• <strong className="text-stone-800">BDNF Met/Met offspring (100%):</strong> Begin maternal DHA supplementation (2g/day) during pregnancy. Plan for early aerobic activity programs post-birth. Consider genetic counseling.</p>
              <p>• <strong className="text-stone-800">IL-6 GG offspring (100%):</strong> Maternal anti-inflammatory diet during pregnancy. Breastfeeding recommended (anti-inflammatory cytokines). Mediterranean diet from weaning.</p>
            </div>
          </div>

          <div className="p-5 bg-amber-light rounded-xl border border-amber/15">
            <div className="flex items-center gap-2 mb-2">
              <Dna size={14} strokeWidth={1.5} className="text-amber" />
              <span className="font-serif text-[15px] font-semibold text-amber-dark">Important — Monitor & Screen</span>
            </div>
            <div className="space-y-2 text-body text-stone-600 leading-relaxed">
              <p>• <strong className="text-stone-800">FTO (25% AA risk):</strong> Newborn genetic screening for rs90000006. If AA — early pediatric nutritionist referral, structured meal plans, regular physical activity from toddler stage.</p>
              <p>• <strong className="text-stone-800">VDR BsmI (100% BB):</strong> Vitamin D3 400 IU/day from birth. Monitor 25-OH-D at 6 months and annually. Ensure adequate calcium.</p>
              <p>• <strong className="text-stone-800">MTNR1B (25% GG risk):</strong> If GG — establish strict meal timing from toddler stage. Monitor fasting glucose from adolescence.</p>
            </div>
          </div>

          <div className="p-5 bg-sage-light rounded-xl border border-sage/15">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} strokeWidth={1.5} className="text-sage" />
              <span className="font-serif text-[15px] font-semibold text-sage-dark">Favorable — No Special Action</span>
            </div>
            <div className="space-y-2 text-body text-stone-600 leading-relaxed">
              <p>• <strong className="text-stone-800">APOE:</strong> No e4 allele from either parent. 50% chance of protective e2. Best possible outcome for Alzheimer's risk.</p>
              <p>• <strong className="text-stone-800">MTHFR:</strong> Sarah's wildtype protects — no TT homozygous risk. Standard prenatal folate sufficient.</p>
              <p>• <strong className="text-stone-800">COMT:</strong> No Met/Met (worrier) offspring possible. Either warrior or balanced — both favorable.</p>
              <p>• <strong className="text-stone-800">SOD2:</strong> Both parents Ala/Ala — 100% efficient antioxidant defense in offspring.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 bg-cream-200 rounded-xl text-caption text-stone-400 leading-relaxed text-center">
        This analysis uses Mendelian inheritance models for single-gene variants. Actual phenotypic outcomes involve complex gene-gene interactions,
        epigenetics, and environmental factors. Consult a certified genetic counselor for clinical decision-making.
        Data sources: ClinVar, PharmGKB, gnomAD 2025-2026.
      </div>
    </div>
  );
}
