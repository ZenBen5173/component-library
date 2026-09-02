"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type {
  ColumnDef,
  ColumnAggregate,
  SortDir,
  FilterConjunction,
  FilterRule,
} from "./types";
import { COLUMN_TYPE_REGISTRY, makeMatcher } from "./columnTypes";
import { TABLE_PAGE_SIZE } from "./shims";

const SESSION_PREFIX = "fn-table-";

/** Built once — see the note on COLLATOR in columnTypes. */
const GROUP_COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

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

  clearAllFilters: () => void;
  hasActiveFilters: boolean;

  /**
   * The filter builder's rules, and the single word that joins them. Notion's
   * simple mode: any number of lines, all AND or all OR.
   */
  rules: FilterRule[];
  setRules: (rules: FilterRule[]) => void;
  conjunction: FilterConjunction;
  setConjunction: (c: FilterConjunction) => void;

  /** Which calculation each column shows in the footer, if any. */
  aggregates: Record<string, ColumnAggregate | undefined>;
  setAggregate: (key: string, agg: ColumnAggregate | undefined) => void;

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

  /** Snapshot the user-mutable bits of state (sort/filters/hidden/order/widths/wrap/groupBy)
   *  in the same shape we persist to sessionStorage. Used by the
   *  consumer when posting a new saved view. */
  currentViewConfig: () => Record<string, unknown>;
}

/** Section J6 — view types. */
export type ViewType = "table" | "kanban" | "calendar";

export interface UseDataTableOptions {
  /** Namespace for persisted state and saved views. Omit and nothing sticks. */
  viewId?: string;
  /**
   * Rows per page. Was a fixed 25 baked into a shim, which meant every table
   * in every app got the same page length whatever the row height or the
   * screen.
   */
  pageSize?: number;
  /** Off renders the whole result set rather than a page of it. */
  paginated?: boolean;
  /** How a row identifies itself. Defaults to `row.id`. */
  rowId?: (row: Record<string, unknown>) => string;
}

const defaultRowId = (row: Record<string, unknown>) => String(row.id ?? "");

export function useDataTable(
  columns: ColumnDef[],
  data: Record<string, unknown>[],
  options: UseDataTableOptions = {},
): UseDataTableState {
  const {
    viewId,
    pageSize = TABLE_PAGE_SIZE,
    paginated = true,
    rowId = defaultRowId,
  } = options;

  // --- View type (Section J6) ---
  const [viewType, setViewType] = useState<ViewType>("table");
  const [kanbanGroupKey, setKanbanGroupKey] = useState<string | null>(null);
  const [calendarDateKey, setCalendarDateKey] = useState<string | null>(null);

  /** Whether the remembered view state has been applied yet. */
  const hydratedRef = useRef(false);

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

  // The filter builder's own state.
  const [rules, setRulesRaw] = useState<FilterRule[]>([]);
  const [conjunction, setConjunctionRaw] = useState<FilterConjunction>("and");

  function setRules(next: FilterRule[]) {
    setRulesRaw(next);
    if (viewId) saveSession(viewId, "rules", next);
  }
  function setConjunction(next: FilterConjunction) {
    setConjunctionRaw(next);
    if (viewId) saveSession(viewId, "conjunction", next);
  }

  /**
   * Which calculation sits under each column.
   *
   * Held here rather than on the column definition so choosing one is a view
   * decision like sorting is — it does not need the consumer to own and write
   * back its columns. Seeded from whatever the definitions declare.
   */
  const [aggregates, setAggregates] = useState<Record<string, ColumnAggregate | undefined>>(
    () => Object.fromEntries(columns.filter((c) => c.aggregate).map((c) => [c.key, c.aggregate])),
  );

  function setAggregate(key: string, agg: ColumnAggregate | undefined) {
    setAggregates((prev) => {
      const next = { ...prev, [key]: agg };
      if (viewId) saveSession(viewId, "aggregates", next);
      return next;
    });
  }

  const hasActiveFilters = rules.length > 0;

  function clearAllFilters() {
    setRules([]);
  }

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
  // Seeded from the column definitions only. Anything remembered from a
  // previous visit is applied after mount — see the hydration effect below.
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.hidden).map((c) => c.key)),
  );

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
  const [columnOrder, setColumnOrderRaw] = useState<string[]>(() =>
    columns.map((c) => c.key),
  );

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

      // Saved order present → preserve user reordering, just sync membership.
      // Only once hydration has run, or this would apply the remembered order
      // during the first render and reintroduce the mismatch.
      if (viewId && hydratedRef.current) {
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
  const [columnWidths, setColumnWidthsRaw] = useState<Record<string, number>>({});

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
  const [wrapColumns, setWrapColumns] = useState<Set<string>>(() => new Set<string>());

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
  const [groupBy, setGroupByRaw] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroupsRaw] = useState<Set<string>>(
    () => new Set<string>(),
  );

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

  /**
   * Everything remembered from a previous visit, applied after mount.
   *
   * None of it may be read while the first render is happening. The server has
   * no sessionStorage, so it renders the columns as declared; a browser that
   * remembers a different order would then render something else and React
   * would throw the server's HTML away — which is exactly what happened, with
   * the last column arriving as "ID" on the client and "Last edited time" from
   * the server. Reading it here instead means both sides start identical and
   * the remembered state is applied a beat later.
   */
  useEffect(() => {
    if (hydratedRef.current || !viewId) return;
    hydratedRef.current = true;

    const savedHidden = loadSession<string[]>(viewId, "hidden", []);
    if (savedHidden.length > 0) setHiddenColumns(new Set(savedHidden));

    const savedOrder = loadSession<string[]>(viewId, "order", []);
    if (savedOrder.length > 0) setColumnOrderRaw(savedOrder);

    const savedWidths = loadSession<Record<string, number>>(viewId, "widths", {});
    if (Object.keys(savedWidths).length > 0) setColumnWidthsRaw(savedWidths);

    const savedWrap = loadSession<string[]>(viewId, "wrap", []);
    if (savedWrap.length > 0) setWrapColumns(new Set(savedWrap));

    const savedGroupBy = loadSession<string | null>(viewId, "groupBy", null);
    if (savedGroupBy) setGroupByRaw(savedGroupBy);

    const savedCollapsed = loadSession<string[]>(viewId, "collapsedGroups", []);
    if (savedCollapsed.length > 0) setCollapsedGroupsRaw(new Set(savedCollapsed));
    // Hydrate sort. Backwards-compat: if a single-entry object is found,
    // upgrade it to the new array shape.
    const savedSortAny = loadSession<unknown>(viewId, "sort", null);
    if (Array.isArray(savedSortAny)) {
      setSortRaw(savedSortAny as Array<{ key: string; dir: SortDir }>);
    } else if (savedSortAny && typeof savedSortAny === "object" && "key" in savedSortAny) {
      const legacy = savedSortAny as { key: string; dir: SortDir };
      setSortRaw([{ key: legacy.key, dir: legacy.dir }]);
    }
    const savedRules = loadSession<FilterRule[]>(viewId, "rules", []);
    if (savedRules.length > 0) setRulesRaw(savedRules);
    const savedConjunction = loadSession<FilterConjunction | null>(viewId, "conjunction", null);
    if (savedConjunction) setConjunctionRaw(savedConjunction);
    const savedAggregates = loadSession<Record<string, ColumnAggregate> | null>(
      viewId,
      "aggregates",
      null,
    );
    if (savedAggregates) setAggregates(savedAggregates);
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
    // Column lookups were `columns.find(...)` inside the comparator and the
    // filter predicate — both run per row, and the comparator runs O(n log n)
    // times, so every comparison walked the column list again. On ten
    // thousand rows that is roughly a million needless scans per sort.
    const byKey = new Map(columns.map((c) => [c.key, c]));

    // Not copied yet: filters return new arrays anyway, and only the sort
    // below mutates. Copying up front duplicates the whole dataset on every
    // recompute even when nothing is sorted.
    let result: Record<string, unknown>[] = data;

    // Search. The key and its matcher are paired up once rather than looked
    // up per column per row — at fifty thousand rows and nineteen columns
    // that is a million registry lookups saved on every keystroke.
    if (search) {
      const q = search.toLowerCase();
      const searchable = columns.map((col) => ({
        key: col.key,
        matches: COLUMN_TYPE_REGISTRY[col.type].matchesSearch,
      }));
      result = result.filter((row) =>
        searchable.some((col) => col.matches(row[col.key], q)),
      );
    }

    // The builder's rules, joined by the one conjunction. Evaluated before
    // anything else so an OR set is not silently ANDed with a column filter.
    if (rules.length > 0) {
      // Each rule becomes a ready-made test once, not once per row.
      const tests = rules
        .map((rule) => {
          const col = byKey.get(rule.key);
          return col
            ? { key: rule.key, matches: makeMatcher(rule.op, rule.value, col.type) }
            : null;
        })
        .filter((t): t is { key: string; matches: (v: unknown) => boolean } => t !== null);

      if (tests.length > 0) {
        result =
          conjunction === "and"
            ? result.filter((row) => tests.every((t) => t.matches(row[t.key])))
            : result.filter((row) => tests.some((t) => t.matches(row[t.key])));
      }
    }

    // Sort — multi-column chain. Iterate sort entries in order; first
    // non-zero comparison wins. Ties fall through to the next entry.
    if (sort.length > 0) {
      // Resolved once, outside the comparator.
      const chain = sort
        .map((s) => {
          const col = byKey.get(s.key);
          const entry = col ? COLUMN_TYPE_REGISTRY[col.type] : undefined;
          return entry ? { key: s.key, dir: s.dir, sortFn: entry.sortFn } : null;
        })
        .filter((x): x is { key: string; dir: "asc" | "desc"; sortFn: (a: unknown, b: unknown) => number } => x !== null);

      // Copy here, and only here — sort mutates in place, and `result` may
      // still be the caller's array if nothing filtered it.
      result = [...result].sort((a, b) => {
        for (const s of chain) {
          const cmp = s.sortFn(a[s.key], b[s.key]);
          if (cmp !== 0) return s.dir === "asc" ? cmp : -cmp;
        }
        return 0;
      });
    }

    return result;
    // filterTree belongs here: it is read above, and without it a changed
    // tree returned the cached result — nested AND/OR filters simply did not
    // apply until some unrelated change happened to invalidate the memo.
  }, [data, search, rules, conjunction, sort, columns]);

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
  const prevRulesKeyRef = useRef(JSON.stringify(rules) + conjunction);
  useEffect(() => {
    const rulesKey = JSON.stringify(rules) + conjunction;
    if (prevSearchRef.current !== search || prevRulesKeyRef.current !== rulesKey) {
      setPageRaw(1);
      prevSearchRef.current = search;
      prevRulesKeyRef.current = rulesKey;
    }
  }, [search, rules, conjunction]);

  const totalPages = paginated
    ? Math.max(1, Math.ceil(processedData.length / pageSize))
    : 1;
  const safePage = Math.min(page, totalPages);

  function setPage(p: number) {
    setPageRaw(Math.max(1, Math.min(p, totalPages)));
  }

  // Unpaginated hands the whole set to the virtualiser, which only ever builds
  // DOM for the rows in view — so this stays viable well past what a page of
  // twenty-five is for.
  const paginatedData = useMemo(
    () =>
      paginated
        ? processedData.slice((safePage - 1) * pageSize, safePage * pageSize)
        : processedData,
    [processedData, safePage, pageSize, paginated]
  );

  // Section J2 — footer aggregates over processedData. Sum/avg/min/max
  // coerce values via Number(); non-numeric values are skipped. Count
  // counts every row (regardless of cell value) — matches user expectations
  // for "how many rows" in the filtered set.
  const footerValues = useMemo<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const col of columns) {
      const agg = aggregates[col.key];
      if (!agg) continue;
      const values = processedData.map((row) => row[col.key]);
      if (agg === "count") {
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
      if (agg === "sum") result = nums.reduce((a, b) => a + b, 0);
      else if (agg === "avg") result = nums.reduce((a, b) => a + b, 0) / nums.length;
      else if (agg === "min") result = Math.min(...nums);
      else result = Math.max(...nums);
      // Format: integers stay int, fractions limited to 2 decimal places.
      out[col.key] = Number.isInteger(result) ? String(result) : result.toFixed(2);
    }
    return out;
  }, [processedData, columns, aggregates]);

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
      .sort((a, b) => GROUP_COLLATOR.compare(a.value, b.value));
  }, [processedData, groupBy]);

  function currentViewConfig(): Record<string, unknown> {
    return {
      sort,
      rules,
      conjunction,
      hiddenColumns: Array.from(hiddenColumns),
      columnOrder,
      columnWidths,
      wrapColumns: Array.from(wrapColumns),
      groupBy,
    };
  }

  return {
    sort,
    setSort,
    toggleSort,
    clearAllFilters,
    hasActiveFilters,
    rules,
    setRules,
    conjunction,
    setConjunction,
    aggregates,
    setAggregate,
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
    currentViewConfig,
    selectedIds,
    toggleSelected,
    toggleAllOnPage: () => {
      setSelectedIds((prev) => {
        // If every visible row on this page is selected, clear; otherwise add them all.
        const pageIds = paginatedData.map(rowId).filter(Boolean);
        const allSelected = pageIds.every((id) => prev.has(id));
        const next = new Set(prev);
        if (allSelected) for (const id of pageIds) next.delete(id);
        else for (const id of pageIds) next.add(id);
        return next;
      });
    },
    selectAllInView: () => {
      setSelectedIds(new Set(processedData.map(rowId).filter(Boolean)));
    },
    clearSelection,
  };
}
