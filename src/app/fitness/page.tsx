"use client";
import { useState } from "react";
import {
  Plus,
  Dumbbell,
  Pencil,
  Trash2,
  Download,
  CheckCircle2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { KEYS } from "@/lib/user-data";
import { useLedger } from "@/lib/use-ledger";
import {
  workoutSchema,
  workoutVolume,
  fitnessDays,
  inputInstant,
  localDateTime,
  type Workout,
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
export default function FitnessPage() {
  const ledger = useLedger(KEYS.workouts, "workouts", workoutSchema);
  const [draft, setDraft] = useState<Workout | null>(null),
    [at, setAt] = useState(""),
    [status, setStatus] = useState("All sessions"),
    [query, setQuery] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [removed, setRemoved] = useState<Workout | null>(null);
  const completed = ledger.entries.filter((row) => row.status === "completed"),
    daily = fitnessDays(ledger.entries),
    visible = ledger.entries
      .filter(
        (row) =>
          (status === "All sessions" || row.status === status) &&
          `${row.name} ${row.type} ${row.sets.map((set) => set.exercise).join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      )
      .sort((a, b) => b.at.localeCompare(a.at));
  function act(action: () => void, message: string) {
    try {
      action();
      setMessage(message);
      setError("");
    } catch (error) {
      setError(messageOf(error));
    }
  }
  function edit(row?: Workout) {
    setDraft(
      row
        ? structuredClone(row)
        : {
            id: crypto.randomUUID(),
            name: "",
            at: new Date().toISOString(),
            status: "completed",
            type: "Resistance",
            durationMin: NaN,
            sets: [],
            notes: "",
          },
    );
    setAt(row ? localDateTime(new Date(row.at)) : localDateTime(new Date()));
    setError("");
  }
  function setChange(index: number, patch: Partial<Workout["sets"][number]>) {
    if (draft)
      setDraft({
        ...draft,
        sets: draft.sets.map((row, i) =>
          i === index ? { ...row, ...patch } : row,
        ),
      });
  }
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-4 justify-between">
          <div>
            <p className="text-micro text-copper-700 uppercase tracking-widest">
              Plans become records
            </p>
            <h2 className="font-serif text-[30px] mt-1">Your training log</h2>
            <p className="text-body text-stone-500 mt-2 max-w-2xl">
              Record actual sessions, sets and loads. Keep planned workouts
              visible without counting them as completed activity.
            </p>
          </div>
          <button
            className={primaryClass}
            disabled={!ledger.ready || !!ledger.error}
            onClick={() => edit()}
          >
            <Plus size={14} />
            Log a session
          </button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          {[
            ["Completed sessions", completed.length],
            [
              "Recorded completed minutes",
              completed.reduce((sum, row) => sum + row.durationMin, 0),
            ],
            ["Planned sessions", ledger.entries.length - completed.length],
          ].map(([label, value]) => (
            <div
              className="p-4 rounded-xl bg-cream-100 border border-cream-300"
              key={label}
            >
              <p className="text-micro text-stone-500">{label}</p>
              <p className="font-serif text-[28px]">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-micro text-stone-400 mt-3">
          All recorded history. No calorie-burn, recovery or readiness score is
          inferred.
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
                }, "Session restored.")
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
                ledger.save({ ...draft, at: inputInstant(at) });
                setDraft(null);
                setRemoved(null);
              }, "Session saved; activity summaries updated.");
            }}
          >
            <h3 className="font-serif text-title">Session details</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Session name">
                <input
                  required
                  className={fieldClass}
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
              </Field>
              <Field label="Session date and time">
                <input
                  required
                  type="datetime-local"
                  className={fieldClass}
                  value={at}
                  onChange={(event) => setAt(event.target.value)}
                />
              </Field>
              <Field label="Duration (minutes)">
                <input
                  required
                  type="number"
                  step="any"
                  min="0.1"
                  max="1440"
                  className={fieldClass}
                  value={
                    Number.isFinite(draft.durationMin) ? draft.durationMin : ""
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      durationMin: event.target.valueAsNumber,
                    })
                  }
                />
              </Field>
              <Field label="Session type">
                <select
                  className={fieldClass}
                  value={draft.type}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      type: event.target.value as Workout["type"],
                    })
                  }
                >
                  {["Resistance", "Cardio", "Mobility", "Other"].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </Field>
              <Field label="Session status">
                <select
                  className={fieldClass}
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      status: event.target.value as Workout["status"],
                    })
                  }
                >
                  <option value="completed">Completed</option>
                  <option value="planned">Planned</option>
                </select>
              </Field>
            </div>
            <p className="text-caption text-stone-500">
              Each row below is one performed or planned set. External-load
              volume uses repetitions × recorded external load. Bodyweight sets
              remain in the log and do not assume a body mass.
            </p>
            {draft.sets.map((set, index) => (
              <fieldset
                className="p-4 rounded-xl bg-cream-100 border border-cream-300"
                key={index}
              >
                <legend className="px-1 text-caption text-stone-600">
                  Set {index + 1}
                </legend>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <Field label="Exercise">
                    <input
                      required
                      className={fieldClass}
                      value={set.exercise}
                      onChange={(event) =>
                        setChange(index, { exercise: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Repetitions">
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      className={fieldClass}
                      value={Number.isFinite(set.reps) ? set.reps : ""}
                      onChange={(event) =>
                        setChange(index, { reps: event.target.valueAsNumber })
                      }
                    />
                  </Field>
                  <Field label="Load kind">
                    <select
                      className={fieldClass}
                      value={set.loadKind}
                      onChange={(event) =>
                        setChange(index, {
                          loadKind: event.target.value as typeof set.loadKind,
                          load:
                            event.target.value === "bodyweight" ? 0 : set.load,
                        })
                      }
                    >
                      <option value="external">External load</option>
                      <option value="bodyweight">Bodyweight</option>
                    </select>
                  </Field>
                  <Field label="Recorded external load">
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      className={fieldClass}
                      disabled={set.loadKind === "bodyweight"}
                      value={Number.isFinite(set.load) ? set.load : ""}
                      onChange={(event) =>
                        setChange(index, { load: event.target.valueAsNumber })
                      }
                    />
                  </Field>
                  <Field label="Load unit">
                    <select
                      className={fieldClass}
                      value={set.unit}
                      onChange={(event) =>
                        setChange(index, {
                          unit: event.target.value as typeof set.unit,
                        })
                      }
                    >
                      <option>kg</option>
                      <option>lb</option>
                    </select>
                  </Field>
                </div>
                <button
                  type="button"
                  className="text-caption text-rose-dark underline mt-3"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      sets: draft.sets.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove set {index + 1}
                </button>
              </fieldset>
            ))}
            <button
              type="button"
              className={actionClass}
              onClick={() =>
                setDraft({
                  ...draft,
                  sets: [
                    ...draft.sets,
                    {
                      exercise: draft.sets.at(-1)?.exercise || "",
                      reps: NaN,
                      load: 0,
                      unit: "kg",
                      loadKind: "external",
                    },
                  ],
                })
              }
            >
              <Plus size={12} />
              Add set
            </button>
            <Field label="Session notes">
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
                Save session
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
      <div className="flex flex-wrap gap-3">
        <Field label="Find a session or exercise">
          <input
            className={fieldClass}
            placeholder="Search recorded sessions…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Session filter">
          <select
            className={fieldClass}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All sessions</option>
            <option value="completed">Completed</option>
            <option value="planned">Planned</option>
          </select>
        </Field>
      </div>
      {!visible.length && (
        <Card>
          <Dumbbell size={24} className="text-copper mb-3" />
          <h3 className="font-serif text-title">
            {ledger.entries.length
              ? "No matching sessions"
              : "Start with a completed session or a plan"}
          </h3>
          <p className="text-body text-stone-500 mt-2">
            Log its date, duration and exercise sets. Your records drive the
            charts and exports.
          </p>
        </Card>
      )}
      {visible.map((workout) => (
        <Card key={workout.id}>
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="text-micro text-stone-400">
                {new Date(workout.at).toLocaleString()} · {workout.type} ·{" "}
                {workout.status}
              </p>
              <h3 className="font-serif text-[22px]">{workout.name}</h3>
            </div>
            <span className="text-caption text-copper-700">
              {workout.durationMin} min
              {workout.status === "completed"
                ? ` · ${workoutVolume(workout).toFixed(1)} kg·reps external-load volume`
                : " · excluded from completed totals"}
            </span>
          </div>
          {workout.sets.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-caption">
                <thead>
                  <tr>
                    {["Set", "Exercise", "Reps", "Recorded load"].map(
                      (label) => (
                        <th
                          key={label}
                          className="p-2 text-stone-400 font-medium"
                        >
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {workout.sets.map((set, index) => (
                    <tr key={index} className="border-t border-cream-300">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{set.exercise}</td>
                      <td className="p-2">{set.reps}</td>
                      <td className="p-2">
                        {set.loadKind === "bodyweight"
                          ? "Bodyweight (not converted)"
                          : `${set.load} ${set.unit}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {workout.notes && (
            <p className="text-caption text-stone-500 mt-3 whitespace-pre-wrap">
              {workout.notes}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              className={actionClass}
              onClick={() => edit(workout)}
              aria-label={`Edit ${workout.name}`}
            >
              <Pencil size={12} />
              Edit
            </button>
            {workout.status === "planned" && (
              <button
                className={actionClass}
                onClick={() => edit({ ...workout, status: "completed" })}
                aria-label={`Review completion of ${workout.name}`}
              >
                <CheckCircle2 size={12} />
                Review as completed
              </button>
            )}
            <button
              className={actionClass}
              aria-label={`Remove ${workout.name}`}
              onClick={() =>
                act(
                  () => setRemoved(ledger.remove(workout.id) || null),
                  "Session removed; summaries updated.",
                )
              }
            >
              <Trash2 size={12} />
              Remove
            </button>
          </div>
        </Card>
      ))}
      {daily.length > 0 && (
        <Card>
          <h3 className="font-serif text-title mb-4">
            Recorded completed minutes by day
          </h3>
          <div className="h-[230px]">
            <ResponsiveContainer>
              <BarChart data={daily}>
                <CartesianGrid
                  stroke="#E8E0D4"
                  vertical={false}
                  strokeDasharray="3 3"
                />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => [
                    value + " min",
                    "Recorded duration",
                  ]}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="duration"
                  fill="#6B8F71"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-micro text-stone-500 mt-3">
            Days without a record are missing, not rest days. Compare load
            volumes within the same exercise and technique; different exercises
            are not equivalent work.
          </p>
        </Card>
      )}
      <Card>
        <h3 className="font-serif text-title mb-3">
          Your history, in a portable format
        </h3>
        <p className="text-caption text-stone-500 mb-4">
          The data model follows the separation of planned sessions and
          performed logs used by{" "}
          <a
            className="underline text-copper-700"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/wger-project/wger"
          >
            wger
          </a>
          . No training program or calorie-burn estimate is generated from your
          genome.
        </p>
        <LedgerTools
          kind="workouts"
          storageKey={KEYS.workouts}
          schema={workoutSchema}
          stored={ledger.stored}
          summarize={(row) =>
            `${new Date(row.at).toLocaleString()} · ${row.status} · ${row.durationMin} min · ${row.sets.length} set(s)`
          }
          onRestore={ledger.restore}
          disabled={!ledger.ready}
        />
        <button
          className={`${actionClass} mt-3`}
          disabled={!ledger.entries.length}
          onClick={() =>
            downloadFile(
              "symphony-workout-sessions.csv",
              toCsv([
                [
                  "session_id",
                  "session",
                  "timestamp",
                  "type",
                  "status",
                  "duration_min",
                  "external_volume_kg_reps",
                  "recorded_sets",
                  "notes",
                ],
                ...ledger.entries.map((row) => [
                  row.id,
                  row.name,
                  row.at,
                  row.type,
                  row.status,
                  row.durationMin,
                  workoutVolume(row),
                  JSON.stringify(row.sets),
                  row.notes,
                ]),
              ]),
              "text/csv",
            )
          }
        >
          <Download size={13} />
          Export sessions CSV
        </button>
      </Card>
    </div>
  );
}
