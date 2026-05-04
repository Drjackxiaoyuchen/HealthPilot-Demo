"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { Sparkline } from "@/components/ui/sparkline";
import { FlaskConical, CheckCircle, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { BLOOD_MARKERS } from "@/data/seed";

export default function BloodworkPage() {
  const markers = BLOOD_MARKERS.map(m => ({ ...m, history: JSON.parse(m.history) }));
  const categories = [...new Set(markers.map(m => m.category))];
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const optimalCount = markers.filter(m => m.status === "optimal").length;
  const avgPct = markers.reduce((s, m) => {
    const pct = m.reference_high > 0 ? ((m.value - m.reference_low) / (m.reference_high - m.reference_low)) * 100 : 50;
    return s + Math.min(Math.max(pct, 0), 100);
  }, 0) / markers.length;

  return (
    <div className="flex flex-col gap-7">
      {/* Summary panel — all key metrics at a glance */}
      <Card className="p-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-micro text-stone-400 uppercase tracking-[0.12em] font-medium mb-1">Biomarker Dashboard</div>
            <h2 className="font-serif text-[26px] font-semibold text-stone-800 tracking-tight">Blood Work Overview</h2>
            <p className="text-body text-stone-500 mt-1">Last tested: April 1, 2026 — Sample Medical Center</p>
          </div>
          <div className="flex gap-4 text-center">
            <div className="px-4 py-3 bg-cream-100 rounded-xl border border-cream-300">
              <div className="text-[24px] font-serif font-semibold text-stone-800">{markers.length}</div>
              <div className="text-micro text-stone-400 font-medium mt-0.5">Tracked</div>
            </div>
            <div className="px-4 py-3 bg-sage-light rounded-xl border border-sage/15">
              <div className="text-[24px] font-serif font-semibold text-sage">{optimalCount}</div>
              <div className="text-micro text-stone-400 font-medium mt-0.5">Optimal</div>
            </div>
            <div className="px-4 py-3 bg-amber-light rounded-xl border border-amber/15">
              <div className="text-[24px] font-serif font-semibold text-amber">{markers.length - optimalCount}</div>
              <div className="text-micro text-stone-400 font-medium mt-0.5">Average</div>
            </div>
          </div>
        </div>

        {/* Quick summary grid */}
        <div className="grid grid-cols-4 gap-3">
          {markers.slice(0, 8).map((m, i) => {
            const pct = m.reference_high > 0 ? ((m.value - m.reference_low) / (m.reference_high - m.reference_low)) * 100 : 50;
            return (
              <div key={i} onClick={() => setSelectedMarker(i)}
                className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-elevated ${
                  selectedMarker === i ? "bg-copper-50 border-copper/20" : "bg-cream-100 border-cream-300"
                }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-micro font-medium text-stone-600 truncate">{m.marker}</span>
                  <div className={`w-2 h-2 rounded-full ${m.status === "optimal" ? "bg-sage" : "bg-amber"}`} />
                </div>
                <div className="text-[18px] font-serif font-semibold text-stone-800">
                  {m.value} <span className="text-micro text-stone-400 font-sans font-normal">{m.unit}</span>
                </div>
                <div className="mt-1.5 h-1 bg-cream-300 rounded-full relative overflow-hidden">
                  <div className={`absolute left-0 top-0 h-full rounded-full ${m.status === "optimal" ? "bg-sage" : "bg-amber"}`}
                    style={{ width: `${Math.min(Math.max(pct, 5), 95)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected marker detail */}
      {selectedMarker !== null && (
        <Card accent>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-title text-stone-800">{markers[selectedMarker].marker}</h3>
              <p className="text-caption text-stone-400 mt-0.5">{markers[selectedMarker].category} · Last tested {markers[selectedMarker].test_date}</p>
            </div>
            <Badge variant={markers[selectedMarker].status === "optimal" ? "success" : "warning"}>
              {markers[selectedMarker].status}
            </Badge>
          </div>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-6 mt-5">
            <div>
              <div className="text-micro text-stone-400 font-medium uppercase tracking-wide mb-1">Current Value</div>
              <div className="text-[32px] font-serif font-semibold text-stone-800">
                {markers[selectedMarker].value}
                <span className="text-body text-stone-400 font-sans ml-1">{markers[selectedMarker].unit}</span>
              </div>
              <div className="text-caption text-stone-400 mt-1">
                Reference: {markers[selectedMarker].reference_low}–{markers[selectedMarker].reference_high} {markers[selectedMarker].unit}
              </div>
              {/* Range bar */}
              <div className="mt-3 relative">
                <div className="h-2 bg-cream-300 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${markers[selectedMarker].status === "optimal" ? "bg-sage" : "bg-amber"}`}
                    style={{ width: `${Math.min(Math.max(((markers[selectedMarker].value - markers[selectedMarker].reference_low) / (markers[selectedMarker].reference_high - markers[selectedMarker].reference_low)) * 100, 5), 95)}%` }} />
                </div>
                <div className="flex justify-between text-micro text-stone-300 mt-1">
                  <span>{markers[selectedMarker].reference_low}</span>
                  <span>{markers[selectedMarker].reference_high}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-micro text-stone-400 font-medium uppercase tracking-wide mb-1">Trend (last 5 tests)</div>
              <div className="flex items-center gap-2">
                <Sparkline data={markers[selectedMarker].history} color={markers[selectedMarker].status === "optimal" ? "#6B8F71" : "#C4956A"} width={180} height={60} />
              </div>
              <div className="flex gap-2 mt-2 text-micro text-stone-400">
                {markers[selectedMarker].history.map((v: number, j: number) => (
                  <span key={j} className="font-mono">{v}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${markers[selectedMarker].status === "optimal" ? "bg-sage-light" : "bg-amber-light"}`}>
                {markers[selectedMarker].status === "optimal"
                  ? <CheckCircle size={32} strokeWidth={1.5} className="text-sage" />
                  : <TrendingUp size={32} strokeWidth={1.5} className="text-amber" />}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Category-grouped detail cards */}
      {categories.map(cat => {
        const ms = markers.filter(m => m.category === cat);
        return (
          <Card key={cat}>
            <SectionTitle icon={FlaskConical} title={cat} subtitle={`${ms.length} markers`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ms.map((m, i) => {
                const pct = m.reference_high > 0 ? ((m.value - m.reference_low) / (m.reference_high - m.reference_low)) * 100 : 50;
                const globalIdx = markers.findIndex(x => x.id === m.id);
                return (
                  <div key={i}
                    onClick={() => setSelectedMarker(globalIdx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-elevated ${
                      selectedMarker === globalIdx ? "bg-copper-50 border-copper/20" : "bg-cream-100 border-cream-300"
                    }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-body font-medium text-stone-800">{m.marker}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.status === "optimal" ? "success" : "warning"}>{m.status}</Badge>
                        <ChevronRight size={13} className="text-stone-300" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-[22px] font-serif font-semibold text-stone-800">
                          {m.value} <span className="text-caption text-stone-400 font-sans font-normal">{m.unit}</span>
                        </div>
                        <div className="text-micro text-stone-400 mt-0.5">Ref: {m.reference_low}–{m.reference_high}</div>
                        <div className="mt-2 h-1 bg-cream-300 rounded-full relative overflow-hidden">
                          <div className={`absolute left-0 top-0 h-full rounded-full ${m.status === "optimal" ? "bg-sage" : "bg-amber"}`}
                            style={{ width: `${Math.min(Math.max(pct, 5), 95)}%` }} />
                        </div>
                      </div>
                      <Sparkline data={m.history} color={m.status === "optimal" ? "#6B8F71" : "#C4956A"} width={80} height={36} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
