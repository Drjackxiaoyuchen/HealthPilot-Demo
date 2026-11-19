import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  buildCgmQuality,
  qualityCsvRows,
  rangeBounds,
} from "../src/lib/cgm-quality";
import { computeStats, type CgmReading } from "../src/lib/cgm";
import { createReport } from "../src/lib/report";

const close = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const reading = (minute: number, v: number): CgmReading => ({
  t: new Date(
    new Date("2026-11-02T00:00:00").getTime() + minute * 60_000,
  ).toISOString(),
  v,
});

test("missing-time bounds have exact endpoints and width equal to the missing fraction", () => {
  assert.deepEqual(rangeBounds(30, 60, 120), {
    lower: 25,
    upper: 75,
    missingMinutes: 60,
  });
  assert.deepEqual(rangeBounds(30, 60, 60), {
    lower: 50,
    upper: 50,
    missingMinutes: 0,
  });
  assert.equal(rangeBounds(0, 0, 0), null);
  // All completions of the missing duration lie within the identified set.
  for (let observed = 1; observed <= 60; observed++) {
    const b = rangeBounds(observed / 3, observed, 60)!;
    close(b.upper - b.lower, (100 * (60 - observed)) / 60);
    for (
      let missingInRange = 0;
      missingInRange <= 60 - observed;
      missingInRange++
    ) {
      const completed = (100 * (observed / 3 + missingInRange)) / 60;
      assert.ok(completed >= b.lower - 1e-8 && completed <= b.upper + 1e-8);
    }
  }
});

test("hourly exposure reconciles with the full-upload support model and threshold boundaries", () => {
  const rows = [2.9, 3, 3.9, 10, 13.9, 14].map((v, i) => reading(i * 5, v));
  const q = buildCgmQuality(rows)!;
  const stats = computeStats(rows)!;
  close(q.observedMinutes, stats.observedMinutes);
  close(q.windowMinutes, stats.elapsedMinutes);
  close((q.inRangeMinutes / q.observedMinutes) * 100, stats.tir);
  close(
    q.days.reduce((sum, day) => sum + day.observedMinutes, 0),
    stats.observedMinutes,
  );
  close(q.days[0].hours[0].mean!, stats.avg);
  close(q.days[0].hours[0].tir!, stats.tir);
  close(q.days[0].calendarCoverage, (100 * 30) / 1440);
  assert.equal(q.days[0].hours[1].coverage, null); // outside the record window
});

test("whole missing dates stay present, with zero support and null glucose statistics", () => {
  const q = buildCgmQuality([
    { t: "2026-11-01T23:55:00", v: 5 },
    { t: "2026-11-03T00:05:00", v: 6 },
  ])!;
  assert.deepEqual(
    q.days.map((day) => day.day),
    ["2026-11-01", "2026-11-02", "2026-11-03"],
  );
  assert.equal(q.days[1].observedMinutes, 0);
  assert.equal(q.days[1].windowMinutes, 1440);
  assert.equal(q.days[1].tir, null);
  assert.equal(q.days[1].mean, null);
  assert.equal(q.days[1].hours[12].coverage, 0);
  assert.equal(q.cadenceInferred, false);
  close(
    q.bounds.upper - q.bounds.lower,
    100 * (1 - q.observedMinutes / q.windowMinutes),
  );
});

test("observation support crossing midnight is split instead of counted twice", () => {
  const q = buildCgmQuality([
    { t: "2026-11-02T23:58:00", v: 4 },
    { t: "2026-11-03T00:04:00", v: 10 },
  ])!;
  assert.equal(q.cadenceMinutes, 6);
  close(q.days[0].observedMinutes, 2);
  close(q.days[1].observedMinutes, 10);
  close(q.days[1].hours[0].mean!, (4 * 4 + 6 * 10) / 10);
  close(
    q.days.reduce((sum, day) => sum + day.observedMinutes, 0),
    12,
  );
});

test("irregular sampling matches an independent minute-grid reference, without bridging gaps", () => {
  const minutes = Array.from({ length: 400 }, (_, i) => i * 5).filter(
    (minute) =>
      !(minute >= 80 && minute < 140) && !(minute >= 1440 && minute < 1700),
  );
  minutes.push(23, 24, 61, 62);
  const rows = [...new Set(minutes)]
    .sort((a, b) => a - b)
    .map((minute, index) => reading(minute, index % 4 === 0 ? 12 : 6));
  const q = buildCgmQuality(rows)!;
  assert.equal(q.cadenceMinutes, 5);
  const oracle = new Map<
    string,
    { observed: number; inRange: number; glucose: number }
  >();
  let index = 0;
  const finalMinute =
    (Date.parse(rows.at(-1)!.t) - Date.parse(rows[0].t)) / 60_000 + 5;
  for (let minute = 0; minute < finalMinute; minute++) {
    const time = Date.parse(reading(minute, 6).t);
    while (index + 1 < rows.length && Date.parse(rows[index + 1].t) <= time)
      index++;
    if (time - Date.parse(rows[index].t) >= 5 * 60_000) continue;
    const date = new Date(time),
      key = `${date.getDate()}-${date.getHours()}`;
    const bucket = oracle.get(key) || { observed: 0, inRange: 0, glucose: 0 };
    bucket.observed++;
    bucket.inRange += rows[index].v <= 10 ? 1 : 0;
    bucket.glucose += rows[index].v;
    oracle.set(key, bucket);
  }
  for (const day of q.days)
    for (const cell of day.hours) {
      const expected = oracle.get(`${Number(day.day.slice(-2))}-${cell.hour}`);
      close(cell.observedMinutes, expected?.observed || 0);
      close(cell.inRangeMinutes, expected?.inRange || 0);
      close(cell.glucoseMinutes, expected?.glucose || 0);
    }
});

test("DST skipped/repeated hours use true minutes, including half-hour transitions", () => {
  const cases = [
    {
      tz: "America/New_York",
      start: "2026-03-08T00:00:00-05:00",
      end: "2026-03-09T00:00:00-04:00",
      duration: 1380,
      hour: 2,
      hourMinutes: 0,
    },
    {
      tz: "America/New_York",
      start: "2026-11-01T00:00:00-04:00",
      end: "2026-11-02T00:00:00-05:00",
      duration: 1500,
      hour: 1,
      hourMinutes: 120,
    },
    {
      tz: "Australia/Lord_Howe",
      start: "2026-10-04T00:00:00+10:30",
      end: "2026-10-05T00:00:00+11:00",
      duration: 1410,
      hour: 2,
      hourMinutes: 30,
    },
    {
      tz: "Australia/Lord_Howe",
      start: "2026-04-05T00:00:00+11:00",
      end: "2026-04-06T00:00:00+10:30",
      duration: 1470,
      hour: 1,
      hourMinutes: 90,
    },
  ];
  for (const example of cases) {
    const code = `require('tsx/cjs'); const { buildCgmQuality } = require('./src/lib/cgm-quality.ts');
      const a = Date.parse('${example.start}'), b = Date.parse('${example.end}');
      const rows = Array.from({length:(b-a)/300000}, (_,i)=>({t:new Date(a+i*300000).toISOString(),v:6}));
      console.log(JSON.stringify(buildCgmQuality(rows)));`;
    const q = JSON.parse(
      execFileSync(process.execPath, ["-e", code], {
        env: { ...process.env, TZ: example.tz },
        encoding: "utf8",
      }),
    );
    assert.equal(q.days.length, 1, example.tz);
    close(q.days[0].calendarMinutes, example.duration);
    close(q.days[0].observedMinutes, example.duration);
    close(q.days[0].calendarCoverage, 100);
    close(q.days[0].hours[example.hour].calendarMinutes, example.hourMinutes);
    close(q.days[0].hours[example.hour].observedMinutes, example.hourMinutes);
  }
});

test("empty and invalid input stays absent; detail truncation is disclosed separately from full bounds", () => {
  assert.equal(buildCgmQuality([]), null);
  assert.equal(buildCgmQuality([{ t: "bad", v: 5 }]), null);
  const q = buildCgmQuality([
    { t: "2024-01-01T12:00:00", v: 5 },
    { t: "2026-01-01T12:00:00", v: 5 },
  ])!;
  assert.equal(q.days.length, 366);
  assert.equal(q.detailTruncated, true);
  close(q.observedMinutes, 10);
  close(
    q.days.reduce((sum, day) => sum + day.observedMinutes, 0),
    5,
  );
  assert.ok(q.windowMinutes > 730 * 1440);
});

test("reports and hourly CSV retain method, timezone, missing values and denominator units", () => {
  const cgm = {
    uploadedAt: "2026-11-19T00:00:00Z",
    sourceFile: "synthetic.csv",
    count: 3,
    unit: "mmol/L" as const,
    readings: [reading(0, 6), reading(5, 12), reading(65, 6)],
  };
  const report = createReport({ cgm, genome: null, bloodwork: null });
  const q = report.cgm!.qualityAudit!;
  assert.equal(q.method, "symphony-cgm-quality-v1");
  assert.equal(q.timeZone, report.timeZone);
  const rows = qualityCsvRows(q, {
    filename: cgm.sourceFile,
    uploadedAt: cgm.uploadedAt,
  });
  assert.equal(rows.length, 25);
  assert.equal(rows[2][9], 6);
  assert.equal(rows[3][9], null);
  assert.equal(rows[1][11], "synthetic.csv");
  assert.equal(rows[1][12], cgm.uploadedAt);
  assert.equal(
    createReport({ cgm: null, genome: null, bloodwork: null }).cgm,
    null,
  );
});
