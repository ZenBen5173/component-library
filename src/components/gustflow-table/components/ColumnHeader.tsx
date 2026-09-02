"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, EyeOff, GripVertical } from "lucide-react";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { ColumnDef, ColumnType, SortDir, FilterRule } from "../types";
import { AnimatedLucide, type IconHandle } from "@/components/ui/animated-lucide";
import { PropertyMenu, columnIconName } from "./PropertyMenu";

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

// --- Column visibility menu ---

export interface ColumnVisibilityMenuProps {
  columns: ColumnDef[];
  hiddenColumns: Set<string>;
  toggleColumn: (key: string) => void;
  /** The canonical order, hidden columns included. */
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

/**
 * One row of the properties menu: shown or hidden, and draggable either way.
 *
 * Only the handle drags. Making the whole row draggable would mean every
 * attempt to toggle a column risks becoming a two-pixel drag instead, and
 * toggling is what people come here to do.
 */
function ColumnMenuRow({
  column,
  hidden,
  onToggle,
}: {
  column: ColumnDef;
  hidden: boolean;
  onToggle: () => void;
}) {
  const sortable = useSortable({ id: column.key });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center gap-1 rounded px-1 transition-colors hover:bg-[var(--card)]"
    >
      <span
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${column.label}`}
        className="grid size-4 shrink-0 cursor-grab place-items-center text-[var(--muted-foreground)]/50 transition-colors hover:text-[var(--muted-foreground)] active:cursor-grabbing"
      >
        <GripVertical className="size-3.5" />
      </span>
      <button
        onClick={onToggle}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-xs transition-colors",
          hidden ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]",
        )}
      >
        {/* Both eyes take the row's own colour. The shown one used to be the
            primary blue, which made it the loudest thing in a menu of grey and
            white and read as a state rather than as an icon. Shown is
            foreground, hidden is muted — the same pair the labels use, and it
            reads correctly in either theme. */}
        {hidden ? (
          <EyeOff className="size-3.5 shrink-0" />
        ) : (
          <Eye className="size-3.5 shrink-0" />
        )}
        <span className="truncate">{column.label}</span>
      </button>
    </div>
  );
}

export function ColumnVisibilityMenu({
  columns,
  hiddenColumns,
  toggleColumn,
  columnOrder,
  setColumnOrder,
  onClose,
  anchorRef,
}: ColumnVisibilityMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const hideableColumns = columns.filter((c) => c.type !== "actions");

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    let left = rect.right - 232;
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

  /**
   * Listed in the order the table uses, not the order they were declared —
   * otherwise dragging a row here moves a column somewhere else on screen and
   * the list does not agree with the table it is describing.
   */
  const ordered = [...hideableColumns].sort((a, b) => {
    const ai = columnOrder.indexOf(a.key);
    const bi = columnOrder.indexOf(b.key);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Reordered against the canonical list, hidden columns included, so a
    // column revealed later comes back where it was put rather than at the end.
    const from = columnOrder.indexOf(active.id as string);
    const to = columnOrder.indexOf(over.id as string);
    if (from === -1 || to === -1) return;
    const next = [...columnOrder];
    next.splice(from, 1);
    next.splice(to, 0, active.id as string);
    setColumnOrder(next);
  }

  const shownCount = ordered.filter((c) => !hiddenColumns.has(c.key)).length;

  return createPortal(
    <div
      ref={ref}
      className="fixed w-[232px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-card-lg"
      style={{ top: pos.top, left: pos.left, zIndex: 9999 }}
    >
      <p className="border-b border-[var(--border)] px-3 py-2 text-[11px] text-[var(--muted-foreground)]">
        {shownCount} of {ordered.length} shown · drag to reorder
      </p>
      <div className="max-h-64 overflow-y-auto p-1">
        <DndContext
          id="column-visibility"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ordered.map((c) => c.key)} strategy={verticalListSortingStrategy}>
            {ordered.map((c) => (
              <ColumnMenuRow
                key={c.key}
                column={c}
                hidden={hiddenColumns.has(c.key)}
                onToggle={() => toggleColumn(c.key)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>,
    document.body
  );
}

// --- Main header row ---

interface ColumnHeaderRowProps {
  columns: ColumnDef[];
  sort: Array<{ key: string; dir: SortDir }>;
  toggleSort: (key: string, opts?: { shiftKey?: boolean }) => void;
  /** Every rule in force, so a heading can say it is filtered. */
  rules: FilterRule[];
  onFilterColumn: (key: string) => void;
  columnConfigOpen: string | null;
  openColumnConfig: (key: string) => void;
  closeColumnConfig: () => void;
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
  /** Present only when the consumer owns its column list. */
  onRename?: (key: string, label: string) => void;
  onChangeType?: (key: string, type: ColumnType) => void;
  onSetIcon?: (key: string, icon: string | undefined) => void;
  onSetIdPrefix?: (key: string, prefix: string) => void;
  /** Section J7 polish — checkbox header rendered as the first column
   *  when bulk-actions are enabled. Sets/unsets selection for all rows
   *  on the current page. */
  selectionHeader?: React.ReactNode;
}

interface SortableColumnHeaderProps {
  col: ColumnDef;
  width: number;
  isSortable: boolean;
  filterCount: number;
  hasFilter: boolean;
  sort: Array<{ key: string; dir: SortDir }>;
  toggleSort: (key: string, opts?: { shiftKey?: boolean }) => void;
  onFilterColumn: (key: string) => void;
  onRename?: (key: string, label: string) => void;
  onChangeType?: (key: string, type: ColumnType) => void;
  onSetIcon?: (key: string, icon: string | undefined) => void;
  onSetIdPrefix?: (key: string, prefix: string) => void;
  toggleColumn: (key: string) => void;
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
  filterCount,
  hasFilter,
  sort,
  toggleSort,
  onFilterColumn,
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
  toggleColumn,
  onRename,
  onChangeType,
  onSetIcon,
  onSetIdPrefix,
}: SortableColumnHeaderProps) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  // Drag-reorder hook. Disabled for non-reorderable columns (actions).
  const sortable = useSortable({ id: col.key, disabled: !reorderable });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  // The heading plays the icon, not the glyph: a 14px hover target is not a
  // hover target. Same contract the hand-built animated icons use.
  const iconRef = useRef<IconHandle>(null);

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
          background: "var(--muted)",
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
      // The heading drives its own icon. Pointing at a 14px glyph to make it
      // move is not an interaction anyone can perform on purpose.
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      className="relative shrink-0 border-r border-[var(--border)] bg-muted px-3 py-2.5 text-left last:border-r-0"
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
          {/* The property's icon, the way Notion labels its columns — the
              fastest way to see that "Updated" is a date and not text. */}
          <AnimatedLucide
            ref={iconRef}
            name={columnIconName(col) as never}
            size={14}
            trigger="manual"
            className="opacity-70"
          />
          {col.label}
          {filterCount > 1 && (
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

      {/* The property menu */}
      {columnConfigOpen === col.key && (
        <PropertyMenu
          column={col}
          sort={sort}
          toggleSort={toggleSort}
          onFilterColumn={onFilterColumn}
          isWrapped={wrapColumns.has(col.key)}
          toggleWrap={toggleWrap}
          isGroupedBy={isGroupedBy}
          setGroupBy={setGroupBy}
          toggleColumn={toggleColumn}
          onRename={onRename}
          onChangeType={onChangeType}
          onSetIcon={onSetIcon}
          onSetIdPrefix={onSetIdPrefix}
          onClose={closeColumnConfig}
          anchorRef={headerRef}
        />
      )}
    </div>
  );
}

export function ColumnHeaderRow({
  columns,
  sort,
  toggleSort,
  rules,
  onFilterColumn,
  columnConfigOpen,
  openColumnConfig,
  closeColumnConfig,
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
  onRename,
  onChangeType,
  onSetIcon,
  onSetIdPrefix,
}: ColumnHeaderRowProps) {

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

  /**
   * The DndContext's id, which every sortable header points at through
   * `aria-describedby`.
   *
   * Left to itself dnd-kit numbers this per mount, so the server and the
   * client disagree and React throws the server HTML away. This used to be a
   * `useId()`, on the belief that useId agrees across the two — it only does
   * when the component sits at the same place in both trees, and a lazily
   * imported one does not. The column keys are the same on both sides
   * whatever wraps the table, so they are what the id is built from.
   */
  const dndId = `gf-dnd-${reorderableKeys.join("_")}`;

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={reorderableKeys} strategy={horizontalListSortingStrategy}>
        <div className="flex sticky top-0 z-10 border-b border-[var(--border)] bg-muted shadow-[0_1px_0_0_var(--border),0_4px_10px_-8px_rgb(0_0_0/0.35)] group">
          {selectionHeader}
          {columns.map((col) => {
            const isSortable = col.sortable !== false && col.type !== "actions";
            // How many of the bar's rules point at this column — so a
            // heading still says it is filtered, from the one filter model
            // rather than a second one of its own.
            const filterCount = rules.filter((r) => r.key === col.key).length;
            const hasFilter = filterCount > 0;
            const w = columnWidths[col.key] ?? col.width ?? (col.type === "actions" ? 80 : 150);

            return (
              <SortableColumnHeader
                key={col.key}
                col={col}
                width={w}
                isSortable={isSortable}
                filterCount={filterCount}
                hasFilter={hasFilter}
                sort={sort}
                toggleSort={toggleSort}
                onFilterColumn={onFilterColumn}
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
                toggleColumn={toggleColumn}
                onRename={onRename}
                onChangeType={onChangeType}
                onSetIcon={onSetIcon}
                onSetIdPrefix={onSetIdPrefix}
              />
            );
          })}

        </div>
      </SortableContext>
    </DndContext>
  );
}
