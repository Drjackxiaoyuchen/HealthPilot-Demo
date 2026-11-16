import { computeStats, validReadings, type CgmReading } from "./cgm";
import type { Meal } from "./personal-ledgers";
export const MEAL_CONTEXT_METHOD = "symphony-meal-context-v1";
export function createMealContextAnalyzer(readings: CgmReading[]) {
  const valid = validReadings(readings),
    cadence = computeStats(readings)?.cadence || 5;
  return function analyzeMeal(meal: Meal, allMeals: Meal[]) {
    const at = Date.parse(meal.at),
      minute = 60000;
    const window = valid.filter(
      (row) =>
        Date.parse(row.t) >= at - 30 * minute &&
        Date.parse(row.t) <= at + 120 * minute,
    );
    const before = window.filter((row) => Date.parse(row.t) < at),
      after = window.filter((row) => Date.parse(row.t) >= at);
    const observed = after.reduce(
      (sum, row, i) =>
        sum +
        Math.max(
          0,
          Math.min(
            cadence,
            (at + 120 * minute - Date.parse(row.t)) / minute,
            i + 1 < after.length
              ? (Date.parse(after[i + 1].t) - Date.parse(row.t)) / minute
              : cadence,
          ),
        ),
      0,
    );
    const coverage = (observed / 120) * 100;
    const empty = {
      baseline: null,
      peak: null,
      delta: null,
      coverage,
      beforeCount: before.length,
      afterCount: after.length,
    };
    if (meal.status !== "eaten")
      return {
        ...empty,
        status: "insufficient" as const,
        reason: "Planned meals have no observed response.",
      };
    if (
      allMeals.some(
        (other) =>
          other.id !== meal.id &&
          other.status === "eaten" &&
          Date.parse(other.at) >= at - 30 * minute &&
          Date.parse(other.at) <= at + 120 * minute,
      )
    )
      return {
        ...empty,
        status: "overlap" as const,
        reason:
          "Another recorded meal overlaps the baseline or 2-hour window; no individual-meal summary is assigned.",
      };
    const validBaseline =
      before.length >= 2 &&
      Date.parse(before.at(-1)!.t) >= at - 15 * minute &&
      Date.parse(before.at(-1)!.t) - Date.parse(before[0].t) >= 5 * minute;
    const validPost =
      after.length >= 4 &&
      Date.parse(after[0].t) <= at + 15 * minute &&
      Date.parse(after.at(-1)!.t) >= at + 105 * minute &&
      coverage >= 80;
    if (!validBaseline || !validPost)
      return {
        ...empty,
        status: "insufficient" as const,
        reason:
          "Needs ≥2 pre-meal readings spanning ≥5 min (latest within 15 min), ≥4 post-meal readings starting within 15 min and reaching 105 min, and ≥80% observed coverage over 2 hours.",
      };
    const baseline =
      before.reduce((sum, row) => sum + row.v, 0) / before.length;
    const peak = after.reduce(
      (value, row) => Math.max(value, row.v),
      -Infinity,
    );
    return {
      baseline,
      peak,
      delta: peak - baseline,
      coverage,
      beforeCount: before.length,
      afterCount: after.length,
      status: "available" as const,
      reason:
        "Observed CGM context only. Timing, sensor error, activity and prior intake can influence this pattern; it is not a food-effect estimate or prediction.",
    };
  };
}

export function mealContext(
  meal: Meal,
  allMeals: Meal[],
  readings: CgmReading[],
) {
  return createMealContextAnalyzer(readings)(meal, allMeals);
}
