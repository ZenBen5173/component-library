"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ClipboardList, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon, X as XIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./shims";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE } from "./shims";
import type { DataTableProps } from "./types";
import { useDataTable } from "./useDataTable";
import { Toolbar } from "./components/Toolbar";
import { ColumnHeaderRow } from "./components/ColumnHeader";
import { CellRenderer } from "./components/CellRenderer";
import { COLUMN_TYPE_REGISTRY } from "./columnTypes";
import { downloadCsv } from "./exportCsv";

const ROW_HEIGHT = 44;
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
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (p: number) => void;
}) {
  const start = (page - 1) * TABLE_PAGE_SIZE + 1;
  const end = Math.min(page * TABLE_PAGE_SIZE, totalRows);
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
                  ? "bg-primary/15 text-white"
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
  loading = false,
  emptyState,
  searchable = true,
  frozenFirstColumn = false,
  exportable,
  bulkActions,
}: DataTableProps) {
  const state = useDataTable(columns, data, viewId);
  const scrollRef = useRef<HTMLDivElement>(null);
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
  const renderRowCheckbox = (rowId: string) => {
    if (!showSelectionCol) return null;
    return (
      <div
        className="shrink-0 flex items-center justify-center px-2 border-r border-[var(--border)]"
        style={{ width: SELECTION_COL_WIDTH }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={state.selectedIds.has(rowId)}
          onChange={() => state.toggleSelected(rowId)}
        />
      </div>
    );
  };

  const showVirtualized = !loading && state.paginatedData.length > 0;
  const clickable = typeof onRowClick === "function";
  const showPagination = state.processedData.length > TABLE_PAGE_SIZE;

  return (
    <div>
      {searchable && (
        <Toolbar
          resultCount={state.resultCount}
          search={state.search}
          setSearch={state.setSearch}
          searchOpen={state.searchOpen}
          toggleSearchOpen={state.toggleSearchOpen}
          hasActiveFilters={state.hasActiveFilters}
          clearAllFilters={state.clearAllFilters}
          allColumns={columns}
          hiddenColumns={state.hiddenColumns}
          toggleColumn={state.toggleColumn}
          groupByLabel={
            state.groupBy
              ? state.orderedColumns.find((c) => c.key === state.groupBy)?.label ?? state.groupBy
              : null
          }
          clearGroupBy={() => state.setGroupBy(null)}
          onExportCsv={
            exportable
              ? () => {
                  const visibleCols = state.orderedColumns.filter((c) => c.type !== "actions");
                  const filename = typeof exportable === "string" ? exportable : "export";
                  downloadCsv(state.processedData, visibleCols, filename);
                }
              : undefined
          }
          selectedCount={bulkActions ? state.selectedIds.size : 0}
          onClearSelection={bulkActions ? () => state.clearSelection() : undefined}
          onSelectAll={bulkActions ? state.selectAllInView : undefined}
          savedViews={viewId ? state.savedViews.map((v) => ({ id: v.id, name: v.name, is_default: v.is_default })) : undefined}
          onApplyView={
            viewId
              ? (vId: string) => {
                  const v = state.savedViews.find((sv) => sv.id === vId);
                  if (v) state.applyViewConfig(v.config);
                }
              : undefined
          }
          onSaveCurrentAsView={
            viewId
              ? async (name: string, asDefault: boolean) => {
                  const config = state.currentViewConfig();
                  const res = await fetch(`/api/data-table-views`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ table_key: viewId, name, config, is_default: asDefault }),
                  });
                  if (res.ok) {
                    const { view } = await res.json();
                    // Insert + dedupe default flag locally so the dropdown reflects the change
                    // without a re-fetch.
                    void state.refetchSavedViews();
                    void view; // referenced so the linter doesnt fuss about unused destructure
                  }
                }
              : undefined
          }
          onSetDefaultView={
            viewId
              ? async (vId: string, isDefault: boolean) => {
                  await fetch(`/api/data-table-views/${vId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ is_default: isDefault }),
                  });
                  void state.refetchSavedViews();
                }
              : undefined
          }
          onDeleteView={
            viewId
              ? async (vId: string) => {
                  await fetch(`/api/data-table-views/${vId}`, { method: "DELETE" });
                  void state.refetchSavedViews();
                }
              : undefined
          }
          viewType={state.viewType}
          setViewType={state.setViewType}
          onBulkDelete={
            bulkActions?.onDelete
              ? async () => {
                  const ids = Array.from(state.selectedIds);
                  if (ids.length === 0) return;
                  if (!confirm(`Delete ${ids.length} selected row${ids.length === 1 ? "" : "s"}? This can't be undone.`)) return;
                  await bulkActions.onDelete!(ids);
                  state.clearSelection();
                }
              : undefined
          }
        />
      )}

      {/* Section J6 — Kanban / Calendar branches. Both consume the
          processedData (post-filter, post-sort) so search + filters apply
          identically across views. */}
      {/* Single scroll owner — only rendered for the table view. */}
      {state.viewType === "table" && (
      <div
        ref={scrollRef}
        className="w-full rounded-lg border border-[var(--border)] text-sm overflow-auto"
        style={{ maxHeight: "min(600px, 70vh)", minWidth: 0 }}
      >
        {/* Inner sizer */}
        <div style={{ minWidth: totalMinWidth }}>
          {/* Sticky header */}
          <ColumnHeaderRow
            selectionHeader={
              showSelectionCol ? (
                <div
                  className="shrink-0 flex items-center justify-center px-2 border-r border-[var(--border)]"
                  style={{ width: SELECTION_COL_WIDTH }}
                >
                  <input
                    type="checkbox"
                    aria-label="Select all on this page"
                    checked={
                      state.paginatedData.length > 0 &&
                      state.paginatedData.every((r) => state.selectedIds.has(r.id as string))
                    }
                    onChange={() => state.toggleAllOnPage()}
                  />
                </div>
              ) : undefined
            }
            columns={state.orderedColumns}
            allColumns={columns}
            sort={state.sort}
            toggleSort={state.toggleSort}
            filters={state.filters}
            setFilter={state.setFilter}
            clearFilter={state.clearFilter}
            columnConfigOpen={state.columnConfigOpen}
            openColumnConfig={state.openColumnConfig}
            closeColumnConfig={state.closeColumnConfig}
            hiddenColumns={state.hiddenColumns}
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
            // Sprint 5.5 — grouped render. Skips virtualization (the
            // overhead of computing per-group offsets isn't worth it
            // for typical group counts; the linear render is fine for
            // tables under a few thousand rows). Each group renders a
            // sticky header bar + collapsible rows.
            <div>
              {state.groups.map((group) => {
                const collapsed = state.collapsedGroups.has(group.value);
                const groupColLabel = state.orderedColumns.find((c) => c.key === state.groupBy)?.label ?? state.groupBy;
                return (
                  <div key={group.value}>
                    <button
                      type="button"
                      onClick={() => state.toggleGroup(group.value)}
                      className="flex items-center gap-2 w-full px-3 py-2 bg-muted/60 border-y border-[var(--border)] text-left text-xs font-medium hover:bg-muted transition-colors sticky top-[42px] z-[6]"
                    >
                      {collapsed ? <ChevronRightIcon className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      <span className="text-xs uppercase font-medium text-[var(--muted-foreground)]">{groupColLabel}:</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">{group.value}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">({group.rows.length})</span>
                    </button>
                    {!collapsed && group.rows.map((row, rIdx) => (
                      <div
                        key={(row.id as string) ?? `${group.value}-${rIdx}`}
                        className={cn(
                          "flex border-t border-[var(--border)] transition-colors",
                          "hover:bg-muted/40"
                        )}
                      >
                        {renderRowCheckbox(row.id as string)}
                        {state.orderedColumns.map((col) => {
                          const w = getColWidth(col, state.columnWidths);
                          const value = row[col.key];
                          const isEditable = (col.editable ?? COLUMN_TYPE_REGISTRY[col.type].defaultEditable) && !!onEdit;
                          const isFrozen = frozenKey === col.key;
                          return (
                            <div
                              key={col.key}
                              data-col-key={col.key}
                              className="shrink-0 border-r border-[var(--border)] px-3 py-2.5 text-[var(--foreground)] last:border-r-0"
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
                                onEdit={isEditable && onEdit ? (newValue) => onEdit((row.id as string), col.key, newValue) : undefined}
                                onRowClick={clickable ? onRowClick! : undefined}
                                isTitleColumn={titleKey ? col.key === titleKey : col.type === "title"}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
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
                    key={(row.id as string) ?? virtualRow.index}
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
                    {renderRowCheckbox(row.id as string)}
                    {state.orderedColumns.map((col) => {
                      const w = getColWidth(col, state.columnWidths);
                      const value = row[col.key];
                      const isEditable = (col.editable ?? COLUMN_TYPE_REGISTRY[col.type].defaultEditable) && !!onEdit;
                      const isFrozen = frozenKey === col.key;
                      return (
                        <div
                          key={col.key}
                          data-col-key={col.key}
                          className="shrink-0 border-r border-[var(--border)] px-3 py-2.5 text-[var(--foreground)] last:border-r-0"
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
                            onEdit={isEditable && onEdit ? (newValue) => onEdit((row.id as string), col.key, newValue) : undefined}
                            onRowClick={clickable ? onRowClick! : undefined}
                            isTitleColumn={titleKey ? col.key === titleKey : col.type === "title"}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Section J2 — aggregation footer. Only renders when at least
            one column has an `aggregate` configured. Sticky to the bottom
            of the table body so it stays visible while scrolling. */}
        {(() => {
          const anyAgg = state.orderedColumns.some((c) => c.aggregate);
          if (!anyAgg) return null;
          return (
            <div className="flex border-t-2 border-[var(--border)] bg-[var(--card)] sticky bottom-0 z-10 font-medium text-xs">
              {showSelectionCol && (
                <div className="shrink-0" style={{ width: SELECTION_COL_WIDTH }} />
              )}
              {state.orderedColumns.map((col) => {
                const w = getColWidth(col, state.columnWidths);
                const isFrozen = frozenKey === col.key;
                const value = col.aggregate ? state.footerValues[col.key] : null;
                const aggLabel =
                  col.aggregate === "sum" ? "Σ"
                  : col.aggregate === "avg" ? "x̄"
                  : col.aggregate === "count" ? "#"
                  : col.aggregate === "min" ? "min"
                  : col.aggregate === "max" ? "max"
                  : "";
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
                    {value != null ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">{aggLabel}</span>
                        <span>{value}</span>
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
      )}

      {/* Pagination — only shows in table view. */}
      {state.viewType === "table" && showPagination && (
        <PaginationControls
          page={state.page}
          totalPages={state.totalPages}
          totalRows={state.resultCount}
          onPageChange={state.setPage}
        />
      )}
    </div>
  );
}
