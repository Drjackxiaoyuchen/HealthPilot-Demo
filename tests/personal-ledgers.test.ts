import { test } from "node:test";
import assert from "node:assert/strict";
import {
  supplementSchema,
  supplementTotals,
  mealSchema,
  mealNutrients,
  nutritionDays,
  workoutSchema,
  workoutVolume,
  fitnessDays,
  parseLedger,
  type Supplement,
  type Meal,
  type Workout,
} from "../src/lib/personal-ledgers";
import { mealContext } from "../src/lib/meal-context";
import { createReport } from "../src/lib/report";

const supplement = (patch: Partial<Supplement> = {}): Supplement => ({
  id: "p1",
  name: "Label A",
  servingsPerDay: 1,
  timing: "",
  active: true,
  ingredients: [
    { name: "Vitamin D", amount: 400, unit: "IU", basis: "active nutrient" },
  ],
  source: "Synthetic test label",
  sourceUrl: "",
  notes: "",
  ...patch,
});
const meal = (patch: Partial<Meal> = {}): Meal => ({
  id: "m1",
  name: "Synthetic lunch",
  at: "2026-11-15T12:00:00+08:00",
  status: "eaten",
  foods: [
    {
      name: "Synthetic food",
      grams: 150,
      portionBasis: "weighed",
      kcal100: 200,
      protein100: 10,
      carbs100: 20,
      fat100: 8,
      fiber100: 2,
      source: "Synthetic label",
      sourceUrl: "",
    },
  ],
  notes: "",
  ...patch,
});
const workout = (patch: Partial<Workout> = {}): Workout => ({
  id: "w1",
  name: "Synthetic strength",
  at: "2026-11-15T18:00:00+08:00",
  status: "completed",
  type: "Resistance",
  durationMin: 30,
  sets: [
    { exercise: "Row", reps: 10, load: 20, unit: "kg", loadKind: "external" },
  ],
  notes: "",
  ...patch,
});
const ledger = <T>(kind: string, entries: T[]) => ({
  format: "symphony-ledger-v1" as const,
  kind,
  updatedAt: "2026-11-16T00:00:00Z",
  entries,
});

test("vitamin D uses its specific IU conversion and combines compatible active label amounts", () => {
  const totals = supplementTotals([
    supplement(),
    supplement({
      id: "p2",
      name: "Label B",
      ingredients: [
        {
          name: "vitamin d3",
          amount: 20,
          unit: "mcg",
          basis: "active nutrient",
        },
      ],
    }),
  ]);
  assert.equal(totals.length, 1);
  assert.equal(totals[0].amount, 30);
  assert.equal(totals[0].unit, "mcg");
  assert.equal(totals[0].productIds.length, 2);
  assert.equal(totals[0].convertedVitaminD, true);
});
test("planned supplement totals multiply serving count and exclude paused products", () => {
  const totals = supplementTotals([
    supplement({ servingsPerDay: 2 }),
    supplement({ id: "paused", active: false }),
  ]);
  assert.equal(totals[0].amount, 20);
  assert.equal(totals[0].productIds.length, 1);
});
test("IU for other ingredients and DFE units never receive generic mass conversion", () => {
  const totals = supplementTotals([
    supplement({
      ingredients: [
        {
          name: "Vitamin A",
          amount: 1000,
          unit: "IU",
          basis: "active nutrient",
        },
        {
          name: "Vitamin A",
          amount: 300,
          unit: "mcg",
          basis: "active nutrient",
        },
        {
          name: "Folate",
          amount: 400,
          unit: "mcg DFE",
          basis: "active nutrient",
        },
        { name: "Folate", amount: 400, unit: "mcg", basis: "active nutrient" },
      ],
    }),
  ]);
  assert.equal(totals.length, 4);
  assert.equal(totals.find((row) => row.unit === "IU")?.amount, 1000);
  assert.ok(totals.every((row) => !row.convertedVitaminD));
});
test("compound weights remain product-specific even when ingredient names match", () => {
  const ingredients = [
    {
      name: "Magnesium",
      amount: 100,
      unit: "mg" as const,
      basis: "compound / unspecified" as const,
    },
  ];
  const totals = supplementTotals([
    supplement({ ingredients }),
    supplement({ id: "p2", ingredients }),
  ]);
  assert.equal(totals.length, 2);
  assert.ok(totals.every((row) => row.productIds.length === 1));
});
test("mass normalization combines mg, g and mcg without losing source products", () => {
  const totals = supplementTotals([
    supplement({
      ingredients: [
        { name: "Vitamin C", amount: 1, unit: "g", basis: "active nutrient" },
        {
          name: "Vitamin C",
          amount: 500000,
          unit: "mcg",
          basis: "active nutrient",
        },
      ],
    }),
  ]);
  assert.equal(totals[0].amount, 1500);
  assert.equal(totals[0].unit, "mg");
  assert.equal(totals[0].productIds.length, 1);
});
test("supplement validation rejects invalid dose values and executable source URLs", () => {
  for (const amount of [0, -1, NaN, Infinity])
    assert.equal(
      supplementSchema.safeParse(
        supplement({
          ingredients: [
            { name: "Vitamin D", amount, unit: "IU", basis: "active nutrient" },
          ],
        }),
      ).success,
      false,
    );
  assert.equal(
    supplementSchema.safeParse(supplement({ sourceUrl: "javascript:alert(1)" }))
      .success,
    false,
  );
  assert.equal(
    supplementSchema.safeParse(
      supplement({ sourceUrl: "https://example.org/label" }),
    ).success,
    true,
  );
});
test("meal nutrient calculations scale reviewed per-100g values by portion mass", () => {
  const result = mealNutrients(meal());
  assert.deepEqual(result, {
    kcal: 300,
    protein: 15,
    carbs: 30,
    fat: 12,
    fiber: 3,
  });
});
test("missing fiber remains unknown and is not imputed as zero", () => {
  const original = meal();
  original.foods[0].fiber100 = null;
  assert.equal(mealNutrients(original).fiber, null);
  assert.equal(nutritionDays([original])[0].fiber, null);
});
test("planned meals never enter daily intake; missing dates are not fabricated", () => {
  const days = nutritionDays([
    meal(),
    meal({ id: "plan", at: "2026-11-17T12:00:00+08:00", status: "planned" }),
  ]);
  assert.equal(days.length, 1);
  assert.equal(days[0].kcal, 300);
  assert.equal(days[0].meals, 1);
});
test("zero nutrient values are valid but absent required values and negative portions fail", () => {
  const original = meal();
  assert.equal(
    mealSchema.safeParse({
      ...original,
      foods: [{ ...original.foods[0], kcal100: 0, carbs100: 0 }],
    }).success,
    true,
  );
  assert.equal(
    mealSchema.safeParse({
      ...original,
      foods: [{ ...original.foods[0], grams: -1 }],
    }).success,
    false,
  );
  assert.equal(
    mealSchema.safeParse({
      ...original,
      foods: [{ ...original.foods[0], protein100: NaN }],
    }).success,
    false,
  );
});
test("external-load volume normalizes pounds and excludes assumed body mass", () => {
  const row = workout({
    sets: [
      { exercise: "Row", reps: 10, load: 20, unit: "kg", loadKind: "external" },
      { exercise: "Row", reps: 5, load: 100, unit: "lb", loadKind: "external" },
      {
        exercise: "Pushup",
        reps: 20,
        load: 80,
        unit: "kg",
        loadKind: "bodyweight",
      },
    ],
  });
  assert.ok(Math.abs(workoutVolume(row) - (200 + 500 * 0.45359237)) < 1e-10);
});
test("planned workout duration and volume are excluded from completed activity", () => {
  assert.equal(workoutVolume(workout({ status: "planned" })), 0);
  const days = fitnessDays([
    workout(),
    workout({ id: "plan", status: "planned", durationMin: 60 }),
  ]);
  assert.equal(days[0].duration, 30);
  assert.equal(days[0].sessions, 1);
  assert.equal(days[0].volumeKg, 200);
});
test("workout validation rejects missing duration, fractional reps and invalid dates", () => {
  assert.equal(
    workoutSchema.safeParse(workout({ durationMin: NaN })).success,
    false,
  );
  assert.equal(
    workoutSchema.safeParse(workout({ durationMin: 0 })).success,
    false,
  );
  assert.equal(
    workoutSchema.safeParse(workout({ at: "2026-02-30T00:00:00Z" })).success,
    false,
  );
  assert.equal(
    workoutSchema.safeParse(
      workout({
        sets: [
          {
            exercise: "Row",
            reps: 2.5,
            load: 10,
            unit: "kg",
            loadKind: "external",
          },
        ],
      }),
    ).success,
    false,
  );
});
test("reviewed backups reject a wrong module, wrong format and duplicate IDs", () => {
  assert.throws(() =>
    parseLedger(ledger("meals", [meal()]), "supplements", supplementSchema),
  );
  assert.throws(() =>
    parseLedger(
      { ...ledger("supplements", [supplement()]), format: "unknown" },
      "supplements",
      supplementSchema,
    ),
  );
  assert.throws(() =>
    parseLedger(
      ledger("supplements", [supplement(), supplement()]),
      "supplements",
      supplementSchema,
    ),
  );
  assert.equal(
    parseLedger(
      JSON.parse(JSON.stringify(ledger("meals", [meal()]))),
      "meals",
      mealSchema,
    ).entries.length,
    1,
  );
});
const cgm = Array.from({ length: 31 }, (_, i) => ({
  t: new Date(Date.parse(meal().at) + (i - 6) * 5 * 60000).toISOString(),
  v: i < 6 ? 5 : i === 12 ? 8 : 6,
}));
test("observed meal context uses available baseline and a covered post-meal window", () => {
  const result = mealContext(meal(), [meal()], cgm);
  assert.equal(result.status, "available");
  assert.equal(result.baseline, 5);
  assert.equal(result.peak, 8);
  assert.equal(result.delta, 3);
  assert.equal(result.coverage, 100);
});
test("meal summaries withhold values for sparse post-meal sampling", () => {
  const sparse = cgm.filter((_, i) => i < 6 || [6, 15, 27, 30].includes(i));
  const result = mealContext(meal(), [meal()], sparse);
  assert.equal(result.status, "insufficient");
  assert.equal(result.delta, null);
  assert.ok(result.coverage < 80);
});
test("another eaten meal blocks assignment; a planned meal does not", () => {
  const other = meal({
    id: "other",
    at: new Date(Date.parse(meal().at) + 30 * 60000).toISOString(),
  });
  assert.equal(mealContext(meal(), [meal(), other], cgm).status, "overlap");
  assert.equal(
    mealContext(meal(), [meal(), { ...other, status: "planned" }], cgm).status,
    "available",
  );
});
test("a planned meal, absent baseline or missing CGM cannot produce a numeric response", () => {
  assert.equal(mealContext(meal({ status: "planned" }), [], cgm).delta, null);
  assert.equal(mealContext(meal(), [meal()], cgm.slice(6)).delta, null);
  assert.equal(mealContext(meal(), [meal()], []).peak, null);
});
test("reports include entered records and derived summaries with their method boundaries", () => {
  const report = createReport({
    cgm: null,
    genome: null,
    bloodwork: null,
    supplements: ledger("supplements", [supplement()]),
    meals: ledger("meals", [meal()]),
    workouts: ledger("workouts", [workout()]),
  });
  assert.equal(report.schemaVersion, "symphony-report-v2");
  assert.equal(report.supplements?.plannedDailyTotals[0].amount, 10);
  assert.equal(report.nutrition?.dailyLoggedIntake[0].kcal, 300);
  assert.equal(report.fitness?.completedDays[0].duration, 30);
  assert.equal(report.nutrition?.observedMealContexts.length, 0);
  assert.equal(
    report.sections.find((row) => row.path === "/diet")?.status,
    "saved meal records; portion-derived nutrients",
  );
  assert.ok(!JSON.stringify(report).includes("health_score"));
});

test("published daily-record backup examples remain compatible with validated schemas", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const [kind, schema] of [
    ["supplements", supplementSchema],
    ["meals", mealSchema],
    ["workouts", workoutSchema],
  ] as const) {
    const value = JSON.parse(
      await readFile(`docs/examples/daily-records/${kind}.json`, "utf8"),
    );
    assert.equal(
      parseLedger(value, kind, schema as import("zod").z.ZodType<unknown>)
        .entries.length,
      2,
    );
  }
});

test("late post-meal sampling is withheld even when total observed coverage exceeds 80%", () => {
  const late = cgm.filter((_, i) => i < 6 || i >= 10);
  const result = mealContext(meal(), [meal()], late);
  assert.ok(result.coverage >= 80);
  assert.equal(result.status, "insufficient");
  assert.equal(result.delta, null);
  assert.ok(result.reason.includes("starting within 15 min"));
});
