"use client";

import { useRef, useEffect, useState } from "react";
import { Search, Filter, X, Layers, Download, Trash2, Bookmark, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToolbarSavedView = {
  id: string;
  name: string;
  is_default: boolean;
};

export type ToolbarViewType = "table" | "kanban" | "calendar";

interface ToolbarProps {
  resultCount: number;
  search: string;
  setSearch: (s: string) => void;
  searchOpen: boolean;
  toggleSearchOpen: () => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  /** Sprint 5.5 — when set, shows "Grouped by <label> ✕" pill in the toolbar. */
  groupByLabel?: string | null;
  clearGroupBy?: () => void;
  /** Section J3 — when set, renders an "Export CSV" button in the toolbar
   *  that triggers the consumer's CSV-download handler with the current
   *  filtered/sorted/visible row set. */
  onExportCsv?: () => void;
  /** Section J7 — bulk-action selection summary + delete button. */
  selectedCount?: number;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
  /** Section J7 — "Select all in filtered view" button. v1 ships
   *  toolbar-level selection (per-row checkboxes are a follow-up polish). */
  onSelectAll?: () => void;
  /** Section J4 — saved views dropdown.
   *  Consumer wires up a list + handlers; the toolbar renders the menu. */
  savedViews?: ToolbarSavedView[];
  onApplyView?: (viewId: string) => void;
  onSaveCurrentAsView?: (name: string, asDefault: boolean) => Promise<void> | void;
  onSetDefaultView?: (viewId: string, isDefault: boolean) => Promise<void> | void;
  onDeleteView?: (viewId: string) => Promise<void> | void;
  /** Section J6 — view type switcher (Table / Kanban / Calendar). */
  viewType?: ToolbarViewType;
  setViewType?: (v: ToolbarViewType) => void;
}

export function Toolbar({
  resultCount,
  search,
  setSearch,
  searchOpen,
  toggleSearchOpen,
  hasActiveFilters,
  clearAllFilters,
  groupByLabel,
  clearGroupBy,
  onExportCsv,
  selectedCount = 0,
  onClearSelection,
  onBulkDelete,
  onSelectAll,
  savedViews,
  onApplyView,
  onSaveCurrentAsView,
  onSetDefaultView,
  onDeleteView,
  viewType,
  setViewType,
}: ToolbarProps) {
  const [viewsMenuOpen, setViewsMenuOpen] = useState(false);
  const [savePromptOpen, setSavePromptOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewIsDefault, setNewViewIsDefault] = useState(false);
  const viewsAnchor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!viewsMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (viewsAnchor.current && !viewsAnchor.current.contains(e.target as Node)) {
        setViewsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [viewsMenuOpen]);
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

      {/* Sprint 5.5 — group-by indicator */}
      {groupByLabel && clearGroupBy && (
        <button
          type="button"
          onClick={clearGroupBy}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-[color-mix(in_oklch,var(--primary)_25%,transparent)] hover:opacity-80"
          title="Clear grouping"
        >
          <Layers className="h-3 w-3" />
          Grouped by {groupByLabel}
          <X className="h-3 w-3" />
        </button>
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


        {/* Section J4 — saved views dropdown */}
        {savedViews && onApplyView && (
          <div ref={viewsAnchor} className="relative">
            <button
              type="button"
              onClick={() => setViewsMenuOpen((o) => !o)}
              className="p-2 rounded-md transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
              title="Saved views"
            >
              <Bookmark className="h-4 w-4" />
            </button>
            {viewsMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 z-50 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-card-lg p-1">
                {savedViews.length === 0 && (
                  <p className="text-xs text-[var(--muted-foreground)] px-3 py-2">No saved views yet.</p>
                )}
                {savedViews.map((v) => (
                  <div key={v.id} className="flex items-center gap-1 px-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => { onApplyView(v.id); setViewsMenuOpen(false); }}
                      className="flex-1 text-left px-2 py-1.5 text-sm rounded hover:bg-[var(--card)]"
                    >
                      {v.name}
                    </button>
                    {onSetDefaultView && (
                      <button
                        type="button"
                        onClick={() => onSetDefaultView(v.id, !v.is_default)}
                        className={cn("p-1 rounded", v.is_default ? "text-primary" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
                        title={v.is_default ? "This is the default view" : "Make default"}
                      >
                        <Star className={cn("h-3.5 w-3.5", v.is_default && "fill-current")} />
                      </button>
                    )}
                    {onDeleteView && (
                      <button
                        type="button"
                        onClick={() => { if (confirm(`Delete "${v.name}"?`)) onDeleteView(v.id); }}
                        className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                        title="Delete view"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {onSaveCurrentAsView && (
                  <div className="border-t border-[var(--border)] mt-1 pt-1">
                    {!savePromptOpen ? (
                      <button
                        type="button"
                        onClick={() => setSavePromptOpen(true)}
                        className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-[var(--card)] text-primary"
                      >
                        + Save current as new view…
                      </button>
                    ) : (
                      <div className="px-2 py-1.5 space-y-1.5">
                        <input
                          autoFocus
                          type="text"
                          value={newViewName}
                          onChange={(e) => setNewViewName(e.target.value)}
                          placeholder="View name"
                          className="w-full text-sm px-2 py-1 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
                        />
                        <label className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <input type="checkbox" checked={newViewIsDefault} onChange={(e) => setNewViewIsDefault(e.target.checked)} />
                          Make this the default
                        </label>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!newViewName.trim()) return;
                              await onSaveCurrentAsView(newViewName.trim(), newViewIsDefault);
                              setNewViewName("");
                              setNewViewIsDefault(false);
                              setSavePromptOpen(false);
                              setViewsMenuOpen(false);
                            }}
                            className="flex-1 px-2 py-1 text-xs rounded bg-primary/15 text-white hover:opacity-90"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSavePromptOpen(false); setNewViewName(""); }}
                            className="px-2 py-1 text-xs rounded border border-[var(--border)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Filter */}
        <button
          type="button"
          onClick={() => { if (hasActiveFilters) clearAllFilters(); }}
          className={cn(
            "relative p-2 rounded-md transition-colors",
            hasActiveFilters
              ? "text-primary bg-primary/10"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
          )}
          title={hasActiveFilters ? "Clear all filters" : "Filters are set per column — click column headers"}
        >
          {hasActiveFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
        </button>

        {/* Section J3 — CSV export */}
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            className="p-2 rounded-md transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
            title="Export filtered rows as CSV"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
