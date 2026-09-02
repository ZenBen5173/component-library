"use client";

import { useRef, useEffect, useState } from "react";
import { Search, Filter, X, Trash2, Columns3, ArrowDownUp } from "lucide-react";
import { ColumnVisibilityMenu } from "./ColumnHeader";
import { TableMenu } from "./TableMenu";
import type { ColumnDef } from "../types";
import { cn } from "@/lib/utils";

export type ToolbarViewType = "table" | "kanban" | "calendar";

interface ToolbarProps {
  resultCount: number;
  search: string;
  setSearch: (s: string) => void;
  searchOpen: boolean;
  toggleSearchOpen: () => void;
  /** Column visibility — lives beside the other table-wide controls rather
      than in the header row, where it read as one more column. */
  allColumns?: ColumnDef[];
  hiddenColumns?: Set<string>;
  toggleColumn?: (key: string) => void;
  /** The canonical column order, so the properties menu can rearrange it. */
  columnOrder?: string[];
  setColumnOrder?: (order: string[]) => void;
  /** Sprint 5.5 — when set, shows "Grouped by <label> ✕" pill in the toolbar. */
  groupByLabel?: string | null;
  clearGroupBy?: () => void;
  /** Section J3 — when set, renders an "Export CSV" button in the toolbar
   *  that triggers the consumer's CSV-download handler with the current
   *  filtered/sorted/visible row set. */
  onExportCsv?: () => void;
  /** Start (and open) a sort or a filter from nothing. */
  onOpenSort?: () => void;
  onOpenFilter?: () => void;
  hasSort?: boolean;
  hasFilters?: boolean;
  /** Rows per page, and the setter behind the menu. */
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  /** Section J7 — bulk-action selection summary + delete button. */
  selectedCount?: number;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
  /** Section J7 — "Select all in filtered view" button. v1 ships
   *  toolbar-level selection (per-row checkboxes are a follow-up polish). */
  onSelectAll?: () => void;
}

export function Toolbar({
  resultCount,
  search,
  setSearch,
  searchOpen,
  toggleSearchOpen,
  allColumns,
  hiddenColumns,
  toggleColumn,
  columnOrder,
  setColumnOrder,
  onExportCsv,
  onOpenSort,
  onOpenFilter,
  hasSort,
  hasFilters,
  pageSize = 25,
  onPageSizeChange,
  selectedCount = 0,
  onClearSelection,
  onBulkDelete,
  onSelectAll,
}: ToolbarProps) {
  const colMenuBtnRef = useRef<HTMLButtonElement>(null);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs text-[var(--muted-foreground)]">
        {resultCount} result{resultCount !== 1 ? "s" : ""}
      </span>

      {/* Section J7 — "Select all in filtered view" trigger when nothing selected. */}
      {onSelectAll && selectedCount === 0 && (
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline-offset-4 hover:underline"
        >
          Select all
        </button>
      )}

      {/* Section J7 — bulk action bar (replaces filter/group/search controls when active). */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary">
          <span className="text-xs font-medium text-primary">
            {selectedCount} selected
          </span>
          {onBulkDelete && (
            <button
              type="button"
              onClick={onBulkDelete}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full text-[var(--destructive)] border border-[var(--destructive)] hover:bg-[color-mix(in_oklch,var(--destructive)_8%,transparent)]"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
          {onClearSelection && (
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        {/* Search */}
        <div className="flex items-center">
          {searchOpen && (
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") toggleSearchOpen(); }}
              placeholder="Search..."
              className="w-full sm:w-48 h-8 px-3 text-sm border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-accent mr-1"
            />
          )}
          <button
            type="button"
            onClick={toggleSearchOpen}
            className={cn(
              "p-2 rounded-md transition-colors",
              searchOpen || search
                ? "text-primary bg-primary/10"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
            )}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>


        {/* Sort and filter. The bar under the toolbar shows what is applied;
            these are how you apply the first one, since a bar with nothing in
            it is not shown at all. */}
        {onOpenSort && (
          <button
            type="button"
            onClick={onOpenSort}
            title="Sort"
            className={cn(
              "rounded-md p-2 transition-colors",
              hasSort
                ? "bg-primary/10 text-primary"
                : "text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)]",
            )}
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        )}
        {onOpenFilter && (
          <button
            type="button"
            onClick={onOpenFilter}
            title="Filter"
            className={cn(
              "rounded-md p-2 transition-colors",
              hasFilters
                ? "bg-primary/10 text-primary"
                : "text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)]",
            )}
          >
            <Filter className="h-4 w-4" />
          </button>
        )}

        {/* Column visibility — next to filter, since both narrow what the
            table shows. */}
        {allColumns && hiddenColumns && toggleColumn && (
          <div className="relative">
            <button
              ref={colMenuBtnRef}
              type="button"
              onClick={() => setColMenuOpen((o) => !o)}
              className={cn(
                "p-2 rounded-md transition-colors",
                colMenuOpen || hiddenColumns.size > 0
                  ? "text-primary bg-primary/10"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]",
              )}
              title="Show/hide columns"
            >
              <Columns3 className="h-4 w-4" />
            </button>
            {colMenuOpen && (
              <ColumnVisibilityMenu
                columns={allColumns}
                hiddenColumns={hiddenColumns}
                toggleColumn={toggleColumn}
                columnOrder={columnOrder ?? []}
                setColumnOrder={setColumnOrder ?? (() => {})}
                onClose={() => setColMenuOpen(false)}
                anchorRef={colMenuBtnRef}
              />
            )}
          </div>
        )}

        {/* Everything that configures the table rather than filters it. */}
        <TableMenu
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          onExportCsv={onExportCsv}
        />
      </div>
    </div>
  );
}
