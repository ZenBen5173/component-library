"use client";

import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ClipboardList, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./shims";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE } from "./shims";
import { operatorsFor, type ColumnType, type DataTableProps } from "./types";
import { useDataTable } from "./useDataTable";
import { Toolbar } from "./components/Toolbar";
import { ScrollRail } from "./components/ScrollRail";
import { ViewBar } from "./components/ViewBar";
import { ColumnHeaderRow } from "./components/ColumnHeader";
import { CellRenderer } from "./components/CellRenderer";
import { COLUMN_TYPE_REGISTRY } from "./columnTypes";
import { downloadCsv } from "./exportCsv";
import { FooterCell } from "./components/FooterCell";

const ROW_HEIGHT = 44;
/**
 * How many rows a single group renders before it stops.
 *
 * Grouped rows are deliberately not virtualised — the group headers stick
 * under the column header as you scroll, and absolutely-positioned virtual
 * rows cannot do that. Ungrouped, the virtualiser bounds the DOM whatever the
 * row count; grouped, this does, and each group offers to show the rest.
 */
const GROUP_ROW_CAP = 200;
const OVERSCAN = 5;
const DEFAULT_WIDTH = 150;
const ACTIONS_WIDTH = 80;

function getColWidth(
  col: { key: string; type: string; width?: number },
  columnWidths: Record<string, number>
): number {
  return columnWidths[col.key] ?? col.width ?? (col.type === "actions" ? ACTIONS_WIDTH : DEFAULT_WIDTH);
}

// --- Pagination controls ---

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function PaginationControls({
  page,
  totalPages,
  totalRows,
  perPage,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalRows: number;
  perPage: number;
  onPageChange: (p: number) => void;
}) {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalRows);
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm">
      <span className="text-xs text-[var(--muted-foreground)]">
        Showing {start}–{end} of {totalRows} rows
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            page <= 1
              ? "text-[var(--muted-foreground)] opacity-40 cursor-not-allowed"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
          )}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-[var(--muted-foreground)]">...</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "min-w-[28px] h-7 px-1.5 text-xs font-medium rounded-md transition-colors",
                p === page
                  // Was text-white, which vanished against a light page.
                  ? "bg-primary/15 text-primary"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            page >= totalPages
              ? "text-[var(--muted-foreground)] opacity-40 cursor-not-allowed"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
          )}
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- Main DataTable ---

export function DataTable({
  columns,
  data,
  onRowClick,
  onEdit,
  titleKey,
  viewId,
  rowId = (row) => String(row.id ?? ""),
  onColumnsChange,
  loading = false,
  emptyState,
  searchable = true,
  paginated = true,
  frozenFirstColumn = false,
  exportable,
  bulkActions,
  pageSize = TABLE_PAGE_SIZE,
}: DataTableProps) {
  // Seeded from the prop and then owned here, so "rows per page" in the menu
  // is a live setting rather than something only the consumer can change.
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  /**
   * Which panel the toolbar just asked for.
   *
   * The panels live on the chips in the bar below, and a chip does not exist
   * until its first rule does — so the toolbar's icons create that first entry
   * and name the panel, which then opens as it appears.
   */
  const [openPanel, setOpenPanel] = useState<{ panel: "sort" | "filter"; n: number } | null>(null);
  const askFor = (panel: "sort" | "filter") =>
    setOpenPanel((prev) => ({ panel, n: (prev?.n ?? 0) + 1 }));

  /** Start a filter on one column, from wherever the request came from. */
  const filterColumn = (key: string) => {
    const column = columns.find((c) => c.key === key);
    if (!column) return;
    state.setRules([
      ...state.rules,
      {
        id: `r${Date.now().toString(36)}${state.rules.length}`,
        key,
        op: operatorsFor(column.type)[0]!.value,
        value: "",
      },
    ]);
    askFor("filter");
  };

  const state = useDataTable(columns, data, {
    viewId,
    pageSize: rowsPerPage,
    paginated,
    rowId,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const footerViewportRef = useRef<HTMLDivElement>(null);

  /** Keeps the totals row lined up with the columns above it. */
  const syncFooterScroll = () => {
    const viewport = footerViewportRef.current;
    if (viewport && scrollRef.current) {
      viewport.scrollLeft = scrollRef.current.scrollLeft;
    }
  };

  // Both edit the column list rather than the view, so they exist only when
  // the consumer has somewhere to keep the result.
  const onRename = onColumnsChange
    ? (key: string, label: string) =>
        onColumnsChange(columns.map((c) => (c.key === key ? { ...c, label } : c)))
    : undefined;

  const onSetIcon = onColumnsChange
    ? (key: string, icon: string | undefined) =>
        onColumnsChange(columns.map((c) => (c.key === key ? { ...c, icon } : c)))
    : undefined;

  const onSetIdPrefix = onColumnsChange
    ? (key: string, idPrefix: string) =>
        onColumnsChange(columns.map((c) => (c.key === key ? { ...c, idPrefix } : c)))
    : undefined;

  const onChangeType = onColumnsChange
    ? (key: string, type: ColumnType) =>
        onColumnsChange(
          columns.map((c) =>
            c.key === key
              ? // A filter written against the old type rarely means anything
                // under the new one, and an aggregate over what is now text
                // means nothing at all.
                { ...c, type, aggregate: type === "number" ? c.aggregate : undefined }
              : c,
          ),
        )
    : undefined;
  // Sprint 4.3 — first non-actions column key (used by both the header
  // row and the body for the freeze styling).
  const frozenKey = frozenFirstColumn
    ? state.orderedColumns.find((c) => c.type !== "actions")?.key ?? null
    : null;

  const virtualizer = useVirtualizer({
    count: state.paginatedData.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  // Section J7 polish — extra leading column for bulk-action checkboxes.
  const showSelectionCol = !!bulkActions;
  const SELECTION_COL_WIDTH = 36;

  const totalMinWidth = state.orderedColumns.reduce((sum, col) => {
    return sum + getColWidth(col, state.columnWidths);
  }, 40 + (showSelectionCol ? SELECTION_COL_WIDTH : 0)); // 40px for the ··· column

  // Section J7 polish — per-row checkbox cell.
  const renderRowCheckbox = (id: string) => {
    if (!showSelectionCol) return null;
    return (
      <div
        className="shrink-0 flex items-center justify-center px-2 border-r border-[var(--border)]"
        style={{ width: SELECTION_COL_WIDTH }}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          aria-label="Select row"
          checked={state.selectedIds.has(id)}
          onCheckedChange={() => state.toggleSelected(id)}
          animateIn={false}
        />
      </div>
    );
  };

  const clickable = typeof onRowClick === "function";

  // Tri-state: a dash when only some of the page is ticked, which a plain
  // boolean cannot say — it would read as "none selected".
  const selectedOnPage = state.paginatedData.filter((r) =>
    state.selectedIds.has(rowId(r)),
  ).length;
  const pageSelection: boolean | "indeterminate" =
    selectedOnPage === 0
      ? false
      : selectedOnPage === state.paginatedData.length
        ? true
        : "indeterminate";

  // Groups the user has asked to see in full, past GROUP_ROW_CAP.
  const [shownInFull, setShownInFull] = useState<Set<string>>(new Set());

  /**
   * One row's cells. Shared by the grouped and virtualised bodies, which
   * otherwise held the same forty lines twice and drifted apart.
   */
  const renderCells = (row: Record<string, unknown>) => (
    <>
      {renderRowCheckbox(rowId(row))}
      {state.orderedColumns.map((col) => {
        const w = getColWidth(col, state.columnWidths);
        const value = row[col.key];
        const isEditable = (col.editable ?? COLUMN_TYPE_REGISTRY[col.type].defaultEditable) && !!onEdit;
        const isFrozen = frozenKey === col.key;
        return (
          <div
            key={col.key}
            data-col-key={col.key}
            // overflow-hidden is what stops a cell writing into its
            // neighbour. Without it a wide value — a file chip, a long link —
            // simply carries on past the column edge and lands on top of the
            // next column's text, which is what "wrap" appeared to be
            // breaking: the wrapping was fine, the containment was missing.
            className="shrink-0 overflow-hidden border-r border-[var(--border)] px-3 py-2.5 text-[var(--foreground)] last:border-r-0"
            style={{
              width: w,
              minWidth: 80,
              ...(isFrozen
                ? {
                    position: "sticky",
                    left: 0,
                    zIndex: 5,
                    background: "var(--background)",
                    boxShadow: "inset -1px 0 0 var(--border)",
                  }
                : {}),
            }}
          >
            <CellRenderer
              column={col}
              value={value}
              row={row}
              isWrapped={state.wrapColumns.has(col.key)}
              onEdit={isEditable && onEdit ? (newValue) => onEdit(rowId(row), col.key, newValue) : undefined}
              onRowClick={clickable ? onRowClick! : undefined}
              isTitleColumn={titleKey ? col.key === titleKey : col.type === "title"}
            />
          </div>
        );
      })}
    </>
  );

  // Any column with a calculation chosen, plus room to choose one: the
  // row is always there for a numeric table so there is somewhere to click.
  const hasFooter =
    state.orderedColumns.some((c) => state.aggregates[c.key]) ||
    state.orderedColumns.some((c) => c.type === "number");

  const showVirtualized = !loading && state.paginatedData.length > 0;
  // Grouped rows are rendered whole, not by the page — so the pager, which
  // would sit underneath claiming "showing 1–25 of 1000", is hidden with them.
  const showPagination =
    paginated && !state.groupBy && state.processedData.length > rowsPerPage;

  return (
    <div>
      {searchable && (
        <Toolbar
          resultCount={state.resultCount}
          search={state.search}
          setSearch={state.setSearch}
          searchOpen={state.searchOpen}
          toggleSearchOpen={state.toggleSearchOpen}
          allColumns={columns}
          hiddenColumns={state.hiddenColumns}
          toggleColumn={state.toggleColumn}
          columnOrder={state.columnOrder}
          setColumnOrder={state.setColumnOrder}
          hasSort={state.sort.length > 0}
          hasFilters={state.rules.length > 0}
          onOpenSort={() => {
            if (state.sort.length === 0) {
              const first = columns.find(
                (c) => c.sortable !== false && c.type !== "actions",
              );
              if (first) state.setSort([{ key: first.key, dir: "asc" }]);
            }
            askFor("sort");
          }}
          onOpenFilter={() => {
            if (state.rules.length === 0) {
              const first = columns.find(
                (c) => c.filterable !== false && c.type !== "actions",
              );
              if (first) return filterColumn(first.key);
            }
            askFor("filter");
          }}
          onExportCsv={
            exportable
              ? () => {
                  const visibleCols = state.orderedColumns.filter((c) => c.type !== "actions");
                  const filename = typeof exportable === "string" ? exportable : "export";
                  downloadCsv(state.processedData, visibleCols, filename);
                }
              : undefined
          }
          pageSize={rowsPerPage}
          onPageSizeChange={paginated ? setRowsPerPage : undefined}
          selectedCount={bulkActions ? state.selectedIds.size : 0}
          onClearSelection={bulkActions ? () => state.clearSelection() : undefined}
          onSelectAll={bulkActions ? state.selectAllInView : undefined}
          onBulkDelete={
            bulkActions?.onDelete
              ? async () => {
                  const ids = Array.from(state.selectedIds);
                  if (ids.length === 0) return;
                  // window.confirm blocks the tab and looks like nothing else
                  // in the app; it is only the fallback.
                  const ask =
                    bulkActions.confirmDelete ??
                    ((count: number) =>
                      window.confirm(
                        `Delete ${count} selected row${count === 1 ? "" : "s"}? This can't be undone.`,
                      ));
                  if (!(await ask(ids.length))) return;
                  await bulkActions.onDelete!(ids);
                  state.clearSelection();
                }
              : undefined
          }
        />
      )}

      {/* What is applied to the table right now, and where to change it. */}
      {state.viewType === "table" && (
        <ViewBar
          columns={columns}
          sort={state.sort}
          setSort={state.setSort}
          rules={state.rules}
          setRules={state.setRules}
          conjunction={state.conjunction}
          setConjunction={state.setConjunction}
          groupByColumn={
            state.groupBy ? columns.find((c) => c.key === state.groupBy) ?? null : null
          }
          clearGroupBy={() => state.setGroupBy(null)}
          openPanel={openPanel}
        />
      )}

      {/* Section J6 — Kanban / Calendar branches. Both consume the
          processedData (post-filter, post-sort) so search + filters apply
          identically across views. */}
      {/* Single scroll owner — only rendered for the table view. */}
      {state.viewType === "table" && (
      <div
        ref={scrollRef}
        onScroll={syncFooterScroll}
        className={cn(
          "no-native-scrollbar w-full border border-[var(--border)] text-sm overflow-x-auto",
          // Paged, the body is exactly as tall as its rows, so there is
          // nothing to scroll vertically and no bar down the side. Unpaged, it
          // holds the whole result set and has to scroll — the virtualiser
          // needs a scroll container to measure against.
          paginated ? "overflow-y-hidden" : "overflow-y-auto",
          hasFooter ? "rounded-t-lg border-b-0" : "rounded-lg",
        )}
        style={{
          ...(paginated ? {} : { maxHeight: "min(600px, 70vh)" }),
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: totalMinWidth }}>
          {/* Sticky header */}
          <ColumnHeaderRow
            selectionHeader={
              showSelectionCol ? (
                <div
                  className="shrink-0 flex items-center justify-center px-2 border-r border-[var(--border)]"
                  style={{ width: SELECTION_COL_WIDTH }}
                >
                  <Checkbox
                    aria-label="Select all on this page"
                    checked={pageSelection}
                    onCheckedChange={() => state.toggleAllOnPage()}
                    animateIn={false}
                  />
                </div>
              ) : undefined
            }
            columns={state.orderedColumns}
            sort={state.sort}
            toggleSort={state.toggleSort}
            rules={state.rules}
            onFilterColumn={filterColumn}
            columnConfigOpen={state.columnConfigOpen}
            openColumnConfig={state.openColumnConfig}
            closeColumnConfig={state.closeColumnConfig}
            toggleColumn={state.toggleColumn}
            wrapColumns={state.wrapColumns}
            toggleWrap={state.toggleWrap}
            columnWidths={state.columnWidths}
            setColumnWidth={state.setColumnWidth}
            setColumnOrder={state.setColumnOrder}
            columnOrder={state.columnOrder}
            frozenFirstColumn={frozenFirstColumn}
            bodyRef={scrollRef}
            groupBy={state.groupBy}
            setGroupBy={state.setGroupBy}
            onRename={onRename}
            onChangeType={onChangeType}
            onSetIcon={onSetIcon}
            onSetIdPrefix={onSetIdPrefix}
          />

          {/* Body */}
          {loading ? (
            <div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="flex border-t border-[var(--border)]">
                  {showSelectionCol && (
                    <div className="shrink-0" style={{ width: SELECTION_COL_WIDTH }} />
                  )}
                  {state.orderedColumns.map((col) => {
                    const w = getColWidth(col, state.columnWidths);
                    return (
                      <div key={col.key} className="shrink-0 border-r border-[var(--border)] px-3 py-3 last:border-r-0" style={{ width: w }}>
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : state.processedData.length === 0 ? (
            emptyState || (
              <EmptyState
                icon={<ClipboardList />}
                title="No data"
                description={state.search || state.hasActiveFilters ? "No items match your search or filters." : "There are no items to display."}
              />
            )
          ) : state.groupBy ? (
            // Sprint 5.5 — grouped render. Sticky group header bars plus
            // collapsible rows; each group renders at most GROUP_ROW_CAP rows
            // and offers the rest behind a click, so grouping by something
            // high-volume cannot drop ten thousand rows into the document.
            <div>
              {state.groups.map((group) => {
                const collapsed = state.collapsedGroups.has(group.value);
                const groupColLabel = state.orderedColumns.find((c) => c.key === state.groupBy)?.label ?? state.groupBy;
                const uncapped = shownInFull.has(group.value);
                const rows = uncapped ? group.rows : group.rows.slice(0, GROUP_ROW_CAP);
                const withheld = group.rows.length - rows.length;
                return (
                  <div key={group.value}>
                    <button
                      type="button"
                      onClick={() => state.toggleGroup(group.value)}
                      className="flex items-center gap-2 w-full px-3 py-2 bg-muted border-y border-[var(--border)] text-left text-xs font-medium hover:bg-accent transition-colors sticky top-[42px] z-[6]"
                    >
                      {collapsed ? <ChevronRightIcon className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      <span className="text-xs uppercase font-medium text-[var(--muted-foreground)]">{groupColLabel}:</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">{group.value}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">({group.rows.length})</span>
                    </button>
                    {!collapsed && rows.map((row, rIdx) => (
                      <div
                        key={rowId(row) || `${group.value}-${rIdx}`}
                        className={cn(
                          "flex border-t border-[var(--border)] transition-colors",
                          "hover:bg-muted/40"
                        )}
                      >
                        {renderCells(row)}
                      </div>
                    ))}
                    {!collapsed && withheld > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setShownInFull((prev) => new Set(prev).add(group.value))
                        }
                        className="w-full border-t border-[var(--border)] px-3 py-2.5 text-left text-xs text-[var(--muted-foreground)] transition-colors hover:bg-muted/40 hover:text-[var(--foreground)]"
                      >
                        Show {withheld.toLocaleString()} more in {group.value}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : showVirtualized ? (
            <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = state.paginatedData[virtualRow.index];
                if (!row) return null; // virtualRow.index always within bounds, but defend
                return (
                  <div
                    key={rowId(row) || virtualRow.index}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className={cn(
                      "flex border-t border-[var(--border)] transition-colors",
                      "hover:bg-muted/40"
                    )}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {renderCells(row)}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

      </div>
      )}

      {/* The totals row, below the scroller rather than stuck to its bottom
          edge inside it.

          Sticky-inside meant rows slid underneath it and were clipped in
          half at the end of the list — the row was not cut off so much as
          covered. Out here it can never overlap anything. It cannot share
          the body's horizontal scrollbar from out here either, so its
          scroll position is driven from the body's: overflow-x hidden still
          makes a scroll container, which keeps a frozen first column
          working, and hides the second scrollbar that would otherwise
          appear under the first. */}
      {state.viewType === "table" && hasFooter && (
        <div
          ref={footerViewportRef}
          className="no-native-scrollbar w-full overflow-x-hidden rounded-b-lg border border-[var(--border)] text-sm"
        >
          <div style={{ minWidth: totalMinWidth }}>
            <div className="group/footer flex bg-[var(--card)] font-medium text-xs">
              {showSelectionCol && (
                <div className="shrink-0" style={{ width: SELECTION_COL_WIDTH }} />
              )}
              {state.orderedColumns.map((col) => {
                const w = getColWidth(col, state.columnWidths);
                const isFrozen = frozenKey === col.key;
                const agg = state.aggregates[col.key];
                const value = agg ? state.footerValues[col.key] : null;
                return (
                  <div
                    key={col.key}
                    className="shrink-0 border-r border-[var(--border)] px-3 py-2 text-[var(--foreground)] last:border-r-0"
                    style={{
                      width: w,
                      minWidth: 80,
                      ...(isFrozen
                        ? {
                            position: "sticky",
                            left: 0,
                            zIndex: 11,
                            background: "var(--card)",
                            boxShadow: "inset -1px 0 0 var(--border)",
                          }
                        : {}),
                    }}
                  >
                    <FooterCell
                      column={col}
                      aggregate={agg}
                      value={value}
                      onChange={(next) => state.setAggregate(col.key, next)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* The horizontal scrollbar, below the totals rather than cutting
          across the table above them. */}
      {state.viewType === "table" && (
        <ScrollRail targetRef={scrollRef} className="mt-1" />
      )}

      {/* Pagination — only shows in table view. */}
      {state.viewType === "table" && showPagination && (
        <PaginationControls
          page={state.page}
          totalPages={state.totalPages}
          totalRows={state.resultCount}
          perPage={rowsPerPage}
          onPageChange={state.setPage}
        />
      )}
    </div>
  );
}
