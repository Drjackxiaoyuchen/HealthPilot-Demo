// Glucose & Metabolic demo data
// Source: real CGM trace from Sibionics sensor (April 19–26, 2026)
// Units: mmol/L (Chinese clinical convention). Multiply by 18 for mg/dL.

export const GLUCOSE_REF = {
  low: 3.9,
  high: 7.8,
  veryHigh: 10.0,
  fastingTarget: 5.6,
};

// 96-point CGM trace for "today" (2026-04-25), every 15 min
// Real data captured by a Sibionics CGM sensor — used here as demo data.
export const CGM_TODAY: { t: string; v: number }[] = [
  { t: "00:01", v: 6.0 }, { t: "00:16", v: 5.8 }, { t: "00:31", v: 5.6 }, { t: "00:46", v: 5.5 },
  { t: "01:01", v: 5.3 }, { t: "01:16", v: 5.4 }, { t: "01:31", v: 5.7 }, { t: "01:46", v: 5.4 },
  { t: "02:01", v: 4.9 }, { t: "02:16", v: 4.7 }, { t: "02:31", v: 4.8 }, { t: "02:46", v: 5.2 },
  { t: "03:01", v: 5.1 }, { t: "03:16", v: 4.9 }, { t: "03:31", v: 4.9 }, { t: "03:46", v: 5.4 },
  { t: "04:01", v: 5.2 }, { t: "04:16", v: 5.3 }, { t: "04:31", v: 5.0 }, { t: "04:46", v: 4.6 },
  { t: "05:01", v: 4.5 }, { t: "05:16", v: 5.3 }, { t: "05:31", v: 5.0 }, { t: "05:46", v: 5.1 },
  { t: "06:01", v: 4.9 }, { t: "06:16", v: 4.8 }, { t: "06:31", v: 4.9 }, { t: "06:46", v: 4.8 },
  { t: "07:01", v: 4.8 }, { t: "07:16", v: 4.7 }, { t: "07:31", v: 4.8 }, { t: "07:46", v: 4.8 },
  { t: "08:01", v: 4.7 }, { t: "08:16", v: 4.7 }, { t: "08:31", v: 4.8 }, { t: "08:46", v: 5.4 },
  { t: "09:01", v: 5.0 }, { t: "09:16", v: 4.7 }, { t: "09:31", v: 5.2 }, { t: "09:46", v: 5.1 },
  { t: "10:01", v: 5.0 }, { t: "10:16", v: 5.2 }, { t: "10:31", v: 5.5 }, { t: "10:46", v: 5.3 },
  { t: "11:01", v: 5.2 }, { t: "11:16", v: 4.9 }, { t: "11:31", v: 4.9 }, { t: "11:46", v: 5.2 },
  { t: "12:01", v: 5.3 }, { t: "12:16", v: 5.0 }, { t: "12:31", v: 5.3 }, { t: "12:46", v: 5.1 },
  { t: "13:01", v: 5.0 }, { t: "13:16", v: 5.5 }, { t: "13:31", v: 7.1 }, { t: "13:46", v: 8.5 },
  { t: "14:01", v: 8.0 }, { t: "14:16", v: 7.6 }, { t: "14:31", v: 7.1 }, { t: "14:46", v: 6.6 },
  { t: "15:01", v: 6.8 }, { t: "15:16", v: 6.4 }, { t: "15:31", v: 6.9 }, { t: "15:46", v: 6.8 },
  { t: "16:01", v: 6.7 }, { t: "16:16", v: 5.9 }, { t: "16:31", v: 6.3 }, { t: "16:46", v: 6.5 },
  { t: "17:01", v: 6.9 }, { t: "17:16", v: 6.5 }, { t: "17:31", v: 6.8 }, { t: "17:46", v: 6.3 },
  { t: "18:01", v: 5.6 }, { t: "18:16", v: 5.4 }, { t: "18:31", v: 5.8 }, { t: "18:46", v: 5.7 },
  { t: "19:01", v: 5.3 }, { t: "19:16", v: 5.2 }, { t: "19:31", v: 5.3 }, { t: "19:46", v: 5.2 },
  { t: "20:01", v: 6.6 }, { t: "20:16", v: 7.2 }, { t: "20:31", v: 7.2 }, { t: "20:46", v: 6.1 },
  { t: "21:01", v: 6.2 }, { t: "21:16", v: 6.1 }, { t: "21:31", v: 6.7 }, { t: "21:46", v: 6.6 },
  { t: "22:01", v: 6.4 }, { t: "22:16", v: 6.1 }, { t: "22:31", v: 5.9 }, { t: "22:46", v: 5.8 },
  { t: "23:01", v: 5.8 }, { t: "23:16", v: 6.3 }, { t: "23:31", v: 5.6 }, { t: "23:46", v: 5.6 },
];

// 7-day daily summary — derived from real CGM data, April 19–25, 2026.
export const WEEK_SUMMARY = [
  { day: "04-19", avg: 5.81, tir: 100, high: 0,  low: 0, min: 4.8, max: 7.6 },
  { day: "04-20", avg: 5.87, tir: 97,  high: 3,  low: 0, min: 4.5, max: 9.0 },
  { day: "04-21", avg: 5.60, tir: 93,  high: 7,  low: 0, min: 4.5, max: 9.5 },
  { day: "04-22", avg: 5.71, tir: 98,  high: 2,  low: 0, min: 4.4, max: 8.4 },
  { day: "04-23", avg: 5.36, tir: 97,  high: 3,  low: 0, min: 4.3, max: 9.0 },
  { day: "04-24", avg: 5.34, tir: 93,  high: 7,  low: 0, min: 4.1, max: 9.0 },
  { day: "04-25", avg: 5.65, tir: 98,  high: 2,  low: 0, min: 4.5, max: 8.8 },
];

// Today's logged meals (2026-04-25) with observed glucose impact
// Peak glucose comes from the actual CGM trace above.
export type MealLog = {
  id: string;
  time: string;            // local HH:MM
  type: "breakfast" | "lunch" | "dinner" | "snack";
  description: string;
  emoji: string;
  calories: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g: number;
  glycemicLoad: number;    // approx GL of meal
  baselineGlucose: number; // mmol/L just before eating
  peakGlucose: number;     // mmol/L within 90 min after
  peakTime: string;        // HH:MM
  spike: number;           // peak - baseline
  verdict: "excellent" | "good" | "moderate" | "high";
};

export const MEAL_LOG: MealLog[] = [
  {
    id: "m1", time: "08:30", type: "breakfast",
    description: "Scrambled eggs (3), avocado, sourdough toast, black coffee",
    emoji: "🥑",
    calories: 480, carbs_g: 28, protein_g: 24, fat_g: 30, fiber_g: 8,
    glycemicLoad: 9,
    baselineGlucose: 4.7, peakGlucose: 5.4, peakTime: "08:46", spike: 0.7,
    verdict: "excellent",
  },
  {
    id: "m2", time: "10:30", type: "snack",
    description: "Greek yogurt with mixed berries and chia seeds",
    emoji: "🫐",
    calories: 220, carbs_g: 22, protein_g: 18, fat_g: 6, fiber_g: 5,
    glycemicLoad: 7,
    baselineGlucose: 5.0, peakGlucose: 5.5, peakTime: "10:31", spike: 0.5,
    verdict: "excellent",
  },
  {
    id: "m3", time: "13:00", type: "lunch",
    description: "White rice (1.5 bowls), sweet & sour pork, vegetable stir-fry",
    emoji: "🍚",
    calories: 780, carbs_g: 95, protein_g: 32, fat_g: 28, fiber_g: 4,
    glycemicLoad: 58,
    baselineGlucose: 5.0, peakGlucose: 8.5, peakTime: "13:46", spike: 3.5,
    verdict: "high",
  },
  {
    id: "m4", time: "16:30", type: "snack",
    description: "Whey protein shake, mixed nuts (small handful)",
    emoji: "🥜",
    calories: 280, carbs_g: 12, protein_g: 28, fat_g: 14, fiber_g: 3,
    glycemicLoad: 4,
    baselineGlucose: 6.5, peakGlucose: 6.9, peakTime: "17:01", spike: 0.4,
    verdict: "excellent",
  },
  {
    id: "m5", time: "19:30", type: "dinner",
    description: "Steamed sea bass, quinoa, sautéed broccolini, olive oil",
    emoji: "🐟",
    calories: 540, carbs_g: 38, protein_g: 38, fat_g: 22, fiber_g: 7,
    glycemicLoad: 16,
    baselineGlucose: 5.3, peakGlucose: 7.2, peakTime: "20:16", spike: 1.9,
    verdict: "good",
  },
  {
    id: "m6", time: "21:15", type: "snack",
    description: "Dark chocolate (2 squares, 85% cacao)",
    emoji: "🍫",
    calories: 110, carbs_g: 10, protein_g: 2, fat_g: 8, fiber_g: 3,
    glycemicLoad: 3,
    baselineGlucose: 6.1, peakGlucose: 6.7, peakTime: "21:31", spike: 0.6,
    verdict: "excellent",
  },
];

// Foods database for the calorie scan / quick-add feature
export type FoodItem = {
  id: string;
  name: string;
  emoji: string;
  serving: string;
  calories: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g: number;
  glycemicIndex: number;   // GI 0–110
  glucoseImpact: "low" | "moderate" | "high";
  category: string;
};

export const FOOD_DB: FoodItem[] = [
  // High-impact carbs
  { id: "f1",  name: "White rice",      emoji: "🍚", serving: "1 bowl (150g)",   calories: 205, carbs_g: 45, protein_g: 4,  fat_g: 0,  fiber_g: 1,  glycemicIndex: 73, glucoseImpact: "high",     category: "Grains" },
  { id: "f2",  name: "White bread",     emoji: "🍞", serving: "2 slices",        calories: 160, carbs_g: 30, protein_g: 6,  fat_g: 2,  fiber_g: 1,  glycemicIndex: 75, glucoseImpact: "high",     category: "Grains" },
  { id: "f3",  name: "Instant noodles", emoji: "🍜", serving: "1 pack",          calories: 380, carbs_g: 54, protein_g: 8,  fat_g: 14, fiber_g: 2,  glycemicIndex: 67, glucoseImpact: "high",     category: "Grains" },
  { id: "f4",  name: "Mango",           emoji: "🥭", serving: "1 cup",           calories: 100, carbs_g: 25, protein_g: 1,  fat_g: 0,  fiber_g: 3,  glycemicIndex: 60, glucoseImpact: "moderate", category: "Fruit" },
  { id: "f5",  name: "Watermelon",      emoji: "🍉", serving: "1 cup",           calories: 46,  carbs_g: 12, protein_g: 1,  fat_g: 0,  fiber_g: 1,  glycemicIndex: 76, glucoseImpact: "moderate", category: "Fruit" },
  // Balanced
  { id: "f6",  name: "Brown rice",      emoji: "🍙", serving: "1 bowl (150g)",   calories: 215, carbs_g: 45, protein_g: 5,  fat_g: 2,  fiber_g: 4,  glycemicIndex: 50, glucoseImpact: "moderate", category: "Grains" },
  { id: "f7",  name: "Quinoa",          emoji: "🌾", serving: "1 cup cooked",    calories: 220, carbs_g: 39, protein_g: 8,  fat_g: 4,  fiber_g: 5,  glycemicIndex: 53, glucoseImpact: "moderate", category: "Grains" },
  { id: "f8",  name: "Sweet potato",    emoji: "🍠", serving: "1 medium",        calories: 115, carbs_g: 27, protein_g: 2,  fat_g: 0,  fiber_g: 4,  glycemicIndex: 63, glucoseImpact: "moderate", category: "Vegetables" },
  { id: "f9",  name: "Banana",          emoji: "🍌", serving: "1 medium",        calories: 105, carbs_g: 27, protein_g: 1,  fat_g: 0,  fiber_g: 3,  glycemicIndex: 51, glucoseImpact: "moderate", category: "Fruit" },
  { id: "f10", name: "Apple",           emoji: "🍎", serving: "1 medium",        calories: 95,  carbs_g: 25, protein_g: 0,  fat_g: 0,  fiber_g: 4,  glycemicIndex: 36, glucoseImpact: "low",      category: "Fruit" },
  // Low-impact / protein / fat
  { id: "f11", name: "Chicken breast",  emoji: "🍗", serving: "150g grilled",    calories: 250, carbs_g: 0,  protein_g: 47, fat_g: 5,  fiber_g: 0,  glycemicIndex: 0,  glucoseImpact: "low",      category: "Protein" },
  { id: "f12", name: "Salmon",          emoji: "🐟", serving: "150g grilled",    calories: 280, carbs_g: 0,  protein_g: 39, fat_g: 14, fiber_g: 0,  glycemicIndex: 0,  glucoseImpact: "low",      category: "Protein" },
  { id: "f13", name: "Eggs",            emoji: "🥚", serving: "2 large",         calories: 155, carbs_g: 1,  protein_g: 13, fat_g: 11, fiber_g: 0,  glycemicIndex: 0,  glucoseImpact: "low",      category: "Protein" },
  { id: "f14", name: "Greek yogurt",    emoji: "🥛", serving: "150g plain",      calories: 130, carbs_g: 8,  protein_g: 17, fat_g: 4,  fiber_g: 0,  glycemicIndex: 11, glucoseImpact: "low",      category: "Dairy" },
  { id: "f15", name: "Avocado",         emoji: "🥑", serving: "½ medium",        calories: 160, carbs_g: 9,  protein_g: 2,  fat_g: 15, fiber_g: 7,  glycemicIndex: 10, glucoseImpact: "low",      category: "Fats" },
  { id: "f16", name: "Almonds",         emoji: "🥜", serving: "30g (~23 nuts)",  calories: 175, carbs_g: 6,  protein_g: 6,  fat_g: 15, fiber_g: 4,  glycemicIndex: 0,  glucoseImpact: "low",      category: "Fats" },
  { id: "f17", name: "Broccoli",        emoji: "🥦", serving: "1 cup steamed",   calories: 55,  carbs_g: 11, protein_g: 4,  fat_g: 0,  fiber_g: 5,  glycemicIndex: 15, glucoseImpact: "low",      category: "Vegetables" },
  { id: "f18", name: "Spinach salad",   emoji: "🥗", serving: "2 cups",          calories: 30,  carbs_g: 4,  protein_g: 3,  fat_g: 0,  fiber_g: 3,  glycemicIndex: 15, glucoseImpact: "low",      category: "Vegetables" },
  { id: "f19", name: "Tofu",            emoji: "🍱", serving: "150g firm",       calories: 145, carbs_g: 4,  protein_g: 16, fat_g: 9,  fiber_g: 2,  glycemicIndex: 15, glucoseImpact: "low",      category: "Protein" },
  { id: "f20", name: "Berries (mixed)", emoji: "🫐", serving: "1 cup",           calories: 70,  carbs_g: 17, protein_g: 1,  fat_g: 0,  fiber_g: 5,  glycemicIndex: 25, glucoseImpact: "low",      category: "Fruit" },
  // Common composite meals
  { id: "f21", name: "Sweet & sour pork", emoji: "🥡", serving: "1 plate",       calories: 620, carbs_g: 70, protein_g: 28, fat_g: 24, fiber_g: 2,  glycemicIndex: 65, glucoseImpact: "high",     category: "Meals" },
  { id: "f22", name: "Beef noodle soup",  emoji: "🍜", serving: "1 bowl",        calories: 540, carbs_g: 65, protein_g: 28, fat_g: 16, fiber_g: 3,  glycemicIndex: 60, glucoseImpact: "high",     category: "Meals" },
  { id: "f23", name: "Sushi roll",        emoji: "🍣", serving: "8 pieces",      calories: 350, carbs_g: 50, protein_g: 16, fat_g: 9,  fiber_g: 2,  glycemicIndex: 55, glucoseImpact: "moderate", category: "Meals" },
  { id: "f24", name: "Caesar salad + chicken", emoji: "🥗", serving: "1 large",  calories: 410, carbs_g: 18, protein_g: 35, fat_g: 22, fiber_g: 4,  glycemicIndex: 25, glucoseImpact: "low",      category: "Meals" },
  { id: "f25", name: "Latte (whole milk)",     emoji: "☕", serving: "12 oz",     calories: 180, carbs_g: 18, protein_g: 10, fat_g: 8,  fiber_g: 0,  glycemicIndex: 30, glucoseImpact: "low",      category: "Beverages" },
];

// AI / pattern insights derived from today's data + genomic context
export const GLUCOSE_INSIGHTS = [
  {
    id: "i1",
    severity: "high" as const,
    title: "Lunch caused a 3.5 mmol/L spike",
    body: "Your white-rice + sweet & sour pork lunch peaked at 8.5 mmol/L 45 min after eating. The combination of refined carbs and sugary sauce is the likely driver.",
    suggestion: "Next time: swap white rice for brown rice or quinoa, eat protein and vegetables first, and walk for 10 min after the meal — typically cuts the spike by 30–50%.",
    relatedMealId: "m3",
  },
  {
    id: "i2",
    severity: "good" as const,
    title: "Excellent overnight glucose stability",
    body: "Your 00:00–07:00 average was 5.0 mmol/L with zero excursions. This indicates good fasting insulin sensitivity and a clean dinner-to-bed window.",
    suggestion: "Keep the 19:30 dinner cut-off and 3-hour gap before sleep — it's working.",
  },
  {
    id: "i3",
    severity: "info" as const,
    title: "Genomic context: TCF7L2 risk variant",
    body: "Your genome carries a TCF7L2 (rs90000024) T-allele, associated with ~40% higher fasting glucose risk. Your current HbA1c (5.1%) shows lifestyle is fully compensating, but high-GI meals will hit you harder than average.",
    suggestion: "Prioritize meals with GL < 20 — your body is more carb-sensitive than baseline.",
  },
  {
    id: "i4",
    severity: "good" as const,
    title: "Dinner pattern is well-balanced",
    body: "Sea bass + quinoa + broccolini produced only a 1.9 mmol/L rise — peak below 7.5 mmol/L. Protein-first sequencing and fiber appear to be moderating absorption nicely.",
    suggestion: "Use this template more often: lean protein + whole grain + 1.5 cups vegetables.",
    relatedMealId: "m5",
  },
];

// Daily nutrient targets (for the macro rings)
export const NUTRIENT_TARGETS = {
  calories: 2200,
  carbs_g: 220,
  protein_g: 165,
  fat_g: 75,
  fiber_g: 35,
};
