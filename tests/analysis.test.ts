import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTable, parseTimestamp, toCsv } from "../src/lib/tabular";
import {
  parseCgmCsv,
  computeStats,
  buildAgp,
  buildDailyTrace,
  dailyReadings,
  type CgmReading,
} from "../src/lib/cgm";
import {
  parseBloodworkCsv,
  labStatus,
  labSeries,
  BLOODWORK_TEMPLATE,
} from "../src/lib/bloodwork";
import { parseGenomeText, matchKnownSnps } from "../src/lib/user-data";
import { createReport, labCsvRows } from "../src/lib/report";
import { SECTION_GUIDES, RESEARCH_SOURCES } from "../src/data/research";

test("quoted CSV fields, escaped quotes, BOM and line breaks survive parsing", () => {
  assert.deepEqual(
    parseTable('\uFEFFmarker,value\r\n"A, B",5\r\n"Lab ""A""\nNorth",7'),
    [
      ["marker", "value"],
      ["A, B", "5"],
      ['Lab "A"\nNorth', "7"],
    ],
  );
  assert.throws(() => parseTable('a,b\n"unclosed,2'));
});
test("ambiguous and impossible timestamps are rejected", () => {
  for (const date of [
    "04/05/2026 12:00",
    "2026-02-30T12:00",
    "2026-12-01T25:00",
    "no-date",
  ])
    assert.equal(parseTimestamp(date), null);
  assert.equal(
    parseTimestamp("2026-11-15T08:00:00+08:00")?.toISOString(),
    "2026-11-15T00:00:00.000Z",
  );
});
test("CGM units are declared, never guessed from the distribution", () => {
  assert.equal(
    parseCgmCsv("timestamp,glucose\n2026-11-15T08:00:00Z,100").ok,
    false,
  );
  const result = parseCgmCsv(
    "timestamp,glucose\n2026-11-15T08:00:00Z,100",
    "mg/dL",
  );
  assert.equal(result.ok, true);
  if (result.ok)
    assert.ok(Math.abs(result.readings[0].v - 100 / 18.0182) < 1e-10);
  assert.equal(
    parseCgmCsv("timestamp,glucose_mg_dl\n2026-11-15T08:00:00Z,100", "mmol/L")
      .ok,
    false,
  );
});
test("CGM parser maps columns, excludes bad rows and resolves duplicate instants", () => {
  const result = parseCgmCsv(
    "device;glucose_mmol_l;timestamp\na;5;2026-11-15T08:00:00Z\na;6;2026-11-15T08:00:00Z\na;bad;2026-11-15T08:05:00Z\na;7;2026-11-15T08:10:00Z",
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.readings.map((r) => r.v),
    [6, 7],
  );
  assert.ok(result.warnings.some((w) => w.includes("1 rows excluded")));
  assert.ok(result.warnings.some((w) => w.includes("1 duplicate")));
});
test("empty, invalid and partial numeric glucose values do not become readings", () => {
  for (const value of ["", "abc", "7x", "Infinity", "0", "500"])
    assert.equal(
      parseCgmCsv(`timestamp,glucose_mmol_l\n2026-11-15T08:00:00Z,${value}`).ok,
      false,
    );
});
const reading = (minute: number, v: number): CgmReading => ({
  t: new Date(Date.UTC(2026, 10, 1, 0, minute)).toISOString(),
  v,
});
test("long gaps remain missing in duration-weighted statistics", () => {
  const stats = computeStats([reading(0, 5), reading(5, 15), reading(65, 5)])!;
  assert.equal(stats.observedMinutes, 15);
  assert.equal(stats.elapsedMinutes, 70);
  assert.ok(Math.abs(stats.coverage - (15 / 70) * 100) < 1e-10);
  assert.ok(Math.abs(stats.tir - (2 / 3) * 100) < 1e-10);
  assert.ok(Math.abs(stats.avg - 25 / 3) < 1e-10);
});
test("standard glucose zones partition observed duration including threshold boundaries", () => {
  const stats = computeStats(
    [2.9, 3, 3.9, 10, 13.9, 14].map((v, i) => reading(i * 5, v)),
  )!;
  assert.ok(
    Math.abs(stats.low + stats.tir + stats.high + stats.veryHigh - 100) < 1e-8,
  );
  assert.ok(Math.abs(stats.veryLow - 100 / 6) < 1e-8);
  assert.ok(Math.abs(stats.tir - 100 / 3) < 1e-8);
});
test("statistics ignore invalid readings, sort and deduplicate timestamps", () => {
  const stats = computeStats([
    reading(5, 6),
    reading(0, 4),
    reading(5, 8),
    { t: "invalid", v: 7 },
    reading(10, NaN),
  ])!;
  assert.equal(stats.count, 2);
  assert.equal(stats.avg, 6);
  assert.equal(computeStats([]), null);
  assert.equal(stats.gmi, null);
});
test("GMI is withheld for a short or sparse window", () => {
  const full = Array.from({ length: 14 * 24 * 12 }, (_, i) =>
    reading(i * 5, 5),
  );
  assert.ok(computeStats(full)!.gmi !== null);
  assert.equal(computeStats(full.slice(0, -1))!.gmi, null);
  assert.equal(computeStats(full.filter((_, i) => i % 36 < 12))!.gmi, null);
});
test("one reading is usable and very large uploads avoid stack overflows", () => {
  assert.equal(computeStats([reading(0, 5)])!.count, 1);
  assert.equal(
    computeStats(Array.from({ length: 130000 }, (_, i) => reading(i * 5, 5)))!
      .min,
    5,
  );
});
test("hourly profile exposes sample and distinct-day counts with linear percentiles", () => {
  const rows = [
    { t: "2026-11-01T08:00:00", v: 4 },
    { t: "2026-11-02T08:00:00", v: 8 },
  ];
  const bins = buildAgp(rows);
  const bin = bins[8];
  assert.equal(bin.n, 2);
  assert.equal(bin.days, 2);
  assert.equal(bin.median, 6);
  assert.equal(bin.p25, 5);
  assert.equal(bin.p75, 7);
  assert.equal(bins[0].median, null);
});
test("daily trace grouping uses the same local calendar as display, including sparse days", () => {
  const rows = [
    { t: "2026-11-01T23:55:00", v: 5 },
    { t: "2026-11-02T00:05:00", v: 6 },
  ];
  assert.deepEqual(
    [...dailyReadings(rows).keys()],
    ["2026-11-01", "2026-11-02"],
  );
  assert.deepEqual(
    buildDailyTrace({
      uploadedAt: "",
      count: 2,
      unit: "mmol/L",
      readings: rows,
    }),
    [{ t: "00:05", v: 6 }],
  );
});
test("lab import retains zero, missing ranges, exact units and laboratory provenance", () => {
  const parsed = parseBloodworkCsv(
    "marker,value,unit,collected_at,reference_low,reference_high,lab\nA,0,mg/L,2026-11-01,0,1,Lab A\nB,9,mg/L,2026-11-01,,,Lab B",
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.observations[0].value, 0);
  assert.equal(parsed.observations[1].referenceLow, null);
  assert.equal(labStatus(parsed.observations[0]), "Within range");
  assert.equal(labStatus(parsed.observations[1]), "No range supplied");
  assert.equal(parsed.observations[1].lab, "Lab B");
});
test("invalid lab rows fail review instead of silently discarding observations", () => {
  for (const row of [
    "A,5,%,2026-02-30,0,10",
    "A,5x,%,2026-11-01,0,10",
    "A,5,%,2026-11-01,10,0",
    "A,5,,2026-11-01,0,10",
    "A,,%,2026-11-01,0,10",
  ])
    assert.equal(
      parseBloodworkCsv(
        "marker,value,unit,collected_at,reference_low,reference_high\n" + row,
      ).ok,
      false,
    );
});
test("lab series keep different units and laboratories separate", () => {
  const parsed = parseBloodworkCsv(
    "marker,value,unit,collected_at,lab\nA,5,mg/dL,2026-11-01,Lab A\nA,6,mg/dL,2026-11-02,Lab A\nA,7,mmol/L,2026-11-02,Lab A\nA,8,mg/dL,2026-11-02,Lab B",
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const groups = labSeries(parsed.observations);
  assert.equal(groups.length, 3);
  assert.equal(groups[0].history.length, 2);
  assert.equal(groups[0].latest.value, 6);
});
test("genome parser supports AncestryDNA allele columns and excludes no-calls", () => {
  const parsed = parseGenomeText(
    "# header\nrs1801133\t1\t11856378\tA\tG\nrs9939609 16 53820527 --\nrs4680 22 19951271 AA",
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.rows.length, 2);
  assert.equal(matchKnownSnps(parsed.rows)[0].genotype, "AG");
});
test("report never fills personal results with demo scores or fictional relatives", () => {
  const report = createReport(
    { cgm: null, genome: null, bloodwork: null },
    "2026-11-16T00:00:00Z",
  );
  assert.equal(report.cgm, null);
  assert.equal(report.genome, null);
  assert.equal(report.bloodwork, null);
  assert.ok(
    report.sections.every(
      (section) =>
        section.status.includes("illustrative") ||
        section.status === "local import workspace",
    ),
  );
  assert.ok(!JSON.stringify(report).includes("Morgan"));
});
test("laboratory CSV export round-trips observations and protects spreadsheet formulas", () => {
  const parsed = parseBloodworkCsv(BLOODWORK_TEMPLATE);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const stored = {
    uploadedAt: "2026-11-16T00:00:00Z",
    sourceFile: "test.csv",
    observations: parsed.observations,
  };
  const roundTrip = parseBloodworkCsv(toCsv(labCsvRows(stored)));
  assert.equal(roundTrip.ok, true);
  if (roundTrip.ok)
    assert.deepEqual(
      roundTrip.observations.map((row) => [
        row.marker,
        row.value,
        row.unit,
        row.collectedAt,
      ]),
      parsed.observations.map((row) => [
        row.marker,
        row.value,
        row.unit,
        row.collectedAt,
      ]),
    );
  assert.equal(toCsv([["=HYPERLINK(1)", -5]]), '"\'=HYPERLINK(1)","-5"');
});
test("all 18 sections have resolvable public references and explicit current/next boundaries", () => {
  assert.equal(SECTION_GUIDES.length, 18);
  assert.equal(new Set(SECTION_GUIDES.map((s) => s.path)).size, 18);
  for (const section of SECTION_GUIDES) {
    assert.equal(section.pipeline.length, 3);
    assert.ok(section.current && section.next && section.output);
    assert.ok(section.sources.length);
    for (const id of section.sources)
      assert.ok(RESEARCH_SOURCES.some((source) => source.id === id));
  }
});

test("Excel import parses date cells locally without a runtime CDN script", async () => {
  const XLSX = await import("xlsx");
  const { parseCgmXlsx } = await import("../src/lib/cgm");
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(
    [
      ["timestamp", "glucose_mmol_l"],
      [new Date(2026, 10, 15, 8, 0, 0), 5.2],
      [new Date(2026, 10, 15, 8, 5, 0), 5.4],
    ],
    { cellDates: true, dateNF: "yyyy-mm-dd hh:mm:ss" },
  );
  XLSX.utils.book_append_sheet(workbook, sheet, "Readings");
  const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const result = await parseCgmXlsx(new File([bytes], "synthetic-cgm.xlsx"));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.readings.length, 2);
    assert.equal(result.readings[0].v, 5.2);
  }
});

test("one-sided lab intervals classify only against the supplied bound", () => {
  const parsed = parseBloodworkCsv(
    "marker,value,unit,collected_at,reference_low,reference_high\nA,12,mg/L,2026-11-01,,10\nB,2,mg/L,2026-11-01,3,",
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(labStatus(parsed.observations[0]), "Above range");
  assert.equal(labStatus(parsed.observations[1]), "Below range");
});

test("a new data source produces a fresh report rather than cached demo statistics", () => {
  const dataset = (value: number) => ({
    uploadedAt: "2026-11-16T00:00:00Z",
    sourceFile: "synthetic.csv",
    count: 2,
    unit: "mmol/L" as const,
    readings: [reading(0, value), reading(5, value)],
  });
  assert.equal(
    createReport({ cgm: dataset(5), genome: null, bloodwork: null }).cgm
      ?.summary?.avg,
    5,
  );
  assert.equal(
    createReport({ cgm: dataset(8), genome: null, bloodwork: null }).cgm
      ?.summary?.avg,
    8,
  );
});
