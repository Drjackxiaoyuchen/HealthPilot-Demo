import { z } from "zod";
import { localDay, parseTimestamp } from "./tabular";

const id = z.string().min(1).max(100);
const text = z.string().trim().min(1).max(200);
export const sourceUrl = z
  .string()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    try {
      return ["https:", "http:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Use an http or https source URL, or leave it blank.");
const note = z.string().max(4000);
const positive = z.number().finite().positive().max(1e7);
const nonnegative = z.number().finite().min(0).max(1e7);
const instant = z.string().datetime({ offset: true });

export const INGREDIENTS = [
  "Vitamin D",
  "Vitamin C",
  "Vitamin B12",
  "Magnesium",
  "Calcium",
  "Iron",
  "Zinc",
  "Folate",
  "Omega-3",
  "Other",
] as const;
export const SUPPLEMENT_UNITS = [
  "mcg",
  "mg",
  "g",
  "IU",
  "mcg DFE",
  "mcg RAE",
] as const;
export const ingredientSchema = z.object({
  name: text,
  amount: positive,
  unit: z.enum(SUPPLEMENT_UNITS),
  basis: z.enum(["active nutrient", "compound / unspecified"]),
});
export const supplementSchema = z.object({
  id,
  name: text,
  servingsPerDay: positive.max(100),
  timing: z.string().max(200),
  active: z.boolean(),
  ingredients: z.array(ingredientSchema).min(1).max(50),
  source: text,
  sourceUrl,
  notes: note,
});
export type Supplement = z.infer<typeof supplementSchema>;

export function ingredientKey(name: string): string {
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  return ["vitamin d", "vitamin d2", "vitamin d3"].includes(key)
    ? "vitamin d"
    : key;
}
export function supplementTotals(products: Supplement[]) {
  const totals = new Map<
    string,
    {
      ingredient: string;
      amount: number;
      unit: string;
      basis: string;
      productIds: string[];
      products: string[];
      sources: string[];
      convertedVitaminD: boolean;
    }
  >();
  for (const product of products.filter((row) => row.active))
    for (const ingredient of product.ingredients) {
      const name = ingredientKey(ingredient.name);
      let amount = ingredient.amount * product.servingsPerDay,
        unit: string = ingredient.unit,
        convertedVitaminD = false;
      // Only a nutrient-specific IU conversion is supported. Vitamin A/E IU are not interchangeable mass units.
      if (
        name === "vitamin d" &&
        ingredient.unit === "IU" &&
        ingredient.basis === "active nutrient"
      ) {
        amount /= 40;
        unit = "mcg";
        convertedVitaminD = true;
      } else if (["g", "mg", "mcg"].includes(unit)) {
        amount *= unit === "g" ? 1000 : unit === "mcg" ? 0.001 : 1;
        unit = "mg";
      }
      if (name === "vitamin d" && unit === "mg") {
        amount *= 1000;
        unit = "mcg";
      }
      // Compound/unspecified masses remain product-specific; they cannot establish nutrient exposure.
      const key = `${name}|${unit}|${ingredient.basis}|${ingredient.basis === "compound / unspecified" ? product.id : ""}`;
      const row = totals.get(key) || {
        ingredient: name,
        amount: 0,
        unit,
        basis: ingredient.basis,
        productIds: [],
        products: [],
        sources: [],
        convertedVitaminD: false,
      };
      row.amount += amount;
      row.convertedVitaminD ||= convertedVitaminD;
      if (!row.productIds.includes(product.id)) {
        row.productIds.push(product.id);
        row.products.push(product.name);
        row.sources.push(product.source);
      }
      totals.set(key, row);
    }
  return [...totals.values()].sort((a, b) =>
    a.ingredient.localeCompare(b.ingredient),
  );
}

export const foodSchema = z.object({
  name: text,
  grams: positive.max(20000),
  portionBasis: z.enum(["weighed", "estimated"]),
  kcal100: nonnegative.max(10000),
  protein100: nonnegative.max(100),
  carbs100: nonnegative.max(100),
  fat100: nonnegative.max(100),
  fiber100: nonnegative.max(100).nullable(),
  source: text,
  sourceUrl,
});
export const mealSchema = z.object({
  id,
  name: text,
  at: instant,
  status: z.enum(["eaten", "planned"]),
  foods: z.array(foodSchema).min(1).max(100),
  notes: note,
});
export type Food = z.infer<typeof foodSchema>;
export type Meal = z.infer<typeof mealSchema>;
export function mealNutrients(meal: Meal) {
  return meal.foods.reduce(
    (total, food) => {
      const factor = food.grams / 100;
      return {
        kcal: total.kcal + food.kcal100 * factor,
        protein: total.protein + food.protein100 * factor,
        carbs: total.carbs + food.carbs100 * factor,
        fat: total.fat + food.fat100 * factor,
        fiber:
          total.fiber === null || food.fiber100 === null
            ? null
            : total.fiber + food.fiber100 * factor,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 as number | null },
  );
}
export function nutritionDays(meals: Meal[]) {
  const groups = new Map<
    string,
    {
      day: string;
      meals: number;
      kcal: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number | null;
    }
  >();
  for (const meal of meals.filter((row) => row.status === "eaten")) {
    const day = localDay(new Date(meal.at)),
      n = mealNutrients(meal);
    const current = groups.get(day) || {
      day,
      meals: 0,
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };
    groups.set(day, {
      day,
      meals: current.meals + 1,
      kcal: current.kcal + n.kcal,
      protein: current.protein + n.protein,
      carbs: current.carbs + n.carbs,
      fat: current.fat + n.fat,
      fiber:
        current.fiber === null || n.fiber === null
          ? null
          : current.fiber + n.fiber,
    });
  }
  return [...groups.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export const exerciseSetSchema = z.object({
  exercise: text,
  reps: z.number().int().min(1).max(10000),
  load: nonnegative.max(2000),
  unit: z.enum(["kg", "lb"]),
  loadKind: z.enum(["external", "bodyweight"]),
});
export const workoutSchema = z.object({
  id,
  name: text,
  at: instant,
  status: z.enum(["completed", "planned"]),
  type: z.enum(["Resistance", "Cardio", "Mobility", "Other"]),
  durationMin: positive.max(1440),
  sets: z.array(exerciseSetSchema).max(200),
  notes: note,
});
export type Workout = z.infer<typeof workoutSchema>;
export function workoutVolume(workout: Workout) {
  if (workout.status !== "completed") return 0;
  return workout.sets
    .filter((set) => set.loadKind === "external")
    .reduce(
      (sum, set) =>
        sum + set.load * (set.unit === "lb" ? 0.45359237 : 1) * set.reps,
      0,
    );
}
export function fitnessDays(workouts: Workout[]) {
  const groups = new Map<
    string,
    { day: string; sessions: number; duration: number; volumeKg: number }
  >();
  for (const workout of workouts.filter((row) => row.status === "completed")) {
    const day = localDay(new Date(workout.at)),
      current = groups.get(day) || {
        day,
        sessions: 0,
        duration: 0,
        volumeKg: 0,
      };
    groups.set(day, {
      day,
      sessions: current.sessions + 1,
      duration: current.duration + workout.durationMin,
      volumeKg: current.volumeKg + workoutVolume(workout),
    });
  }
  return [...groups.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export type Ledger<T> = {
  format: "symphony-ledger-v1";
  kind: string;
  updatedAt: string;
  entries: T[];
};
export function parseLedger<T>(
  value: unknown,
  kind: string,
  schema: z.ZodType<T>,
): Ledger<T> {
  return z
    .object({
      format: z.literal("symphony-ledger-v1"),
      kind: z.literal(kind),
      updatedAt: instant,
      entries: z
        .array(schema)
        .max(50000)
        .refine(
          (entries) =>
            new Set(entries.map((entry) => (entry as { id: string }).id))
              .size === entries.length,
          "Duplicate record IDs in backup.",
        ),
    })
    .parse(value);
}
export function localDateTime(date: Date) {
  return `${localDay(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
export function inputInstant(value: string) {
  const date = parseTimestamp(value);
  if (!date) throw new Error("Enter a valid date and time.");
  return date.toISOString();
}
export const inputNumber = (value: string) =>
  value.trim() === "" ? NaN : Number(value);
