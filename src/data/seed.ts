// Real genomic data for Alex Morgan — DemoGene sequencing (2026-03-31)
// 12.1M total variants (1.17M direct + 10.93M imputed), GRCh37/hg19
// Annotations updated with ClinVar/PharmGKB/gnomAD 2025-2026

export const GENOMIC_VARIANTS = [
  { id: "gv-1", rsid: "rs90000001", gene: "MTHFR", variant: "C677T", genotype: "AG", enzyme_activity: "~65%", risk_level: "moderate", category: "Methylation & Folate", impact: "~35% reduced folate metabolism (reverse strand). Mildly elevated homocysteine possible.", action: "Methylfolate (5-MTHF) 400-800mcg, Methylcobalamin (B12) 1000mcg, Riboflavin (B2) 25mg", chr: "1", pos: "11856378", clinvar: "Benign/Likely benign", gnomad_af: "0.308", pmids: ["PMID:9142527","PMID:26647156"], updated: "2025-04" },
  { id: "gv-2", rsid: "rs90000002", gene: "MTHFR", variant: "A1298C", genotype: "GT", enzyme_activity: "~80%", risk_level: "low", category: "Methylation & Folate", impact: "Mild reduction in BH4 recycling (reverse strand). Compound het with C677T increases risk.", action: "Consider methylfolate 200-400mcg if combined with C677T variant", chr: "1", pos: "11854476", clinvar: "Benign", gnomad_af: "0.290", pmids: ["PMID:10930360"], updated: "2025-04" },
  { id: "gv-3", rsid: "rs90000003", gene: "MTRR", variant: "A66G", genotype: "AA", enzyme_activity: "100%", risk_level: "low", category: "Methylation & Folate", impact: "Normal methionine synthase reductase function. B12 recycling intact.", action: "No intervention needed. Monitor MMA if B12 supplementation.", chr: "5", pos: "7870973", clinvar: "Benign", gnomad_af: "0.45", pmids: ["PMID:12375236"], updated: "2025-01" },
  { id: "gv-4", rsid: "rs90000004", gene: "COMT", variant: "Val158Met", genotype: "GG", enzyme_activity: "High (3-4x)", risk_level: "context-dependent", category: "Neurotransmitter", impact: "Val/Val (Warrior). Fast COMT — lower dopamine/NE. Better stress resilience, needs stimulation. Higher pain tolerance.", action: "Tyrosine 500mg, green tea extract. Caffeine well-tolerated. Varied exercise for dopamine.", chr: "22", pos: "19951271", clinvar: "Functional polymorphism", gnomad_af: "0.38", pmids: ["PMID:15241677","PMID:17008817"], updated: "2025-03" },
  { id: "gv-5", rsid: "rs90000005", gene: "BDNF", variant: "Val66Met", genotype: "TT", enzyme_activity: "Reduced secretion", risk_level: "moderate", category: "Neuroplasticity", impact: "Met/Met — significantly reduced activity-dependent BDNF secretion. Primary intervention: aerobic exercise.", action: "Regular aerobic exercise (most powerful BDNF upregulator for Met carriers), omega-3 2g/day, mindfulness practice", chr: "11", pos: "27679916", clinvar: "Functional polymorphism", gnomad_af: "0.20", pmids: ["PMID:12553913","PMID:36944589"], updated: "2025-05" },
  { id: "gv-6", rsid: "rs90000006", gene: "FTO", variant: "rs90000006", genotype: "AT", enzyme_activity: "N/A", risk_level: "moderate", category: "Metabolic & Obesity", impact: "Heterozygous obesity risk allele. 1.3-1.7x risk. Accelerates metabolic aging via m6A demethylation (2025 study).", action: "HIIT exercise most effective. High protein diet, regular meal timing. Avoid high-sugar/high-fat combo.", chr: "16", pos: "53820527", clinvar: "Risk factor", gnomad_af: "0.34", pmids: ["PMID:17554300","PMID:38926423"], updated: "2026-01" },
  { id: "gv-7", rsid: "rs90000007", gene: "APOE", variant: "ε4 determinant", genotype: "TT", enzyme_activity: "N/A", risk_level: "low", category: "Cardiovascular & Neuro", impact: "No ε4 allele. Combined with rs90000019 CT → APOE ε2/ε3 isoform. Protective: ~40-50% reduced AD risk.", action: "Standard heart-healthy diet. Unprocessed red meat may decrease AD risk in non-ε4 carriers (2026 study).", chr: "19", pos: "45411941", clinvar: "Well-established", gnomad_af: "0.15", pmids: ["PMID:8346443","PMID:24135141"], updated: "2026-02" },
  { id: "gv-8", rsid: "rs90000008", gene: "IL-6", variant: "G>C (-174)", genotype: "GG", enzyme_activity: "High expression", risk_level: "moderate", category: "Inflammation", impact: "High baseline IL-6 expression. Pro-inflammatory phenotype. Associated with severe COVID-19, RA, MS risk.", action: "Anti-inflammatory diet (Mediterranean), omega-3 2g, curcumin 500mg/day. Monitor hs-CRP.", chr: "7", pos: "22766645", clinvar: "Functional variant", gnomad_af: "0.42", pmids: ["PMID:10764843","PMID:38512345"], updated: "2025-06" },
  { id: "gv-9", rsid: "rs90000009", gene: "VDR", variant: "FokI", genotype: "GG", enzyme_activity: "High (FF short isoform)", risk_level: "low", category: "Vitamin D & Calcium", impact: "FF genotype — more transcriptionally active VDR. Higher vitamin D responsiveness.", action: "Standard vitamin D3 2000 IU/day. Target serum 40-60 ng/mL.", chr: "12", pos: "48272895", clinvar: "Functional polymorphism", gnomad_af: "0.35", pmids: ["PMID:9435228"], updated: "2025-05" },
  { id: "gv-10", rsid: "rs90000010", gene: "VDR", variant: "BsmI", genotype: "CC", enzyme_activity: "Reduced expression (BB)", risk_level: "moderate", category: "Vitamin D & Calcium", impact: "BB genotype — reduced VDR expression. Compensate with higher D3 intake.", action: "Vitamin D3 2000-4000 IU daily. Vitamin K2 200mcg. Calcium 600mg with meals.", chr: "12", pos: "48239835", clinvar: "Functional variant", gnomad_af: "0.40", pmids: ["PMID:10684912"], updated: "2025-03" },
  { id: "gv-11", rsid: "rs90000011", gene: "MTNR1B", variant: "C>G", genotype: "CG", enzyme_activity: "Altered melatonin signaling", risk_level: "moderate", category: "Sleep & Glucose", impact: "Heterozygous risk for glucose/insulin dysregulation linked to melatonin receptor. Late eating worsens effect.", action: "Low-dose melatonin (<0.5mg). Dinner cutoff 3+ hours before sleep. Monitor fasting glucose.", chr: "11", pos: "92708710", clinvar: "Risk factor", gnomad_af: "0.28", pmids: ["PMID:19060906","PMID:22885924"], updated: "2025-07" },
  { id: "gv-12", rsid: "rs90000012", gene: "NQO1", variant: "Pro187Ser", genotype: "AG", enzyme_activity: "2-4x reduced", risk_level: "moderate", category: "Detoxification", impact: "Heterozygous — 2-4x reduced NQO1 quinone reductase activity. Impaired CoQ10 regeneration.", action: "CoQ10 (Ubiquinol) 200mg/day. NAC 600mg. Cruciferous vegetables.", chr: "16", pos: "69745145", clinvar: "Risk factor", gnomad_af: "0.22", pmids: ["PMID:10072042"], updated: "2025-02" },
  { id: "gv-13", rsid: "rs90000013", gene: "OPRM1", variant: "A118G", genotype: "AG", enzyme_activity: "Reduced binding", risk_level: "moderate", category: "Pain & Reward", impact: "Reduced mu-opioid receptor binding. May need higher opioid doses for pain relief. Altered reward processing.", action: "Note for anesthesiologist. Non-opioid pain strategies preferred.", chr: "6", pos: "154360797", clinvar: "Functional variant", gnomad_af: "0.15", pmids: ["PMID:15583226"], updated: "2025-04" },
  { id: "gv-14", rsid: "rs90000014", gene: "HFE", variant: "C282Y", genotype: "GG", enzyme_activity: "Normal", risk_level: "low", category: "Iron Metabolism", impact: "Normal HFE function. No hemochromatosis risk at this locus.", action: "No intervention needed.", chr: "6", pos: "26093141", clinvar: "Pathogenic (homozygous)", gnomad_af: "0.06", pmids: ["PMID:8696333"], updated: "2025-01" },
  { id: "gv-15", rsid: "rs90000015", gene: "HFE", variant: "H63D", genotype: "CC", enzyme_activity: "Normal", risk_level: "low", category: "Iron Metabolism", impact: "Normal iron sensing. No increased absorption risk.", action: "No intervention needed. Standard ferritin monitoring.", chr: "6", pos: "26091179", clinvar: "Benign/Likely benign", gnomad_af: "0.14", pmids: ["PMID:8696333"], updated: "2025-01" },
  { id: "gv-16", rsid: "rs90000016", gene: "SOD2", variant: "Ala16Val", genotype: "AA", enzyme_activity: "High mitochondrial activity", risk_level: "low", category: "Antioxidant Defense", impact: "Ala/Ala — high mitochondrial superoxide dismutase activity. Efficient ROS clearance.", action: "No intervention needed. Baseline antioxidant support adequate.", chr: "6", pos: "160113872", clinvar: "Benign", gnomad_af: "0.47", pmids: ["PMID:10508489"], updated: "2025-01" },
  { id: "gv-17", rsid: "rs90000017", gene: "CYP2D6", variant: "*4 allele", genotype: "CC", enzyme_activity: "Normal", risk_level: "low", category: "Pharmacogenomics", impact: "Normal CYP2D6 metabolizer. Standard drug dosing for codeine, tamoxifen, SSRIs.", action: "Normal metabolizer — standard drug dosing.", chr: "22", pos: "42524947", clinvar: "Pharmacogenomic", gnomad_af: "0.20", pmids: ["PMID:22031724"], updated: "2025-06" },
  { id: "gv-18", rsid: "rs90000018", gene: "GSTP1", variant: "Ile105Val", genotype: "AA", enzyme_activity: "Normal", risk_level: "low", category: "Detoxification", impact: "Ile/Ile — normal glutathione S-transferase P1. Standard detoxification capacity.", action: "No intervention needed.", chr: "11", pos: "67352689", clinvar: "Benign", gnomad_af: "0.33", pmids: ["PMID:10987269"], updated: "2025-01" },
];

// Composite pathway scores from genomic_annotations.json
export const COMPOSITE_SCORES = [
  { pathway: "Methylation & Folate", score: 11.1, label: "Low", moderate: 1, low: 2 },
  { pathway: "Cardiovascular & Neuro", score: 0.0, label: "Low", moderate: 0, low: 2 },
  { pathway: "Neurotransmitter", score: 8.3, label: "Low", moderate: 0, low: 1 },
  { pathway: "Vitamin D & Calcium", score: 11.1, label: "Low", moderate: 2, low: 4 },
  { pathway: "Antioxidant Defense", score: 0.0, label: "Low", moderate: 0, low: 2 },
  { pathway: "Detoxification", score: 33.3, label: "Moderate", moderate: 1, low: 1 },
  { pathway: "Iron Metabolism", score: 0.0, label: "Low", moderate: 0, low: 4 },
  { pathway: "Metabolic & Obesity", score: 33.3, label: "Moderate", moderate: 2, low: 0 },
  { pathway: "Neuroplasticity", score: 33.3, label: "Moderate", moderate: 1, low: 0 },
  { pathway: "Sleep & Glucose", score: 33.3, label: "Moderate", moderate: 1, low: 0 },
  { pathway: "Inflammation", score: 16.7, label: "Low", moderate: 1, low: 1 },
  { pathway: "Pharmacogenomics", score: 0.0, label: "Low", moderate: 0, low: 5 },
  { pathway: "Pain & Reward", score: 33.3, label: "Moderate", moderate: 1, low: 0 },
  { pathway: "Dietary Tolerance", score: 33.3, label: "Moderate", moderate: 2, low: 0 },
];

// Latest research annotations (2025-2026)
export const RESEARCH_UPDATES = [
  { id: "ru-1", date: "2026-02", gene: "APOE", rsid: "rs90000007", title: "Without APOE3 or APOE4, Alzheimer's Would Be a Rare Disease", source: "NPJ Dementia 2026", finding: "Analysis of 470,000 participants shows APOE ε3 accounts for at least one-third of AD cases. Your ε2/ε3 genotype is protective.", impact: "positive", url: "alzforum.org" },
  { id: "ru-2", date: "2026-01", gene: "FTO", rsid: "rs90000006", title: "FTO rs90000006-A Accelerates Muscle Aging via m6A Demethylation", source: "Nature Communications 2024 / BMC Endocrine 2026", finding: "CRISPR studies show risk allele enhances insulin/IGF signaling and muscle progenitor senescence. Meta-analysis of 34,206 confirms strong obesity link.", impact: "actionable", url: "nature.com" },
  { id: "ru-3", date: "2025-05", gene: "BDNF", rsid: "rs90000005", title: "BDNF Val66Met Predicts Therapeutic Response to Electrical Stimulation", source: "Muscle & Nerve 2025", finding: "Met/Met carriers show reduced cognitive improvement with aerobic exercise but respond to electrical nerve stimulation. Your TT genotype requires personalized exercise protocols.", impact: "actionable", url: "wiley.com" },
  { id: "ru-4", date: "2025-06", gene: "IL-6", rsid: "rs90000008", title: "IL-6 Genotype Predicts COVID-19 Severity and TNF Inhibitor Response", source: "Springer Nature 2025", finding: "GG genotype (yours) associated with severe inflammation, clotting risk in COVID-19. C allele increases RA risk and predicts poor TNF inhibitor response.", impact: "monitor", url: "springer.com" },
  { id: "ru-5", date: "2025-07", gene: "CYP1A2", rsid: "rs90000021", title: "CYP1A2 Genotype × Coffee Intake Modulates Metabolic Syndrome Risk", source: "Nutrients 2025", finding: "Fast metabolizers (AA) with 1-2 cups/day show better folate/B12 and metabolic markers. Slow metabolizers should limit caffeine.", impact: "actionable", url: "mdpi.com" },
  { id: "ru-6", date: "2025-04", gene: "MTHFR", rsid: "rs90000001", title: "2025 Meta-Analysis Reconfirms MTHFR Wide-Ranging Implications", source: "MDPI 2025", finding: "Comprehensive metabolic evaluation matters more than genotype alone. Heterozygous carriers like you benefit from folate monitoring, not aggressive supplementation.", impact: "monitor", url: "mdpi.com" },
  { id: "ru-7", date: "2025-03", gene: "COMT", rsid: "rs90000004", title: "COMT Val158Met Confirmed as Dopamine Signaling Master Regulator", source: "Springer Nature 2025", finding: "Val/Val (your genotype) confirmed: higher stress resilience, better working memory under pressure, but may need varied stimulation to prevent dopamine depletion.", impact: "positive", url: "springer.com" },
  { id: "ru-8", date: "2025-05", gene: "VDR", rsid: "rs90000009", title: "VDR FokI Linked to Sleep Quality and Autoimmune Disease Activity", source: "Scientific Reports 2025", finding: "Multiple 2024-2025 studies link VDR variants to sleep quality, SLE disease activity, and T2DM complications. Your FF genotype is the more active isoform.", impact: "positive", url: "nature.com" },
];

export const SUPPLEMENTS = [
  { id: "sup-1", name: "Methylfolate (5-MTHF)", dose: "400 mcg", frequency: "daily", time_of_day: "morning", related_gene: "MTHFR C677T", reason: "Compensates ~35% reduced folate metabolism (AG genotype)", priority: "high", status: "active" },
  { id: "sup-2", name: "Methylcobalamin (B12)", dose: "1000 mcg", frequency: "daily", time_of_day: "morning", related_gene: "MTHFR", reason: "Supports methylation cycle with MTHFR variant", priority: "high", status: "active" },
  { id: "sup-3", name: "Omega-3 (EPA/DHA)", dose: "2000 mg", frequency: "daily", time_of_day: "with meals", related_gene: "BDNF, IL-6", reason: "BDNF Met/Met requires omega-3; IL-6 GG needs anti-inflammatory", priority: "high", status: "active" },
  { id: "sup-4", name: "Vitamin D3", dose: "2000-4000 IU", frequency: "daily", time_of_day: "morning", related_gene: "VDR BsmI", reason: "VDR BsmI CC (BB) = reduced expression, compensate with D3", priority: "high", status: "active" },
  { id: "sup-5", name: "CoQ10 (Ubiquinol)", dose: "200 mg", frequency: "daily", time_of_day: "morning", related_gene: "NQO1", reason: "NQO1 AG = 2-4x reduced CoQ10 regeneration capacity", priority: "high", status: "active" },
  { id: "sup-6", name: "Curcumin (BCM-95)", dose: "500 mg", frequency: "daily", time_of_day: "with meals", related_gene: "IL-6", reason: "IL-6 GG pro-inflammatory phenotype — anti-inflammatory support", priority: "medium", status: "active" },
  { id: "sup-7", name: "Vitamin K2 (MK-7)", dose: "200 mcg", frequency: "daily", time_of_day: "morning", related_gene: "VDR", reason: "Synergistic with D3, directs calcium to bones", priority: "medium", status: "active" },
  { id: "sup-8", name: "Magnesium Glycinate", dose: "400 mg", frequency: "daily", time_of_day: "evening", related_gene: "MTNR1B", reason: "Supports sleep quality for MTNR1B glucose-sleep coupling", priority: "medium", status: "active" },
  { id: "sup-9", name: "Tyrosine", dose: "500 mg", frequency: "daily", time_of_day: "morning", related_gene: "COMT", reason: "Supports dopamine for Val/Val fast COMT metabolizer", priority: "low", status: "active" },
];

export const SUPPLEMENT_CONFLICTS = [
  { supplement1: "Vitamin D3", supplement2: "Vitamin K2", severity: "synergy", note: "K2 directs calcium from D3 to bones — take together" },
  { supplement1: "Magnesium", supplement2: "Vitamin D3", severity: "synergy", note: "Magnesium required for D3 activation" },
  { supplement1: "CoQ10", supplement2: "Curcumin", severity: "safe", note: "Complementary antioxidant pathways — no interaction" },
  { supplement1: "Iron", supplement2: "Calcium", severity: "critical", note: "Calcium blocks iron absorption — separate by 2+ hours" },
  { supplement1: "Omega-3", supplement2: "Vitamin E", severity: "caution", note: "High dose combo may increase bleeding risk" },
];

export const DAILY_LOGS = [
  { day: "2026-04-01", calories: 1920, protein_g: 165, carbs_g: 210, fat_g: 62, water_ml: 2800, steps: 8200, sleep_hours: 7.2, weight_kg: 78.5, health_score: 82 },
  { day: "2026-04-02", calories: 1850, protein_g: 172, carbs_g: 195, fat_g: 58, water_ml: 3200, steps: 10500, sleep_hours: 7.8, weight_kg: 78.3, health_score: 88 },
  { day: "2026-04-03", calories: 2100, protein_g: 155, carbs_g: 240, fat_g: 72, water_ml: 2500, steps: 6800, sleep_hours: 6.5, weight_kg: 78.4, health_score: 72 },
  { day: "2026-04-04", calories: 1780, protein_g: 180, carbs_g: 178, fat_g: 55, water_ml: 3000, steps: 12000, sleep_hours: 8.1, weight_kg: 78.1, health_score: 91 },
  { day: "2026-04-05", calories: 1950, protein_g: 168, carbs_g: 205, fat_g: 65, water_ml: 2900, steps: 9200, sleep_hours: 7.5, weight_kg: 78.2, health_score: 85 },
  { day: "2026-04-06", calories: 2200, protein_g: 145, carbs_g: 260, fat_g: 78, water_ml: 2600, steps: 5500, sleep_hours: 8.5, weight_kg: 78.4, health_score: 78 },
  { day: "2026-04-07", calories: 1880, protein_g: 175, carbs_g: 200, fat_g: 60, water_ml: 3100, steps: 7800, sleep_hours: 7.9, weight_kg: 78.0, health_score: 86 },
];

export const MEALS = [
  { id: "meal-1", day: "2026-04-07", time: "07:30", meal_type: "breakfast", description: "Oatmeal with blueberries, walnuts, whey protein", calories: 480, protein_g: 35, carbs_g: 58, fat_g: 14 },
  { id: "meal-2", day: "2026-04-07", time: "10:00", meal_type: "snack", description: "Greek yogurt, almonds, honey", calories: 280, protein_g: 22, carbs_g: 20, fat_g: 12 },
  { id: "meal-3", day: "2026-04-07", time: "12:30", meal_type: "lunch", description: "Grilled chicken breast, brown rice, steamed broccoli", calories: 620, protein_g: 48, carbs_g: 55, fat_g: 18 },
  { id: "meal-4", day: "2026-04-07", time: "15:30", meal_type: "snack", description: "Protein shake, banana", calories: 320, protein_g: 30, carbs_g: 35, fat_g: 5 },
  { id: "meal-5", day: "2026-04-07", time: "19:00", meal_type: "dinner", description: "Steamed sea bass, sweet potato, mixed salad, avocado", calories: 550, protein_g: 42, carbs_g: 40, fat_g: 20 },
];

export const BLOOD_MARKERS = [
  { id: "bm-1", marker: "Total Testosterone", value: 620, unit: "ng/dL", reference_low: 300, reference_high: 1000, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([580,595,610,605,620]), category: "Hormones" },
  { id: "bm-2", marker: "Free Testosterone", value: 15.2, unit: "pg/mL", reference_low: 8.7, reference_high: 25.1, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([13.8,14.1,14.5,14.9,15.2]), category: "Hormones" },
  { id: "bm-3", marker: "Vitamin D (25-OH)", value: 52, unit: "ng/mL", reference_low: 30, reference_high: 100, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([28,35,42,48,52]), category: "Vitamins" },
  { id: "bm-4", marker: "Homocysteine", value: 9.2, unit: "umol/L", reference_low: 5, reference_high: 15, status: "average", test_date: "2026-04-01", history: JSON.stringify([14.5,12.8,11.2,10.1,9.2]), category: "Metabolic" },
  { id: "bm-5", marker: "hs-CRP", value: 0.8, unit: "mg/L", reference_low: 0, reference_high: 3, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([2.1,1.8,1.4,1.0,0.8]), category: "Inflammation" },
  { id: "bm-6", marker: "Ferritin", value: 95, unit: "ng/mL", reference_low: 30, reference_high: 400, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([78,82,88,91,95]), category: "Metabolic" },
  { id: "bm-7", marker: "HbA1c", value: 5.1, unit: "%", reference_low: 4, reference_high: 5.7, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([5.4,5.3,5.2,5.2,5.1]), category: "Metabolic" },
  { id: "bm-8", marker: "TSH", value: 2.1, unit: "mIU/L", reference_low: 0.4, reference_high: 4.0, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([2.8,2.5,2.3,2.2,2.1]), category: "Hormones" },
  { id: "bm-9", marker: "ApoB", value: 85, unit: "mg/dL", reference_low: 0, reference_high: 130, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([102,98,93,89,85]), category: "Lipids" },
  { id: "bm-10", marker: "LDL Cholesterol", value: 105, unit: "mg/dL", reference_low: 0, reference_high: 130, status: "average", test_date: "2026-04-01", history: JSON.stringify([125,118,115,110,105]), category: "Lipids" },
  { id: "bm-11", marker: "HDL Cholesterol", value: 58, unit: "mg/dL", reference_low: 40, reference_high: 100, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([48,50,53,55,58]), category: "Lipids" },
  { id: "bm-12", marker: "Triglycerides", value: 88, unit: "mg/dL", reference_low: 0, reference_high: 150, status: "optimal", test_date: "2026-04-01", history: JSON.stringify([135,120,105,95,88]), category: "Lipids" },
];

export const MEDICAL_RECORDS = [
  { id: "mr-1", date: "2026-04-01", type: "Lab Work", doctor: "Dr. Smith", facility: "Sample Medical Center", summary: "Comprehensive metabolic panel + lipids — all within range", status: "completed" },
  { id: "mr-2", date: "2026-03-31", type: "Genomic Report", doctor: "DemoBio Lab", facility: "DemoGene Sequencing", summary: "12.1M variants analyzed (1.17M direct + 10.93M imputed). 18 clinically annotated SNPs across 14 pathways.", status: "completed" },
  { id: "mr-3", date: "2026-03-01", type: "Physical Exam", doctor: "Dr. Johnson", facility: "City General Hospital", summary: "Annual checkup — BMI 24.2, BP 118/76, all systems normal", status: "completed" },
];

export const FAMILY_MEMBERS = [
  { id: "fm-1", name: "Alex Morgan", relation: "Self", age: 29, avatar_emoji: "AM", health_score: 86, alerts: 0, conditions: JSON.stringify(["APOE e2/e3 (protective)","BDNF Met/Met","COMT Val/Val","MTHFR C677T het","FTO AT carrier"]), last_checkup: "2026-04-01", sex: "M", generation: 2 },
  { id: "fm-4", name: "Sarah Morgan", relation: "Wife", age: 28, avatar_emoji: "SM", health_score: 88, alerts: 0, conditions: JSON.stringify(["APOE e3/e3","BDNF Met/Met","COMT Val/Met (het)","MTHFR wildtype","FTO AT carrier","CYP2C19 intermediate","GSTP1 het","PPARG Pro12Ala (protective)"]), last_checkup: "2026-04-11", sex: "F", generation: 2 },
  { id: "fm-2", name: "Robert Morgan", relation: "Father", age: 58, avatar_emoji: "RM", health_score: 74, alerts: 2, conditions: JSON.stringify(["APOE e3/e4","Statin therapy","Hypertension stage 1"]), last_checkup: "2026-03-15", sex: "M", generation: 1 },
  { id: "fm-3", name: "Linda Morgan", relation: "Mother", age: 55, avatar_emoji: "LM", health_score: 78, alerts: 1, conditions: JSON.stringify(["HFE H63D het","VDR BsmI BB","Mild osteopenia"]), last_checkup: "2026-03-15", sex: "F", generation: 1 },
];

// Sarah Morgan's full genomic variant set (DemoGene 2026-04-11)
export const PARTNER_GENOMIC_VARIANTS = [
  { rsid: "rs90000001", gene: "MTHFR", variant: "C677T", genotype: "GG", enzyme_activity: "100%", risk_level: "low", category: "Methylation & Folate", impact: "Wildtype. Normal folate metabolism — no elevated homocysteine risk.", chr: "1", pos: "11856378" },
  { rsid: "rs90000002", gene: "MTHFR", variant: "A1298C", genotype: "TT", enzyme_activity: "100%", risk_level: "low", category: "Methylation & Folate", impact: "Wildtype. Normal BH4 recycling.", chr: "1", pos: "11854476" },
  { rsid: "rs90000004", gene: "COMT", variant: "Val158Met", genotype: "AG", enzyme_activity: "Intermediate", risk_level: "low", category: "Neurotransmitter", impact: "Val/Met heterozygous — balanced dopamine clearance. Neither warrior nor worrier extreme.", chr: "22", pos: "19951271" },
  { rsid: "rs90000005", gene: "BDNF", variant: "Val66Met", genotype: "TT", enzyme_activity: "Reduced secretion", risk_level: "moderate", category: "Neuroplasticity", impact: "Met/Met — significantly reduced BDNF secretion. Both parents carry this — offspring will be Met/Met.", chr: "11", pos: "27679916" },
  { rsid: "rs90000006", gene: "FTO", variant: "rs90000006", genotype: "AT", enzyme_activity: "N/A", risk_level: "moderate", category: "Metabolic & Obesity", impact: "Heterozygous obesity risk allele. Same as partner.", chr: "16", pos: "53820527" },
  { rsid: "rs90000007", gene: "APOE", variant: "ε4 determinant", genotype: "TT", enzyme_activity: "N/A", risk_level: "low", category: "Cardiovascular & Neuro", impact: "No ε4 allele. rs90000019=CC → APOE ε3/ε3 (most common genotype).", chr: "19", pos: "45411941" },
  { rsid: "rs90000008", gene: "IL-6", variant: "G>C (-174)", genotype: "GG", enzyme_activity: "High expression", risk_level: "moderate", category: "Inflammation", impact: "High baseline IL-6 expression. Same as partner — offspring will likely be GG.", chr: "7", pos: "22766645" },
  { rsid: "rs90000009", gene: "VDR", variant: "FokI", genotype: "GG", enzyme_activity: "High (FF short isoform)", risk_level: "low", category: "Vitamin D & Calcium", impact: "FF genotype — more transcriptionally active VDR.", chr: "12", pos: "48272895" },
  { rsid: "rs90000010", gene: "VDR", variant: "BsmI", genotype: "CC", enzyme_activity: "Reduced expression (BB)", risk_level: "moderate", category: "Vitamin D & Calcium", impact: "BB genotype — reduced VDR expression. Same as partner.", chr: "12", pos: "48239835" },
  { rsid: "rs90000011", gene: "MTNR1B", variant: "C>G", genotype: "CG", enzyme_activity: "Altered melatonin signaling", risk_level: "moderate", category: "Sleep & Glucose", impact: "Heterozygous — same as partner.", chr: "11", pos: "92708710" },
  { rsid: "rs90000012", gene: "NQO1", variant: "Pro187Ser", genotype: "GG", enzyme_activity: "Normal", risk_level: "low", category: "Detoxification", impact: "Wildtype — normal NQO1 activity. Better than partner (AG).", chr: "16", pos: "69745145" },
  { rsid: "rs90000013", gene: "OPRM1", variant: "A118G", genotype: "AG", enzyme_activity: "Reduced binding", risk_level: "moderate", category: "Pain & Reward", impact: "Same as partner — reduced mu-opioid receptor binding.", chr: "6", pos: "154360797" },
  { rsid: "rs90000016", gene: "SOD2", variant: "Ala16Val", genotype: "AA", enzyme_activity: "High mitochondrial activity", risk_level: "low", category: "Antioxidant Defense", impact: "Ala/Ala — efficient ROS clearance. Same as partner.", chr: "6", pos: "160113872" },
  { rsid: "rs90000018", gene: "GSTP1", variant: "Ile105Val", genotype: "AG", enzyme_activity: "Mildly reduced", risk_level: "low", category: "Detoxification", impact: "Ile/Val heterozygous — slightly reduced glutathione conjugation vs Alex's wildtype.", chr: "11", pos: "67352689" },
  { rsid: "rs90000020", gene: "CYP2C19", variant: "*2 allele", genotype: "AG", enzyme_activity: "Intermediate metabolizer", risk_level: "moderate", category: "Pharmacogenomics", impact: "One loss-of-function allele — intermediate CYP2C19 metabolizer. Affects clopidogrel, PPIs, some SSRIs.", chr: "10", pos: "96541616" },
  { rsid: "rs90000021", gene: "CYP1A2", variant: "*1F allele", genotype: "AC", enzyme_activity: "Intermediate", risk_level: "low", category: "Pharmacogenomics", impact: "Intermediate caffeine metabolizer. 1-2 cups/day optimal.", chr: "15", pos: "75041917" },
  { rsid: "rs90000022", gene: "PPARG", variant: "Pro12Ala", genotype: "CG", enzyme_activity: "Moderate activity", risk_level: "low", category: "Metabolic", impact: "Pro12Ala heterozygous — protective against type 2 diabetes. Improved insulin sensitivity.", chr: "3", pos: "12393125" },
  { rsid: "rs90000023", gene: "XRCC1", variant: "Arg399Gln", genotype: "CT", enzyme_activity: "Mildly reduced", risk_level: "low", category: "DNA Repair", impact: "Heterozygous — slightly reduced base excision repair capacity.", chr: "19", pos: "44055726" },
];

// Offspring risk analysis — comparing Alex × Sarah genotypes
export const OFFSPRING_RISK_ANALYSIS = [
  {
    gene: "BDNF", variant: "Val66Met", rsid: "rs90000005",
    self_genotype: "TT (Met/Met)", partner_genotype: "TT (Met/Met)",
    offspring_prediction: "100% TT (Met/Met)",
    risk_level: "high",
    category: "Neuroplasticity",
    impact: "Both parents are Met/Met homozygous — all offspring will be Met/Met. Significantly reduced activity-dependent BDNF secretion.",
    action: "Prioritize aerobic exercise from early childhood. Omega-3 supplementation (age-appropriate). Monitor developmental milestones. Consider enriched learning environments.",
    inheritance: "autosomal recessive pattern — guaranteed Met/Met",
  },
  {
    gene: "FTO", variant: "rs90000006", rsid: "rs90000006",
    self_genotype: "AT (het)", partner_genotype: "AT (het)",
    offspring_prediction: "25% AA, 50% AT, 25% TT",
    risk_level: "high",
    category: "Metabolic & Obesity",
    impact: "25% chance of AA homozygous (highest obesity risk, 1.7x). 50% chance of AT like parents. Accelerated metabolic aging via m6A demethylation if AA.",
    action: "Screen at birth. If AA: early nutritional intervention, limit sugar/refined carb exposure, structured physical activity from age 3+. Regular BMI monitoring.",
    inheritance: "25% highest risk, 50% moderate, 25% no risk",
  },
  {
    gene: "IL-6", variant: "G>C (-174)", rsid: "rs90000008",
    self_genotype: "GG (high expression)", partner_genotype: "GG (high expression)",
    offspring_prediction: "100% GG",
    risk_level: "high",
    category: "Inflammation",
    impact: "Both parents GG — offspring guaranteed pro-inflammatory IL-6 phenotype. Higher baseline inflammation, potentially worse COVID/infection outcomes.",
    action: "Anti-inflammatory diet from childhood (Mediterranean pattern). Omega-3, minimize processed foods. Monitor hs-CRP from adolescence.",
    inheritance: "autosomal — guaranteed high-expression genotype",
  },
  {
    gene: "VDR", variant: "BsmI", rsid: "rs90000010",
    self_genotype: "CC (BB, reduced)", partner_genotype: "CC (BB, reduced)",
    offspring_prediction: "100% CC (BB)",
    risk_level: "moderate",
    category: "Vitamin D & Calcium",
    impact: "Both parents BB — offspring guaranteed reduced VDR expression. Increased osteoporosis risk if vitamin D insufficient.",
    action: "Vitamin D3 supplementation from infancy (400 IU/day). Adequate calcium. Outdoor activity. Monitor 25-OH-D levels annually.",
    inheritance: "100% BB genotype",
  },
  {
    gene: "MTNR1B", variant: "C>G", rsid: "rs90000011",
    self_genotype: "CG (het)", partner_genotype: "CG (het)",
    offspring_prediction: "25% GG, 50% CG, 25% CC",
    risk_level: "moderate",
    category: "Sleep & Glucose",
    impact: "25% chance of GG (most impaired glucose-melatonin coupling). 50% like parents. Important for meal timing and sleep hygiene.",
    action: "If GG: strict meal timing, dinner cutoff 3h before bed. Low-glycemic diet. Monitor fasting glucose from teens.",
    inheritance: "25% highest risk, 50% moderate, 25% no risk",
  },
  {
    gene: "OPRM1", variant: "A118G", rsid: "rs90000013",
    self_genotype: "AG (het)", partner_genotype: "AG (het)",
    offspring_prediction: "25% GG, 50% AG, 25% AA",
    risk_level: "moderate",
    category: "Pain & Reward",
    impact: "25% chance of GG homozygous — significantly reduced opioid receptor binding. Important for future pain management.",
    action: "If GG: flag for anesthesiologists. Non-opioid pain strategies primary. Document pharmacogenomic status.",
    inheritance: "25% GG (highest impact), 50% het, 25% wildtype",
  },
  {
    gene: "MTHFR", variant: "C677T", rsid: "rs90000001",
    self_genotype: "AG (het, ~65%)", partner_genotype: "GG (wildtype, 100%)",
    offspring_prediction: "50% AG (het), 50% GG (wildtype)",
    risk_level: "low",
    category: "Methylation & Folate",
    impact: "No offspring will be TT homozygous. 50% chance of heterozygous like Alex (mild reduction). Sarah's wildtype allele is protective.",
    action: "Standard prenatal folate supplementation sufficient. No heightened methylation risk for offspring.",
    inheritance: "Sarah's wildtype protects — worst case is heterozygous",
  },
  {
    gene: "APOE", variant: "ε alleles", rsid: "rs90000007/rs90000019",
    self_genotype: "e2/e3", partner_genotype: "e3/e3",
    offspring_prediction: "50% e2/e3, 50% e3/e3",
    risk_level: "low",
    category: "Cardiovascular & Neuro",
    impact: "No e4 allele from either parent. 50% chance of inheriting protective e2 from Alex. Zero Alzheimer's risk from APOE.",
    action: "Excellent APOE outlook. No special intervention needed. Standard cardiovascular health maintenance.",
    inheritance: "Both favorable — e2 or e3 only",
  },
  {
    gene: "COMT", variant: "Val158Met", rsid: "rs90000004",
    self_genotype: "GG (Val/Val, warrior)", partner_genotype: "AG (Val/Met, balanced)",
    offspring_prediction: "50% GG (Val/Val), 50% AG (Val/Met)",
    risk_level: "low",
    category: "Neurotransmitter",
    impact: "No Met/Met offspring possible. 50% warrior (high stress resilience), 50% balanced. Both good outcomes.",
    action: "If Val/Val: provide varied stimulation, sports, challenges. If Val/Met: balanced approach works naturally.",
    inheritance: "Both outcomes favorable",
  },
  {
    gene: "SOD2", variant: "Ala16Val", rsid: "rs90000016",
    self_genotype: "AA (Ala/Ala)", partner_genotype: "AA (Ala/Ala)",
    offspring_prediction: "100% AA (Ala/Ala)",
    risk_level: "low",
    category: "Antioxidant Defense",
    impact: "Both parents Ala/Ala — offspring guaranteed efficient mitochondrial ROS clearance. Excellent antioxidant baseline.",
    action: "No intervention needed. Natural antioxidant defense intact.",
    inheritance: "100% optimal genotype",
  },
  {
    gene: "NQO1", variant: "Pro187Ser", rsid: "rs90000012",
    self_genotype: "AG (het, 2-4x reduced)", partner_genotype: "GG (wildtype)",
    offspring_prediction: "50% AG (het), 50% GG (wildtype)",
    risk_level: "low",
    category: "Detoxification",
    impact: "No homozygous risk allele possible. Sarah's wildtype protects. Worst case is heterozygous like Alex.",
    action: "If het: consider CoQ10 supplementation in adulthood. Standard diet otherwise.",
    inheritance: "Sarah's wildtype is protective",
  },
  {
    gene: "GSTP1", variant: "Ile105Val", rsid: "rs90000018",
    self_genotype: "AA (Ile/Ile, normal)", partner_genotype: "AG (Ile/Val, het)",
    offspring_prediction: "50% AA (normal), 50% AG (het)",
    risk_level: "low",
    category: "Detoxification",
    impact: "No Val/Val offspring possible. Detoxification capacity normal or mildly reduced.",
    action: "Standard cruciferous vegetable intake supports glutathione pathways.",
    inheritance: "Alex's wildtype is protective",
  },
  {
    gene: "CYP2C19", variant: "*2 allele", rsid: "rs90000020",
    self_genotype: "CC (normal metabolizer)", partner_genotype: "AG (intermediate)",
    offspring_prediction: "50% CC (normal), 50% AG (intermediate)",
    risk_level: "low",
    category: "Pharmacogenomics",
    impact: "No poor metabolizer offspring. Sarah's *2 allele may pass to 50% of children — affects clopidogrel, PPIs.",
    action: "Pharmacogenomic card for offspring if AG. Standard dosing adjustments.",
    inheritance: "Alex's normal alleles protective",
  },
];

// Disease associations for offspring risk variants — curated from OMIM, ClinVar, GWAS Catalog
export const OFFSPRING_DISEASE_MAP = [
  {
    gene: "BDNF", rsid: "rs90000005", offspring_genotype: "TT (Met/Met)",
    probability: "100%",
    diseases: [
      { name: "Major Depressive Disorder", risk_increase: "1.5–2.0x", onset: "Adolescence–adulthood", severity: "moderate", mechanism: "Reduced hippocampal BDNF secretion impairs stress resilience and synaptic plasticity in prefrontal cortex.", evidence: "Meta-analysis of 14,233 subjects (Verhagen et al., 2010; Molendijk et al., 2014)" },
      { name: "Anxiety Disorders (GAD, PTSD)", risk_increase: "1.4–1.8x", onset: "Childhood–adulthood", severity: "moderate", mechanism: "Impaired fear extinction learning due to reduced BDNF in amygdala-hippocampal circuit.", evidence: "Soliman et al., Cell 2010; Dincheva et al., Biol Psych 2012" },
      { name: "Cognitive Decline / Memory Impairment", risk_increase: "1.3x faster episodic memory decline", onset: "Middle age+", severity: "moderate", mechanism: "Reduced activity-dependent BDNF secretion in hippocampal CA1 → impaired LTP and memory consolidation.", evidence: "Egan et al., Cell 2003; Hariri et al., J Neurosci 2003" },
      { name: "Obesity / Metabolic Syndrome", risk_increase: "1.2–1.5x", onset: "Childhood", severity: "low", mechanism: "BDNF regulates energy balance in hypothalamus. Met/Met → reduced hypothalamic BDNF → hyperphagia tendency.", evidence: "Han et al., NEJM 2008; Beckers et al., Hum Mol Genet 2008" },
      { name: "Reduced Response to Exercise", risk_increase: "Not a disease — functional", onset: "All ages", severity: "low", mechanism: "Met/Met carriers show 20-40% less BDNF upregulation from aerobic exercise vs Val/Val, but still benefit.", evidence: "Lemos et al., Front Psych 2016; Walsh et al., 2020" },
    ],
    prevention: [
      { strategy: "Aerobic Exercise (150+ min/week)", effectiveness: "High", timing: "From age 3+", detail: "Despite reduced response, exercise remains the single most effective BDNF upregulator. Swimming, running, cycling. HIIT particularly effective." },
      { strategy: "Omega-3 Supplementation", effectiveness: "Moderate", timing: "From infancy (maternal DHA → breast milk)", detail: "DHA (2g/day maternal, age-appropriate doses for child) supports BDNF expression via CREB pathway." },
      { strategy: "Enriched Learning Environment", effectiveness: "Moderate", timing: "From birth", detail: "Environmental enrichment (music, language, problem-solving) stimulates BDNF expression independent of genotype." },
      { strategy: "Mindfulness / Meditation Training", effectiveness: "Moderate", timing: "From age 6+", detail: "8-week mindfulness programs increase serum BDNF by 15-20% in Met carriers (Gomutbutra et al., 2020)." },
      { strategy: "Sleep Hygiene", effectiveness: "Moderate", timing: "From birth", detail: "Adequate sleep (age-appropriate hours) is critical for BDNF-dependent memory consolidation. Sleep deprivation hits Met/Met harder." },
      { strategy: "Screen for Depression Early", effectiveness: "High", timing: "Adolescence", detail: "Met/Met carriers should be screened annually from age 12. CBT is first-line; SSRIs may show delayed response in Met/Met." },
    ],
  },
  {
    gene: "FTO", rsid: "rs90000006", offspring_genotype: "AA (homozygous risk)",
    probability: "25%",
    diseases: [
      { name: "Childhood Obesity", risk_increase: "1.7x (3 kg heavier by age 7)", onset: "Age 2–7", severity: "high", mechanism: "FTO demethylates m6A on IRX3/IRX5 mRNA → disrupted hypothalamic appetite regulation → increased caloric intake.", evidence: "Frayling et al., Science 2007; Claussnitzer et al., NEJM 2015" },
      { name: "Type 2 Diabetes", risk_increase: "1.3–1.5x", onset: "Adulthood", severity: "high", mechanism: "FTO AA → insulin resistance via adipose tissue inflammation + hepatic lipid accumulation. Independent of BMI.", evidence: "Yajnik et al., Diabetologia 2009; Loos & Yeo, Nat Rev Genet 2022" },
      { name: "Cardiovascular Disease", risk_increase: "1.2–1.4x", onset: "Adulthood", severity: "high", mechanism: "Obesity-mediated atherosclerosis + direct endothelial m6A effects on VEGF signaling.", evidence: "Doney et al., PLoS One 2009; Mo et al., Circ Res 2022" },
      { name: "Sarcopenic Obesity (Muscle Aging)", risk_increase: "1.5x accelerated muscle loss", onset: "Age 40+", severity: "moderate", mechanism: "FTO risk allele enhances muscle progenitor senescence via IGF/insulin signaling cascade (CRISPR validated).", evidence: "Nature Communications 2024; BMC Endocrine 2026" },
      { name: "Certain Cancers (breast, prostate, pancreatic)", risk_increase: "1.1–1.3x", onset: "Adulthood", severity: "moderate", mechanism: "m6A demethylation disrupts tumor suppressor mRNA stability. Obesity-independent pathway.", evidence: "Li et al., Nat Genet 2012; Huang et al., Cancer Res 2020" },
    ],
    prevention: [
      { strategy: "Structured Nutrition from Birth", effectiveness: "High", timing: "From weaning", detail: "High-protein, low-glycemic diet. Avoid sugar-sweetened beverages entirely. Regular meal timing. FTO AA children respond exceptionally well to dietary intervention." },
      { strategy: "Daily Physical Activity", effectiveness: "High", timing: "From age 2+", detail: "HIIT most effective for FTO risk allele carriers (attenuates risk by ~40%). At least 60 min/day moderate activity." },
      { strategy: "Avoid High-Sugar + High-Fat Combinations", effectiveness: "High", timing: "From weaning", detail: "The AA genotype is specifically sensitive to calorie-dense processed foods. Home-cooked meals, Mediterranean pattern." },
      { strategy: "Regular BMI and Body Composition Monitoring", effectiveness: "Moderate", timing: "From age 2, every 6 months", detail: "Track growth curves carefully. DEXA scan at age 10+ if BMI trending high. Early intervention prevents metabolic syndrome." },
      { strategy: "Fasting Glucose + Insulin Monitoring", effectiveness: "Moderate", timing: "From age 10", detail: "Annual HOMA-IR screening if AA genotype confirmed. Early metformin consideration if insulin resistance develops." },
    ],
  },
  {
    gene: "IL-6", rsid: "rs90000008", offspring_genotype: "GG (high expression)",
    probability: "100%",
    diseases: [
      { name: "Severe COVID-19 / Viral Infections", risk_increase: "2.0–3.0x for cytokine storm", onset: "Any age", severity: "high", mechanism: "GG → high constitutive IL-6 → exaggerated inflammatory cascade during infection → cytokine storm, ARDS.", evidence: "Pairo-Castineira et al., Nature 2021; Khanh et al., Springer 2025" },
      { name: "Rheumatoid Arthritis", risk_increase: "1.4–1.8x", onset: "Adulthood (30+)", severity: "moderate", mechanism: "Chronic IL-6 elevation drives synovial inflammation, cartilage degradation, joint erosion.", evidence: "Fishman et al., J Clin Invest 1998; Pavlov et al., Arthritis Res 2020" },
      { name: "Cardiovascular Disease (Atherosclerosis)", risk_increase: "1.3–1.5x", onset: "Middle age+", severity: "high", mechanism: "IL-6 drives CRP production, endothelial dysfunction, foam cell formation in arterial walls.", evidence: "IL-6R Mendelian Randomisation Analysis, Lancet 2012; Ridker CANTOS trial" },
      { name: "Type 2 Diabetes", risk_increase: "1.2–1.4x", onset: "Adulthood", severity: "moderate", mechanism: "IL-6 → SOCS3 → insulin receptor substrate degradation → hepatic/muscle insulin resistance.", evidence: "Spranger et al., Diabetes 2003; Wang et al., Nat Med 2014" },
      { name: "Depression (Inflammation-Mediated)", risk_increase: "1.3–1.6x", onset: "Adulthood", severity: "moderate", mechanism: "Peripheral IL-6 crosses BBB → microglial activation → serotonin/dopamine pathway disruption.", evidence: "Dowlati et al., Biol Psych 2010; Kappelmann et al., JAMA Psych 2021" },
      { name: "Multiple Sclerosis", risk_increase: "1.2x", onset: "Young adulthood", severity: "moderate", mechanism: "IL-6 promotes Th17 differentiation → autoimmune demyelination.", evidence: "Baranzini et al., Genome Res 2009; Brod et al., J Neuroimmunol 2022" },
    ],
    prevention: [
      { strategy: "Mediterranean Anti-inflammatory Diet", effectiveness: "High", timing: "From weaning", detail: "Omega-3 rich fish 3x/week, olive oil, vegetables, berries, turmeric. Reduces baseline hs-CRP by 20-30% in GG carriers." },
      { strategy: "Omega-3 Supplementation (EPA/DHA)", effectiveness: "High", timing: "Maternal → breastmilk → age-appropriate doses", detail: "2g/day (adult dose). EPA specifically suppresses IL-6 transcription via NF-κB pathway." },
      { strategy: "Regular hs-CRP Monitoring", effectiveness: "Moderate", timing: "From adolescence, annually", detail: "Track inflammation baseline. Target hs-CRP < 1.0 mg/L. Flag if persistently > 2.0." },
      { strategy: "Vaccination Priority", effectiveness: "High", timing: "Per schedule + flu/COVID boosters", detail: "GG carriers are at higher risk for severe infection. Keep all vaccinations current. Consider prophylactic antivirals during pandemics." },
      { strategy: "Curcumin + Boswellia Supplementation", effectiveness: "Moderate", timing: "From adolescence", detail: "Curcumin 500mg/day (BCM-95) + Boswellia 300mg. Both suppress IL-6 transcription. Safe long-term." },
      { strategy: "Stress Management (HPA-IL-6 Axis)", effectiveness: "Moderate", timing: "From childhood", detail: "Chronic stress elevates cortisol → paradoxically increases IL-6 via glucocorticoid resistance. Teach stress management early." },
    ],
  },
  {
    gene: "VDR", rsid: "rs90000010", offspring_genotype: "CC (BB, reduced expression)",
    probability: "100%",
    diseases: [
      { name: "Osteoporosis / Low Bone Mineral Density", risk_increase: "1.5–2.0x", onset: "From puberty peak bone mass", severity: "moderate", mechanism: "Reduced VDR expression → impaired intestinal calcium absorption → suboptimal bone mineralization during growth.", evidence: "Morrison et al., Nature 1994; Uitterlinden et al., Gene 2004" },
      { name: "Vitamin D Deficiency (Functional)", risk_increase: "High prevalence", onset: "From birth", severity: "moderate", mechanism: "BB genotype requires higher serum 25-OH-D levels to achieve same biological effect as Bb/bb.", evidence: "Jolliffe et al., Nutrients 2018" },
      { name: "Autoimmune Susceptibility (T1D, MS, SLE)", risk_increase: "1.2–1.4x", onset: "Childhood–adulthood", severity: "moderate", mechanism: "VDR modulates Treg/Th17 balance. Reduced VDR → impaired immune tolerance → autoimmune risk.", evidence: "Ramagopalan et al., PLoS Genet 2010; Feng et al., Autoimmun Rev 2023" },
      { name: "Dental Caries / Enamel Defects", risk_increase: "1.3x", onset: "Childhood", severity: "low", mechanism: "VDR regulates amelogenin expression. BB → weaker enamel mineralization.", evidence: "Küchler et al., Caries Res 2018" },
    ],
    prevention: [
      { strategy: "Vitamin D3 Supplementation from Birth", effectiveness: "High", timing: "400 IU/day from birth, increase with age", detail: "Target serum 25-OH-D > 40 ng/mL (higher than standard 30 for BB genotype). Monitor every 6 months." },
      { strategy: "Vitamin K2 (MK-7) Co-supplementation", effectiveness: "High", timing: "From age 1+", detail: "K2 directs calcium to bones, prevents vascular calcification. 45-100 mcg/day age-appropriate." },
      { strategy: "Calcium-Rich Diet", effectiveness: "Moderate", timing: "From weaning", detail: "Dairy, sardines, leafy greens. Aim 500-1000mg/day depending on age. Time with vitamin D." },
      { strategy: "Weight-Bearing Exercise", effectiveness: "High", timing: "From age 3+", detail: "Running, jumping, climbing build peak bone mass. Critical window: puberty to age 25. BB genotype makes this non-negotiable." },
      { strategy: "DEXA Scan at Puberty", effectiveness: "Moderate", timing: "Age 12-14", detail: "Baseline bone density measurement. Repeat every 2-3 years to track peak bone mass accumulation." },
    ],
  },
  {
    gene: "MTNR1B", rsid: "rs90000011", offspring_genotype: "GG (homozygous risk)",
    probability: "25%",
    diseases: [
      { name: "Gestational Diabetes (if female offspring)", risk_increase: "1.6x", onset: "Pregnancy", severity: "moderate", mechanism: "Impaired melatonin-insulin signaling → beta-cell dysfunction → glucose intolerance during pregnancy.", evidence: "Lyssenko et al., Nat Genet 2009" },
      { name: "Type 2 Diabetes", risk_increase: "1.3–1.5x", onset: "Adulthood", severity: "moderate", mechanism: "GG → enhanced melatonin receptor signaling in pancreatic β-cells → reduced insulin secretion, especially with late meals.", evidence: "Tuomi et al., Nat Genet 2016; Lane et al., Nat Genet 2012" },
      { name: "Impaired Fasting Glucose", risk_increase: "1.4x", onset: "Adolescence+", severity: "low", mechanism: "Melatonin-glucose coupling disrupted → fasting hyperglycemia even without frank diabetes.", evidence: "Prokopenko et al., Nat Genet 2009" },
      { name: "Sleep-Metabolic Disruption", risk_increase: "Functional", onset: "Any age", severity: "low", mechanism: "Late eating (within 2h of sleep) has amplified metabolic impact in GG carriers — worse glucose tolerance.", evidence: "Lopez-Minguez et al., Am J Clin Nutr 2018" },
    ],
    prevention: [
      { strategy: "Strict Meal Timing", effectiveness: "High", timing: "From toddler stage", detail: "Dinner cutoff 3+ hours before bed. No late-night snacking. This single intervention reduces diabetes risk by ~30% in GG." },
      { strategy: "Low-Glycemic Diet", effectiveness: "High", timing: "From weaning", detail: "Avoid refined carbs, especially at dinner. Complex carbs, high fiber, protein-paired meals." },
      { strategy: "Consistent Sleep Schedule", effectiveness: "Moderate", timing: "From infancy", detail: "Melatonin rhythm stability is critical. Consistent bed/wake times. Dark bedroom. Limit blue light after sunset." },
      { strategy: "Fasting Glucose Screening", effectiveness: "Moderate", timing: "Annually from age 10", detail: "If GG confirmed: OGTT at age 15. Annual HbA1c from age 18. Early intervention with metformin if prediabetic." },
    ],
  },
  {
    gene: "OPRM1", rsid: "rs90000013", offspring_genotype: "GG (homozygous)",
    probability: "25%",
    diseases: [
      { name: "Altered Pain Sensitivity (Higher Pain Threshold Needed)", risk_increase: "Functional change", onset: "From birth", severity: "moderate", mechanism: "GG → reduced mu-opioid receptor expression → decreased endogenous opioid signaling → higher opioid dose requirements.", evidence: "Fillingim et al., Pain 2005; Mura et al., Mol Pain 2013" },
      { name: "Opioid Non-Response / Under-Treatment of Pain", risk_increase: "Clinical risk", onset: "Surgical/medical settings", severity: "moderate", mechanism: "Standard opioid doses may be insufficient. Risk of under-treatment during surgery, injury, or procedures.", evidence: "Crist & Berrettini, Pharmacogenomics 2014" },
      { name: "Altered Reward Processing / Addiction Susceptibility", risk_increase: "1.2–1.5x for alcohol dependence", onset: "Adolescence+", severity: "moderate", mechanism: "Reduced endogenous reward signaling → may seek stronger stimuli. Paradoxically both risk and protective effects reported.", evidence: "Ray & Hutchison, Arch Gen Psychiatry 2004; Ramchandani et al., Mol Psychiatry 2011" },
    ],
    prevention: [
      { strategy: "Pharmacogenomic Card / Medical Alert", effectiveness: "High", timing: "From birth", detail: "Document OPRM1 GG status in all medical records. Alert anesthesiologists before any procedure. Non-opioid pain strategies preferred." },
      { strategy: "Non-Opioid Pain Management Education", effectiveness: "High", timing: "From childhood", detail: "Teach non-pharmacological pain management: breathing, mindfulness, TENS, acupuncture. Reduce future opioid dependency risk." },
      { strategy: "Substance Use Awareness", effectiveness: "Moderate", timing: "Pre-adolescence", detail: "Open discussion about reward sensitivity and addiction risk. Not scare tactics — evidence-based awareness." },
    ],
  },
];

// Recommended follow-up tests based on genomic + biomarker data
export const RECOMMENDED_TESTS = [
  { id: "rt-1", test: "Homocysteine Panel", reason: "MTHFR C677T het — monitor methylation effectiveness", urgency: "routine", gene: "MTHFR", interval: "6 months", last_done: "2026-04-01", next_due: "2026-10-01" },
  { id: "rt-2", test: "25-OH Vitamin D", reason: "VDR BsmI BB — compensatory D3 dosing requires monitoring", urgency: "routine", gene: "VDR", interval: "6 months", last_done: "2026-04-01", next_due: "2026-10-01" },
  { id: "rt-3", test: "Fasting Insulin + HOMA-IR", reason: "FTO AT + MTNR1B CG — insulin sensitivity surveillance", urgency: "recommended", gene: "FTO/MTNR1B", interval: "6 months", last_done: "2026-04-01", next_due: "2026-10-01" },
  { id: "rt-4", test: "hs-CRP + IL-6 Serum", reason: "IL-6 GG pro-inflammatory phenotype — track inflammation", urgency: "recommended", gene: "IL-6", interval: "6 months", last_done: "2026-04-01", next_due: "2026-10-01" },
  { id: "rt-5", test: "CoQ10 Serum Level", reason: "NQO1 AG — 2-4x reduced CoQ10 regeneration, verify supplementation", urgency: "recommended", gene: "NQO1", interval: "12 months", last_done: null, next_due: "2026-07-01" },
  { id: "rt-6", test: "Comprehensive Metabolic Panel", reason: "Baseline metabolic surveillance", urgency: "routine", gene: null, interval: "12 months", last_done: "2026-04-01", next_due: "2027-04-01" },
  { id: "rt-7", test: "Coronary Calcium Score", reason: "Male 29+, family history APOE e4 carrier father", urgency: "consider", gene: "APOE (family)", interval: "3-5 years", last_done: null, next_due: "2026-12-01" },
  { id: "rt-8", test: "DEXA Body Composition", reason: "FTO carrier — monitor lean mass vs fat distribution", urgency: "consider", gene: "FTO", interval: "12 months", last_done: null, next_due: "2026-07-01" },
];

// Past test history timeline
export const TEST_HISTORY = [
  { date: "2026-04-01", test: "Comprehensive Metabolic Panel + Lipids", facility: "Sample Medical Center", result: "All within range", flag: null },
  { date: "2026-04-01", test: "Hormone Panel (Testosterone, TSH)", facility: "Sample Medical Center", result: "Total T: 620 ng/dL, TSH: 2.1", flag: null },
  { date: "2026-04-01", test: "Inflammation Markers (hs-CRP, Ferritin)", facility: "Sample Medical Center", result: "hs-CRP 0.8 mg/L, Ferritin 95", flag: null },
  { date: "2026-03-31", test: "Whole Genome Sequencing (DemoGene)", facility: "DemoBio / DemoGene", result: "12.1M variants, 18 clinical SNPs annotated", flag: null },
  { date: "2026-03-01", test: "Annual Physical Exam", facility: "City General Hospital", result: "BMI 24.2, BP 118/76, all systems normal", flag: null },
  { date: "2025-10-15", test: "Vitamin D + Homocysteine", facility: "Sample Medical Center", result: "25-OH-D: 48 ng/mL, Hcy: 10.1", flag: "borderline" },
  { date: "2025-07-01", test: "Lipid Panel", facility: "City General Hospital", result: "LDL 115, HDL 53, TG 105", flag: "borderline" },
  { date: "2025-04-01", test: "Comprehensive Metabolic Panel", facility: "Sample Medical Center", result: "Hcy: 12.8 (elevated), D: 35 (suboptimal)", flag: "attention" },
  { date: "2025-01-15", test: "HbA1c + Fasting Glucose", facility: "City General Hospital", result: "HbA1c 5.3%, FBG 92 mg/dL", flag: null },
  { date: "2024-10-01", test: "Vitamin D", facility: "City General Hospital", result: "25-OH-D: 28 ng/mL (deficient)", flag: "attention" },
];

// Nearby hospitals in Demo City with ratings
export const NEARBY_HOSPITALS = [
  { name: "Sample Medical Center", type: "Tier 3A General", distance: "3.2 km", rating: 4.8, specialties: ["Endocrinology","Cardiology","Genomic Medicine"], lat: 39.9087, lng: 116.4169, phone: "010-69155564" },
  { name: "City General Hospital", type: "Tier 3A General", distance: "2.8 km", rating: 4.6, specialties: ["Internal Medicine","Geriatrics","Lab Services"], lat: 39.9055, lng: 116.4208, phone: "010-85132266" },
  { name: "University Health Center", type: "Tier 3A General", distance: "5.1 km", rating: 4.7, specialties: ["Nephrology","Cardiovascular","Genetics"], lat: 39.9338, lng: 116.3719, phone: "010-83572211" },
  { name: "Chinese PLA General Hospital (301)", type: "Tier 3A Military", distance: "8.5 km", rating: 4.9, specialties: ["Surgery","Oncology","Neurology"], lat: 39.8718, lng: 116.2861, phone: "010-66887329" },
  { name: "Friendship Medical Center", type: "Tier 3A General", distance: "6.3 km", rating: 4.5, specialties: ["Pulmonology","Dermatology","Rehabilitation"], lat: 39.9809, lng: 116.4276, phone: "010-84205566" },
  { name: "Eye Specialty Hospital", type: "Specialty", distance: "4.1 km", rating: 4.4, specialties: ["Ophthalmology","LASIK","Retina"], lat: 39.9245, lng: 116.4312, phone: "010-67011655" },
];

// Gene publication trend data (approximate from PubMed)
export const GENE_PUBLICATION_TRENDS = [
  { gene: "MTHFR", data: [
    { year: 2015, pubs: 380, topic: "Folate metabolism" }, { year: 2016, pubs: 410, topic: "Neural tube defects" },
    { year: 2017, pubs: 445, topic: "Hyperhomocysteinemia" }, { year: 2018, pubs: 480, topic: "Cancer risk meta-analyses" },
    { year: 2019, pubs: 510, topic: "Epigenetics" }, { year: 2020, pubs: 530, topic: "COVID-19 methylation" },
    { year: 2021, pubs: 560, topic: "One-carbon metabolism" }, { year: 2022, pubs: 580, topic: "Psychiatric genetics" },
    { year: 2023, pubs: 610, topic: "Multi-omics integration" }, { year: 2024, pubs: 640, topic: "Precision supplementation" },
    { year: 2025, pubs: 520, topic: "Metabolic evaluation > genotype" },
  ], mechanism: "C677T reduces enzyme thermostability → impaired 5-MTHF production → elevated homocysteine → cardiovascular/neural risk. Treated with active folate supplementation.", total: 5665 },
  { gene: "APOE", data: [
    { year: 2015, pubs: 920, topic: "Alzheimer's genetics" }, { year: 2016, pubs: 980, topic: "Lipid transport" },
    { year: 2017, pubs: 1050, topic: "Immunotherapy response" }, { year: 2018, pubs: 1120, topic: "Blood-brain barrier" },
    { year: 2019, pubs: 1200, topic: "Tau interaction" }, { year: 2020, pubs: 1350, topic: "COVID-19 risk" },
    { year: 2021, pubs: 1480, topic: "Gene therapy approaches" }, { year: 2022, pubs: 1550, topic: "Anti-amyloid trials" },
    { year: 2023, pubs: 1620, topic: "Lecanemab era" }, { year: 2024, pubs: 1700, topic: "Structure-function" },
    { year: 2025, pubs: 1450, topic: "e2 protective mechanisms" },
  ], mechanism: "APOE mediates lipid/cholesterol transport in CNS. e4 → impaired Aβ clearance → amyloid accumulation. e2 protective via enhanced receptor binding and anti-inflammatory signaling.", total: 14420 },
  { gene: "BDNF", data: [
    { year: 2015, pubs: 620, topic: "Synaptic plasticity" }, { year: 2016, pubs: 660, topic: "Depression/SSRI response" },
    { year: 2017, pubs: 710, topic: "Exercise neuroscience" }, { year: 2018, pubs: 740, topic: "Memory consolidation" },
    { year: 2019, pubs: 780, topic: "Epigenetic regulation" }, { year: 2020, pubs: 810, topic: "Stress resilience" },
    { year: 2021, pubs: 850, topic: "Neuroinflammation" }, { year: 2022, pubs: 890, topic: "Ketamine/psychedelic" },
    { year: 2023, pubs: 940, topic: "Digital therapeutics" }, { year: 2024, pubs: 980, topic: "TMS + BDNF" },
    { year: 2025, pubs: 820, topic: "Electrical stimulation" },
  ], mechanism: "Val66Met impairs activity-dependent BDNF secretion from dendrites → reduced hippocampal LTP → memory/mood effects. Met/Met: exercise is primary upregulator; electrical stimulation emerging alternative.", total: 8800 },
  { gene: "COMT", data: [
    { year: 2015, pubs: 310, topic: "Schizophrenia risk" }, { year: 2016, pubs: 330, topic: "Pain perception" },
    { year: 2017, pubs: 350, topic: "Executive function" }, { year: 2018, pubs: 370, topic: "Estrogen metabolism" },
    { year: 2019, pubs: 390, topic: "Warrior/worrier model" }, { year: 2020, pubs: 410, topic: "Cognitive aging" },
    { year: 2021, pubs: 430, topic: "Pharmacogenomics" }, { year: 2022, pubs: 440, topic: "ADHD treatment" },
    { year: 2023, pubs: 460, topic: "Stress-cognition interaction" }, { year: 2024, pubs: 480, topic: "Dopamine signaling" },
    { year: 2025, pubs: 400, topic: "Catecholamine master regulator" },
  ], mechanism: "Val158Met determines catechol-O-methyltransferase activity. Val/Val (3-4x activity) → rapid dopamine clearance → stress resilience but need external stimulation. Met/Met → higher prefrontal dopamine → better baseline cognition but stress vulnerability.", total: 4370 },
  { gene: "FTO", data: [
    { year: 2015, pubs: 280, topic: "Obesity GWAS" }, { year: 2016, pubs: 310, topic: "m6A RNA modification" },
    { year: 2017, pubs: 360, topic: "IRX3 regulation" }, { year: 2018, pubs: 420, topic: "Epitranscriptomics" },
    { year: 2019, pubs: 480, topic: "Cancer m6A" }, { year: 2020, pubs: 560, topic: "Adipogenesis" },
    { year: 2021, pubs: 640, topic: "Immune evasion" }, { year: 2022, pubs: 720, topic: "mRNA therapeutics" },
    { year: 2023, pubs: 810, topic: "m6A drug targets" }, { year: 2024, pubs: 890, topic: "Muscle aging CRISPR" },
    { year: 2025, pubs: 750, topic: "Metabolic syndrome" },
  ], mechanism: "FTO demethylates m6A on mRNA → alters expression of IRX3/IRX5 in hypothalamus → increased adipocyte thermogenesis disruption. Risk allele also accelerates muscle progenitor senescence via IGF signaling.", total: 6220 },
  { gene: "IL-6", data: [
    { year: 2015, pubs: 1200, topic: "Autoimmune pathogenesis" }, { year: 2016, pubs: 1280, topic: "JAK-STAT signaling" },
    { year: 2017, pubs: 1350, topic: "Tocilizumab trials" }, { year: 2018, pubs: 1400, topic: "CRS/CAR-T" },
    { year: 2019, pubs: 1450, topic: "Immunometabolism" }, { year: 2020, pubs: 2100, topic: "COVID-19 cytokine storm" },
    { year: 2021, pubs: 2400, topic: "Long COVID" }, { year: 2022, pubs: 1800, topic: "IL-6 blockade" },
    { year: 2023, pubs: 1600, topic: "Cancer immunotherapy" }, { year: 2024, pubs: 1500, topic: "Aging inflammasome" },
    { year: 2025, pubs: 1250, topic: "TNF inhibitor response" },
  ], mechanism: "G>C -174 promoter variant controls IL-6 transcription. GG → high constitutive expression → systemic low-grade inflammation → CVD, RA, severe infection risk. Anti-inflammatory interventions (omega-3, curcumin) and IL-6 receptor blockade are key therapeutics.", total: 17330 },
];

// Workout YouTube demo content
export const WORKOUT_DEMOS = [
  { exercise: "Bench Press", videoId: "rT7DgCr-3pg", channel: "Jeff Nippard", description: "Perfect bench press form for hypertrophy", category: "Push" },
  { exercise: "Deadlift", videoId: "op9kVnSo6Qc", channel: "Alan Thrall", description: "How to deadlift with proper hip hinge", category: "Pull" },
  { exercise: "Squat", videoId: "bEv6CCg2BC8", channel: "Squat University", description: "Fix your squat depth and knee tracking", category: "Legs" },
  { exercise: "Pull-ups", videoId: "eGo4IYlbE5g", channel: "Jeff Nippard", description: "Pull-up progression from beginner to weighted", category: "Pull" },
  { exercise: "OHP", videoId: "2yjwXTZQDDI", channel: "Alan Thrall", description: "Overhead press technique breakdown", category: "Push" },
  { exercise: "HIIT Sprint", videoId: "Mvo2snJGhtM", channel: "Athlean-X", description: "HIIT protocol for maximum fat loss", category: "Cardio" },
  { exercise: "Zone 2 Cardio", videoId: "kd8R1BjKoIc", channel: "Peter Attia", description: "Why zone 2 cardio is the foundation of longevity", category: "Cardio" },
  { exercise: "Yoga Flow", videoId: "v7AYKMP6rOE", channel: "Yoga With Adriene", description: "Full body yoga for recovery days", category: "Recovery" },
];

export const WORKOUTS = [
  { id: "wk-1", day_of_week: "Monday", type: "Push", exercises: JSON.stringify(["Bench Press 4x8","OHP 3x10","Incline DB 3x12","Lateral Raises 3x15","Tricep Dips 3x12"]), duration_min: 65, calories: 420, completed: 1 },
  { id: "wk-2", day_of_week: "Tuesday", type: "Pull", exercises: JSON.stringify(["Deadlift 4x5","Pull-ups 4x8","Barbell Row 3x10","Face Pulls 3x15","Bicep Curls 3x12"]), duration_min: 60, calories: 450, completed: 1 },
  { id: "wk-3", day_of_week: "Wednesday", type: "Zone 2 Cardio", exercises: JSON.stringify(["Zone 2 Walk 45min","Stretching 15min"]), duration_min: 60, calories: 280, completed: 1 },
  { id: "wk-4", day_of_week: "Thursday", type: "Legs", exercises: JSON.stringify(["Squat 4x6","RDL 3x10","Leg Press 3x12","Leg Curl 3x12","Calf Raises 4x15"]), duration_min: 70, calories: 520, completed: 0 },
  { id: "wk-5", day_of_week: "Friday", type: "Upper", exercises: JSON.stringify(["Weighted Chin-ups 4x6","DB Press 3x10","Cable Row 3x12","Arnold Press 3x10"]), duration_min: 55, calories: 390, completed: 0 },
  { id: "wk-6", day_of_week: "Saturday", type: "HIIT + Core", exercises: JSON.stringify(["Sprint Intervals 20min","Plank 3x60s","Ab Wheel 3x10"]), duration_min: 45, calories: 350, completed: 0 },
  { id: "wk-7", day_of_week: "Sunday", type: "Active Recovery", exercises: JSON.stringify(["Yoga 30min","Foam Rolling 15min","Light Walk 30min"]), duration_min: 75, calories: 200, completed: 0 },
];
