"use client";
import { useState } from "react";
import {
  Pill,
  Plus,
  Download,
  Pencil,
  Pause,
  Play,
  Trash2,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { KEYS } from "@/lib/user-data";
import { useLedger } from "@/lib/use-ledger";
import {
  INGREDIENTS,
  SUPPLEMENT_UNITS,
  supplementSchema,
  supplementTotals,
  type Supplement,
} from "@/lib/personal-ledgers";
import {
  LedgerTools,
  Field,
  fieldClass,
  actionClass,
  primaryClass,
  messageOf,
} from "@/components/ui/ledger-tools";
import { downloadFile } from "@/lib/download";
import { toCsv } from "@/lib/tabular";

const newProduct = (): Supplement => ({
  id: crypto.randomUUID(),
  name: "",
  servingsPerDay: 1,
  timing: "",
  active: true,
  ingredients: [
    { name: "Vitamin D", amount: 0, unit: "mcg", basis: "active nutrient" },
  ],
  source: "Product label (manual entry)",
  sourceUrl: "",
  notes: "",
});
const display = (value: number) =>
  Number(value.toPrecision(6)).toLocaleString();
export default function SupplementsPage() {
  const ledger = useLedger(KEYS.supplements, "supplements", supplementSchema);
  const [draft, setDraft] = useState<Supplement | null>(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [removed, setRemoved] = useState<Supplement | null>(null);
  const totals = supplementTotals(ledger.entries),
    overlaps = totals.filter((row) => row.productIds.length > 1);
  function act(action: () => void, success: string) {
    try {
      action();
      setError("");
      setMessage(success);
    } catch (error) {
      setError(messageOf(error));
    }
  }
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-4 justify-between">
          <div>
            <p className="text-micro uppercase tracking-widest text-copper-700">
              Know what is on the label
            </p>
            <h2 className="font-serif text-[30px] mt-1">
              Your supplement ledger
            </h2>
            <p className="text-body text-stone-500 mt-2 max-w-2xl">
              Keep products, ingredients and sources together. Totals describe
              your entered daily plan; they do not establish what you took or
              what you need.
            </p>
          </div>
          <button
            className={primaryClass}
            disabled={!ledger.ready || !!ledger.error}
            onClick={() => {
              setDraft(newProduct());
              setError("");
            }}
          >
            <Plus size={15} />
            Add product
          </button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          {[
            [
              "Active products",
              ledger.entries.filter((row) => row.active).length,
            ],
            ["Ingredient totals", totals.length],
            ["Ingredients in multiple products", overlaps.length],
          ].map(([label, value]) => (
            <div
              className="bg-cream-100 p-4 rounded-xl border border-cream-300"
              key={label}
            >
              <p className="text-micro text-stone-500">{label}</p>
              <p className="font-serif text-[28px]">{value}</p>
            </div>
          ))}
        </div>
      </Card>
      {(ledger.error || error) && (
        <p
          role="alert"
          className="bg-rose-light p-4 rounded-xl text-caption text-rose-dark"
        >
          {ledger.error || error}
        </p>
      )}
      {message && (
        <p role="status" className="text-caption text-sage-dark">
          {message}{" "}
          {removed && (
            <button
              className="underline ml-2"
              onClick={() =>
                act(() => {
                  ledger.save(removed);
                  setRemoved(null);
                }, "Product restored.")
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
            onSubmit={(event) => {
              event.preventDefault();
              act(() => {
                ledger.save(draft);
                setDraft(null);
                setRemoved(null);
              }, "Product saved in this browser.");
            }}
            className="space-y-4"
          >
            <h3 className="font-serif text-title">
              {ledger.entries.some((row) => row.id === draft.id)
                ? "Edit product"
                : "Add a product from its label"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Product name">
                <input
                  required
                  maxLength={200}
                  className={fieldClass}
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
              </Field>
              <Field label="Planned servings per day">
                <input
                  type="number"
                  required
                  step="any"
                  min="0.01"
                  max="100"
                  className={fieldClass}
                  value={draft.servingsPerDay || ""}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      servingsPerDay: event.target.valueAsNumber,
                    })
                  }
                />
              </Field>
              <Field label="Timing / schedule notes">
                <input
                  className={fieldClass}
                  value={draft.timing}
                  onChange={(event) =>
                    setDraft({ ...draft, timing: event.target.value })
                  }
                  placeholder="For example, with breakfast"
                />
              </Field>
              <Field label="Label or reference source">
                <input
                  required
                  className={fieldClass}
                  value={draft.source}
                  onChange={(event) =>
                    setDraft({ ...draft, source: event.target.value })
                  }
                />
              </Field>
              <Field label="Source URL (optional)">
                <input
                  type="url"
                  className={fieldClass}
                  value={draft.sourceUrl}
                  onChange={(event) =>
                    setDraft({ ...draft, sourceUrl: event.target.value })
                  }
                />
              </Field>
            </div>
            <p className="text-caption text-stone-500">
              Enter each amount per serving. Use active nutrient / elemental
              amounts from Supplement Facts. Keep compound weights and uncertain
              amounts marked separately.
            </p>
            <datalist id="supplement-ingredients">
              {INGREDIENTS.filter((name) => name !== "Other").map((name) => (
                <option key={name}>{name}</option>
              ))}
            </datalist>
            {draft.ingredients.map((ingredient, index) => (
              <fieldset
                className="rounded-xl border border-cream-300 bg-cream-100 p-4"
                key={index}
              >
                <legend className="px-1 text-caption text-stone-600">
                  Ingredient {index + 1}
                </legend>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Ingredient name">
                    <input
                      required
                      list="supplement-ingredients"
                      className={fieldClass}
                      value={ingredient.name}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ingredients: draft.ingredients.map((row, i) =>
                            i === index
                              ? { ...row, name: event.target.value }
                              : row,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Amount per serving">
                    <input
                      required
                      type="number"
                      step="any"
                      min="0.000001"
                      className={fieldClass}
                      value={
                        Number.isFinite(ingredient.amount) &&
                        ingredient.amount !== 0
                          ? ingredient.amount
                          : ""
                      }
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ingredients: draft.ingredients.map((row, i) =>
                            i === index
                              ? { ...row, amount: event.target.valueAsNumber }
                              : row,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Label unit">
                    <select
                      className={fieldClass}
                      value={ingredient.unit}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ingredients: draft.ingredients.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  unit: event.target.value as typeof row.unit,
                                }
                              : row,
                          ),
                        })
                      }
                    >
                      {SUPPLEMENT_UNITS.map((unit) => (
                        <option key={unit}>{unit}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Amount basis">
                    <select
                      className={fieldClass}
                      value={ingredient.basis}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ingredients: draft.ingredients.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  basis: event.target.value as typeof row.basis,
                                }
                              : row,
                          ),
                        })
                      }
                    >
                      <option>active nutrient</option>
                      <option>compound / unspecified</option>
                    </select>
                  </Field>
                </div>
                {draft.ingredients.length > 1 && (
                  <button
                    type="button"
                    className="text-caption text-rose-dark mt-3 underline"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        ingredients: draft.ingredients.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    Remove ingredient {index + 1}
                  </button>
                )}
              </fieldset>
            ))}
            <button
              type="button"
              className={actionClass}
              onClick={() =>
                setDraft({
                  ...draft,
                  ingredients: [
                    ...draft.ingredients,
                    {
                      name: "",
                      amount: 0,
                      unit: "mg",
                      basis: "active nutrient",
                    },
                  ],
                })
              }
            >
              <Plus size={13} />
              Add another ingredient
            </button>
            <Field label="Notes / questions for review">
              <textarea
                maxLength={4000}
                className={fieldClass}
                rows={2}
                value={draft.notes}
                onChange={(event) =>
                  setDraft({ ...draft, notes: event.target.value })
                }
              />
            </Field>
            <div className="flex gap-3">
              <button className={primaryClass} type="submit">
                Save product
              </button>
              <button
                className={actionClass}
                type="button"
                onClick={() => setDraft(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}
      <Card>
        <h3 className="font-serif text-title mb-2">
          Planned daily ingredient totals
        </h3>
        <p className="text-caption text-stone-500 mb-4">
          Active products only. Compatible mass units are normalized; IU stays
          ingredient-specific. Compound / unspecified amounts remain separate by
          product. No upper-limit, drug-interaction or dose recommendation is
          inferred.
        </p>
        {!totals.length ? (
          <p className="text-body text-stone-400 py-5">
            Add a labeled product to see ingredient totals here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-caption">
              <thead>
                <tr>
                  {[
                    "Ingredient",
                    "Planned amount / day",
                    "Basis",
                    "Products",
                    "Review",
                  ].map((label) => (
                    <th key={label} className="p-3 font-medium text-stone-400">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {totals.map((row, index) => (
                  <tr className="border-t border-cream-300" key={index}>
                    <td className="p-3 capitalize">{row.ingredient}</td>
                    <td className="p-3 whitespace-nowrap">
                      {display(row.amount)} {row.unit}
                    </td>
                    <td className="p-3">{row.basis}</td>
                    <td className="p-3">{row.products.join(", ")}</td>
                    <td className="p-3">
                      {row.productIds.length > 1
                        ? "Multiple products — check labels"
                        : "Single product"}
                      {row.convertedVitaminD && (
                        <span className="block text-micro text-stone-400">
                          Vitamin D: 40 IU = 1 mcg
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <div className="grid lg:grid-cols-2 gap-4">
        {ledger.entries.map((product) => (
          <Card key={product.id}>
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-micro text-stone-400">
                  {product.active ? "Active daily plan" : "Paused"}
                </p>
                <h3 className="font-serif text-[22px]">{product.name}</h3>
              </div>
              <Pill size={20} className="text-copper" />
            </div>
            <p className="text-caption text-stone-500 mt-3">
              {product.servingsPerDay} serving(s) per day
              {product.timing ? ` · ${product.timing}` : ""}
            </p>
            <ul className="text-caption text-stone-600 mt-3 space-y-1">
              {product.ingredients.map((row, index) => (
                <li key={index}>
                  {row.name}: {row.amount} {row.unit} / serving · {row.basis}
                </li>
              ))}
            </ul>
            <p className="text-micro text-stone-400 mt-3">
              Source: {product.source}{" "}
              {product.sourceUrl && (
                <a
                  className="text-copper-700 underline"
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open source
                </a>
              )}
            </p>
            {product.notes && (
              <p className="text-caption text-stone-500 mt-3 whitespace-pre-wrap">
                {product.notes}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                className={actionClass}
                onClick={() => setDraft(structuredClone(product))}
                aria-label={`Edit ${product.name}`}
              >
                <Pencil size={12} />
                Edit
              </button>
              <button
                className={actionClass}
                onClick={() =>
                  act(
                    () => ledger.save({ ...product, active: !product.active }),
                    product.active
                      ? "Product paused; totals updated."
                      : "Product resumed; totals updated.",
                  )
                }
                aria-label={`${product.active ? "Pause" : "Resume"} ${product.name}`}
              >
                {product.active ? <Pause size={12} /> : <Play size={12} />}{" "}
                {product.active ? "Pause" : "Resume"}
              </button>
              <button
                className={actionClass}
                onClick={() =>
                  act(
                    () => setRemoved(ledger.remove(product.id) || null),
                    "Product removed.",
                  )
                }
                aria-label={`Remove ${product.name}`}
              >
                <Trash2 size={12} />
                Remove
              </button>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex gap-2 items-center mb-3">
          <BookOpen size={16} className="text-copper" />
          <h3 className="font-serif text-title">
            Source notes & portable records
          </h3>
        </div>
        <p className="text-caption text-stone-500 mb-4">
          <a
            href="https://dsld.od.nih.gov/"
            target="_blank"
            rel="noreferrer"
            className="text-copper-700 underline"
          >
            NIH Dietary Supplement Label Database
          </a>{" "}
          records label contents; it does not establish efficacy. The{" "}
          <a
            href="https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/"
            target="_blank"
            rel="noreferrer"
            className="text-copper-700 underline"
          >
            Vitamin D fact sheet
          </a>{" "}
          supports the specific IU conversion. Totals cannot identify unentered
          ingredients, unknown formulations or medication interactions.
        </p>
        <LedgerTools
          kind="supplements"
          storageKey={KEYS.supplements}
          schema={supplementSchema}
          stored={ledger.stored}
          summarize={(row) =>
            `${row.servingsPerDay} serving(s)/day · ${row.active ? "active" : "paused"} · ${row.ingredients.map((i) => `${i.name}: ${i.amount} ${i.unit}`).join("; ")} · ${row.source}`
          }
          onRestore={ledger.restore}
          disabled={!ledger.ready}
        />
        <button
          className={`${actionClass} mt-3`}
          disabled={!totals.length}
          onClick={() =>
            downloadFile(
              "symphony-supplement-totals.csv",
              toCsv([
                [
                  "ingredient",
                  "planned_amount_per_day",
                  "unit",
                  "basis",
                  "products",
                  "label_sources",
                ],
                ...totals.map((row) => [
                  row.ingredient,
                  row.amount,
                  row.unit,
                  row.basis,
                  row.products.join("; "),
                  row.sources.join("; "),
                ]),
              ]),
              "text/csv",
            )
          }
        >
          <Download size={13} />
          Export ingredient totals CSV
        </button>
      </Card>
    </div>
  );
}
