"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Download, Pencil, Trash2, Utensils } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { KEYS } from "@/lib/user-data";
import { type CgmStored } from "@/lib/cgm";
import { useLocalData } from "@/lib/use-local-data";
import { useLedger } from "@/lib/use-ledger";
import {
  mealSchema,
  mealNutrients,
  nutritionDays,
  inputInstant,
  localDateTime,
  type Meal,
  type Food,
} from "@/lib/personal-ledgers";
import { createMealContextAnalyzer } from "@/lib/meal-context";
import { localDay, toCsv } from "@/lib/tabular";
import { downloadFile } from "@/lib/download";
import {
  LedgerTools,
  Field,
  fieldClass,
  actionClass,
  primaryClass,
  messageOf,
} from "@/components/ui/ledger-tools";
const newFood = (): Food => ({
  name: "",
  grams: NaN,
  portionBasis: "estimated",
  kcal100: NaN,
  protein100: NaN,
  carbs100: NaN,
  fat100: NaN,
  fiber100: null,
  source: "",
  sourceUrl: "",
});
const fmt = (n: number | null) =>
  n === null ? "Not fully recorded" : n.toFixed(1);
export default function DietPage() {
  const ledger = useLedger(KEYS.meals, "meals", mealSchema),
    cgm = useLocalData<CgmStored>(KEYS.cgm);
  const [draft, setDraft] = useState<Meal | null>(null),
    [at, setAt] = useState(""),
    [day, setDay] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [removed, setRemoved] = useState<Meal | null>(null);
  const analyzeMeal = useMemo(
    () => createMealContextAnalyzer(cgm?.readings || []),
    [cgm],
  );
  const daily = nutritionDays(ledger.entries),
    dates = [
      ...new Set(ledger.entries.map((row) => localDay(new Date(row.at)))),
    ].sort(),
    selected = dates.includes(day) ? day : dates.at(-1) || "",
    summary = daily.find((row) => row.day === selected),
    meals = ledger.entries
      .filter((row) => localDay(new Date(row.at)) === selected)
      .sort((a, b) => a.at.localeCompare(b.at));
  function act(action: () => void, message: string) {
    try {
      action();
      setMessage(message);
      setError("");
    } catch (error) {
      setError(messageOf(error));
    }
  }
  function edit(meal?: Meal) {
    const time = localDateTime(new Date());
    setDraft(
      meal
        ? structuredClone(meal)
        : {
            id: crypto.randomUUID(),
            name: "",
            at: new Date().toISOString(),
            status: "eaten",
            foods: [newFood()],
            notes: "",
          },
    );
    setAt(meal ? localDateTime(new Date(meal.at)) : time);
    setError("");
  }
  function foodChange(index: number, patch: Partial<Food>) {
    if (draft)
      setDraft({
        ...draft,
        foods: draft.foods.map((row, i) =>
          i === index ? { ...row, ...patch } : row,
        ),
      });
  }
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-micro text-copper-700 uppercase tracking-widest">
              From portions to patterns
            </p>
            <h2 className="font-serif text-[30px] mt-1">Your food diary</h2>
            <p className="text-body text-stone-500 mt-2 max-w-2xl">
              Record foods from a label or a named database entry, scale by the
              portion you ate, and keep the source. Planned meals stay separate
              from recorded intake.
            </p>
          </div>
          <button
            className={primaryClass}
            disabled={!ledger.ready || !!ledger.error}
            onClick={() => edit()}
          >
            <Plus size={14} />
            Log a meal
          </button>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-3 mt-5">
          <label className="text-caption text-stone-500">
            Diary date{" "}
            <select
              aria-label="Diary date"
              className="rounded-xl border-cream-300 text-caption ml-2"
              value={selected}
              onChange={(event) => setDay(event.target.value)}
              disabled={!dates.length}
            >
              {dates.length ? (
                dates.map((date) => <option key={date}>{date}</option>)
              ) : (
                <option value="">No meals recorded</option>
              )}
            </select>
          </label>
          <span className="text-micro text-stone-400">
            Device time zone · only days with records appear
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {[
            ["Energy (kcal)", summary ? fmt(summary.kcal) : "Not recorded"],
            ["Protein (g)", summary ? fmt(summary.protein) : "Not recorded"],
            ["Carbohydrate (g)", summary ? fmt(summary.carbs) : "Not recorded"],
            ["Fat (g)", summary ? fmt(summary.fat) : "Not recorded"],
            ["Fiber (g)", summary ? fmt(summary.fiber) : "Not recorded"],
          ].map(([label, value]) => (
            <div
              className="p-3 rounded-xl bg-cream-100 border border-cream-300"
              key={label}
            >
              <p className="text-micro text-stone-500">{label}</p>
              <p className="font-serif text-[23px] mt-1">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-micro text-stone-400 mt-3">
          Totals describe logged eaten foods, not complete-day intake or a
          personalized calorie target. Missing fiber remains unknown.
        </p>
      </Card>
      {(ledger.error || error) && (
        <p
          role="alert"
          className="rounded-xl bg-rose-light p-4 text-caption text-rose-dark"
        >
          {ledger.error || error}
        </p>
      )}
      {message && (
        <p role="status" className="text-caption text-sage-dark">
          {message}
          {removed && (
            <button
              className="underline ml-2"
              onClick={() =>
                act(() => {
                  ledger.save(removed);
                  setRemoved(null);
                }, "Meal restored.")
              }
            >
              Undo removal
            </button>
          )}
        </p>
      )}
      {draft && (
        <Card accent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              act(() => {
                const saved = { ...draft, at: inputInstant(at) };
                ledger.save(saved);
                setDay(localDay(new Date(saved.at)));
                setDraft(null);
                setRemoved(null);
              }, "Meal saved. Diary totals and CGM context updated.");
            }}
          >
            <h3 className="font-serif text-title">
              Record a meal and its sources
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Meal name">
                <input
                  className={fieldClass}
                  required
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
              </Field>
              <Field label="Meal date and time">
                <input
                  className={fieldClass}
                  type="datetime-local"
                  required
                  value={at}
                  onChange={(event) => setAt(event.target.value)}
                />
              </Field>
              <Field label="Meal status">
                <select
                  className={fieldClass}
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      status: event.target.value as Meal["status"],
                    })
                  }
                >
                  <option value="eaten">Eaten — include in intake</option>
                  <option value="planned">Planned — exclude from intake</option>
                </select>
              </Field>
            </div>
            {draft.foods.map((food, index) => (
              <fieldset
                key={index}
                className="rounded-xl border border-cream-300 bg-cream-100 p-4"
              >
                <legend className="px-1 text-caption text-stone-600">
                  Food {index + 1} · nutrient amounts per 100 grams
                </legend>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Field label="Food name">
                    <input
                      required
                      className={fieldClass}
                      value={food.name}
                      onChange={(event) =>
                        foodChange(index, { name: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Portion eaten (g)">
                    <input
                      required
                      type="number"
                      step="any"
                      min="0.01"
                      className={fieldClass}
                      value={Number.isFinite(food.grams) ? food.grams : ""}
                      onChange={(event) =>
                        foodChange(index, { grams: event.target.valueAsNumber })
                      }
                    />
                  </Field>
                  <Field label="Portion basis">
                    <select
                      className={fieldClass}
                      value={food.portionBasis}
                      onChange={(event) =>
                        foodChange(index, {
                          portionBasis: event.target
                            .value as Food["portionBasis"],
                        })
                      }
                    >
                      <option value="estimated">Estimated</option>
                      <option value="weighed">Weighed</option>
                    </select>
                  </Field>
                  {(
                    [
                      ["Energy / 100 g (kcal)", "kcal100"],
                      ["Protein / 100 g (g)", "protein100"],
                      ["Carbohydrate / 100 g (g)", "carbs100"],
                      ["Fat / 100 g (g)", "fat100"],
                      ["Fiber / 100 g (g, optional)", "fiber100"],
                    ] as const
                  ).map(([label, key]) => (
                    <Field key={key} label={label}>
                      <input
                        className={fieldClass}
                        required={key !== "fiber100"}
                        type="number"
                        min="0"
                        step="any"
                        value={
                          food[key] === null || !Number.isFinite(food[key])
                            ? ""
                            : food[key]!
                        }
                        onChange={(event) =>
                          foodChange(index, {
                            [key]:
                              event.target.value === "" && key === "fiber100"
                                ? null
                                : event.target.valueAsNumber,
                          })
                        }
                      />
                    </Field>
                  ))}
                  <Field label="Nutrient source / record ID">
                    <input
                      className={fieldClass}
                      required
                      placeholder="Package label, or USDA FDC ID"
                      value={food.source}
                      onChange={(event) =>
                        foodChange(index, { source: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Source URL (optional)">
                    <input
                      className={fieldClass}
                      type="url"
                      value={food.sourceUrl}
                      onChange={(event) =>
                        foodChange(index, { sourceUrl: event.target.value })
                      }
                    />
                  </Field>
                </div>
                {draft.foods.length > 1 && (
                  <button
                    type="button"
                    className="text-caption underline text-rose-dark mt-3"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        foods: draft.foods.filter((_, i) => i !== index),
                      })
                    }
                  >
                    Remove food {index + 1}
                  </button>
                )}
              </fieldset>
            ))}
            <p className="text-micro text-stone-500">
              Use gram-based portions. A milliliter is not assumed to equal a
              gram. If a label gives values per serving, convert them to per 100
              g using that serving's mass first.
            </p>
            <button
              type="button"
              className={actionClass}
              onClick={() =>
                setDraft({ ...draft, foods: [...draft.foods, newFood()] })
              }
            >
              <Plus size={12} />
              Add food
            </button>
            <Field label="Meal notes">
              <textarea
                className={fieldClass}
                rows={2}
                value={draft.notes}
                onChange={(event) =>
                  setDraft({ ...draft, notes: event.target.value })
                }
              />
            </Field>
            <div className="flex gap-2">
              <button type="submit" className={primaryClass}>
                Save meal
              </button>
              <button
                type="button"
                className={actionClass}
                onClick={() => setDraft(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}
      {!ledger.entries.length && (
        <Card>
          <Utensils size={24} className="text-copper mb-3" />
          <h3 className="font-serif text-title">Start with one meal</h3>
          <p className="text-body text-stone-500 mt-2">
            Add its time, portion and label values. Your own records will appear
            here; example meals do not populate this diary.
          </p>
        </Card>
      )}
      {meals.map((meal) => {
        const n = mealNutrients(meal),
          context = cgm ? analyzeMeal(meal, ledger.entries) : null;
        return (
          <Card key={meal.id}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-micro text-stone-400">
                  {new Date(meal.at).toLocaleString()} · {meal.status}
                </p>
                <h3 className="font-serif text-[22px]">{meal.name}</h3>
              </div>
              <p className="text-caption text-copper-700">
                {n.kcal.toFixed(1)} kcal · {n.protein.toFixed(1)} g protein
              </p>
            </div>
            <div className="mt-4 space-y-2">
              {meal.foods.map((food, index) => (
                <div
                  key={index}
                  className="p-3 bg-cream-100 rounded-xl text-caption text-stone-600"
                >
                  <strong className="font-medium">{food.name}</strong> ·{" "}
                  {food.grams} g ({food.portionBasis})
                  <span className="block text-micro text-stone-400 mt-1">
                    Source: {food.source}{" "}
                    {food.sourceUrl && (
                      <a
                        className="underline text-copper-700"
                        href={food.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open source
                      </a>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {context && (
              <div className="mt-4 p-3 bg-sage-light/40 border border-sage/20 rounded-xl">
                <p className="text-caption font-medium text-stone-700">
                  Observed CGM context
                </p>
                {context.status === "available" && (
                  <p className="text-caption text-stone-600 mt-1">
                    Pre-meal mean {context.baseline!.toFixed(2)} → observed
                    2-hour peak {context.peak!.toFixed(2)} mmol/L · difference{" "}
                    {context.delta! >= 0 ? "+" : ""}
                    {context.delta!.toFixed(2)} mmol/L
                  </p>
                )}
                <p className="text-micro text-stone-500 mt-1">
                  {context.reason}
                </p>
                <p className="text-micro text-stone-400 mt-1">
                  {context.beforeCount} baseline / {context.afterCount}{" "}
                  post-meal readings · {context.coverage.toFixed(1)}% of the
                  2-hour window observed
                </p>
              </div>
            )}
            {meal.notes && (
              <p className="text-caption text-stone-500 mt-3 whitespace-pre-wrap">
                {meal.notes}
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className={actionClass}
                aria-label={`Edit ${meal.name}`}
                onClick={() => edit(meal)}
              >
                <Pencil size={12} />
                Edit
              </button>
              <button
                className={actionClass}
                aria-label={`Remove ${meal.name}`}
                onClick={() =>
                  act(
                    () => setRemoved(ledger.remove(meal.id) || null),
                    "Meal removed; totals updated.",
                  )
                }
              >
                <Trash2 size={12} />
                Remove
              </button>
            </div>
          </Card>
        );
      })}
      {daily.length > 0 && (
        <Card>
          <h3 className="font-serif text-title mb-3">
            Energy from logged eaten meals
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer>
              <BarChart data={daily}>
                <CartesianGrid
                  vertical={false}
                  stroke="#E8E0D4"
                  strokeDasharray="3 3"
                />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => [
                    value.toFixed(1) + " kcal",
                    "Logged energy",
                  ]}
                />
                <Bar
                  dataKey="kcal"
                  fill="#B8906F"
                  isAnimationActive={false}
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
      <Card>
        <h3 className="font-serif text-title mb-3">
          Keep sources with your diary
        </h3>
        <p className="text-caption text-stone-500 mb-4">
          <a
            href="https://fdc.nal.usda.gov/"
            className="text-copper-700 underline"
            target="_blank"
            rel="noreferrer"
          >
            USDA FoodData Central
          </a>{" "}
          and{" "}
          <a
            href="https://world.openfoodfacts.org/"
            className="text-copper-700 underline"
            target="_blank"
            rel="noreferrer"
          >
            Open Food Facts
          </a>{" "}
          are lookup sources. Values are entered and reviewed here; there is no
          automatic food-photo inference.{" "}
          <Link className="text-copper-700 underline" href="/glucose">
            View your glucose trace
          </Link>{" "}
          for the same dates.
        </p>
        <LedgerTools
          kind="meals"
          storageKey={KEYS.meals}
          schema={mealSchema}
          stored={ledger.stored}
          summarize={(row) =>
            `${new Date(row.at).toLocaleString()} · ${row.status} · ${row.foods.map((f) => `${f.name}: ${f.grams} g (${f.portionBasis})`).join("; ")}`
          }
          onRestore={ledger.restore}
          disabled={!ledger.ready}
        />
        <button
          className={`${actionClass} mt-3`}
          disabled={!ledger.entries.length}
          onClick={() =>
            downloadFile(
              "symphony-meal-foods.csv",
              toCsv([
                [
                  "meal_id",
                  "meal",
                  "timestamp",
                  "status",
                  "food",
                  "grams",
                  "portion_basis",
                  "kcal_per_100g",
                  "protein_per_100g",
                  "carbs_per_100g",
                  "fat_per_100g",
                  "fiber_per_100g",
                  "source",
                  "source_url",
                ],
                ...ledger.entries.flatMap((meal) =>
                  meal.foods.map((food) => [
                    meal.id,
                    meal.name,
                    meal.at,
                    meal.status,
                    food.name,
                    food.grams,
                    food.portionBasis,
                    food.kcal100,
                    food.protein100,
                    food.carbs100,
                    food.fat100,
                    food.fiber100,
                    food.source,
                    food.sourceUrl,
                  ]),
                ),
              ]),
              "text/csv",
            )
          }
        >
          <Download size={13} />
          Export food diary CSV
        </button>
      </Card>
    </div>
  );
}
