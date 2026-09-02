"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import type { ColumnAggregate, ColumnDef } from "../types";
import { cn } from "@/lib/utils";

/**
 * One cell of the calculation row.
 *
 * Only numeric columns get one. Summing a status or averaging an email is not
 * a calculation anyone wants, and offering it fills the row with options that
 * return nothing — so a non-numeric column simply shows an empty cell.
 *
 * Count is the exception in principle, since counting rows works for any
 * column, but it says the same thing in every column and the table already
 * prints "1000 results" above itself.
 */

const CALCULATIONS: { value: ColumnAggregate; label: string; symbol: string }[] = [
  { value: "sum", label: "Sum", symbol: "Σ" },
  { value: "avg", label: "Average", symbol: "x̄" },
  { value: "min", label: "Minimum", symbol: "min" },
  { value: "max", label: "Maximum", symbol: "max" },
  { value: "count", label: "Count", symbol: "#" },
];

export function FooterCell({
  column,
  aggregate,
  value,
  onChange,
}: {
  column: ColumnDef;
  aggregate: ColumnAggregate | undefined;
  value: string | null;
  onChange: (next: ColumnAggregate | undefined) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    // Above the cell: the calculation row is at the bottom of the table, so a
    // menu dropped below it would open off the end of the page.
    setPos({ top: rect.top - 8, left: Math.max(8, rect.left) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (column.type !== "number") return null;

  const current = CALCULATIONS.find((c) => c.value === aggregate);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "-mx-1 flex w-[calc(100%+0.5rem)] items-center justify-end gap-1.5 rounded px-1 py-0.5 transition-colors",
          open ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]",
        )}
      >
        {current && value != null ? (
          <>
            <span className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
              {current.symbol}
            </span>
            <span className="tabular-nums">{value}</span>
          </>
        ) : (
          // Faint until you point at it: an empty row of the word
          // "Calculate" repeated under every column is louder than the data.
          <span className="text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover/footer:opacity-100">
            Calculate
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: pos.top, left: pos.left, zIndex: 9999, transform: "translateY(-100%)" }}
            className="fixed w-[168px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-1 shadow-card-lg"
          >
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--card)]"
            >
              <span className="min-w-0 flex-1">None</span>
              {!aggregate && <Check className="size-3.5 shrink-0" />}
            </button>
            <div className="my-1 h-px bg-[var(--border)]" />
            {CALCULATIONS.map((calc) => (
              <button
                key={calc.value}
                type="button"
                onClick={() => {
                  onChange(calc.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--card)]"
              >
                <span className="w-6 shrink-0 text-[11px] text-[var(--muted-foreground)]">
                  {calc.symbol}
                </span>
                <span className="min-w-0 flex-1">{calc.label}</span>
                {aggregate === calc.value && <Check className="size-3.5 shrink-0" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
