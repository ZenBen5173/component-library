"use client";

import { useRef, useEffect, useState, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, EyeOff } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { ColumnDef, SortDir, ActiveFilter } from "../types";
import { COLUMN_TYPE_REGISTRY } from "../columnTypes";
import { FilterPanel } from "./FilterPanel";

// --- Sort icon ---

function SortIcon({ column, sort }: { column: ColumnDef; sort: Array<{ key: string; dir: SortDir }> }) {
  const idx = sort.findIndex((s) => s.key === column.key);
  if (idx === -1) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
  // idx !== -1 guard above ensures sort[idx] is defined
  const entry = sort[idx]!;
  // J1: show 1↑ / 2↓ etc when chained (length > 1) so the position is visible.
  return (
    <span className="inline-flex items-center gap-0.5">
      {sort.length > 1 && <span className="text-[9px] font-semibold opacity-70">{idx + 1}</span>}
      {entry.dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
    </span>
  );
}

// --- Column config panel ---

interface ColumnConfigPanelProps {
  column: ColumnDef;
  sort: Array<{ key: string; dir: SortDir }>;
  toggleSort: (key: string, opts?: { shiftKey?: boolean }) => void;
  filters: ActiveFilter[];
  setFilter: (key: string, value: string | string[]) => void;
  clearFilter: (key: string) => void;
  isWrapped: boolean;
  toggleWrap: (key: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  /** Sprint 5.5 — group-by support. */
  isGroupedBy: boolean;
  setGroupBy: (key: string | null) => void;
}

function ColumnConfigPanel({
  column,
  sort,
  toggleSort,
  filters,
  setFilter,
  clearFilter,
  isWrapped,
  toggleWrap,
  onClose,
  anchorRef,
  isGroupedBy,
  setGroupBy,
}: ColumnConfigPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    let left = rect.left;
    if (left + 220 > window.innerWidth - 16) left = window.innerWidth - 236;
    left = Math.max(8, left);
    setPos({ top: rect.bottom + 4, left });
  }, [anchorRef]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, [onClose, anchorRef]);

  const isSortable = column.sortable !== false && column.type !== "actions";
  const isFilterable = column.filterable !== false && column.type !== "actions";
  const isWrappable = column.type !== "actions";

  return createPortal(
    <div ref={ref} className="fixed w-[220px] bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-card-lg p-2 space-y-2" style={{ top: pos.top, left: pos.left, zIndex: 9999 }}>
      {/* Sort — J1 multi-column. */}
      {isSortable && (() => {
        const entry = sort.find((s) => s.key === column.key);
        const idx = sort.findIndex((s) => s.key === column.key);
        return (
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Sort {sort.length > 1 ? <span className="opacity-70">(chain of {sort.length})</span> : null}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  // Move this column to ASC. If absent, append. If present desc, flip via shift.
                  if (!entry) toggleSort(column.key);
                  else if (entry.dir === "desc") toggleSort(column.key, { shiftKey: true });
                  onClose();
                }}
                className={cn("flex-1 px-2 py-1 text-xs rounded border transition-colors",
                  entry?.dir === "asc" ? "border-primary text-primary bg-primary/10" : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
              >A → Z</button>
              <button
                onClick={() => {
                  if (!entry) { toggleSort(column.key); toggleSort(column.key, { shiftKey: true }); }
                  else if (entry.dir === "asc") toggleSort(column.key, { shiftKey: true });
                  onClose();
                }}
                className={cn("flex-1 px-2 py-1 text-xs rounded border transition-colors",
                  entry?.dir === "desc" ? "border-primary text-primary bg-primary/10" : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
              >Z → A</button>
              {entry && (
                <button
                  onClick={() => { toggleSort(column.key); onClose(); }}
                  className="px-2 py-1 text-xs rounded border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  title="Remove from sort chain"
                >×</button>
              )}
            </div>
            {entry && sort.length > 1 && (
              <p className="text-[10px] text-[var(--muted-foreground)]">Position #{idx + 1} in sort chain</p>
            )}
          </div>
        );
      })()}

      {/* Filter */}
      {isFilterable && (
        <FilterPanel column={column} filters={filters} onSetFilter={setFilter} onClearFilter={clearFilter} />
      )}

      {/* Wrap */}
      {isWrappable && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">Wrap text</p>
          <button
            onClick={() => toggleWrap(column.key)}
            className={cn("px-2 py-1 text-xs rounded border transition-colors",
              isWrapped ? "border-primary text-primary bg-primary/10" : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
          >
            {isWrapped ? "On" : "Off"}
          </button>
        </div>
      )}

      {/* Sprint 5.5 — group-by */}
      {column.type !== "actions" && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">Group by</p>
          <button
            onClick={() => { setGroupBy(isGroupedBy ? null : column.key); onClose(); }}
            className={cn(
              "w-full px-2 py-1 text-xs rounded border transition-colors text-left",
              isGroupedBy
                ? "border-primary text-primary bg-primary/10"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {isGroupedBy ? "Stop grouping by this column" : "Group rows by this column"}
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}

// --- Column visibility menu ---

export interface ColumnVisibilityMenuProps {
  columns: ColumnDef[];
  hiddenColumns: Set<string>;
  toggleColumn: (key: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function ColumnVisibilityMenu({ columns, hiddenColumns, toggleColumn, onClose, anchorRef }: ColumnVisibilityMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const hideableColumns = columns.filter((c) => c.type !== "actions");

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    let left = rect.right - 200;
    if (left < 8) left = 8;
    setPos({ top: rect.bottom + 4, left });
  }, [anchorRef]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, [onClose, anchorRef]);

  const visible = hideableColumns.filter((c) => !hiddenColumns.has(c.key));
  const hidden = hideableColumns.filter((c) => hiddenColumns.has(c.key));

  return createPortal(
    <div ref={ref} className="fixed w-[200px] bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-card-lg max-h-64 overflow-y-auto" style={{ top: pos.top, left: pos.left, zIndex: 9999 }}>
      {visible.length > 0 && (
        <div className="p-1">
          <p className="px-2 py-1 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Shown</p>
          {visible.map((c) => (
            <button key={c.key} onClick={() => toggleColumn(c.key)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--card)] rounded transition-colors">
              <Eye className="h-3.5 w-3.5 text-primary shrink-0" />
              {c.label}
            </button>
          ))}
        </div>
      )}
      {hidden.length > 0 && (
        <div className={cn("p-1", visible.length > 0 && "border-t border-[var(--border)]")}>
          <p className="px-2 py-1 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Hidden</p>
          {hidden.map((c) => (
            <button key={c.key} onClick={() => toggleColumn(c.key)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded transition-colors">
              <EyeOff className="h-3.5 w-3.5 shrink-0" />
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

// --- Main header row ---

interface ColumnHeaderRowProps {
  columns: ColumnDef[];
  allColumns: ColumnDef[];
  sort: Array<{ key: string; dir: SortDir }>;
  toggleSort: (key: string, opts?: { shiftKey?: boolean }) => void;
  filters: ActiveFilter[];
  setFilter: (key: string, value: string | string[]) => void;
  clearFilter: (key: string) => void;
  columnConfigOpen: string | null;
  openColumnConfig: (key: string) => void;
  closeColumnConfig: () => void;
  hiddenColumns: Set<string>;
  toggleColumn: (key: string) => void;
  wrapColumns: Set<string>;
  toggleWrap: (key: string) => void;
  columnWidths: Record<string, number>;
  setColumnWidth: (key: string, width: number) => void;
  /** Sprint 4.3 — drag-reorder via dnd-kit. Pass through from useDataTable. */
  setColumnOrder: (order: string[]) => void;
  columnOrder: string[];
  /** Sprint 4.3 — sticky-pin the first non-actions column to the left edge. */
  frozenFirstColumn?: boolean;
  /** Body container ref so double-click "fit-to-content" can measure cells. */
  bodyRef?: React.RefObject<HTMLElement | null>;
  /** Sprint 5.5 — group-by state + setter. */
  groupBy: string | null;
  setGroupBy: (key: string | null) => void;
  /** Section J7 polish — checkbox header rendered as the first column
   *  when bulk-actions are enabled. Sets/unsets selection for all rows
   *  on the current page. */
  selectionHeader?: React.ReactNode;
}

interface SortableColumnHeaderProps {
  col: ColumnDef;
  width: number;
  isSortable: boolean;
  filters: ActiveFilter[];
  filterCount: number;
  hasFilter: boolean;
  sort: Array<{ key: string; dir: SortDir }>;
  toggleSort: (key: string, opts?: { shiftKey?: boolean }) => void;
  setFilter: (key: string, value: string | string[]) => void;
  clearFilter: (key: string) => void;
  columnConfigOpen: string | null;
  openColumnConfig: (key: string) => void;
  closeColumnConfig: () => void;
  wrapColumns: Set<string>;
  toggleWrap: (key: string) => void;
  setColumnWidth: (key: string, width: number) => void;
  reorderable: boolean;
  bodyRef?: React.RefObject<HTMLElement | null>;
  /** Sprint 4.3 — when true, this header sticks left and gets a darker background. */
  frozen?: boolean;
  /** Sprint 5.5 — group-by support. */
  isGroupedBy: boolean;
  setGroupBy: (key: string | null) => void;
}

function SortableColumnHeader({
  col,
  width,
  isSortable,
  filters,
  filterCount,
  hasFilter,
  sort,
  toggleSort,
  setFilter,
  clearFilter,
  columnConfigOpen,
  openColumnConfig,
  closeColumnConfig,
  wrapColumns,
  toggleWrap,
  setColumnWidth,
  reorderable,
  bodyRef,
  frozen,
  isGroupedBy,
  setGroupBy,
}: SortableColumnHeaderProps) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  // Drag-reorder hook. Disabled for non-reorderable columns (actions).
  const sortable = useSortable({ id: col.key, disabled: !reorderable });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style: React.CSSProperties = {
    width,
    minWidth: 80,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(frozen
      ? {
          position: "sticky",
          left: 0,
          zIndex: 11,
          background: "color-mix(in oklab, var(--muted) 60%, var(--background))",
        }
      : {}),
  };

  /**
   * Sprint 4.3 — fit-to-content. Measure every body cell with this
   * column's data attribute and pick the widest. Add ~24px padding so
   * the result doesn't clip the cell's own padding.
   */
  function fitToContent() {
    const root = bodyRef?.current ?? document.body;
    // Use the global DOM CSS.escape (NOT the dnd-kit CSS util we
    // imported as `CSS` for transform helpers) to escape arbitrary
    // column keys for the attribute selector.
    const safeKey = typeof window !== "undefined" && window.CSS?.escape
      ? window.CSS.escape(col.key)
      : col.key.replace(/"/g, '\\"');
    const cells = root.querySelectorAll<HTMLElement>(`[data-col-key="${safeKey}"]`);
    if (cells.length === 0) return;
    let max = 80; // header minimum
    cells.forEach((cell) => {
      const w = cell.scrollWidth;
      if (w > max) max = w;
    });
    setColumnWidth(col.key, Math.min(640, max + 24));
  }

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        headerRef.current = el;
      }}
      style={style}
      {...(reorderable ? { ...attributes, ...listeners } : {})}
      className="relative shrink-0 border-r border-[var(--border)] bg-muted/60 px-3 py-2.5 text-left backdrop-blur-sm last:border-r-0"
      data-col-key={col.key}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            if (col.type === "actions") return;
            if (columnConfigOpen === col.key) closeColumnConfig();
            else openColumnConfig(col.key);
          }}
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap transition-colors",
            "text-[var(--muted-foreground)]",
            isSortable && "cursor-pointer hover:text-[var(--foreground)]",
            hasFilter && "text-primary"
          )}
        >
          {col.label}
          {filterCount > 0 && (
            <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1 min-w-[16px] text-center leading-4">{filterCount}</span>
          )}
          {isSortable && <SortIcon column={col} sort={sort} />}
        </button>
      </div>

      {/* Resize handle — drag to resize, double-click to fit-to-content */}
      {col.type !== "actions" && (
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 active:bg-primary/50"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startW = width;
            function onMove(ev: MouseEvent) {
              const newW = Math.max(80, startW + ev.clientX - startX);
              setColumnWidth(col.key, newW);
            }
            function onUp() {
              document.removeEventListener("mousemove", onMove);
              document.removeEventListener("mouseup", onUp);
            }
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
          }}
          onDoubleClick={(e) => {
            e.preventDefault();
            fitToContent();
          }}
          title="Drag to resize · double-click to fit content"
        />
      )}

      {/* Column config panel */}
      {columnConfigOpen === col.key && (
        <ColumnConfigPanel
          column={col}
          sort={sort}
          toggleSort={toggleSort}
          filters={filters}
          setFilter={setFilter}
          clearFilter={clearFilter}
          isWrapped={wrapColumns.has(col.key)}
          toggleWrap={toggleWrap}
          onClose={closeColumnConfig}
          anchorRef={headerRef}
          isGroupedBy={isGroupedBy}
          setGroupBy={setGroupBy}
        />
      )}
    </div>
  );
}

export function ColumnHeaderRow({
  columns,
  allColumns,
  sort,
  toggleSort,
  filters,
  setFilter,
  clearFilter,
  columnConfigOpen,
  openColumnConfig,
  closeColumnConfig,
  hiddenColumns,
  toggleColumn,
  wrapColumns,
  toggleWrap,
  columnWidths,
  setColumnWidth,
  setColumnOrder,
  columnOrder,
  frozenFirstColumn,
  bodyRef,
  groupBy,
  setGroupBy,
  selectionHeader,
}: ColumnHeaderRowProps) {

  // Stable ID for the DndContext. useId() returns the same string on
  // both server and client renders, which keeps `aria-describedby` in
  // sync on every sortable column-header button. Without this, dnd-kit
  // auto-numbers its announcement container per mount, so if any other
  // DndContext mounts ahead of this one (different counter on each
  // render pass), the column headers' aria-describedby mismatches and
  // React 19 logs a hydration warning. Using useId() also handles the
  // multi-table case cleanly — each ColumnHeaderRow gets its own ID.
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Reorder by moving `active` to the slot of `over` in the canonical
    // columnOrder. Includes hidden columns so the next reveal preserves
    // the user's intended position.
    const oldIndex = columnOrder.indexOf(active.id as string);
    const newIndex = columnOrder.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...columnOrder];
    next.splice(oldIndex, 1);
    next.splice(newIndex, 0, active.id as string);
    setColumnOrder(next);
  }

  // Determine the first non-actions column for freeze styling.
  const firstNonActionKey = columns.find((c) => c.type !== "actions")?.key ?? null;

  // Reorderable items exclude the actions column.
  const reorderableKeys = columns.filter((c) => c.type !== "actions").map((c) => c.key);

  return (
    <DndContext
      // useId()-derived ID pins the per-context container reference so
      // SSR and client agree on every sortable header's
      // `aria-describedby`. See the `dndId` declaration above for why.
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={reorderableKeys} strategy={horizontalListSortingStrategy}>
        <div className="flex sticky top-0 z-10 border-b border-[var(--border)] shadow-[0_1px_0_0_var(--border),0_4px_10px_-8px_rgb(0_0_0/0.35)] group">
          {selectionHeader}
          {columns.map((col) => {
            const isSortable = col.sortable !== false && col.type !== "actions";
            const activeFilter = filters.find((f) => f.key === col.key);
            const hasFilter = !!activeFilter;
            const filterCount = hasFilter && Array.isArray(activeFilter.value) ? activeFilter.value.length : 0;
            const w = columnWidths[col.key] ?? col.width ?? (col.type === "actions" ? 80 : 150);

            return (
              <SortableColumnHeader
                key={col.key}
                col={col}
                width={w}
                isSortable={isSortable}
                filters={filters}
                filterCount={filterCount}
                hasFilter={hasFilter}
                sort={sort}
                toggleSort={toggleSort}
                setFilter={setFilter}
                clearFilter={clearFilter}
                columnConfigOpen={columnConfigOpen}
                openColumnConfig={openColumnConfig}
                closeColumnConfig={closeColumnConfig}
                wrapColumns={wrapColumns}
                toggleWrap={toggleWrap}
                setColumnWidth={setColumnWidth}
                reorderable={col.type !== "actions"}
                bodyRef={bodyRef}
                frozen={!!frozenFirstColumn && col.key === firstNonActionKey}
                isGroupedBy={groupBy === col.key}
                setGroupBy={setGroupBy}
              />
            );
          })}

        </div>
      </SortableContext>
    </DndContext>
  );
}
