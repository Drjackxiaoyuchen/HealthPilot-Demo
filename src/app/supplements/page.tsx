"use client";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { Pill, CheckCircle, AlertTriangle, Shield } from "lucide-react";
import { SUPPLEMENTS, SUPPLEMENT_CONFLICTS } from "@/data/seed";

export default function SupplementsPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Pill} label="Active Supplements" value={SUPPLEMENTS.length} color="copper" />
        <StatCard icon={CheckCircle} label="Gene-Matched" value={SUPPLEMENTS.filter(s => s.related_gene).length} color="green" />
        <StatCard icon={AlertTriangle} label="Conflicts Found" value={SUPPLEMENT_CONFLICTS.filter(c => c.severity === "critical").length} color="red" />
      </div>

      <Card>
        <SectionTitle icon={Pill} title="Current Supplement Stack" subtitle="Genetically personalized protocol" />
        <div className="flex flex-col gap-2.5">
          {SUPPLEMENTS.map(s => (
            <div key={s.id} className="flex items-center gap-4 p-4 bg-cream-100 rounded-xl border border-cream-300 hover:shadow-elevated transition-all">
              <div className={`w-2 h-2 rounded-full shrink-0 ${s.priority === "high" ? "bg-sage" : s.priority === "medium" ? "bg-amber" : "bg-stone-300"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-body font-medium text-stone-800">{s.name}</div>
                <div className="text-caption text-stone-400 mt-0.5">{s.reason}</div>
              </div>
              <Badge variant="info">{s.dose}</Badge>
              <span className="text-caption text-stone-400 w-20 text-center capitalize">{s.time_of_day.replace("_", " ")}</span>
              {s.related_gene && <Badge variant="purple">{s.related_gene}</Badge>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Shield} title="Interaction Matrix" subtitle="Synergies, cautions & conflicts" />
        <div className="flex flex-col gap-2.5">
          {SUPPLEMENT_CONFLICTS.map((c, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${
              c.severity === "critical" ? "bg-rose-light border-rose/15" :
              c.severity === "caution" ? "bg-amber-light border-amber/15" :
              "bg-sage-light border-sage/15"
            }`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-micro font-semibold ${
                c.severity === "critical" ? "bg-rose/10 text-rose" :
                c.severity === "caution" ? "bg-amber/10 text-amber" :
                "bg-sage/10 text-sage"
              }`}>{c.severity === "critical" ? "!" : c.severity === "caution" ? "!" : "OK"}</div>
              <div className="flex-1">
                <span className="font-medium text-stone-700 text-body">{c.supplement1}</span>
                <span className="text-stone-400 text-body"> + </span>
                <span className="font-medium text-stone-700 text-body">{c.supplement2}</span>
              </div>
              <Badge variant={c.severity === "critical" ? "danger" : c.severity === "caution" ? "warning" : "success"}>{c.severity}</Badge>
              <span className="text-caption text-stone-500 max-w-[320px]">{c.note}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
