"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { FileText, MapPin, Star, Phone, Clock, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Dna } from "lucide-react";
import { TEST_HISTORY, RECOMMENDED_TESTS, NEARBY_HOSPITALS } from "@/data/seed";

export default function RecordsPage() {
  const [expandedHospital, setExpandedHospital] = useState<number | null>(null);

  const flaggedTests = TEST_HISTORY.filter(t => t.flag);
  const upcomingTests = RECOMMENDED_TESTS.filter(t => {
    const due = new Date(t.next_due);
    return due <= new Date("2026-12-31");
  });

  return (
    <div className="flex flex-col gap-7">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4">
        <Card accent className="text-center py-5">
          <div className="text-[26px] font-serif font-semibold text-stone-800">{TEST_HISTORY.length}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Tests Completed</div>
        </Card>
        <Card className="text-center py-5">
          <div className="text-[26px] font-serif font-semibold text-amber">{flaggedTests.length}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Past Flags</div>
        </Card>
        <Card className="text-center py-5">
          <div className="text-[26px] font-serif font-semibold text-copper">{upcomingTests.length}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Recommended Next</div>
        </Card>
        <Card className="text-center py-5">
          <div className="text-[26px] font-serif font-semibold text-sage">{TEST_HISTORY.filter(t => !t.flag).length}</div>
          <div className="text-caption text-stone-400 font-medium mt-1">Clear Results</div>
        </Card>
      </div>

      {/* Red flags and recommended tests */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <SectionTitle icon={AlertTriangle} title="Red Flags & Attention Items" subtitle="Past test results requiring follow-up" />
          <div className="flex flex-col gap-2.5">
            {flaggedTests.length === 0 ? (
              <div className="text-body text-stone-400 py-4 text-center">No active red flags</div>
            ) : (
              flaggedTests.map((t, i) => (
                <div key={i} className={`p-4 rounded-xl border ${
                  t.flag === "attention" ? "bg-rose-light border-rose/15" : "bg-amber-light border-amber/15"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-micro font-mono text-stone-400">{t.date}</span>
                    <Badge variant={t.flag === "attention" ? "danger" : "warning"}>{t.flag}</Badge>
                  </div>
                  <div className="text-body font-medium text-stone-800">{t.test}</div>
                  <div className="text-caption text-stone-500 mt-1">{t.result}</div>
                  <div className="text-micro text-stone-400 mt-1">{t.facility}</div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Dna} title="Recommended Tests" subtitle="Gene-informed testing schedule" />
          <div className="flex flex-col gap-2.5">
            {upcomingTests.slice(0, 6).map((t, i) => (
              <div key={i} className={`p-4 rounded-xl border ${
                t.urgency === "recommended" ? "bg-copper-50 border-copper/15" :
                t.urgency === "consider" ? "bg-slate-light border-slate/15" :
                "bg-cream-100 border-cream-300"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body font-medium text-stone-800">{t.test}</span>
                  <Badge variant={t.urgency === "recommended" ? "default" : t.urgency === "consider" ? "info" : "success"}>{t.urgency}</Badge>
                </div>
                <div className="text-caption text-stone-500">{t.reason}</div>
                <div className="flex items-center gap-3 mt-2 text-micro text-stone-400">
                  {t.gene && <span className="font-mono bg-plum-light text-plum-dark px-1.5 py-0.5 rounded">{t.gene}</span>}
                  <span>Every {t.interval}</span>
                  <span>Due: {t.next_due}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Test History Timeline */}
      <Card>
        <SectionTitle icon={FileText} title="Complete Test History" subtitle="All diagnostic tests and results" />
        <div className="relative pl-6">
          <div className="absolute left-[9px] top-0 bottom-0 w-[1px] bg-cream-300" />
          <div className="flex flex-col gap-3">
            {TEST_HISTORY.map((t, i) => (
              <div key={i} className="relative pl-6">
                <div className={`absolute left-[-7px] top-3 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-cream-100 ${
                  t.flag === "attention" ? "bg-rose" : t.flag === "borderline" ? "bg-amber" : "bg-sage"
                }`}>
                  {t.flag ? <AlertTriangle size={8} className="text-white" /> : <CheckCircle size={8} className="text-white" />}
                </div>
                <div className={`p-3.5 bg-cream-100 rounded-xl border hover:shadow-elevated transition-all ${
                  t.flag ? "border-amber/15" : "border-cream-300"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-micro font-mono text-stone-400">{t.date}</span>
                    {t.flag && <Badge variant={t.flag === "attention" ? "danger" : "warning"}>{t.flag}</Badge>}
                  </div>
                  <div className="text-body font-medium text-stone-800">{t.test}</div>
                  <div className="text-caption text-stone-500 mt-0.5">{t.result}</div>
                  <div className="text-micro text-stone-400 mt-0.5">{t.facility}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Nearby Hospitals Map */}
      <Card>
        <SectionTitle icon={MapPin} title="Nearby Hospitals" subtitle="Top-rated facilities in Demo City" />
        <div className="grid grid-cols-1 gap-3">
          {NEARBY_HOSPITALS.map((h, i) => (
            <div key={i}
              className="p-4 bg-cream-100 rounded-xl border border-cream-300 hover:shadow-elevated transition-all cursor-pointer"
              onClick={() => setExpandedHospital(expandedHospital === i ? null : i)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-body font-medium text-stone-800">{h.name}</span>
                    <div className="flex items-center gap-0.5 text-amber">
                      <Star size={12} fill="currentColor" />
                      <span className="text-micro font-medium">{h.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-caption text-stone-400">
                    <span>{h.type}</span>
                    <span className="text-cream-400">|</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{h.distance}</span>
                    <span className="flex items-center gap-1"><Phone size={11} />{h.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-1 max-w-[300px] justify-end">
                    {h.specialties.slice(0, 3).map(s => <Badge key={s} variant="info">{s}</Badge>)}
                  </div>
                  {expandedHospital === i ? <ChevronUp size={15} className="text-stone-300 ml-2" /> : <ChevronDown size={15} className="text-stone-300 ml-2" />}
                </div>
              </div>
              {expandedHospital === i && (
                <div className="mt-3 pt-3 border-t border-cream-300 flex items-center gap-4 text-caption text-stone-500">
                  <span>Coordinates: {h.lat.toFixed(4)}°N, {h.lng.toFixed(4)}°E</span>
                  <a href={`https://maps.apple.com/?q=${h.name}&ll=${h.lat},${h.lng}`}
                    className="text-copper font-medium hover:underline" target="_blank" rel="noopener noreferrer">
                    Open in Maps
                  </a>
                  <a href={`tel:${h.phone}`} className="text-copper font-medium hover:underline">Call</a>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
