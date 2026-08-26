/**
 * Section J3 — CSV export from a DataTable's processed rows.
 *
 * Pure helper. Takes the post-filter rows + the visible columns, returns
 * a CSV string. Uses RFC 4180 escaping (double-quoted fields, doubled-up
 * quotes inside, CRLF line endings). Triggers a browser download via
 * Blob + anchor click.
 */

import type { ColumnDef } from "./types";

/** Coerce any cell value to a CSV-safe string. */
function csvCell(value: unknown): string {
  if (value == null) return "";
  // Date / Date-like ISO string → leave as-is. Arrays → comma-join.
  // Objects with `name` / `label` (e.g. relation values) → use that.
  if (Array.isArray(value)) {
    return value.map((v) => csvCell(v)).join("; ");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name;
    if (typeof obj.label === "string") return obj.label;
    if (typeof obj.title === "string") return obj.title;
    return JSON.stringify(value);
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

/** RFC 4180 escape: wrap in quotes, double up internal quotes. */
function escapeCsv(s: string): string {
  if (s == null) return "";
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Build the CSV string for the given rows + column list.
 * Header row uses `column.label`; cell values come from `row[column.key]`.
 */
export function buildCsv(rows: Record<string, unknown>[], columns: ColumnDef[]): string {
  const header = columns.map((c) => escapeCsv(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCsv(csvCell(row[c.key]))).join(","))
    .join("\r\n");
  return `${header}\r\n${body}`;
}

/**
 * Trigger a browser download of the given rows as a CSV file. Filename
 * defaults to `<tableName>-<YYYY-MM-DD>.csv`.
 */
export function downloadCsv(
  rows: Record<string, unknown>[],
  columns: ColumnDef[],
  tableName: string = "export"
): void {
  const csv = buildCsv(rows, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${tableName}-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a tick — some browsers need the URL alive briefly.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
