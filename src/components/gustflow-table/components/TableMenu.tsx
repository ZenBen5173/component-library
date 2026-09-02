"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Download, MoreHorizontal, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The table's own menu, behind the three dots.
 *
 * Everything that configures the table rather than the data it is showing —
 * how many rows to a page, and getting the rows out. A row of single-purpose
 * icons across the toolbar makes each of them a guessing game; one dot menu
 * says what each thing is in words.
 */

/** Sensible page lengths. Twenty-five is the default the table shipped with. */
export const PAGE_SIZES = [10, 25, 50, 100];

export function TableMenu({
  pageSize,
  onPageSizeChange,
  onExportCsv,
}: {
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  onExportCsv?: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: Math.max(8, rect.right - 216) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!onPageSizeChange && !onExportCsv) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Table options"
        className={cn(
          "rounded-md p-2 transition-colors",
          open
            ? "bg-[var(--card)] text-[var(--foreground)]"
            : "text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)]",
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: pos.top, left: pos.left, zIndex: 9999 }}
            className="fixed w-[216px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-card-lg"
          >
            {onPageSizeChange && (
              <div className="p-1">
                <p className="flex items-center gap-2 px-2 py-1.5 text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">
                  <Rows3 className="size-3.5" />
                  Rows per page
                </p>
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      onPageSizeChange(size);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--card)]"
                  >
                    <span className="min-w-0 flex-1 tabular-nums">{size}</span>
                    {size === pageSize && <Check className="size-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {onExportCsv && (
              <div className={cn("p-1", onPageSizeChange && "border-t border-[var(--border)]")}>
                <button
                  type="button"
                  onClick={() => {
                    onExportCsv();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--card)]"
                >
                  <Download className="size-4 shrink-0 text-[var(--muted-foreground)]" />
                  Download as CSV
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
