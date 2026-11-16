"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { writeJSON } from "./user-data";
import { parseLedger, type Ledger } from "./personal-ledgers";

export function useLedger<T extends { id: string }>(
  key: string,
  kind: string,
  schema: z.ZodType<T>,
) {
  const [stored, setStored] = useState<Ledger<T> | null>(null),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  function load() {
    const raw = window.localStorage.getItem(key);
    return raw ? parseLedger(JSON.parse(raw), kind, schema) : null;
  }
  useEffect(() => {
    const update = () => {
      try {
        setStored(load());
        setError("");
      } catch {
        setError(
          "The saved dataset could not be read. Download its raw backup before repairing it; new entries are blocked to preserve the original. A validated backup can still be reviewed and restored.",
        );
      } finally {
        setReady(true);
      }
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("symphony:data", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("symphony:data", update);
    };
  }, [key, kind, schema]);
  function commit(entries: T[]) {
    const next = parseLedger(
      {
        format: "symphony-ledger-v1",
        kind,
        updatedAt: new Date().toISOString(),
        entries,
      },
      kind,
      schema,
    );
    writeJSON(key, next);
  }
  function save(entry: T) {
    const checked = schema.parse(entry),
      current = load()?.entries || [];
    commit([...current.filter((row) => row.id !== checked.id), checked]);
  }
  function remove(id: string) {
    const current = load()?.entries || [],
      removed = current.find((row) => row.id === id);
    commit(current.filter((row) => row.id !== id));
    return removed;
  }
  function restore(value: unknown) {
    const next = parseLedger(value, kind, schema);
    commit(next.entries);
  }
  return {
    stored,
    entries: stored?.entries || [],
    ready,
    error,
    save,
    remove,
    restore,
  };
}
