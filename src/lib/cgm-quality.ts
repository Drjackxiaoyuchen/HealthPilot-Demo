import { cgmExposure, CGM_RANGE, type CgmReading } from "./cgm";
import { localDay } from "./tabular";

export const CGM_QUALITY_METHOD = "symphony-cgm-quality-v1";
export const MAX_AUDIT_DAYS = 366;
const MINUTE = 60_000;

export type CoverageCell = {
  hour: number;
  calendarMinutes: number;
  windowMinutes: number;
  observedMinutes: number;
  inRangeMinutes: number;
  glucoseMinutes: number;
  mean: number | null;
  tir: number | null;
  coverage: number | null;
  start: string | null;
  end: string | null;
};
export type CoverageDay = Omit<CoverageCell, "hour" | "start" | "end"> & {
  day: string;
  calendarCoverage: number;
  hours: CoverageCell[];
};

/** Sharp missing-duration bounds conditional on the declared observation support.
 * Unknown minutes can all be outside or all inside the target range. These are
 * identification/sensitivity bounds, not confidence or prediction intervals.
 */
export function rangeBounds(
  inRangeMinutes: number,
  observedMinutes: number,
  windowMinutes: number,
) {
  if (windowMinutes <= 0) return null;
  const missingMinutes = Math.max(0, windowMinutes - observedMinutes);
  return {
    lower: (100 * inRangeMinutes) / windowMinutes,
    upper: (100 * (inRangeMinutes + missingMinutes)) / windowMinutes,
    missingMinutes,
  };
}

const emptyCell = (hour: number): CoverageCell => ({
  hour,
  calendarMinutes: 0,
  windowMinutes: 0,
  observedMinutes: 0,
  inRangeMinutes: 0,
  glucoseMinutes: 0,
  mean: null,
  tir: null,
  coverage: null,
  start: null,
  end: null,
});

function finish<
  T extends Pick<
    CoverageCell,
    | "observedMinutes"
    | "windowMinutes"
    | "inRangeMinutes"
    | "glucoseMinutes"
    | "mean"
    | "tir"
    | "coverage"
  >,
>(cell: T): T {
  return {
    ...cell,
    mean: cell.observedMinutes
      ? cell.glucoseMinutes / cell.observedMinutes
      : null,
    tir: cell.observedMinutes
      ? (100 * cell.inRangeMinutes) / cell.observedMinutes
      : null,
    coverage: cell.windowMinutes
      ? (100 * cell.observedMinutes) / cell.windowMinutes
      : null,
  };
}

/** Device-local civil hours, split in absolute time. Repeated DST hours share
 * a column with their actual duration; skipped hours have zero duration.
 * No interpolation, gap filling, sample-count coverage, or treatment inference.
 */
export function buildCgmQuality(input: CgmReading[]) {
  const exposure = cgmExposure(input);
  if (!exposure) return null;
  const { readings, cadence, weights, cadenceInferred } = exposure;
  const start = Date.parse(readings[0].t);
  const end = Date.parse(readings.at(-1)!.t) + cadence * MINUTE;
  const windowMinutes = (end - start) / MINUTE;
  let observedMinutes = 0;
  let inRangeMinutes = 0;
  readings.forEach((reading, index) => {
    observedMinutes += weights[index];
    if (reading.v >= CGM_RANGE.low && reading.v <= CGM_RANGE.high)
      inRangeMinutes += weights[index];
  });

  const first = new Date(start);
  first.setHours(0, 0, 0, 0);
  const last = new Date(end - 1);
  last.setHours(0, 0, 0, 0);
  const detailStart = new Date(last);
  detailStart.setDate(detailStart.getDate() - MAX_AUDIT_DAYS + 1);
  if (detailStart < first) detailStart.setTime(first.getTime());

  const days: CoverageDay[] = [];
  const slices: { start: number; end: number; cell: CoverageCell }[] = [];
  for (let date = new Date(detailStart); date <= last; ) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const day: CoverageDay = {
      day: localDay(date),
      calendarCoverage: 0,
      calendarMinutes: 0,
      windowMinutes: 0,
      observedMinutes: 0,
      inRangeMinutes: 0,
      glucoseMinutes: 0,
      mean: null,
      tir: null,
      coverage: null,
      hours: Array.from({ length: 24 }, (_, hour) => emptyCell(hour)),
    };
    // At most one absolute hour per step also handles a repeated civil hour.
    for (let cursor = date.getTime(); cursor < nextDay.getTime(); ) {
      const wallEnd = new Date(cursor);
      wallEnd.setMinutes(60, 0, 0);
      const stop = Math.min(
        wallEnd.getTime(),
        cursor + 60 * MINUTE,
        nextDay.getTime(),
      );
      const cell = day.hours[new Date(cursor).getHours()];
      cell.calendarMinutes += (stop - cursor) / MINUTE;
      const a = Math.max(cursor, start),
        b = Math.min(stop, end);
      if (b > a) {
        cell.windowMinutes += (b - a) / MINUTE;
        cell.start ??= new Date(a).toISOString();
        cell.end = new Date(b).toISOString();
        slices.push({ start: a, end: b, cell });
      }
      cursor = stop;
    }
    days.push(day);
    date = nextDay;
  }

  let sliceIndex = 0;
  readings.forEach((reading, index) => {
    const a = Date.parse(reading.t),
      b = a + weights[index] * MINUTE;
    while (sliceIndex < slices.length && slices[sliceIndex].end <= a)
      sliceIndex++;
    for (let j = sliceIndex; j < slices.length && slices[j].start < b; j++) {
      const slice = slices[j];
      const minutes =
        Math.max(0, Math.min(b, slice.end) - Math.max(a, slice.start)) / MINUTE;
      slice.cell.observedMinutes += minutes;
      slice.cell.glucoseMinutes += minutes * reading.v;
      if (reading.v >= CGM_RANGE.low && reading.v <= CGM_RANGE.high)
        slice.cell.inRangeMinutes += minutes;
    }
  });
  const detailDays = days.map((day) => {
    day.hours = day.hours.map(finish);
    for (const cell of day.hours) {
      day.calendarMinutes += cell.calendarMinutes;
      day.windowMinutes += cell.windowMinutes;
      day.observedMinutes += cell.observedMinutes;
      day.inRangeMinutes += cell.inRangeMinutes;
      day.glucoseMinutes += cell.glucoseMinutes;
    }
    day.calendarCoverage = (100 * day.observedMinutes) / day.calendarMinutes;
    return finish(day);
  });
  return {
    method: CGM_QUALITY_METHOD,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cadenceMinutes: cadence,
    cadenceInferred,
    start: new Date(start).toISOString(),
    endExclusive: new Date(end).toISOString(),
    windowMinutes,
    observedMinutes,
    inRangeMinutes,
    bounds: rangeBounds(inRangeMinutes, observedMinutes, windowMinutes)!,
    detailStart: detailDays[0].day,
    detailTruncated: detailStart > first,
    maxDetailDays: MAX_AUDIT_DAYS,
    days: detailDays,
  };
}

export function qualityCsvRows(
  quality: NonNullable<ReturnType<typeof buildCgmQuality>>,
  source?: { filename: string; uploadedAt: string },
): unknown[][] {
  return [
    [
      "day",
      "hour_local",
      "time_zone",
      "calendar_minutes",
      "window_minutes",
      "observed_minutes",
      "window_coverage_pct",
      "in_range_minutes",
      "observed_tir_pct",
      "mean_mmol_l",
      "method",
      "source_file",
      "uploaded_at",
    ],
    ...quality.days.flatMap((day) =>
      day.hours.map((cell) => [
        day.day,
        cell.hour,
        quality.timeZone,
        cell.calendarMinutes,
        cell.windowMinutes,
        cell.observedMinutes,
        cell.coverage,
        cell.inRangeMinutes,
        cell.tir,
        cell.mean,
        quality.method,
        source?.filename || null,
        source?.uploadedAt || null,
      ]),
    ),
  ];
}
