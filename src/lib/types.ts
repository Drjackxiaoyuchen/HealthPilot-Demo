// ============================================================
// Core Types for Health Compass
// Based on FHIR R4 patterns (inspired by Medplum/Fasten)
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatarEmoji: string;
  createdAt: string;
}

export interface GenomicVariant {
  id: string;
  gene: string;
  variant: string;
  genotype: string;
  riskLevel: "low" | "moderate" | "high";
  category: string;
  impact: string;
  action: string;
  rsid?: string;
  chromosome?: string;
  position?: number;
}

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "with_meals";
  relatedGene?: string;
  reason: string;
  priority: "high" | "medium" | "low";
  status: "active" | "paused" | "stopped";
  brand?: string;
}

export interface SupplementConflict {
  supplement1: string;
  supplement2: string;
  severity: "synergy" | "safe" | "caution" | "critical";
  note: string;
}

export interface DailyLog {
  day: string; // YYYY-MM-DD
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  waterMl?: number;
  steps?: number;
  sleepHours?: number;
  sleepScore?: number;
  weightKg?: number;
  workoutCompleted?: boolean;
  workoutCalories?: number;
  workoutDurationMin?: number;
  workoutName?: string;
  healthScore?: number;
  updatedAt: string;
}

export interface Meal {
  id: string;
  day: string;
  time: string;
  mealType: "breakfast" | "snack" | "lunch" | "dinner";
  description: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Workout {
  id: string;
  dayOfWeek: string;
  type: string;
  exercises: string[];
  durationMin: number;
  calories: number;
  completed: boolean;
}

export interface BloodMarker {
  id: string;
  marker: string;
  value: number;
  unit: string;
  referenceLow: number;
  referenceHigh: number;
  status: "optimal" | "average" | "out_of_range";
  testDate: string;
  history: number[];
  category: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  doctor: string;
  facility: string;
  summary: string;
  status: "completed" | "scheduled" | "cancelled";
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  facility: string;
  type: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  purpose: string;
  relatedGene?: string;
  interactions: string[];
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "mild" | "moderate" | "serious" | "pharmacogenomic";
  note: string;
  relatedGene?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  avatarEmoji: string;
  healthScore: number;
  alerts: number;
  conditions: string[];
  lastCheckup: string;
}

// API response wrapper (inspired by Fasten)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
