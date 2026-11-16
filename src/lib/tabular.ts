// Small, local CSV/TSV reader: quoted delimiters, escaped quotes and CRLF.
export function parseTable(text: string): string[][] {
  const sample =
    text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .find((line) => /[,;\t]/.test(line)) || "";
  const delimiter = [",", ";", "\t"].sort(
    (a, b) => sample.split(b).length - sample.split(a).length,
  )[0];
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && (c === delimiter || c === "\n" || c === "\r")) {
      row.push(field.trim());
      field = "";
      if (c !== delimiter) {
        if (row.some(Boolean)) rows.push(row);
        row = [];
        if (c === "\r" && input[i + 1] === "\n") i++;
      }
    } else field += c;
  }
  if (quoted) throw new Error("Unclosed quote in file. Check the CSV export.");
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export const headerKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");
export function finiteNumber(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const n = Number(value.replace(/^(\d+),(\d+)$/, "$1.$2"));
  return Number.isFinite(n) ? n : null;
}

// Reject ambiguous calendar dates rather than silently swapping day and month.
// Offsets are retained as instants; offset-free values use the device time zone.
export function parseTimestamp(value: string): Date | null {
  const match = value?.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/,
  );
  if (!match) return null;
  const [, y, m, d, h = "00", min = "00", sec = "00"] = match;
  const calendar = new Date(Date.UTC(+y, +m - 1, +d));
  if (
    calendar.getUTCFullYear() !== +y ||
    calendar.getUTCMonth() !== +m - 1 ||
    calendar.getUTCDate() !== +d ||
    +h > 23 ||
    +min > 59 ||
    +sec > 59
  )
    return null;
  const date = new Date(value.replace(" ", "T"));
  return Number.isFinite(date.getTime()) ? date : null;
}

export function localDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function toCsv(rows: unknown[][]): string {
  return rows
    .map((row) =>
      row
        .map((value) => {
          let cell = String(value ?? "");
          // Protect spreadsheet consumers from formula injection.
          if (typeof value === "string" && /^[=+@\-\t\r]/.test(cell))
            cell = "'" + cell;
          return '"' + cell.replace(/"/g, '""') + '"';
        })
        .join(","),
    )
    .join("\r\n");
}
