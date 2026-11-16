import { finiteNumber, headerKey, parseTable, parseTimestamp } from "./tabular";

export type LabObservation = {
  id: string;
  marker: string;
  value: number;
  unit: string;
  collectedAt: string;
  referenceLow: number | null;
  referenceHigh: number | null;
  category: string;
  lab: string;
  loinc?: string;
};
export type BloodworkStored = {
  uploadedAt: string;
  sourceFile: string;
  observations: LabObservation[];
};
export type LabStatus =
  | "Within range"
  | "Below range"
  | "Above range"
  | "No range supplied";

export function labStatus(row: LabObservation): LabStatus {
  if (row.referenceLow === null && row.referenceHigh === null)
    return "No range supplied";
  if (row.referenceLow !== null && row.value < row.referenceLow)
    return "Below range";
  if (row.referenceHigh !== null && row.value > row.referenceHigh)
    return "Above range";
  return "Within range";
}

export function parseBloodworkCsv(
  text: string,
):
  | { ok: true; observations: LabObservation[]; warnings: string[] }
  | { ok: false; error: string } {
  try {
    const rows = parseTable(text),
      headers = rows[0]?.map(headerKey) || [];
    const required = ["marker", "value", "unit", "collectedat"];
    if (required.some((key) => !headers.includes(key)))
      return {
        ok: false,
        error:
          "Required columns: marker, value, unit, collected_at. Optional: reference_low, reference_high, category, lab, loinc.",
      };
    const observations = new Map<string, LabObservation>();
    const errors: string[] = [];
    let duplicates = 0;
    rows.slice(1).forEach((row, index) => {
      const cell = (key: string) => row[headers.indexOf(key)] || "";
      const value = finiteNumber(cell("value")),
        low = finiteNumber(cell("referencelow")),
        high = finiteNumber(cell("referencehigh"));
      const date = cell("collectedat");
      if (
        !cell("marker") ||
        !cell("unit") ||
        value === null ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !parseTimestamp(date) ||
        (cell("referencelow") && low === null) ||
        (cell("referencehigh") && high === null) ||
        (low !== null && high !== null && low >= high)
      ) {
        errors.push(
          `Row ${index + 2}: check marker, numeric value/ranges, unit and YYYY-MM-DD collection date.`,
        );
        return;
      }
      const observation: LabObservation = {
        id: `lab-${index + 1}`,
        marker: cell("marker"),
        value,
        unit: cell("unit"),
        collectedAt: date,
        referenceLow: low,
        referenceHigh: high,
        category: cell("category") || "Other",
        lab: cell("lab") || "Not supplied",
        loinc: cell("loinc") || undefined,
      };
      const key = [
        observation.marker.toLowerCase(),
        observation.unit,
        date,
        observation.lab,
      ].join("|");
      if (observations.has(key)) duplicates++;
      observations.set(key, observation);
    });
    if (errors.length)
      return {
        ok: false,
        error:
          errors.slice(0, 4).join(" ") +
          (errors.length > 4 ? ` ${errors.length - 4} more invalid rows.` : ""),
      };
    if (!observations.size)
      return { ok: false, error: "No observations found." };
    return {
      ok: true,
      observations: [...observations.values()].sort((a, b) =>
        a.collectedAt.localeCompare(b.collectedAt),
      ),
      warnings: [
        ...(duplicates
          ? [
              `${duplicates} duplicate marker/unit/date/lab rows replaced by the last row.`,
            ]
          : []),
        "Units and laboratory reference intervals are preserved exactly. Different units remain separate trends.",
      ],
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to read CSV.",
    };
  }
}

export function labSeries(observations: LabObservation[]) {
  const series = new Map<string, LabObservation[]>();
  for (const row of observations) {
    const key = `${row.marker.toLowerCase()}|${row.unit}|${row.lab}`;
    const group = series.get(key) || [];
    group.push(row);
    series.set(key, group);
  }
  return [...series.values()].map((rows) => {
    const ordered = rows
      .slice()
      .sort((a, b) => a.collectedAt.localeCompare(b.collectedAt));
    return {
      key: `${ordered[0].marker}|${ordered[0].unit}|${ordered[0].lab}`,
      latest: ordered.at(-1)!,
      history: ordered,
    };
  });
}

export const BLOODWORK_TEMPLATE =
  "marker,value,unit,collected_at,reference_low,reference_high,category,lab,loinc\nHbA1c,5.4,%,2026-10-15,4,5.6,Metabolic,Example Lab,4548-4\nHbA1c,5.2,%,2026-11-15,4,5.6,Metabolic,Example Lab,4548-4\nVitamin D,28,ng/mL,2026-11-15,20,50,Vitamins,Example Lab,\n";
