import {
  finiteNumber,
  headerKey,
  localDay,
  parseTable,
  parseTimestamp,
} from "./tabular";

export type GlucoseUnit = "mmol/L" | "mg/dL";
export type CgmReading = { t: string; v: number };
export type CgmStored = {
  uploadedAt: string;
  sourceFile?: string;
  count: number;
  unit: GlucoseUnit; // Original input unit; readings are always normalized to mmol/L.
  readings: CgmReading[];
  warnings?: string[];
};
export type ParseResult =
  | { ok: true; readings: CgmReading[]; unit: GlucoseUnit; warnings: string[] }
  | { ok: false; error: string };
export const CGM_METHOD = "symphony-cgm-v1";
export const CGM_RANGE = { low: 3.9, high: 10, veryHigh: 13.9 };

export function parseCgmCsv(
  text: string,
  selectedUnit?: GlucoseUnit,
): ParseResult {
  try {
    const rows = parseTable(text);
    const hi = rows.findIndex(
      (row) =>
        row.some((c) =>
          /^(timestamp|time|datetime|devicetimestamp|timestamplocal)/.test(
            headerKey(c),
          ),
        ) && row.some((c) => /glucose|^sgv$|^value$/.test(headerKey(c))),
    );
    if (hi < 0)
      return {
        ok: false,
        error:
          "Include headers: timestamp, glucose_mmol_l (or glucose_mg_dl). Dates must use YYYY-MM-DD HH:mm or ISO 8601.",
      };
    const headers = rows[hi];
    const ti = headers.findIndex((c) =>
      /^(timestamp|time|datetime|devicetimestamp|timestamplocal)/.test(
        headerKey(c),
      ),
    );
    // Libre exports may include both historic and scanned columns: use historic.
    const gi = headers.findIndex(
      (c) =>
        /glucose|^sgv$|^value$/.test(headerKey(c)) &&
        !/scan|rapid|low|high/i.test(c),
    );
    if (gi < 0)
      return { ok: false, error: "No historic glucose column found." };
    const header = headerKey(headers[gi]);
    const declared = /mmoll/.test(header)
      ? "mmol/L"
      : /mgdl|^sgv$/.test(header)
        ? "mg/dL"
        : undefined;
    if (declared && selectedUnit && declared !== selectedUnit)
      return {
        ok: false,
        error:
          "Selected units conflict with the glucose column header. Check the export.",
      };
    const unit = declared || selectedUnit;
    if (!unit)
      return {
        ok: false,
        error:
          "Choose the file's glucose unit below, or use a glucose_mmol_l / glucose_mg_dl column. Units are never guessed from values.",
      };
    const readings = new Map<string, CgmReading>();
    let rejected = 0,
      duplicates = 0;
    for (const row of rows.slice(hi + 1)) {
      const date = parseTimestamp(row[ti]);
      const raw = finiteNumber(row[gi]);
      const value = raw === null ? NaN : unit === "mg/dL" ? raw / 18.0182 : raw;
      if (!date || !Number.isFinite(value) || value < 1 || value > 40) {
        rejected++;
        continue;
      }
      const t = date.toISOString();
      if (readings.has(t)) duplicates++;
      readings.set(t, { t, v: value });
    }
    if (!readings.size)
      return {
        ok: false,
        error:
          "No valid readings. Use unambiguous ISO dates and numeric glucose values (1–40 mmol/L or equivalent).",
      };
    return {
      ok: true,
      unit,
      readings: [...readings.values()].sort((a, b) => a.t.localeCompare(b.t)),
      warnings: [
        ...(rejected
          ? [`${rejected} rows excluded: missing/invalid timestamps or values.`]
          : []),
        ...(duplicates
          ? [
              `${duplicates} duplicate timestamps replaced by the last value in the file.`,
            ]
          : []),
        "Times display in this device's time zone; offset-free timestamps are interpreted in that zone.",
      ],
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unable to parse file.",
    };
  }
}

export async function parseCgmXlsx(
  file: File,
  unit?: GlucoseUnit,
): Promise<ParseResult> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
  });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return { ok: false, error: "Workbook contains no sheets." };
  return parseCgmCsv(
    XLSX.utils.sheet_to_csv(sheet, { dateNF: "yyyy-mm-dd hh:mm:ss" }),
    unit,
  );
}

export function validReadings(readings: CgmReading[]): CgmReading[] {
  const unique = new Map<string, CgmReading>();
  for (const r of readings) {
    if (
      !r ||
      !Number.isFinite(r.v) ||
      r.v < 1 ||
      r.v > 40 ||
      !Number.isFinite(Date.parse(r.t))
    )
      continue;
    const t = new Date(r.t).toISOString();
    unique.set(t, { t, v: r.v });
  }
  return [...unique.values()].sort((a, b) => a.t.localeCompare(b.t));
}

export function dailyReadings(
  readings: CgmReading[],
): Map<string, CgmReading[]> {
  const groups = new Map<string, CgmReading[]>();
  for (const r of validReadings(readings)) {
    const key = localDay(new Date(r.t));
    groups.set(key, [...(groups.get(key) || []), r]);
  }
  return groups;
}

export function buildDailyTrace(
  stored: CgmStored,
  selectedDay?: string,
): CgmReading[] {
  const groups = dailyReadings(stored.readings);
  const key = selectedDay || [...groups.keys()].at(-1);
  return (key ? groups.get(key) || [] : []).map((r) => {
    const dt = new Date(r.t);
    return {
      t: `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`,
      v: r.v,
    };
  });
}

export function computeStats(input: CgmReading[]) {
  const readings = validReadings(input);
  if (!readings.length) return null;
  const intervals = readings
    .slice(1)
    .map((r, i) => (Date.parse(r.t) - Date.parse(readings[i].t)) / 60000)
    .filter((n) => n > 0 && n <= 20)
    .sort((a, b) => a - b);
  const cadence = intervals.length
    ? intervals[Math.floor(intervals.length / 2)]
    : 5;
  // Left-hold each reading for at most one inferred sensor interval; gaps remain missing.
  const weights = readings.map((r, i) =>
    i + 1 < readings.length
      ? Math.min(
          cadence,
          (Date.parse(readings[i + 1].t) - Date.parse(r.t)) / 60000,
        )
      : cadence,
  );
  const observedMinutes = weights.reduce((a, b) => a + b, 0);
  const elapsedMinutes =
    (Date.parse(readings.at(-1)!.t) - Date.parse(readings[0].t)) / 60000 +
    cadence;
  const average =
    readings.reduce((sum, r, i) => sum + r.v * weights[i], 0) / observedMinutes;
  const fraction = (test: (v: number) => boolean) =>
    (readings.reduce((sum, r, i) => sum + (test(r.v) ? weights[i] : 0), 0) /
      observedMinutes) *
    100;
  const coverage = Math.min(100, (observedMinutes / elapsedMinutes) * 100);
  const sd = Math.sqrt(
    readings.reduce((sum, r, i) => sum + (r.v - average) ** 2 * weights[i], 0) /
      observedMinutes,
  );
  return {
    avg: average,
    tir: fraction((v) => v >= 3.9 && v <= 10),
    low: fraction((v) => v < 3.9),
    veryLow: fraction((v) => v < 3),
    high: fraction((v) => v > 10 && v <= 13.9),
    veryHigh: fraction((v) => v > 13.9),
    min: readings.reduce((value, r) => Math.min(value, r.v), Infinity),
    max: readings.reduce((value, r) => Math.max(value, r.v), -Infinity),
    cv: (sd / average) * 100,
    coverage,
    observedMinutes,
    elapsedMinutes,
    cadence,
    count: readings.length,
    days: dailyReadings(readings).size,
    start: readings[0].t,
    end: readings.at(-1)!.t,
    gmi:
      elapsedMinutes >= 14 * 1440 && coverage >= 70
        ? 3.31 + 0.02392 * (average * 18.0182)
        : null,
  };
}

export function buildAgp(readings: CgmReading[]) {
  const bins = new Map<number, { values: number[]; days: Set<string> }>();
  for (const r of validReadings(readings)) {
    const date = new Date(r.t),
      hour = date.getHours();
    const bin = bins.get(hour) || { values: [], days: new Set<string>() };
    bin.values.push(r.v);
    bin.days.add(localDay(date));
    bins.set(hour, bin);
  }
  return Array.from({ length: 24 }, (_, hour) => {
    const bin = bins.get(hour),
      values = bin?.values.sort((a, b) => a - b) || [];
    const quantile = (p: number) => {
      if (!values.length) return null;
      const index = (values.length - 1) * p,
        lower = Math.floor(index);
      return (
        values[lower] +
        (values[Math.ceil(index)] - values[lower]) * (index - lower)
      );
    };
    return {
      hour: `${String(hour).padStart(2, "0")}:00`,
      n: values.length,
      days: bin?.days.size || 0,
      p05: quantile(0.05),
      p25: quantile(0.25),
      median: quantile(0.5),
      p75: quantile(0.75),
      p95: quantile(0.95),
    };
  });
}
