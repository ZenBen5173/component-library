import type { ReactNode, ComponentType } from "react";

// --- Sort & Filter primitives ---

export type SortDir = "asc" | "desc";

export type ActiveFilter = {
  key: string;
  value: string | string[];
};

/**
 * Section J5 — compound filter logic. The tree is rooted at a single
 * AND/OR group; children can be nested groups or leaves. The plain
 * flat-AND case (every existing consumer) round-trips as a single
 * top-level AND group whose children are all leaves.
 */
export type FilterLeaf = ActiveFilter & { kind: "leaf" };
export type FilterGroup = { kind: "group"; op: "AND" | "OR"; children: FilterNode[] };
export type FilterNode = FilterLeaf | FilterGroup;

/** Empty tree shorthand. */
export const EMPTY_FILTER_TREE: FilterGroup = { kind: "group", op: "AND", children: [] };

/** Coerce an existing flat ActiveFilter[] into a top-level AND group. */
export function activeFiltersToTree(filters: ActiveFilter[]): FilterGroup {
  return {
    kind: "group",
    op: "AND",
    children: filters.map((f) => ({ kind: "leaf", key: f.key, value: f.value })),
  };
}

/** Pull every leaf out of the tree (regardless of nesting). Used by
 *  per-column header checks for "is this column filtered?". */
export function collectLeaves(node: FilterNode): FilterLeaf[] {
  if (node.kind === "leaf") return [node];
  return node.children.flatMap(collectLeaves);
}

// --- Column types ---

export const COLUMN_TYPES = [
  "text", "title", "number", "status", "date", "boolean", "badge",
  "person", "department", "record", "priority", "role", "actions",
] as const;

// "title" is kept in the union for backward compat but treated as "text" with clickable styling.
// Use DataTable's titleKey prop instead of type: "title" for new code.

export type ColumnType = (typeof COLUMN_TYPES)[number];

export type SelectOption = { value: string; label: string };

export interface ActionDef {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick: (row: Record<string, unknown>) => void;
  variant?: "default" | "destructive";
  show?: (row: Record<string, unknown>) => boolean;
}

// --- Column definition ---

export type ColumnAggregate = "sum" | "avg" | "count" | "min" | "max";

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
  editable?: boolean;
  options?: SelectOption[];
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  width?: number;
  actions?: ActionDef[];
  renderCell?: (value: unknown, row: Record<string, unknown>) => ReactNode;
  /**
   * Section J2 — aggregation footer. When set, the table renders a sticky
   * footer row showing this aggregate over the post-filter rows. `count`
   * works for any column type; `sum`/`avg`/`min`/`max` only meaningful
   * on numeric columns.
   */
  aggregate?: ColumnAggregate;
}

// --- DataTable props ---

export interface DataTableProps {
  columns: ColumnDef[];
  data: Record<string, unknown>[];
  onRowClick?: ((row: Record<string, unknown>) => void) | null;
  onEdit?: (rowId: string, key: string, value: unknown) => Promise<void> | void;
  /** Which column key is the primary clickable title. Gets bold text + click handler. Defaults to first column with type "title", or first column. */
  titleKey?: string;
  viewId?: string;
  loading?: boolean;
  emptyState?: ReactNode;
  searchable?: boolean;
  paginated?: boolean;
  /**
   * Sprint 4.3 — sticky-pin the first non-actions column to the left so
   * it stays visible when the table scrolls horizontally. Off by default.
   */
  frozenFirstColumn?: boolean;
  /**
   * Section J3 — when set (truthy), the toolbar exposes an "Export CSV"
   * button that downloads the current filtered/sorted/visible row set.
   * String value is used as the download filename prefix (e.g.
   * "supplier-list" → "supplier-list-2026-04-28.csv"). `true` falls back
   * to "export".
   */
  exportable?: boolean | string;
  /**
   * Section J7 — bulk actions. When set, an extra checkbox column is
   * added at the leftmost position. Selecting rows reveals a toolbar
   * action menu. v1 supports bulk-delete; bulk-edit can be added by
   * passing a future `onEdit` member.
   */
  bulkActions?: {
    onDelete?: (rowIds: string[]) => Promise<void> | void;
  };
}
