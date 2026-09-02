"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDownUp,
  ChevronDown,
  Filter as FilterIcon,
  GripVertical,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  operatorsFor,
  VALUELESS_OPERATORS,
  type ColumnDef,
  type FilterConjunction,
  type FilterOperator,
  type FilterRule,
  type SortDir,
} from "../types";
import { columnIconName } from "./PropertyMenu";
import { AnimatedLucide } from "@/components/ui/animated-lucide";
import { cn } from "@/lib/utils";

/**
 * The sort and filter bar, built the way Notion builds it.
 *
 * Sorting and filtering used to live only behind each column's own menu,
 * which hides the answer to the question people actually ask of a table:
 * what is being applied to it right now? Here the state is the interface —
 * a chip per feature saying what is on, and the rules themselves in a popover
 * you can edit in place.
 */

const CHIP =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors";

/** Shared shell: a chip that opens a panel under itself. */
function Popover({
  chip,
  chipActive,
  children,
  width = 420,
  openOnMount,
  openSignal,
}: {
  chip: React.ReactNode;
  chipActive?: boolean;
  children: (close: () => void) => React.ReactNode;
  width?: number;
  /** Opens as soon as it exists — how the toolbar icons reach it, since the
   *  chip they anchor to does not exist until the first rule does. */
  openOnMount?: boolean;
  /** Changes each time the toolbar asks again, so a second click reopens. */
  openSignal?: number;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(Boolean(openOnMount));
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Reading the flag only at mount meant the toolbar icon worked once — the
  // first time, when the chip was created — and did nothing ever after,
  // because the chip was already mounted and the flag never re-read.
  useEffect(() => {
    if (openOnMount) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSignal]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 16)),
    });
  }, [open, width]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      // Anything portalled (a select's own popup) counts as inside.
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
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

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          CHIP,
          chipActive
            ? "bg-primary/15 text-primary"
            : "text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)]",
        )}
      >
        {chip}
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: pos.top, left: pos.left, width, zIndex: 9999 }}
            className="fixed overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-card-lg"
          >
            {children(() => setOpen(false))}
          </div>,
          document.body,
        )}
    </>
  );
}

/** A compact native select, styled to sit inside a rule row. */
function Select({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--card)] py-0 pl-2 pr-6 text-xs text-[var(--foreground)] outline-none transition-colors hover:border-[var(--foreground)]/25"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-[var(--muted-foreground)]" />
    </div>
  );
}

const ROW_ACTION =
  "grid size-7 shrink-0 place-items-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)]";

const ADD_ROW =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)]";

// --- Sort -----------------------------------------------------------------

export function SortBar({
  columns,
  sort,
  setSort,
  openOnMount,
  openSignal,
}: {
  columns: ColumnDef[];
  sort: { key: string; dir: SortDir }[];
  setSort: (s: { key: string; dir: SortDir }[]) => void;
  openOnMount?: boolean;
  openSignal?: number;
}) {
  const sortable = columns.filter((c) => c.sortable !== false && c.type !== "actions");
  const first = sort[0] ? columns.find((c) => c.key === sort[0]!.key) : undefined;

  // No chip until there is something to say. Nothing applied means no bar
  // at all, which is the point of the bar.
  if (sortable.length === 0 || sort.length === 0) return null;

  const label = sort.length === 1 ? (first?.label ?? sort[0]!.key) : `${sort.length} sorts`;

  return (
    <Popover
      width={360}
      openOnMount={openOnMount}
      openSignal={openSignal}
      chipActive
      chip={
        <>
          <ArrowDownUp className="size-3.5" />
          {label}
          <ChevronDown className="size-3" />
        </>
      }
    >
      {(close) => (
        <>
          {sort.map((entry, i) => (
            <div key={`${entry.key}-${i}`} className="flex items-center gap-1.5 px-0.5 py-1">
              {/* Order is priority: the first sort wins, the next breaks its
                  ties. The handle is here to say so, and to change it. */}
              <button
                type="button"
                title="Drag to reprioritise"
                onClick={() => {
                  if (i === 0) return;
                  const next = [...sort];
                  [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
                  setSort(next);
                }}
                className={cn(ROW_ACTION, "cursor-grab")}
              >
                <GripVertical className="size-3.5" />
              </button>

              <Select
                value={entry.key}
                onChange={(key) =>
                  setSort(sort.map((s, j) => (j === i ? { ...s, key } : s)))
                }
                className="flex-1"
              >
                {sortable.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </Select>

              <Select
                value={entry.dir}
                onChange={(dir) =>
                  setSort(sort.map((s, j) => (j === i ? { ...s, dir: dir as SortDir } : s)))
                }
                className="w-[136px]"
              >
                <option value="asc">Sort ascending</option>
                <option value="desc">Sort descending</option>
              </Select>

              <button
                type="button"
                title="Remove"
                onClick={() => setSort(sort.filter((_, j) => j !== i))}
                className={ROW_ACTION}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            className={ADD_ROW}
            onClick={() => {
              const used = new Set(sort.map((s) => s.key));
              const next = sortable.find((c) => !used.has(c.key)) ?? sortable[0];
              if (next) setSort([...sort, { key: next.key, dir: "asc" }]);
            }}
          >
            <Plus className="size-3.5" />
            Add sort
          </button>

          {sort.length > 0 && (
            <>
              <div className="my-1 h-px bg-[var(--border)]" />
              <button
                type="button"
                className={ADD_ROW}
                onClick={() => {
                  setSort([]);
                  close();
                }}
              >
                <Trash2 className="size-3.5" />
                Delete sort
              </button>
            </>
          )}
        </>
      )}
    </Popover>
  );
}

// --- Filter ---------------------------------------------------------------

let ruleSeq = 0;
/** Ids only need to be unique within one table, and never leave the browser. */
const nextRuleId = () => `r${(ruleSeq += 1)}`;

export function FilterBar({
  columns,
  rules,
  setRules,
  conjunction,
  setConjunction,
  openOnMount,
  openSignal,
}: {
  columns: ColumnDef[];
  rules: FilterRule[];
  setRules: (r: FilterRule[]) => void;
  conjunction: FilterConjunction;
  setConjunction: (c: FilterConjunction) => void;
  openOnMount?: boolean;
  openSignal?: number;
}) {
  const filterable = columns.filter((c) => c.filterable !== false && c.type !== "actions");
  if (filterable.length === 0 || rules.length === 0) return null;

  function ruleFor(column: ColumnDef): FilterRule {
    return {
      id: nextRuleId(),
      key: column.key,
      op: operatorsFor(column.type)[0]!.value,
      value: "",
    };
  }

  function update(id: string, patch: Partial<FilterRule>) {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <Popover
      openOnMount={openOnMount}
      openSignal={openSignal}
      chipActive
      chip={
        <>
          <FilterIcon className="size-3.5" />
          {`${rules.length} rule${rules.length === 1 ? "" : "s"}`}
          <ChevronDown className="size-3" />
        </>
      }
    >
      {(close) => (
        <>
          {rules.map((rule, i) => {
            const column = filterable.find((c) => c.key === rule.key) ?? filterable[0]!;
            const operators = operatorsFor(column.type);
            const needsValue = !VALUELESS_OPERATORS.includes(rule.op);
            return (
              <div key={rule.id} className="flex items-center gap-1.5 px-0.5 py-1">
                {/* The joining word appears once, on the second row, and
                    changing it changes the whole set — which is what Notion's
                    simple mode does and what people mean by "and". */}
                {i === 0 ? (
                  <span className="w-[68px] shrink-0 pl-1 text-xs text-[var(--muted-foreground)]">
                    Where
                  </span>
                ) : i === 1 ? (
                  <Select
                    value={conjunction}
                    onChange={(v) => setConjunction(v as FilterConjunction)}
                    className="w-[68px] shrink-0"
                  >
                    <option value="and">And</option>
                    <option value="or">Or</option>
                  </Select>
                ) : (
                  <span className="w-[68px] shrink-0 pl-2 text-xs capitalize text-[var(--muted-foreground)]">
                    {conjunction}
                  </span>
                )}

                <Select
                  value={rule.key}
                  onChange={(key) => {
                    const next = filterable.find((c) => c.key === key)!;
                    // The old operator may not exist for the new column, so
                    // the rule falls back to that column's first one.
                    const ops = operatorsFor(next.type);
                    const keep = ops.some((o) => o.value === rule.op) ? rule.op : ops[0]!.value;
                    update(rule.id, { key, op: keep, value: "" });
                  }}
                  className="w-[112px] shrink-0"
                >
                  {filterable.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </Select>

                <Select
                  value={rule.op}
                  onChange={(op) => update(rule.id, { op: op as FilterOperator })}
                  className="w-[104px] shrink-0"
                >
                  {operators.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>

                {needsValue ? (
                  <ValueField
                    column={column}
                    value={typeof rule.value === "string" ? rule.value : ""}
                    onChange={(v) => update(rule.id, { value: v })}
                  />
                ) : (
                  <span className="min-w-0 flex-1" />
                )}

                <button
                  type="button"
                  title="Remove rule"
                  onClick={() => setRules(rules.filter((r) => r.id !== rule.id))}
                  className={ROW_ACTION}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            className={ADD_ROW}
            onClick={() => setRules([...rules, ruleFor(filterable[0]!)])}
          >
            <Plus className="size-3.5" />
            Add filter rule
          </button>

          {rules.length > 0 && (
            <>
              <div className="my-1 h-px bg-[var(--border)]" />
              <button
                type="button"
                className={ADD_ROW}
                onClick={() => {
                  setRules([]);
                  close();
                }}
              >
                <Trash2 className="size-3.5" />
                Delete filter
              </button>
            </>
          )}
        </>
      )}
    </Popover>
  );
}

/** The value side of a rule: a list where the column has one, else a box. */
function ValueField({
  column,
  value,
  onChange,
}: {
  column: ColumnDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = column.options;
  const isDate =
    column.type === "date" ||
    column.type === "created_time" ||
    column.type === "last_edited_time";

  if (options && options.length > 0) {
    return (
      <Select value={value} onChange={onChange} className="min-w-0 flex-1">
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    );
  }

  return (
    <input
      type={isDate ? "date" : column.type === "number" ? "number" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value"
      className="h-7 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] hover:border-[var(--foreground)]/25 focus:border-primary"
    />
  );
}

/**
 * The chip row under the toolbar.
 *
 * Absent entirely when nothing is applied — an empty bar of buttons saying
 * "Sort" and "Filter" is a row of furniture describing a table that has
 * neither. Once something is on, it says what, and offers to add a filter
 * beside it; the toolbar's own icons are how you start from nothing.
 */
export function ViewBar({
  columns,
  sort,
  setSort,
  rules,
  setRules,
  conjunction,
  setConjunction,
  groupByColumn,
  clearGroupBy,
  /** Bumped by the toolbar icons to open a panel that has just appeared. */
  openPanel,
}: {
  columns: ColumnDef[];
  sort: { key: string; dir: SortDir }[];
  setSort: (s: { key: string; dir: SortDir }[]) => void;
  rules: FilterRule[];
  setRules: (r: FilterRule[]) => void;
  conjunction: FilterConjunction;
  setConjunction: (c: FilterConjunction) => void;
  groupByColumn?: ColumnDef | null;
  clearGroupBy?: () => void;
  openPanel?: { panel: "sort" | "filter"; n: number } | null;
}) {
  const filterable = columns.filter((c) => c.filterable !== false && c.type !== "actions");
  const showBar = sort.length > 0 || rules.length > 0 || !!groupByColumn;
  if (!showBar) return null;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <SortBar
        columns={columns}
        sort={sort}
        setSort={setSort}
        openOnMount={openPanel?.panel === "sort"}
        openSignal={openPanel?.n}
      />
      <FilterBar
        columns={columns}
        rules={rules}
        setRules={setRules}
        conjunction={conjunction}
        setConjunction={setConjunction}
        openOnMount={openPanel?.panel === "filter"}
        openSignal={openPanel?.n}
      />

      {groupByColumn && clearGroupBy && (
        <button
          type="button"
          onClick={clearGroupBy}
          title="Stop grouping"
          className={cn(CHIP, "bg-primary/15 text-primary")}
        >
          <AnimatedLucide name={columnIconName(groupByColumn) as never} size={14} />
          Grouped by {groupByColumn.label}
          <X className="size-3" />
        </button>
      )}

      {/* Plain text, not a chip: it is an invitation rather than a state. */}
      {filterable.length > 0 && (
        <button
          type="button"
          onClick={() => {
            const column = filterable[0]!;
            setRules([
              ...rules,
              {
                id: nextRuleId(),
                key: column.key,
                op: operatorsFor(column.type)[0]!.value,
                value: "",
              },
            ]);
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)]"
        >
          <Plus className="size-3.5" />
          Filter
        </button>
      )}
    </div>
  );
}
