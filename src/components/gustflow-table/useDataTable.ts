"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { ColumnDef, SortDir, ActiveFilter } from "./types";
import { COLUMN_TYPE_REGISTRY } from "./columnTypes";
import { TABLE_PAGE_SIZE } from "./shims";

const SESSION_PREFIX = "fn-table-";

function loadSession<T>(viewId: string, key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(`${SESSION_PREFIX}${viewId}-${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveSession(viewId: string, key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${SESSION_PREFIX}${viewId}-${key}`, JSON.stringify(value));
  } catch {
    // sessionStorage full — silent fail
  }
}

export interface UseDataTableState {
  // Sort — Section J1: array of priority-ordered entries (length 0..N).
  // Position 0 is primary, position 1 is secondary tie-breaker, etc.
  sort: Array<{ key: string; dir: SortDir }>;
  setSort: (s: Array<{ key: string; dir: SortDir }>) => void;
  /** Toggle behavior:
   *   - click on UNSORTED header: append to chain ASC
   *   - click on SORTED header (no shift): remove from chain
   *   - shift-click on SORTED header: flip dir
   *   - shift-click on UNSORTED header: append ASC (same as click)
   */
  toggleSort: (key: string, opts?: { shiftKey?: boolean }) => void;

  // Filter — flat per-column (legacy / default).
  filters: ActiveFilter[];
  setFilter: (key: string, value: string | string[]) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  /** Section J5 — when set, overrides the flat `filters` for evaluation.
   *  Lets the advanced filter builder describe AND/OR trees. */
  filterTree: import("./types").FilterGroup | null;
  setFilterTree: (tree: import("./types").FilterGroup | null) => void;

  // Search
  search: string;
  setSearch: (s: string) => void;
  searchOpen: boolean;
  toggleSearchOpen: () => void;

  // Column visibility
  hiddenColumns: Set<string>;
  toggleColumn: (key: string) => void;

  // Column order
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;

  // Column widths
  columnWidths: Record<string, number>;
  setColumnWidth: (key: string, width: number) => void;

  // Column config panel
  columnConfigOpen: string | null;
  openColumnConfig: (key: string) => void;
  closeColumnConfig: () => void;

  // Column wrap
  wrapColumns: Set<string>;
  toggleWrap: (key: string) => void;

  // Sprint 5.5 — group-by
  groupBy: string | null;
  setGroupBy: (key: string | null) => void;
  /** Toggled groups (collapsed). Empty set = all expanded. */
  collapsedGroups: Set<string>;
  toggleGroup: (value: string) => void;
  /** Grouped slices of processedData. Empty when groupBy is null. */
  groups: Array<{ value: string; rows: Record<string, unknown>[] }>;

  // Pagination
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  paginatedData: Record<string, unknown>[];

  // Derived
  processedData: Record<string, unknown>[];
  visibleColumns: ColumnDef[];
  orderedColumns: ColumnDef[];
  resultCount: number;
  /** Section J2 — footer aggregates keyed by column.key. Computed over
   *  processedData (post-search, post-filter) so totals reflect what the
   *  user is actually looking at. Only present for columns whose
   *  ColumnDef.aggregate is set. */
  footerValues: Record<string, string>;
  /** Section J7 — bulk-action selection state. Set of `row.id` for rows
   *  the user has ticked. Resets when the consumer says so (via
   *  `clearSelection`) or implicitly after a bulk action runs. */
  selectedIds: Set<string>;
  toggleSelected: (id: string) => void;
  toggleAllOnPage: () => void;
  selectAllInView: () => void;
  clearSelection: () => void;

  // Section J6 — view type (table / kanban / calendar).
  viewType: ViewType;
  setViewType: (v: ViewType) => void;
  /** Kanban grouping column key (a select / status / role / etc.). */
  kanbanGroupKey: string | null;
  setKanbanGroupKey: (key: string | null) => void;
  /** Calendar date column key (a date column). */
  calendarDateKey: string | null;
  setCalendarDateKey: (key: string | null) => void;

  // Section J4 — saved views.
  savedViews: SavedView[];
  refetchSavedViews: () => Promise<void>;
  /** Snapshot the user-mutable bits of state (sort/filters/hidden/order/widths/wrap/groupBy)
   *  in the same shape we persist to sessionStorage. Used by the
   *  consumer when posting a new saved view. */
  currentViewConfig: () => Record<string, unknown>;
  /** Apply a saved view's config to the live state (overwrites). */
  applyViewConfig: (config: Record<string, unknown>) => void;
}

export type SavedView = {
  id: string;
  table_key: string;
  name: string;
  config: Record<string, unknown>;
  is_default: boolean;
};

/** Section J6 — view types. */
export type ViewType = "table" | "kanban" | "calendar";

export function useDataTable(
  columns: ColumnDef[],
  data: Record<string, unknown>[],
  viewId?: string
): UseDataTableState {
  // --- View type (Section J6) ---
  const [viewType, setViewType] = useState<ViewType>("table");
  const [kanbanGroupKey, setKanbanGroupKey] = useState<string | null>(null);
  const [calendarDateKey, setCalendarDateKey] = useState<string | null>(null);

  // --- Saved views (Section J4) ---
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const viewsLoadedRef = useRef(false);
  useEffect(() => {
    if (viewsLoadedRef.current || !viewId) return;
    viewsLoadedRef.current = true;
    fetch(`/api/data-table-views?table_key=${encodeURIComponent(viewId)}`)
      .then((r) => (r.ok ? r.json() : { views: [] }))
      .then((j: { views: SavedView[] }) => {
        setSavedViews(j.views ?? []);
        // Auto-apply default view on first load.
        const def = (j.views ?? []).find((v) => v.is_default);
        if (def) {
          // Defer to next tick so initial state is settled.
          queueMicrotask(() => {
            // Apply the default config — replicate applyViewConfig inline here
            // since the closure can't reach the function defined later.
            const cfg = def.config;
            if (Array.isArray(cfg.sort)) setSortRaw(cfg.sort as Array<{ key: string; dir: SortDir }>);
            if (Array.isArray(cfg.filters)) setFiltersRaw(cfg.filters as ActiveFilter[]);
          });
        }
      })
      .catch(() => { /* silent — saved views are optional */ });
  }, [viewId]);

  // --- Selection (Section J7) ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }

  // --- Sort (Section J1: multi-column) ---
  const [sort, setSortRaw] = useState<Array<{ key: string; dir: SortDir }>>([]);

  function setSort(s: Array<{ key: string; dir: SortDir }>) {
    setSortRaw(s);
    if (viewId) saveSession(viewId, "sort", s);
  }

  function toggleSort(key: string, opts?: { shiftKey?: boolean }) {
    const idx = sort.findIndex((s) => s.key === key);
    if (idx === -1) {
      // Not in chain — append ASC.
      setSort([...sort, { key, dir: "asc" }]);
    } else if (opts?.shiftKey) {
      // Shift-click on sorted: flip dir in place.
      const next = [...sort];
      // idx !== -1 (else branch above) -> next[idx] is defined
      const cur = next[idx]!;
      next[idx] = { ...cur, dir: cur.dir === "asc" ? "desc" : "asc" };
      setSort(next);
    } else {
      // Plain click on sorted: remove from chain.
      setSort(sort.filter((s) => s.key !== key));
    }
  }

  // --- Filters ---
  const [filters, setFiltersRaw] = useState<ActiveFilter[]>([]);

  function setFilter(key: string, value: string | string[]) {
    setFiltersRaw((prev) => {
      const next = prev.filter((f) => f.key !== key);
      next.push({ key, value });
      if (viewId) saveSession(viewId, "filters", next);
      return next;
    });
  }

  function clearFilter(key: string) {
    setFiltersRaw((prev) => {
      const next = prev.filter((f) => f.key !== key);
      if (viewId) saveSession(viewId, "filters", next);
      return next;
    });
  }

  function clearAllFilters() {
    setFiltersRaw([]);
    if (viewId) saveSession(viewId, "filters", []);
  }

  // Section J5 — compound filter tree (overrides flat filters when set).
  const [filterTree, setFilterTreeRaw] = useState<import("./types").FilterGroup | null>(null);
  function setFilterTree(tree: import("./types").FilterGroup | null) {
    setFilterTreeRaw(tree);
  }

  const hasActiveFilters = filters.length > 0 || (filterTree?.children.length ?? 0) > 0;

  // --- Search (debounced) ---
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearchDebounced] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(searchInput), 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function setSearch(s: string) { setSearchInput(s); }
  function toggleSearchOpen() {
    setSearchOpen((prev) => {
      if (prev) { setSearchInput(""); setSearchDebounced(""); }
      return !prev;
    });
  }

  // --- Hidden columns ---
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    if (viewId) {
      const saved = loadSession<string[]>(viewId, "hidden", []);
      if (saved.length > 0) return new Set(saved);
    }
    return new Set(columns.filter((c) => c.hidden).map((c) => c.key));
  });

  function toggleColumn(key: string) {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (viewId) saveSession(viewId, "hidden", [...next]);
      return next;
    });
  }

  // --- Column order ---
  const [columnOrder, setColumnOrderRaw] = useState<string[]>(() => {
    if (viewId) {
      const saved = loadSession<string[]>(viewId, "order", []);
      if (saved.length > 0) return saved;
    }
    return columns.map((c) => c.key);
  });

  function setColumnOrder(order: string[]) {
    setColumnOrderRaw(order);
    if (viewId) saveSession(viewId, "order", order);
  }

  /**
   * Re-sync columnOrder when the columns prop changes. Without this, the
   * useState initializer above captures the FIRST render's keys and any
   * later schema additions get pushed to position 999 (end of row) by the
   * `orderedColumns` sort below.
   *
   * Two cases:
   *   - User has drag-reordered (sessionStorage has a saved order) → keep
   *     their custom order, but append any new keys at the end and drop
   *     any removed keys so the order stays valid.
   *   - No saved order → mirror the consumer's `columns` array so dynamic
   *     schemas render in the order their author intended.
   */
  const incomingKeys = columns.map((c) => c.key).join(",");
  useEffect(() => {
    setColumnOrderRaw((prev) => {
      const incoming = columns.map((c) => c.key);
      const incomingSet = new Set(incoming);

      // Same set, same order → no-op (avoid an unnecessary re-render)
      if (
        prev.length === incoming.length &&
        prev.every((k, i) => k === incoming[i])
      ) {
        return prev;
      }

      // Saved order present → preserve user reordering, just sync membership
      if (viewId) {
        const saved = loadSession<string[]>(viewId, "order", []);
        if (saved.length > 0) {
          const savedSet = new Set(saved);
          const kept = saved.filter((k) => incomingSet.has(k));
          const added = incoming.filter((k) => !savedSet.has(k));
          return [...kept, ...added];
        }
      }

      // No saved order → mirror the consumer's array
      return incoming;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingKeys, viewId]);

  // --- Column widths ---
  const [columnWidths, setColumnWidthsRaw] = useState<Record<string, number>>(() => {
    if (viewId) return loadSession<Record<string, number>>(viewId, "widths", {});
    return {};
  });

  function setColumnWidth(key: string, width: number) {
    setColumnWidthsRaw((prev) => {
      const next = { ...prev, [key]: width };
      if (viewId) saveSession(viewId, "widths", next);
      return next;
    });
  }

  // --- Column config panel ---
  const [columnConfigOpen, setColumnConfigOpen] = useState<string | null>(null);
  function openColumnConfig(key: string) { setColumnConfigOpen(key); }
  function closeColumnConfig() { setColumnConfigOpen(null); }

  // --- Column wrap ---
  const [wrapColumns, setWrapColumns] = useState<Set<string>>(() => {
    if (viewId) {
      const saved = loadSession<string[]>(viewId, "wrap", []);
      if (saved.length > 0) return new Set(saved);
    }
    return new Set<string>();
  });

  function toggleWrap(key: string) {
    setWrapColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (viewId) saveSession(viewId, "wrap", [...next]);
      return next;
    });
  }

  // --- Group-by (Sprint 5.5) ---
  const [groupBy, setGroupByRaw] = useState<string | null>(() => {
    if (viewId) return loadSession<string | null>(viewId, "groupBy", null);
    return null;
  });
  const [collapsedGroups, setCollapsedGroupsRaw] = useState<Set<string>>(() => {
    if (viewId) {
      const saved = loadSession<string[]>(viewId, "collapsedGroups", []);
      return new Set(saved);
    }
    return new Set();
  });

  function setGroupBy(key: string | null) {
    setGroupByRaw(key);
    if (viewId) saveSession(viewId, "groupBy", key);
    // Clear collapsed state when grouping changes — old keys won't apply
    // to the new column's values.
    setCollapsedGroupsRaw(new Set());
    if (viewId) saveSession(viewId, "collapsedGroups", []);
  }

  function toggleGroup(value: string) {
    setCollapsedGroupsRaw((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      if (viewId) saveSession(viewId, "collapsedGroups", [...next]);
      return next;
    });
  }

  // --- Hydrate persisted sort/filters on mount ---
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || !viewId) return;
    hydratedRef.current = true;
    // Hydrate sort. Backwards-compat: if a single-entry object is found,
    // upgrade it to the new array shape.
    const savedSortAny = loadSession<unknown>(viewId, "sort", null);
    if (Array.isArray(savedSortAny)) {
      setSortRaw(savedSortAny as Array<{ key: string; dir: SortDir }>);
    } else if (savedSortAny && typeof savedSortAny === "object" && "key" in savedSortAny) {
      const legacy = savedSortAny as { key: string; dir: SortDir };
      setSortRaw([{ key: legacy.key, dir: legacy.dir }]);
    }
    const savedFilters = loadSession<ActiveFilter[]>(viewId, "filters", []);
    if (savedFilters.length > 0) setFiltersRaw(savedFilters);
  }, [viewId]);

  // --- Visible columns (not hidden) ---
  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(c.key)),
    [columns, hiddenColumns]
  );

  // --- Ordered columns ---
  const orderedColumns = useMemo(() => {
    const orderMap = new Map(columnOrder.map((k, i) => [k, i]));
    return [...visibleColumns].sort((a, b) => {
      const ai = orderMap.get(a.key) ?? 999;
      const bi = orderMap.get(b.key) ?? 999;
      return ai - bi;
    });
  }, [visibleColumns, columnOrder]);

  // --- Process data: search → filter → sort ---
  const processedData = useMemo(() => {
    let result = [...data];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const entry = COLUMN_TYPE_REGISTRY[col.type];
          const v = row[col.key];
          return entry.matchesSearch(v, q);
        })
      );
    }

    // Filters — Section J5. When a filterTree is set, evaluate the tree.
    // Otherwise the flat filters[] (legacy) all-AND.
    if (filterTree) {
      function evalNode(node: import("./types").FilterNode, row: Record<string, unknown>): boolean {
        if (node.kind === "leaf") {
          const col = columns.find((c) => c.key === node.key);
          if (!col) return true;
          const entry = COLUMN_TYPE_REGISTRY[col.type];
          return entry.matchesFilter(row[node.key], node.value);
        }
        // group
        if (node.children.length === 0) return true;
        if (node.op === "AND") return node.children.every((c) => evalNode(c, row));
        return node.children.some((c) => evalNode(c, row));
      }
      result = result.filter((row) => evalNode(filterTree, row));
    } else {
      for (const { key, value } of filters) {
        const col = columns.find((c) => c.key === key);
        if (!col) continue;
        const entry = COLUMN_TYPE_REGISTRY[col.type];
        result = result.filter((row) => entry.matchesFilter(row[key], value));
      }
    }

    // Sort — multi-column chain. Iterate sort entries in order; first
    // non-zero comparison wins. Ties fall through to the next entry.
    if (sort.length > 0) {
      result.sort((a, b) => {
        for (const s of sort) {
          const col = columns.find((c) => c.key === s.key);
          if (!col) continue;
          const entry = COLUMN_TYPE_REGISTRY[col.type];
          if (!entry) continue;
          const cmp = entry.sortFn(a[s.key], b[s.key]);
          if (cmp !== 0) return s.dir === "asc" ? cmp : -cmp;
        }
        return 0;
      });
    }

    return result;
  }, [data, search, filters, sort, columns]);

  // --- Pagination ---
  const [page, setPageRaw] = useState(1);

  // M13 — reset to page 1 when search or filters CONTENT changes.
  // Was using identity comparison (!==) which fired on every parent
  // re-render that produced a new array reference, even when content
  // was identical. Now compares serialised content so users keep their
  // pagination state across unrelated re-renders.
  // FE-14 — also reset when the J5 filterTree CONTENT changes; without
  // this, deep refinements that drop the result below the current page
  // left `page` stale, so loosening the filter jumped back to the high
  // page instead of resetting to 1.
  const prevSearchRef = useRef(search);
  const prevFiltersKeyRef = useRef(JSON.stringify(filters));
  const prevFilterTreeKeyRef = useRef(JSON.stringify(filterTree));
  useEffect(() => {
    const filtersKey = JSON.stringify(filters);
    const filterTreeKey = JSON.stringify(filterTree);
    if (
      prevSearchRef.current !== search ||
      prevFiltersKeyRef.current !== filtersKey ||
      prevFilterTreeKeyRef.current !== filterTreeKey
    ) {
      setPageRaw(1);
      prevSearchRef.current = search;
      prevFiltersKeyRef.current = filtersKey;
      prevFilterTreeKeyRef.current = filterTreeKey;
    }
  }, [search, filters, filterTree]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / TABLE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  function setPage(p: number) {
    setPageRaw(Math.max(1, Math.min(p, totalPages)));
  }

  const paginatedData = useMemo(
    () => processedData.slice((safePage - 1) * TABLE_PAGE_SIZE, safePage * TABLE_PAGE_SIZE),
    [processedData, safePage]
  );

  // Section J2 — footer aggregates over processedData. Sum/avg/min/max
  // coerce values via Number(); non-numeric values are skipped. Count
  // counts every row (regardless of cell value) — matches user expectations
  // for "how many rows" in the filtered set.
  const footerValues = useMemo<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const col of columns) {
      if (!col.aggregate) continue;
      const values = processedData.map((row) => row[col.key]);
      if (col.aggregate === "count") {
        out[col.key] = String(values.length);
        continue;
      }
      const nums: number[] = [];
      for (const v of values) {
        if (v == null || v === "") continue;
        const n = Number(v);
        if (Number.isFinite(n)) nums.push(n);
      }
      if (nums.length === 0) {
        out[col.key] = "—";
        continue;
      }
      let result: number;
      if (col.aggregate === "sum") result = nums.reduce((a, b) => a + b, 0);
      else if (col.aggregate === "avg") result = nums.reduce((a, b) => a + b, 0) / nums.length;
      else if (col.aggregate === "min") result = Math.min(...nums);
      else result = Math.max(...nums);
      // Format: integers stay int, fractions limited to 2 decimal places.
      out[col.key] = Number.isInteger(result) ? String(result) : result.toFixed(2);
    }
    return out;
  }, [processedData, columns]);

  // Sprint 5.5 — derive groups from processedData (NOT paginatedData,
  // because we want all rows in a group regardless of page boundaries).
  // When groupBy is null, this is empty and the consumer renders rows
  // ungrouped.
  const groups = useMemo(() => {
    if (!groupBy) return [];
    const map = new Map<string, Record<string, unknown>[]>();
    for (const row of processedData) {
      const raw = row[groupBy];
      const key =
        raw == null || raw === ""
          ? "—"
          : typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean"
            ? String(raw)
            : JSON.stringify(raw);
      const bucket = map.get(key);
      if (bucket) bucket.push(row);
      else map.set(key, [row]);
    }
    return Array.from(map.entries())
      .map(([value, rows]) => ({ value, rows }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [processedData, groupBy]);

  return {
    sort,
    setSort,
    toggleSort,
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    filterTree,
    setFilterTree,
    search: searchInput,
    setSearch,
    searchOpen,
    toggleSearchOpen,
    hiddenColumns,
    toggleColumn,
    columnOrder,
    setColumnOrder,
    columnWidths,
    setColumnWidth,
    columnConfigOpen,
    openColumnConfig,
    closeColumnConfig,
    wrapColumns,
    toggleWrap,
    groupBy,
    setGroupBy,
    collapsedGroups,
    toggleGroup,
    groups,
    page: safePage,
    setPage,
    totalPages,
    paginatedData,
    processedData,
    visibleColumns,
    orderedColumns,
    resultCount: processedData.length,
    footerValues,
    viewType,
    setViewType,
    kanbanGroupKey,
    setKanbanGroupKey,
    calendarDateKey,
    setCalendarDateKey,
    savedViews,
    refetchSavedViews: async () => {
      if (!viewId) return;
      try {
        const r = await fetch(`/api/data-table-views?table_key=${encodeURIComponent(viewId)}`);
        if (r.ok) {
          const j = await r.json();
          setSavedViews((j.views ?? []) as SavedView[]);
        }
      } catch { /* silent */ }
    },
    currentViewConfig: () => ({
      sort,
      filters,
      hiddenColumns: Array.from(hiddenColumns),
      columnOrder,
      columnWidths,
      wrapColumns: Array.from(wrapColumns),
      groupBy,
    }),
    applyViewConfig: (cfg: Record<string, unknown>) => {
      if (Array.isArray(cfg.sort)) setSortRaw(cfg.sort as Array<{ key: string; dir: SortDir }>);
      if (Array.isArray(cfg.filters)) setFiltersRaw(cfg.filters as ActiveFilter[]);
      if (Array.isArray(cfg.hiddenColumns)) setHiddenColumns(new Set(cfg.hiddenColumns as string[]));
      if (Array.isArray(cfg.columnOrder)) setColumnOrderRaw(cfg.columnOrder as string[]);
      if (cfg.columnWidths && typeof cfg.columnWidths === "object") setColumnWidthsRaw(cfg.columnWidths as Record<string, number>);
      if (Array.isArray(cfg.wrapColumns)) setWrapColumns(new Set(cfg.wrapColumns as string[]));
      if (typeof cfg.groupBy === "string" || cfg.groupBy === null) setGroupByRaw(cfg.groupBy as string | null);
    },
    selectedIds,
    toggleSelected,
    toggleAllOnPage: () => {
      setSelectedIds((prev) => {
        // If every visible row on this page is selected, clear; otherwise add them all.
        const pageIds = paginatedData.map((r) => r.id as string).filter(Boolean);
        const allSelected = pageIds.every((id) => prev.has(id));
        const next = new Set(prev);
        if (allSelected) for (const id of pageIds) next.delete(id);
        else for (const id of pageIds) next.add(id);
        return next;
      });
    },
    selectAllInView: () => {
      const ids = processedData.map((r) => r.id as string).filter(Boolean);
      setSelectedIds(new Set(ids));
    },
    clearSelection,
  };
}
