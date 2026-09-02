import type { ReactNode, ComponentType } from "react";

// --- Sort & Filter primitives ---

export type SortDir = "asc" | "desc";

/**
 * How a text filter compares. Notion's set, and the reason a filter box on its
 * own is not enough: "contains" cannot express "is exactly", and neither can
 * express "is empty", which is usually the one you actually want.
 */
export const FILTER_OPERATORS = [
  { value: "is", label: "Is" },
  { value: "is_not", label: "Is not" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does not contain" },
  { value: "starts_with", label: "Starts with" },
  { value: "ends_with", label: "Ends with" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
] as const;

export type FilterOperator =
  | (typeof FILTER_OPERATORS)[number]["value"]
  | "gt" | "gte" | "lt" | "lte"
  | "before" | "after" | "on_or_before" | "on_or_after"
  | "is_checked" | "is_unchecked";

/**
 * The conditions each kind of column can be asked about.
 *
 * A number does not "contain" anything and a checkbox is never "greater
 * than" — offering every operator everywhere means most of the menu is
 * nonsense for the column you are actually filtering.
 */
export const OPERATORS_BY_TYPE: Record<string, { value: FilterOperator; label: string }[]> = {
  text: [...FILTER_OPERATORS],
  number: [
    { value: "is", label: "=" },
    { value: "is_not", label: "≠" },
    { value: "gt", label: ">" },
    { value: "gte", label: "≥" },
    { value: "lt", label: "<" },
    { value: "lte", label: "≤" },
    { value: "is_empty", label: "Is empty" },
    { value: "is_not_empty", label: "Is not empty" },
  ],
  select: [
    { value: "is", label: "Is" },
    { value: "is_not", label: "Is not" },
    { value: "is_empty", label: "Is empty" },
    { value: "is_not_empty", label: "Is not empty" },
  ],
  multi_select: [
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does not contain" },
    { value: "is_empty", label: "Is empty" },
    { value: "is_not_empty", label: "Is not empty" },
  ],
  date: [
    { value: "is", label: "Is" },
    { value: "before", label: "Is before" },
    { value: "after", label: "Is after" },
    { value: "on_or_before", label: "Is on or before" },
    { value: "on_or_after", label: "Is on or after" },
    { value: "is_empty", label: "Is empty" },
    { value: "is_not_empty", label: "Is not empty" },
  ],
  checkbox: [
    { value: "is_checked", label: "Is checked" },
    { value: "is_unchecked", label: "Is unchecked" },
  ],
};

/** Which set a column type draws from. */
export function operatorsFor(type: string): { value: FilterOperator; label: string }[] {
  if (type === "number") return OPERATORS_BY_TYPE.number!;
  if (type === "checkbox" || type === "boolean") return OPERATORS_BY_TYPE.checkbox!;
  if (type === "date" || type === "created_time" || type === "last_edited_time")
    return OPERATORS_BY_TYPE.date!;
  if (type === "multi_select" || type === "department") return OPERATORS_BY_TYPE.multi_select!;
  if (["select", "status", "badge", "priority", "role"].includes(type))
    return OPERATORS_BY_TYPE.select!;
  return OPERATORS_BY_TYPE.text!;
}

/**
 * One line of the filter builder.
 *
 * Carries its own id because two rules can name the same column — "created
 * after March and before June" is one column, two rules — and keying on the
 * column would collapse them into one.
 */
export type FilterRule = {
  id: string;
  key: string;
  op: FilterOperator;
  value: string | string[];
};

/** How the rules combine. Notion's simple mode: one word for the whole set. */
export type FilterConjunction = "and" | "or";

/** The ones that ask about presence or state rather than content. */
export const VALUELESS_OPERATORS: FilterOperator[] = [
  "is_empty",
  "is_not_empty",
  "is_checked",
  "is_unchecked",
];

/**
 * How a text filter compares. Notion's set, and the reason a filter box on its
 * own is not enough: "contains" cannot express "is exactly", and neither can
 * express "is empty", which is usually the one you actually want.
 */
// --- Column types ---

export const COLUMN_TYPES = [
  // Notion's property types, less the two that cannot stand alone.
  "text", "number", "select", "multi_select", "status", "date", "person",
  "files", "checkbox", "url", "email", "phone",
  "created_time", "created_by", "last_edited_time", "last_edited_by",
  "button", "place", "id",
  // Earlier names, kept so existing tables keep working. Each behaves as the
  // Notion type it corresponds to.
  "title", "boolean", "badge", "department", "record", "priority", "role",
  "actions",
] as const;

/**
 * The types offered in the header's "Change type" menu, in Notion's order.
 *
 * Formula and Relation are absent by request. Rollup is absent because it
 * cannot be built: a rollup summarises values reached through a relation, and
 * with no relations there is nothing for it to reach.
 */
export const CHANGEABLE_COLUMN_TYPES = [
  "text", "number", "select", "multi_select", "status", "date", "person",
  "files", "checkbox", "url", "email", "phone",
  "created_time", "created_by", "last_edited_time", "last_edited_by",
  "button", "place", "id",
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
  /**
   * A lucide icon name, e.g. "rocket". Overrides the icon the type would
   * otherwise pick, so two Select columns need not look identical.
   */
  icon?: string;
  /**
   * `id` columns only. Prepended to the stored value, so the underlying data
   * stays a bare number or key and the label above it can change without a
   * migration — which is the whole reason Notion keeps the prefix on the
   * property rather than in the value.
   */
  idPrefix?: string;
  /** `button` columns only: what the cell's button says and does. */
  button?: {
    label: string;
    onClick: (row: Record<string, unknown>) => void;
  };
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
  /**
   * How a row identifies itself. Selection, React keys and edit callbacks all
   * go through this. Defaults to `row.id` — which the port assumed outright,
   * so a dataset keyed on `uuid` or `sku` silently lost its selection state.
   */
  rowId?: (row: Record<string, unknown>) => string;
  /**
   * Hand this in and the property menu can rename a column and change its
   * type; leave it out and those two rows are not offered, because there
   * would be nowhere to put the result.
   */
  onColumnsChange?: (next: ColumnDef[]) => void;
  loading?: boolean;
  emptyState?: ReactNode;
  searchable?: boolean;
  /**
   * Page the rows. On by default. Turning it off renders the whole result set
   * into the virtualised body instead — which the flag used to claim to do and
   * did not, because nothing read it.
   */
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
  /**
   * Rows per page. Was fixed at 25 inside a shim, so every table in every app
   * got the same page length regardless of row height or screen.
   */
  pageSize?: number;
  bulkActions?: {
    onDelete?: (rowIds: string[]) => Promise<void> | void;
    /**
     * Asked before a bulk delete runs. Defaults to `window.confirm`, which
     * blocks the tab and looks nothing like the rest of an app — pass your own
     * dialog and return whether the user agreed.
     */
    confirmDelete?: (count: number) => Promise<boolean> | boolean;
  };
}
