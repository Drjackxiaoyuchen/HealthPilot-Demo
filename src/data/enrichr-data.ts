/**
 * enrichr-data.ts
 *
 * Enrichment analysis results and genomic variant data for HealthPilot precision health platform.
 * Contains KEGG, Reactome, GWAS, DisGeNET, and GO enrichment data along with family variant comparisons.
 *
 * Data reflects analysis from Alex Morgan (29M), Jordan Morgan (28F, wife), Linda Morgan (55F, mother),
 * and Robert Morgan (58M, father) genomic profiles.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface KEGGPathway {
  term: string;
  overlap: string;
  pvalue: number;
  adjusted_pvalue: number;
  odds_ratio: number;
  combined_score: number;
  genes: string[];
  category: string;
}

export interface ReactomePathway {
  term: string;
  pvalue: number;
  adjusted_pvalue: number;
  genes: string[];
  category: string;
}

export interface GWASAssociation {
  trait: string;
  rsid: string;
  gene: string;
  pvalue: number;
  odds_ratio: number;
  sample_size: number;
  study: string;
  population: string;
  year: number;
  category: string;
}

export interface DisGeNETDisease {
  disease: string;
  gene: string;
  score: number;
  evidence_count: number;
  source: "curated" | "literature" | "animal_model";
  disease_class: string;
  semantic_type: string;
}

export interface GOBiologicalProcess {
  term: string;
  go_id: string;
  pvalue: number;
  genes: string[];
  category: string;
}

export interface FamilyVariant {
  gene: string;
  rsid: string;
  alex: string;
  jordan: string;
  mom: string;
  dad: string;
  risk_level: "low" | "moderate" | "high";
  category: string;
  concordance: "all_same" | "couple_same" | "all_different" | "partial";
}

export interface PRSEstimate {
  trait: string;
  score: number;
  percentile: number;
  risk_category: "low" | "average" | "elevated" | "high";
  contributing_snps: number;
  population_reference: string;
  interpretation: string;
}

export interface PharmacogenomicProfile {
  gene: string;
  rsid: string;
  genotype: string;
  phenotype: string;
  affected_drugs: string[];
  clinical_action: string;
  evidence_level: "1A" | "1B" | "2A" | "2B" | "3";
  source: "CPIC" | "DPWG" | "PharmGKB";
  person: "Alex" | "Jordan" | "Both";
}

export interface EnrichmentSummary {
  total_genes_analyzed: number;
  total_pathways_significant: number;
  total_diseases_associated: number;
  analysis_date: string;
  genome_build: string;
  enrichr_libraries_used: string[];
}

// ============================================================================
// KEGG PATHWAY ENRICHMENT
// ============================================================================

export const KEGG_ENRICHMENT: KEGGPathway[] = [
  {
    term: "Folate biosynthesis",
    overlap: "4/8",
    pvalue: 2.3e-12,
    adjusted_pvalue: 1.8e-10,
    odds_ratio: 42.5,
    combined_score: 187.3,
    genes: ["MTHFR", "SHMT1", "MTHFD1", "DHFR"],
    category: "Metabolism",
  },
  {
    term: "One carbon pool by folate",
    overlap: "5/21",
    pvalue: 1.8e-11,
    adjusted_pvalue: 1.4e-9,
    odds_ratio: 38.2,
    combined_score: 172.8,
    genes: ["MTHFR", "SHMT1", "MTHFD1", "DHFR", "TYMS"],
    category: "Metabolism",
  },
  {
    term: "Drug metabolism - cytochrome P450",
    overlap: "6/50",
    pvalue: 3.4e-10,
    adjusted_pvalue: 2.1e-8,
    odds_ratio: 28.7,
    combined_score: 156.2,
    genes: ["CYP2D6", "CYP2C19", "CYP1A2", "GSTP1", "NQO1", "COMT"],
    category: "Metabolism",
  },
  {
    term: "Fatty acid metabolism",
    overlap: "4/42",
    pvalue: 5.2e-9,
    adjusted_pvalue: 3.1e-7,
    odds_ratio: 24.3,
    combined_score: 142.1,
    genes: ["FTO", "PPARG", "CPT1A", "ACSL4"],
    category: "Metabolism",
  },
  {
    term: "Tyrosine metabolism",
    overlap: "3/44",
    pvalue: 7.8e-8,
    adjusted_pvalue: 4.2e-6,
    odds_ratio: 19.6,
    combined_score: 128.5,
    genes: ["COMT", "MAO", "DDC"],
    category: "Metabolism",
  },
  {
    term: "MAPK signaling pathway",
    overlap: "7/260",
    pvalue: 1.2e-7,
    adjusted_pvalue: 6.3e-6,
    odds_ratio: 16.8,
    combined_score: 115.7,
    genes: ["BDNF", "MAPK3", "MAPK1", "RAF1", "MEK1", "MEK2", "ERK1"],
    category: "Signaling",
  },
  {
    term: "PI3K-Akt signaling pathway",
    overlap: "6/352",
    pvalue: 2.1e-6,
    adjusted_pvalue: 1.0e-4,
    odds_ratio: 13.2,
    combined_score: 98.6,
    genes: ["BDNF", "FTO", "PPARG", "AKT1", "AKT2", "AKT3"],
    category: "Signaling",
  },
  {
    term: "Calcium signaling pathway",
    overlap: "5/180",
    pvalue: 4.3e-6,
    adjusted_pvalue: 1.9e-4,
    odds_ratio: 11.5,
    combined_score: 87.2,
    genes: ["BDNF", "MTNR1B", "IP3R", "RYANR", "CALM"],
    category: "Signaling",
  },
  {
    term: "mTOR signaling pathway",
    overlap: "4/155",
    pvalue: 8.5e-6,
    adjusted_pvalue: 3.5e-4,
    odds_ratio: 10.1,
    combined_score: 79.4,
    genes: ["BDNF", "AKT1", "TSC1", "TSC2"],
    category: "Signaling",
  },
  {
    term: "HIF-1 signaling pathway",
    overlap: "4/120",
    pvalue: 1.3e-5,
    adjusted_pvalue: 5.2e-4,
    odds_ratio: 9.3,
    combined_score: 72.8,
    genes: ["BDNF", "VDR", "VEGFA", "CTNNB1"],
    category: "Signaling",
  },
  {
    term: "Oxidative phosphorylation",
    overlap: "3/98",
    pvalue: 2.8e-5,
    adjusted_pvalue: 1.1e-3,
    odds_ratio: 8.2,
    combined_score: 63.5,
    genes: ["SOD2", "COX1", "ATP5F1A"],
    category: "Energy Metabolism",
  },
  {
    term: "Vitamin digestion and absorption",
    overlap: "4/67",
    pvalue: 3.1e-5,
    adjusted_pvalue: 1.2e-3,
    odds_ratio: 8.9,
    combined_score: 67.2,
    genes: ["VDR", "CASR", "CUBN", "APOB"],
    category: "Metabolism",
  },
  {
    term: "Alzheimer disease",
    overlap: "5/152",
    pvalue: 4.2e-5,
    adjusted_pvalue: 1.5e-3,
    odds_ratio: 8.1,
    combined_score: 61.3,
    genes: ["APOE", "BDNF", "APP", "PSEN1", "MAPT"],
    category: "Disease",
  },
  {
    term: "Parkinson disease",
    overlap: "4/127",
    pvalue: 6.8e-5,
    adjusted_pvalue: 2.3e-3,
    odds_ratio: 7.4,
    combined_score: 55.2,
    genes: ["BDNF", "COMT", "MAO", "SNCA"],
    category: "Disease",
  },
  {
    term: "Type II diabetes mellitus",
    overlap: "5/179",
    pvalue: 9.3e-5,
    adjusted_pvalue: 3.0e-3,
    odds_ratio: 7.8,
    combined_score: 58.6,
    genes: ["FTO", "MTNR1B", "PPARG", "KCNJ11", "TCF7L2"],
    category: "Disease",
  },
  {
    term: "Iron homeostasis",
    overlap: "3/45",
    pvalue: 1.1e-4,
    adjusted_pvalue: 3.4e-3,
    odds_ratio: 7.2,
    combined_score: 53.8,
    genes: ["HFE", "HAMP", "TFR1"],
    category: "Metabolism",
  },
  {
    term: "Pathways in cancer",
    overlap: "6/395",
    pvalue: 1.5e-4,
    adjusted_pvalue: 4.5e-3,
    odds_ratio: 6.1,
    combined_score: 47.2,
    genes: ["APOE", "BDNF", "FTO", "PPARG", "VEGFA", "EGFR"],
    category: "Disease",
  },
  {
    term: "Immune response - IL-6 signaling",
    overlap: "3/58",
    pvalue: 2.1e-4,
    adjusted_pvalue: 6.1e-3,
    odds_ratio: 6.8,
    combined_score: 50.5,
    genes: ["IL6", "STAT3", "JAK1"],
    category: "Signaling",
  },
  {
    term: "Glutathione metabolism",
    overlap: "3/34",
    pvalue: 2.5e-4,
    adjusted_pvalue: 7.0e-3,
    odds_ratio: 7.1,
    combined_score: 52.3,
    genes: ["GSTP1", "GSS", "GCLC"],
    category: "Metabolism",
  },
  {
    term: "Arachidonic acid metabolism",
    overlap: "3/55",
    pvalue: 3.2e-4,
    adjusted_pvalue: 8.8e-3,
    odds_ratio: 6.4,
    combined_score: 48.1,
    genes: ["IL6", "PLA2G4A", "COX2"],
    category: "Metabolism",
  },
];

// ============================================================================
// REACTOME PATHWAY ENRICHMENT
// ============================================================================

export const REACTOME_ENRICHMENT: ReactomePathway[] = [
  {
    term: "Biological oxidations",
    pvalue: 1.4e-11,
    adjusted_pvalue: 1.1e-9,
    genes: ["CYP2D6", "CYP2C19", "CYP1A2", "GSTP1", "NQO1", "SOD2"],
    category: "Metabolism",
  },
  {
    term: "Phase I - Functionalization of compounds",
    pvalue: 3.2e-10,
    adjusted_pvalue: 2.0e-8,
    genes: ["CYP2D6", "CYP2C19", "CYP1A2", "FMO1", "MAOA"],
    category: "Metabolism",
  },
  {
    term: "Phase II - Conjugation of compounds",
    pvalue: 2.8e-9,
    adjusted_pvalue: 1.5e-7,
    genes: ["GSTP1", "NQO1", "COMT", "UGT1A1", "SULT1A1"],
    category: "Metabolism",
  },
  {
    term: "Metabolism of vitamins and cofactors",
    pvalue: 4.1e-9,
    adjusted_pvalue: 2.1e-7,
    genes: ["MTHFR", "VDR", "CYP2R1", "CYP27A1", "CYP24A1"],
    category: "Metabolism",
  },
  {
    term: "Folate metabolism",
    pvalue: 5.3e-11,
    adjusted_pvalue: 3.2e-9,
    genes: ["MTHFR", "SHMT1", "MTHFD1", "DHFR", "TYMS"],
    category: "Metabolism",
  },
  {
    term: "Vitamin D metabolism",
    pvalue: 1.8e-8,
    adjusted_pvalue: 9.4e-7,
    genes: ["VDR", "CYP2R1", "CYP27A1", "CYP24A1", "DBP"],
    category: "Metabolism",
  },
  {
    term: "Cytochrome P450 reactions",
    pvalue: 2.5e-10,
    adjusted_pvalue: 1.6e-8,
    genes: ["CYP2D6", "CYP2C19", "CYP1A2", "CYP3A4", "CYP3A5"],
    category: "Metabolism",
  },
  {
    term: "Signaling by PDGF",
    pvalue: 3.1e-6,
    adjusted_pvalue: 1.4e-4,
    genes: ["BDNF", "PI3K", "MAPK1", "AKT1", "SRC"],
    category: "Signaling",
  },
  {
    term: "Signaling by FGF",
    pvalue: 4.2e-6,
    adjusted_pvalue: 1.8e-4,
    genes: ["BDNF", "MAPK3", "MAPK1", "PI3K", "FGFR1"],
    category: "Signaling",
  },
  {
    term: "Apoptotic pathway",
    pvalue: 6.8e-6,
    adjusted_pvalue: 2.7e-4,
    genes: ["BDNF", "BAX", "BAK1", "CASP9", "CASP3"],
    category: "Signaling",
  },
  {
    term: "Neural synaptic plasticity",
    pvalue: 8.5e-6,
    adjusted_pvalue: 3.2e-4,
    genes: ["BDNF", "NTRK2", "MAPK3", "CAMK4", "CREB1"],
    category: "Neuronal",
  },
  {
    term: "Calcium ion homeostasis",
    pvalue: 1.2e-5,
    adjusted_pvalue: 4.3e-4,
    genes: ["MTNR1B", "CASR", "IP3R", "RYANR", "PMCA"],
    category: "Signaling",
  },
  {
    term: "Circadian clock signaling",
    pvalue: 1.5e-5,
    adjusted_pvalue: 5.2e-4,
    genes: ["MTNR1B", "CLOCK", "BMAL1", "CRY1", "PER1"],
    category: "Neuronal",
  },
  {
    term: "Inflammatory response - NF-kB pathway",
    pvalue: 2.1e-5,
    adjusted_pvalue: 7.1e-4,
    genes: ["IL6", "TNF", "NFKB1", "IKBKG", "RELA"],
    category: "Immune",
  },
  {
    term: "Dopamine neurotransmitter metabolism",
    pvalue: 2.8e-5,
    adjusted_pvalue: 9.2e-4,
    genes: ["COMT", "MAO", "DDC", "TH", "SLC6A3"],
    category: "Neuronal",
  },
];

// ============================================================================
// GWAS CATALOG DISEASE ASSOCIATIONS
// ============================================================================

export const GWAS_DISEASE_ASSOCIATIONS: GWASAssociation[] = [
  {
    trait: "Body mass index",
    rsid: "rs90000006",
    gene: "FTO",
    pvalue: 4.5e-18,
    odds_ratio: 1.31,
    sample_size: 339224,
    study: "GIANT Consortium",
    population: "East Asian",
    year: 2015,
    category: "Metabolic",
  },
  {
    trait: "Type 2 diabetes",
    rsid: "rs90000024",
    gene: "TCF7L2",
    pvalue: 3.2e-20,
    odds_ratio: 1.37,
    sample_size: 898130,
    study: "DIAGRAM Consortium",
    population: "European",
    year: 2016,
    category: "Metabolic",
  },
  {
    trait: "Type 2 diabetes",
    rsid: "rs90000025",
    gene: "MTNR1B",
    pvalue: 2.1e-15,
    odds_ratio: 1.15,
    sample_size: 898130,
    study: "DIAGRAM Consortium",
    population: "Multi-ethnic",
    year: 2016,
    category: "Metabolic",
  },
  {
    trait: "Fasting glucose",
    rsid: "rs90000026",
    gene: "GCKR",
    pvalue: 5.8e-19,
    odds_ratio: 1.08,
    sample_size: 133010,
    study: "Meta-analysis",
    population: "European",
    year: 2012,
    category: "Metabolic",
  },
  {
    trait: "Alzheimer disease",
    rsid: "rs90000007",
    gene: "APOE",
    pvalue: 1.3e-22,
    odds_ratio: 3.68,
    sample_size: 63926,
    study: "Alzheimer's Disease Genetics Consortium",
    population: "European",
    year: 2013,
    category: "Neurological",
  },
  {
    trait: "Major depression",
    rsid: "rs90000005",
    gene: "BDNF",
    pvalue: 2.4e-12,
    odds_ratio: 1.18,
    sample_size: 677696,
    study: "PGC Major Depression",
    population: "European",
    year: 2018,
    category: "Neurological",
  },
  {
    trait: "Coronary artery disease",
    rsid: "rs90000027",
    gene: "CDKN2B-AS1",
    pvalue: 7.2e-25,
    odds_ratio: 1.28,
    sample_size: 184305,
    study: "CARDIoGRAMplusC4D",
    population: "European",
    year: 2015,
    category: "Cardiovascular",
  },
  {
    trait: "LDL cholesterol",
    rsid: "rs90000028",
    gene: "SORT1",
    pvalue: 1.8e-42,
    odds_ratio: 1.32,
    sample_size: 173715,
    study: "GLGC",
    population: "European",
    year: 2013,
    category: "Cardiovascular",
  },
  {
    trait: "Systolic blood pressure",
    rsid: "rs90000029",
    gene: "CACNB2",
    pvalue: 4.5e-16,
    odds_ratio: 1.07,
    sample_size: 200000,
    study: "ICBP",
    population: "European",
    year: 2016,
    category: "Cardiovascular",
  },
  {
    trait: "Caffeine consumption",
    rsid: "rs2472297",
    gene: "CYP1A2",
    pvalue: 1.2e-14,
    odds_ratio: 1.25,
    sample_size: 91462,
    study: "Meta-analysis",
    population: "European",
    year: 2015,
    category: "Pharmacogenetic",
  },
  {
    trait: "Warfarin dose",
    rsid: "rs9934438",
    gene: "CYP2C9",
    pvalue: 3.5e-16,
    odds_ratio: 1.89,
    sample_size: 5655,
    study: "PharmGKB",
    population: "European",
    year: 2009,
    category: "Pharmacogenetic",
  },
  {
    trait: "Metformin response in T2D",
    rsid: "rs8192678",
    gene: "SLCO1B1",
    pvalue: 4.2e-11,
    odds_ratio: 1.31,
    sample_size: 10000,
    study: "Pharmacogenomics",
    population: "European",
    year: 2011,
    category: "Pharmacogenetic",
  },
  {
    trait: "Osteoporosis",
    rsid: "rs90000009",
    gene: "VDR",
    pvalue: 2.8e-9,
    odds_ratio: 1.12,
    sample_size: 195000,
    study: "GEFOS Consortium",
    population: "European",
    year: 2018,
    category: "Metabolic",
  },
  {
    trait: "Iron overload (Hemochromatosis)",
    rsid: "rs90000015",
    gene: "HFE",
    pvalue: 1.1e-25,
    odds_ratio: 45.2,
    sample_size: 8500,
    study: "Hemochromatosis Registry",
    population: "European",
    year: 2012,
    category: "Metabolic",
  },
  {
    trait: "C-reactive protein levels",
    rsid: "rs1205",
    gene: "IL6",
    pvalue: 3.2e-18,
    odds_ratio: 1.15,
    sample_size: 88284,
    study: "CRP Genetics Consortium",
    population: "European",
    year: 2011,
    category: "Immune",
  },
  {
    trait: "Rheumatoid arthritis",
    rsid: "rs2104286",
    gene: "IL6R",
    pvalue: 4.8e-14,
    odds_ratio: 1.09,
    sample_size: 99999,
    study: "RACI",
    population: "European",
    year: 2012,
    category: "Immune",
  },
  {
    trait: "Parkinson disease",
    rsid: "rs17649553",
    gene: "SNCA",
    pvalue: 1.5e-17,
    odds_ratio: 1.52,
    sample_size: 13000,
    study: "International PD Genetics Consortium",
    population: "European",
    year: 2014,
    category: "Neurological",
  },
  {
    trait: "Prostate cancer",
    rsid: "rs1447295",
    gene: "EHBP1",
    pvalue: 8.2e-20,
    odds_ratio: 1.21,
    sample_size: 80000,
    study: "PRACTICAL Consortium",
    population: "European",
    year: 2018,
    category: "Cancer",
  },
  {
    trait: "Breast cancer",
    rsid: "rs3817198",
    gene: "ESR1",
    pvalue: 2.5e-19,
    odds_ratio: 1.12,
    sample_size: 120000,
    study: "BCAC",
    population: "European",
    year: 2017,
    category: "Cancer",
  },
  {
    trait: "Colorectal cancer",
    rsid: "rs6983267",
    gene: "MYC",
    pvalue: 1.4e-16,
    odds_ratio: 1.18,
    sample_size: 60000,
    study: "CCFR",
    population: "European",
    year: 2016,
    category: "Cancer",
  },
  {
    trait: "Inflammatory bowel disease",
    rsid: "rs11738067",
    gene: "IL23R",
    pvalue: 3.6e-22,
    odds_ratio: 1.34,
    sample_size: 75000,
    study: "IMSGC",
    population: "European",
    year: 2012,
    category: "Immune",
  },
  {
    trait: "Thyroid autoimmunity",
    rsid: "rs2476601",
    gene: "PTPN22",
    pvalue: 2.1e-18,
    odds_ratio: 1.45,
    sample_size: 35000,
    study: "Meta-analysis",
    population: "European",
    year: 2014,
    category: "Immune",
  },
  {
    trait: "Anxiety disorders",
    rsid: "rs1360780",
    gene: "CRHR1",
    pvalue: 5.3e-10,
    odds_ratio: 1.08,
    sample_size: 200000,
    study: "Anxiety Disorders",
    population: "European",
    year: 2016,
    category: "Neurological",
  },
  {
    trait: "Sleep duration",
    rsid: "rs9452621",
    gene: "MTNR1B",
    pvalue: 2.7e-11,
    odds_ratio: 1.06,
    sample_size: 128286,
    study: "Sleep Duration",
    population: "European",
    year: 2015,
    category: "Behavioral",
  },
  {
    trait: "Metabolic syndrome",
    rsid: "rs2943634",
    gene: "IL6R",
    pvalue: 1.5e-12,
    odds_ratio: 1.11,
    sample_size: 60000,
    study: "MetSyn Consortium",
    population: "Multi-ethnic",
    year: 2017,
    category: "Metabolic",
  },
];

// ============================================================================
// DISGENET DISEASE ASSOCIATIONS
// ============================================================================

export const DISGENET_DISEASES: DisGeNETDisease[] = [
  {
    disease: "Major depressive disorder",
    gene: "BDNF",
    score: 0.92,
    evidence_count: 156,
    source: "literature",
    disease_class: "Mental Disorders",
    semantic_type: "Mental or Behavioral Dysfunction",
  },
  {
    disease: "Obesity",
    gene: "FTO",
    score: 0.95,
    evidence_count: 234,
    source: "curated",
    disease_class: "Metabolic Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Type 2 diabetes mellitus",
    gene: "MTNR1B",
    score: 0.89,
    evidence_count: 128,
    source: "literature",
    disease_class: "Metabolic Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Type 2 diabetes mellitus",
    gene: "PPARG",
    score: 0.94,
    evidence_count: 267,
    source: "curated",
    disease_class: "Metabolic Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Alzheimer disease",
    gene: "APOE",
    score: 0.97,
    evidence_count: 2341,
    source: "curated",
    disease_class: "Neurodegenerative Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Hypertension",
    gene: "IL6",
    score: 0.85,
    evidence_count: 89,
    source: "literature",
    disease_class: "Cardiovascular Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Coronary heart disease",
    gene: "APOE",
    score: 0.90,
    evidence_count: 178,
    source: "literature",
    disease_class: "Cardiovascular Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Osteoporosis",
    gene: "VDR",
    score: 0.88,
    evidence_count: 142,
    source: "curated",
    disease_class: "Musculoskeletal Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Adverse drug reaction",
    gene: "CYP2D6",
    score: 0.91,
    evidence_count: 203,
    source: "curated",
    disease_class: "Disorders of Drug Metabolism",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Cytochrome P450 deficiency disease",
    gene: "CYP2C19",
    score: 0.87,
    evidence_count: 115,
    source: "literature",
    disease_class: "Disorders of Drug Metabolism",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Rheumatoid arthritis",
    gene: "IL6",
    score: 0.84,
    evidence_count: 76,
    source: "literature",
    disease_class: "Immune System Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Inflammatory bowel disease",
    gene: "IL6",
    score: 0.82,
    evidence_count: 63,
    source: "literature",
    disease_class: "Immune System Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Parkinson disease",
    gene: "COMT",
    score: 0.83,
    evidence_count: 92,
    source: "literature",
    disease_class: "Neurodegenerative Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Hemochromatosis",
    gene: "HFE",
    score: 0.96,
    evidence_count: 445,
    source: "curated",
    disease_class: "Metabolic Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Iron overload disease",
    gene: "HFE",
    score: 0.94,
    evidence_count: 289,
    source: "curated",
    disease_class: "Metabolic Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "NAD(P)H quinone oxidoreductase deficiency",
    gene: "NQO1",
    score: 0.89,
    evidence_count: 124,
    source: "curated",
    disease_class: "Metabolic Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Opioid use disorder",
    gene: "OPRM1",
    score: 0.81,
    evidence_count: 47,
    source: "literature",
    disease_class: "Mental Disorders",
    semantic_type: "Mental or Behavioral Dysfunction",
  },
  {
    disease: "Anxiety",
    gene: "BDNF",
    score: 0.80,
    evidence_count: 55,
    source: "literature",
    disease_class: "Mental Disorders",
    semantic_type: "Mental or Behavioral Dysfunction",
  },
  {
    disease: "Metabolic syndrome",
    gene: "FTO",
    score: 0.86,
    evidence_count: 98,
    source: "literature",
    disease_class: "Metabolic Diseases",
    semantic_type: "Disease or Syndrome",
  },
  {
    disease: "Dyslipidemia",
    gene: "PPARG",
    score: 0.79,
    evidence_count: 41,
    source: "literature",
    disease_class: "Metabolic Diseases",
    semantic_type: "Disease or Syndrome",
  },
];

// ============================================================================
// GO BIOLOGICAL PROCESSES
// ============================================================================

export const GO_BIOLOGICAL_PROCESSES: GOBiologicalProcess[] = [
  {
    term: "One-carbon metabolic process",
    go_id: "GO:0006730",
    pvalue: 3.2e-13,
    genes: ["MTHFR", "SHMT1", "MTHFD1", "DHFR"],
    category: "Metabolism",
  },
  {
    term: "Vitamin metabolic process",
    go_id: "GO:0042181",
    pvalue: 1.8e-11,
    genes: ["MTHFR", "VDR", "CYP2R1", "DHFR"],
    category: "Metabolism",
  },
  {
    term: "Response to oxidative stress",
    go_id: "GO:0006979",
    pvalue: 2.5e-10,
    genes: ["SOD2", "GSTP1", "NQO1", "CAT"],
    category: "Response to stimulus",
  },
  {
    term: "Dopamine metabolic process",
    go_id: "GO:0042417",
    pvalue: 4.1e-9,
    genes: ["COMT", "MAOA", "DDC"],
    category: "Neurotransmitter Metabolism",
  },
  {
    term: "Calcium ion homeostasis",
    go_id: "GO:0055074",
    pvalue: 5.8e-9,
    genes: ["MTNR1B", "CASR", "IP3R", "RYANR"],
    category: "Signaling",
  },
  {
    term: "Lipid metabolic process",
    go_id: "GO:0006629",
    pvalue: 8.2e-9,
    genes: ["FTO", "PPARG", "CPT1A", "ACSL4"],
    category: "Metabolism",
  },
  {
    term: "Inflammatory response",
    go_id: "GO:0006954",
    pvalue: 1.2e-8,
    genes: ["IL6", "TNF", "NFKB1", "RELA"],
    category: "Immune Response",
  },
  {
    term: "Glutathione metabolic process",
    go_id: "GO:0006749",
    pvalue: 1.5e-8,
    genes: ["GSTP1", "GSS", "GCLC"],
    category: "Metabolism",
  },
  {
    term: "Drug catabolic process",
    go_id: "GO:0042737",
    pvalue: 2.1e-8,
    genes: ["CYP2D6", "CYP2C19", "CYP1A2"],
    category: "Metabolism",
  },
  {
    term: "Brain-derived neurotrophic factor signaling pathway",
    go_id: "GO:0038179",
    pvalue: 3.2e-8,
    genes: ["BDNF", "NTRK2", "MAPK3", "PI3K"],
    category: "Signaling",
  },
  {
    term: "Regulation of synaptic plasticity",
    go_id: "GO:0048167",
    pvalue: 4.8e-8,
    genes: ["BDNF", "CAMK4", "CREB1", "MAPK1"],
    category: "Neuronal Processes",
  },
  {
    term: "Insulin secretion",
    go_id: "GO:0030073",
    pvalue: 6.5e-8,
    genes: ["MTNR1B", "KCNJ11", "TCF7L2"],
    category: "Signaling",
  },
  {
    term: "Iron ion transport",
    go_id: "GO:0030001",
    pvalue: 8.9e-8,
    genes: ["HFE", "HAMP", "DMT1"],
    category: "Transport",
  },
  {
    term: "Circadian rhythm",
    go_id: "GO:0007623",
    pvalue: 1.1e-7,
    genes: ["MTNR1B", "CLOCK", "BMAL1"],
    category: "Biological Rhythms",
  },
  {
    term: "Apoptotic process",
    go_id: "GO:0006915",
    pvalue: 1.4e-7,
    genes: ["BDNF", "BAX", "BAK1", "CASP9"],
    category: "Cell Death",
  },
];

// ============================================================================
// FAMILY VARIANT COMPARISON
// ============================================================================

export const FAMILY_VARIANT_COMPARISON: FamilyVariant[] = [
  {
    gene: "MTHFR",
    rsid: "rs90000001",
    alex: "CT",
    jordan: "CC",
    mom: "CT",
    dad: "N/A",
    risk_level: "moderate",
    category: "Folate Metabolism",
    concordance: "partial",
  },
  {
    gene: "COMT",
    rsid: "rs90000004",
    alex: "GG",
    jordan: "AG",
    mom: "AG",
    dad: "N/A",
    risk_level: "moderate",
    category: "Neurotransmitter Metabolism",
    concordance: "partial",
  },
  {
    gene: "BDNF",
    rsid: "rs90000005",
    alex: "AA",
    jordan: "AG",
    mom: "AG",
    dad: "N/A",
    risk_level: "high",
    category: "Neurotrophin Signaling",
    concordance: "partial",
  },
  {
    gene: "FTO",
    rsid: "rs90000006",
    alex: "AA",
    jordan: "AT",
    mom: "AT",
    dad: "N/A",
    risk_level: "moderate",
    category: "Metabolic",
    concordance: "partial",
  },
  {
    gene: "APOE",
    rsid: "rs90000007/rs90000019",
    alex: "e3/e3",
    jordan: "e3/e4",
    mom: "e3/e3",
    dad: "N/A",
    risk_level: "low",
    category: "Neurodegeneration",
    concordance: "all_different",
  },
  {
    gene: "IL6",
    rsid: "rs90000008",
    alex: "GG",
    jordan: "GC",
    mom: "GG",
    dad: "N/A",
    risk_level: "high",
    category: "Inflammation",
    concordance: "partial",
  },
  {
    gene: "VDR",
    rsid: "rs90000010",
    alex: "Bb",
    jordan: "BB",
    mom: "BB",
    dad: "N/A",
    risk_level: "low",
    category: "Vitamin D Metabolism",
    concordance: "partial",
  },
  {
    gene: "MTNR1B",
    rsid: "rs90000011",
    alex: "GC",
    jordan: "CC",
    mom: "GC",
    dad: "N/A",
    risk_level: "moderate",
    category: "Metabolic/Sleep",
    concordance: "partial",
  },
  {
    gene: "NQO1",
    rsid: "rs90000012",
    alex: "CC",
    jordan: "TC",
    mom: "TC",
    dad: "N/A",
    risk_level: "low",
    category: "Detoxification",
    concordance: "partial",
  },
  {
    gene: "OPRM1",
    rsid: "rs90000013",
    alex: "AA",
    jordan: "AG",
    mom: "AA",
    dad: "N/A",
    risk_level: "moderate",
    category: "Opioid Response",
    concordance: "partial",
  },
  {
    gene: "HFE",
    rsid: "rs90000015",
    alex: "AA",
    jordan: "AA",
    mom: "AG",
    dad: "N/A",
    risk_level: "low",
    category: "Iron Metabolism",
    concordance: "couple_same",
  },
  {
    gene: "SOD2",
    rsid: "rs90000016",
    alex: "TT",
    jordan: "CT",
    mom: "CT",
    dad: "N/A",
    risk_level: "low",
    category: "Antioxidant Defense",
    concordance: "partial",
  },
  {
    gene: "CYP2D6",
    rsid: "rs90000030",
    alex: "GG",
    jordan: "AG",
    mom: "AG",
    dad: "N/A",
    risk_level: "low",
    category: "Drug Metabolism",
    concordance: "partial",
  },
  {
    gene: "GSTP1",
    rsid: "rs90000018",
    alex: "AA",
    jordan: "AG",
    mom: "AA",
    dad: "N/A",
    risk_level: "low",
    category: "Detoxification",
    concordance: "partial",
  },
  {
    gene: "CYP2C19",
    rsid: "rs90000020",
    alex: "GG",
    jordan: "AG",
    mom: "GG",
    dad: "N/A",
    risk_level: "low",
    category: "Drug Metabolism",
    concordance: "all_different",
  },
  {
    gene: "CYP1A2",
    rsid: "rs90000021",
    alex: "AA",
    jordan: "AC",
    mom: "AC",
    dad: "N/A",
    risk_level: "low",
    category: "Drug Metabolism",
    concordance: "partial",
  },
  {
    gene: "PPARG",
    rsid: "rs90000022",
    alex: "CC",
    jordan: "CG",
    mom: "CC",
    dad: "N/A",
    risk_level: "moderate",
    category: "Metabolic",
    concordance: "partial",
  },
  {
    gene: "XRCC1",
    rsid: "rs90000023",
    alex: "GG",
    jordan: "GA",
    mom: "GG",
    dad: "N/A",
    risk_level: "low",
    category: "DNA Repair",
    concordance: "partial",
  },
];

// ============================================================================
// POLYGENIC RISK SCORE ESTIMATES
// ============================================================================

export const PRS_ESTIMATES: PRSEstimate[] = [
  {
    trait: "Coronary Artery Disease",
    score: 0.68,
    percentile: 72,
    risk_category: "elevated",
    contributing_snps: 47,
    population_reference: "East Asian",
    interpretation: "Family history of hypertension and paternal CAD history elevate risk. Standard preventive measures recommended.",
  },
  {
    trait: "Type 2 Diabetes",
    score: 0.42,
    percentile: 64,
    risk_category: "elevated",
    contributing_snps: 32,
    population_reference: "East Asian",
    interpretation: "FTO and MTNR1B variants contribute to moderate risk. Lifestyle intervention highly effective.",
  },
  {
    trait: "Alzheimer Disease",
    score: -0.88,
    percentile: 19,
    risk_category: "low",
    contributing_snps: 28,
    population_reference: "East Asian",
    interpretation: "APOE e3/e3 genotype is protective. Cognitive reserve typical for age.",
  },
  {
    trait: "Body Mass Index",
    score: 0.55,
    percentile: 68,
    risk_category: "elevated",
    contributing_snps: 38,
    population_reference: "East Asian",
    interpretation: "FTO rs90000006 (A allele) moderately elevates BMI risk. Dietary management important.",
  },
  {
    trait: "Major Depression",
    score: 0.84,
    percentile: 78,
    risk_category: "elevated",
    contributing_snps: 51,
    population_reference: "East Asian",
    interpretation: "BDNF Met/Met genotype and other variants increase susceptibility. Consider preventive measures.",
  },
  {
    trait: "Osteoporosis",
    score: 0.35,
    percentile: 61,
    risk_category: "average",
    contributing_snps: 24,
    population_reference: "East Asian",
    interpretation: "VDR Bb heterozygote. Adequate vitamin D and calcium intake sufficient.",
  },
  {
    trait: "Inflammatory Disease",
    score: 0.92,
    percentile: 81,
    risk_category: "elevated",
    contributing_snps: 43,
    population_reference: "East Asian",
    interpretation: "IL-6 GG genotype elevates inflammatory markers. Anti-inflammatory lifestyle beneficial.",
  },
  {
    trait: "Prostate Cancer",
    score: -0.25,
    percentile: 40,
    risk_category: "average",
    contributing_snps: 16,
    population_reference: "East Asian",
    interpretation: "Genetic risk is average. Standard screening recommendations apply.",
  },
  {
    trait: "Parkinson Disease",
    score: -0.45,
    percentile: 32,
    risk_category: "low",
    contributing_snps: 19,
    population_reference: "East Asian",
    interpretation: "No significant genetic risk factors identified. Environmental exposures more relevant.",
  },
  {
    trait: "Caffeine Metabolism",
    score: 1.15,
    percentile: 88,
    risk_category: "high",
    contributing_snps: 5,
    population_reference: "East Asian",
    interpretation: "CYP1A2 AA genotype = fast metabolizer. Higher caffeine tolerance; more caffeine-responsive.",
  },
];

// ============================================================================
// PHARMACOGENOMIC PROFILE
// ============================================================================

export const PHARMACOGENOMIC_PROFILE: PharmacogenomicProfile[] = [
  {
    gene: "CYP2D6",
    rsid: "rs90000030",
    genotype: "GG (Normal)",
    phenotype: "Normal Metabolizer",
    affected_drugs: ["codeine", "tramadol", "metoprolol", "fluoxetine", "paroxetine", "aripiprazole"],
    clinical_action: "Standard dosing recommended. Medications are metabolized at expected rate.",
    evidence_level: "1A",
    source: "CPIC",
    person: "Alex",
  },
  {
    gene: "CYP2C19",
    rsid: "rs90000020",
    genotype: "GG (Normal)",
    phenotype: "Normal Metabolizer",
    affected_drugs: ["citalopram", "escitalopram", "omeprazole", "pantoprazole", "clopidogrel"],
    clinical_action: "Standard dosing. Normal metabolism of SSRIs and proton pump inhibitors.",
    evidence_level: "1A",
    source: "CPIC",
    person: "Alex",
  },
  {
    gene: "CYP1A2",
    rsid: "rs90000021",
    genotype: "AA (Fast Metabolizer)",
    phenotype: "Fast Metabolizer",
    affected_drugs: ["caffeine", "theophylline", "clozapine", "tizanidine"],
    clinical_action: "Higher caffeine tolerance. Consider higher theophylline dosing if used. Monitor clozapine levels.",
    evidence_level: "1B",
    source: "PharmGKB",
    person: "Alex",
  },
  {
    gene: "COMT",
    rsid: "rs90000004",
    genotype: "GG (Low activity)",
    phenotype: "Low-Activity Metabolizer",
    affected_drugs: ["dopamine", "norepinephrine", "estrogen"],
    clinical_action: "May have increased sensitivity to dopaminergic drugs. Monitor for adverse effects with sympathomimetics.",
    evidence_level: "2B",
    source: "PharmGKB",
    person: "Alex",
  },
  {
    gene: "OPRM1",
    rsid: "rs90000013",
    genotype: "AA (Ancestral)",
    phenotype: "Standard Opioid Response",
    affected_drugs: ["morphine", "codeine", "oxycodone", "fentanyl"],
    clinical_action: "Standard opioid dosing appropriate. Normal analgesic response expected.",
    evidence_level: "2A",
    source: "PharmGKB",
    person: "Alex",
  },
  {
    gene: "GSTP1",
    rsid: "rs90000018",
    genotype: "AA (High activity)",
    phenotype: "High-Activity Metabolizer",
    affected_drugs: ["chemotherapy agents", "acetaminophen"],
    clinical_action: "May require higher chemotherapy doses. Standard acetaminophen dosing appropriate.",
    evidence_level: "2B",
    source: "PharmGKB",
    person: "Alex",
  },
  {
    gene: "NQO1",
    rsid: "rs90000012",
    genotype: "CC (Normal)",
    phenotype: "Normal Activity",
    affected_drugs: ["mitomycin C", "doxorubicin"],
    clinical_action: "Normal detoxification of NQO1 substrates. Standard dosing for cancer drugs.",
    evidence_level: "2B",
    source: "PharmGKB",
    person: "Alex",
  },
  {
    gene: "CYP2C19",
    rsid: "rs90000020",
    genotype: "AG (Normal/Intermediate)",
    phenotype: "Normal/Intermediate Metabolizer",
    affected_drugs: ["citalopram", "escitalopram", "omeprazole", "clopidogrel"],
    clinical_action: "Standard to slightly higher dosing. Monitor SSRI response; may need dose adjustment.",
    evidence_level: "1A",
    source: "CPIC",
    person: "Jordan",
  },
  {
    gene: "CYP1A2",
    rsid: "rs90000021",
    genotype: "AC (Intermediate Metabolizer)",
    phenotype: "Intermediate Metabolizer",
    affected_drugs: ["caffeine", "theophylline", "clozapine"],
    clinical_action: "Moderate caffeine sensitivity. Standard theophylline dosing; monitor levels if needed.",
    evidence_level: "1B",
    source: "PharmGKB",
    person: "Jordan",
  },
];

// ============================================================================
// ENRICHMENT ANALYSIS SUMMARY
// ============================================================================

export const ENRICHMENT_SUMMARY: EnrichmentSummary = {
  total_genes_analyzed: 18,
  total_pathways_significant: 35,
  total_diseases_associated: 20,
  analysis_date: "2026-04-11",
  genome_build: "GRCh37/hg19",
  enrichr_libraries_used: [
    "KEGG_2021_Human",
    "Reactome_2022",
    "GWAS_Catalog_2023",
    "DisGeNET",
    "GO_Biological_Process_2025",
    "GO_Molecular_Function_2025",
  ],
};
