# HealthPilot

A precision-health dashboard that turns genomic data, blood biomarkers, continuous glucose monitoring, supplements, and family history into a single coherent, beautiful interface.

> **Demo build.** All data in this repository is fictional (the "Alex Morgan" family). rsIDs have been replaced with placeholder identifiers (rs90000xxx). Lab values, medical records, and genomic variants are illustrative and not for clinical use.

---

## Vision

Most consumer health apps either tell you *what* (a number on a chart) or *what to do* (a generic recommendation), but rarely *why* — the biological reason a recommendation applies to *you*. HealthPilot is an attempt to bridge that gap by:

1. Treating the genome as a permanent reference layer, not a one-time report.
2. Showing every recommendation grounded in a specific variant, biomarker, or pattern.
3. Integrating real-time inputs (CGM, food log) with slow-changing inputs (genome, family history, lab work).
4. Building a *family-aware* picture — risk that lives in lineage, not just one person.

The aim is for someone to open the app and, in under a minute, understand: *what is going on in my body right now, why, and what would meaningfully change it*.

---

## Modules

The app is organized into seventeen modules accessible from a left-rail navigation:

| Module | Purpose |
|---|---|
| **Dashboard** | Daily health score, KPI tiles, weekly trends, wellness radar |
| **Genomics** | 18 annotated variants with composite pathway scores |
| **Glucose & Diet** *(new)* | 24-hour continuous glucose trace, time-in-range, meal-glucose correlation, calorie-scan UI, food database |
| **Supplements** | Protocol with conflict detection and synergies |
| **Diet & Nutrition** | Meals, macro rings, weekly calorie trend |
| **Fitness** | Workout sessions and exercise demos |
| **Medical Records** | Lab and visit history with abnormal-flag tracking |
| **Genome Tracker** | Annotation table linked to publications |
| **Medicine Checker** | Drug-genome interaction lookup |
| **Blood Work** | Biomarkers grouped by category, with sparklines |
| **Family Hub** | Multi-member health overview |
| **Offspring Risk** | Punnett-square inheritance projections |
| **Pathway Enrichment** | Genomic pathway enrichment view |
| **GWAS & Disease** | Genome-wide association references |
| **Family Comparison** | Self vs partner genotype comparison |
| **Polygenic Risk** | PRS distribution plots |
| **Pharmacogenomics** | Drug metabolism profile |

---

## The new piece: Glucose & Diet

The latest module integrates continuous glucose monitoring with food logging:

- **24-hour CGM trace** — area chart with the in-range band (3.9–7.8 mmol/L) overlaid, meal events marked at the time of consumption.
- **Time-in-Range** — daily and 7-day breakdown with the 70% ADA target.
- **Calorie Scan** — camera-style UI that simulates AI food recognition; on selection, shows calories, macros, and predicted glucose impact.
- **Diet Logbook** — every meal correlated against the actual CGM trace (baseline → peak, net spike, verdict).
- **Glycemic Insights** — pattern detection that ties lunchtime spikes to specific foods and pulls in genome context (e.g. "your TCF7L2 variant amplifies carb sensitivity").
- **Food Database** — searchable list of 25 common foods with GI and glucose-impact ratings.

The CGM data shape mirrors a real Sibionics sensor export (5-minute readings, mmol/L). Demo data is downsampled to 15-minute intervals (96 points / 24 hours) for chart performance.

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages (one folder per route)
│   ├── dashboard/
│   ├── glucose/            # CGM + diet logbook
│   ├── genomics/
│   ├── ...
│   └── api/                # API routes (mock endpoints)
├── components/
│   ├── ui/                 # Card, Badge, StatCard, ProgressRing, Sparkline, SectionTitle
│   └── layout/             # Sidebar, Header
├── data/                   # Demo seed data (genomics, blood, glucose, etc.)
└── lib/                    # cn() utility, types
```

Data flows from `src/data/*.ts` (typed seed data) into each module page. Pages are mostly client components ("use client") because the charts and interactions are stateful. There are no external services in this build — the mock API routes return data shaped from the same seed files so the architecture is ready to swap in a real backend.

---

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript** with strict mode
- **Tailwind CSS** with a custom cream/copper palette
- **Recharts** for line / bar / area / radar charts
- **Lucide React** for icons
- **Playfair Display + Inter** typography (Google Fonts)

The styling is deliberately editorial rather than "medical-app" — warm neutrals, serif headings, restrained shadows, muted semantic colors (sage, amber, rose, slate, plum). Theme tokens live in `tailwind.config.ts` and `src/app/globals.css`.

---

## Quick start

```bash
git clone https://github.com/Drjackxiaoyuchen/HealthPilot-Demo.git
cd HealthPilot-Demo
npm install
npm run dev
```

Open http://localhost:3000.

To build for production:

```bash
npm run build
npm run start
```

---

## Data privacy

This repository contains **only fictional demo data**. The original development was done against a real personal genome and CGM trace; before any sharing, all of that was anonymized:

- All real names replaced with the fictional "Morgan" family (Alex, Jordan, Robert, Linda).
- All 30 real rsIDs replaced with placeholder rs90000xxx identifiers.
- Selected genotypes shifted so the demo profile no longer matches any real individual.
- Real facility, lab, and city names replaced with generic placeholders.

The audit script lives in `scripts/anonymize.py` (not included in this public repo) and is re-run any time new modules are added.

---

## Roadmap

Near-term:

- [ ] Dark mode (cream/charcoal pair)
- [ ] Mobile-friendly layout (sidebar collapses, charts reflow)
- [ ] Real Sibionics CGM importer (CSV / xlsx upload → seed)
- [ ] Apple Health / Google Fit ingestion
- [ ] Persistent storage (Postgres + Drizzle ORM)

Medium-term:

- [ ] Real food-recognition model on top of the calorie-scan UI
- [ ] Pharmacogenomic dosing calculator with FDA label warnings
- [ ] Family invite + shared offspring-risk view (proper auth)
- [ ] Whole-genome variant browser (currently only ~30 annotated SNPs)

Long-term:

- [ ] Multi-omics overlay (proteomics, metabolomics)
- [ ] Time-aware recommendation engine that re-ranks suggestions as new lab data arrives

---

## Contributing

This is currently a single-person demo, but contributions are welcome:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-thing`)
3. Commit with a clear message
4. Open a PR

Please don't add any real personal data to this repository — the seed files are the source of truth and should remain fictional.

---

## License

Demo / educational use only. No warranty. Not for clinical decisions.
