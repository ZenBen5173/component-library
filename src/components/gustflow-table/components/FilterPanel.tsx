"use client";

import type { ColumnDef, ActiveFilter } from "../types";
import { COLUMN_TYPE_REGISTRY } from "../columnTypes";

interface FilterPanelProps {
  column: ColumnDef;
  filters: ActiveFilter[];
  onSetFilter: (key: string, value: string | string[]) => void;
  onClearFilter: (key: string) => void;
}

export function FilterPanel({ column, filters, onSetFilter, onClearFilter }: FilterPanelProps) {
  const active = filters.find((f) => f.key === column.key);
  const currentValue = active?.value ?? "";
  const typeDef = COLUMN_TYPE_REGISTRY[column.type];

  switch (typeDef.filterType) {
    case "select": {
      const opts = column.options ?? [];
      if (opts.length === 0) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `DataTable: column "${column.key}" has filterType "select" but no options provided. Pass options to the column definition.`
          );
        }
        // Fall back to text filter when no options
        return (
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Filter</p>
            <input
              type="text"
              value={typeof currentValue === "string" ? currentValue : ""}
              onChange={(e) => {
                if (e.target.value) onSetFilter(column.key, e.target.value);
                else onClearFilter(column.key);
              }}
              placeholder="Contains..."
              className="w-full h-7 px-2 text-xs border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        );
      }
      const selected = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : [];
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Filter{selected.length > 0 && ` (${selected.length})`}
            </p>
            {selected.length > 0 && (
              <button
                onClick={() => onClearFilter(column.key)}
                className="text-[10px] text-primary hover:text-primary-hover font-medium"
              >
                Clear
              </button>
            )}
          </div>
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            {opts.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <label key={opt.value} className="flex items-center gap-2 px-1 py-0.5 text-xs cursor-pointer hover:bg-[var(--card)] rounded">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      const next = isSelected ? selected.filter((v) => v !== opt.value) : [...selected, opt.value];
                      if (next.length === 0) onClearFilter(column.key);
                      else onSetFilter(column.key, next);
                    }}
                    className="h-3.5 w-3.5 rounded border-[var(--border)]"
                  />
                  <span className="text-[var(--foreground)]">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    case "toggle":
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">Filter</p>
          <div className="flex gap-2">
            <button
              onClick={() => onSetFilter(column.key, "true")}
              className={`px-2 py-1 text-xs rounded border ${currentValue === "true" ? "border-primary text-primary bg-primary/10" : "border-[var(--border)] text-[var(--muted-foreground)]"}`}
            >Checked</button>
            <button
              onClick={() => onSetFilter(column.key, "false")}
              className={`px-2 py-1 text-xs rounded border ${currentValue === "false" ? "border-primary text-primary bg-primary/10" : "border-[var(--border)] text-[var(--muted-foreground)]"}`}
            >Unchecked</button>
            {active && (
              <button onClick={() => onClearFilter(column.key)} className="px-2 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Clear</button>
            )}
          </div>
        </div>
      );

    case "date-range": {
      const rangeValue = Array.isArray(currentValue) ? currentValue : [];
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">Filter</p>
          <div className="space-y-1">
            <input
              type="date"
              value={rangeValue[0] ?? ""}
              onChange={(e) => {
                const from = e.target.value;
                const to = rangeValue[1] ?? "";
                if (!from && !to) onClearFilter(column.key);
                else onSetFilter(column.key, [from, to]);
              }}
              className="w-full h-7 px-2 text-xs border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <input
              type="date"
              value={rangeValue[1] ?? ""}
              onChange={(e) => {
                const from = rangeValue[0] ?? "";
                const to = e.target.value;
                if (!from && !to) onClearFilter(column.key);
                else onSetFilter(column.key, [from, to]);
              }}
              className="w-full h-7 px-2 text-xs border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {active && (
              <button onClick={() => onClearFilter(column.key)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Clear</button>
            )}
          </div>
        </div>
      );
    }

    case "none":
      return null;

    case "text":
    default:
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">Filter</p>
          <input
            type="text"
            value={typeof currentValue === "string" ? currentValue : ""}
            onChange={(e) => {
              if (e.target.value) onSetFilter(column.key, e.target.value);
              else onClearFilter(column.key);
            }}
            placeholder="Contains..."
            className="w-full h-7 px-2 text-xs border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      );
  }
}
