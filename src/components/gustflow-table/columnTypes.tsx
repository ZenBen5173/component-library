"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import { Check, X as XIcon } from "lucide-react";
import { StatusBadge } from "./shims";
import { PriorityBadge } from "./shims";
import { RoleBadge } from "./shims";
import { Badge } from "./shims";
import { Avatar } from "./shims";
import { TASK_STATUSES, type TaskStatus } from "./shims";
import { PRIORITIES, type Priority } from "./shims";
import { ROLES, type Role } from "./shims";
import type { ColumnType, SelectOption } from "./types";

// --- Filter types ---

export type FilterType = "text" | "select" | "date-range" | "toggle" | "none";

// --- Type entry ---

export interface ColumnTypeEntry {
  defaultEditable: boolean;
  renderCell: (value: unknown, row: Record<string, unknown>) => ReactNode;
  renderEditCell: (
    value: unknown,
    onCommit: (newValue: unknown) => void,
    onCancel: () => void,
    options?: SelectOption[]
  ) => ReactNode;
  sortFn: (a: unknown, b: unknown) => number;
  filterType: FilterType;
  matchesFilter: (cellValue: unknown, filterValue: string | string[]) => boolean;
  matchesSearch: (cellValue: unknown, query: string) => boolean;
}

// --- Helpers ---

function toString(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

function defaultSearch(v: unknown, q: string): boolean {
  return toString(v).toLowerCase().includes(q);
}

function strCompare(a: unknown, b: unknown): number {
  return toString(a).toLowerCase().localeCompare(toString(b).toLowerCase(), undefined, { numeric: true });
}

const INPUT_CLASS =
  "w-full h-7 px-1.5 text-sm border border-[var(--primary)] rounded bg-[var(--background)] text-[var(--foreground)] outline-none";

// --- Status sort order ---

const STATUS_ORDER: Record<string, number> = {};
TASK_STATUSES.forEach((s, i) => {
  STATUS_ORDER[s] = i;
});

// --- Priority sort order: critical > high > medium > low ---

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// --- Person helper ---

function getPersonName(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "name" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>).name ?? "");
  }
  return "";
}

function getPersonAvatar(value: unknown): string | undefined {
  if (value == null || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  return (obj.avatar_url as string) ?? undefined;
}

// --- Record helper ---

function getRecordTitle(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "title" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>).title ?? "");
  }
  return toString(value);
}

// --- Multi-option filter helper ---

function multiOptionFilter(v: unknown, f: string | string[]): boolean {
  const arr = Array.isArray(f) ? f : [f];
  return arr.includes(toString(v));
}

// --- Registry ---

export const COLUMN_TYPE_REGISTRY: Record<ColumnType, ColumnTypeEntry> = {
  title: {
    defaultEditable: false,
    renderCell: (value) => {
      const s = toString(value);
      if (!s) return <span className="text-[var(--muted-foreground)]">—</span>;
      // Title styling only — navigation handled by DataTable's onRowClick + titleKey
      return <span className="font-medium text-[var(--foreground)] hover:underline cursor-pointer">{s}</span>;
    },
    renderEditCell: () => null,
    sortFn: strCompare,
    filterType: "text",
    matchesFilter: (v, f) =>
      toString(v)
        .toLowerCase()
        .includes(toString(Array.isArray(f) ? f[0] : f).toLowerCase()),
    matchesSearch: defaultSearch,
  },

  text: {
    defaultEditable: true,
    renderCell: (value) => {
      const s = toString(value);
      if (!s) return <span className="text-[var(--muted-foreground)]">—</span>;
      return <>{s}</>;
    },
    renderEditCell: (value, onCommit, onCancel) => (
      <input
        type="text"
        defaultValue={toString(value)}
        autoFocus
        onBlur={(e) => {
          if (e.target.value !== toString(value)) onCommit(e.target.value);
          else onCancel();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(e.currentTarget.value);
          if (e.key === "Escape") onCancel();
        }}
        onClick={(e) => e.stopPropagation()}
        className={INPUT_CLASS}
      />
    ),
    sortFn: strCompare,
    filterType: "text",
    matchesFilter: (v, f) =>
      toString(v)
        .toLowerCase()
        .includes(toString(Array.isArray(f) ? f[0] : f).toLowerCase()),
    matchesSearch: defaultSearch,
  },

  number: {
    defaultEditable: true,
    renderCell: (value) => {
      if (value == null || value === "")
        return <span className="text-[var(--muted-foreground)]">—</span>;
      const n = Number(value);
      return (
        <span className="tabular-nums">
          {isNaN(n) ? String(value) : n.toLocaleString()}
        </span>
      );
    },
    renderEditCell: (value, onCommit, onCancel) => (
      <input
        type="number"
        defaultValue={value != null ? String(value) : ""}
        autoFocus
        onBlur={(e) => {
          const num =
            e.target.value.trim() === "" ? null : Number(e.target.value);
          if (num !== value) onCommit(num);
          else onCancel();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const num =
              e.currentTarget.value.trim() === ""
                ? null
                : Number(e.currentTarget.value);
            onCommit(num);
          }
          if (e.key === "Escape") onCancel();
        }}
        onClick={(e) => e.stopPropagation()}
        className={`${INPUT_CLASS} text-right tabular-nums`}
      />
    ),
    sortFn: (a, b) => {
      const na = a == null ? -Infinity : Number(a);
      const nb = b == null ? -Infinity : Number(b);
      return na - nb;
    },
    filterType: "text",
    matchesFilter: (v, f) =>
      toString(v) === toString(Array.isArray(f) ? f[0] : f),
    matchesSearch: defaultSearch,
  },

  status: {
    defaultEditable: true,
    renderCell: (value) => {
      if (value == null || value === "") return null;
      const s = toString(value);
      if ((TASK_STATUSES as readonly string[]).includes(s)) {
        return <StatusBadge status={s as TaskStatus} />;
      }
      // Generic status badge with auto-detected colour
      const lc = s.toLowerCase().replace(/_/g, " ");
      let cls =
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      if (
        [
          "published",
          "active",
          "completed",
          "approved",
          "verified",
          "enabled",
        ].some((k) => lc.includes(k))
      )
        cls =
          "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      else if (
        ["pending", "in progress", "review"].some((k) => lc.includes(k))
      )
        cls =
          "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      else if (lc === "draft")
        cls =
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      else if (
        [
          "rejected",
          "cancelled",
          "overdue",
          "failed",
          "disabled",
          "inactive",
        ].some((k) => lc.includes(k))
      )
        cls =
          "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      else if (
        ["archived", "closed", "expired"].some((k) => lc.includes(k))
      )
        cls =
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
      else if (["locked", "scheduled"].some((k) => lc.includes(k)))
        cls =
          "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";

      const label = s
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm whitespace-nowrap ${cls}`}
        >
          {label}
        </span>
      );
    },
    renderEditCell: (value, onCommit, onCancel, options) => (
      <select
        defaultValue={toString(value)}
        autoFocus
        onChange={(e) => onCommit(e.target.value)}
        onBlur={() => onCancel()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        className={`${INPUT_CLASS} cursor-pointer`}
      >
        {(options ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ),
    sortFn: (a, b) => {
      const ai = STATUS_ORDER[toString(a)] ?? 999;
      const bi = STATUS_ORDER[toString(b)] ?? 999;
      return ai - bi;
    },
    filterType: "select",
    matchesFilter: multiOptionFilter,
    matchesSearch: defaultSearch,
  },

  date: {
    defaultEditable: true,
    renderCell: (value) => {
      if (value == null || value === "")
        return <span className="text-[var(--muted-foreground)]">—</span>;
      try {
        return <span>{format(new Date(String(value)), "d MMM yyyy")}</span>;
      } catch {
        return <span>{String(value)}</span>;
      }
    },
    renderEditCell: (value, onCommit, onCancel) => (
      <input
        type="date"
        defaultValue={value ? String(value).split("T")[0] : ""}
        autoFocus
        onBlur={(e) => onCommit(e.target.value || null)}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            onCommit(e.currentTarget.value || null);
          if (e.key === "Escape") onCancel();
        }}
        onClick={(e) => e.stopPropagation()}
        className={INPUT_CLASS}
      />
    ),
    sortFn: (a, b) => {
      const da = a == null || a === "" ? 0 : new Date(String(a)).getTime();
      const db = b == null || b === "" ? 0 : new Date(String(b)).getTime();
      return da - db;
    },
    filterType: "date-range",
    matchesFilter: (v, f) => {
      if (v == null) return false;
      const d = new Date(String(v)).getTime();
      const fv = Array.isArray(f) ? f : [f];
      if (fv.length === 2 && fv[0] && fv[1])
        return (
          d >= new Date(fv[0]).getTime() && d <= new Date(fv[1]).getTime()
        );
      if (fv[0]) return d >= new Date(fv[0]).getTime();
      return true;
    },
    matchesSearch: defaultSearch,
  },

  boolean: {
    defaultEditable: true,
    renderCell: (value) => {
      return value ? (
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <XIcon className="h-4 w-4 text-[var(--muted-foreground)]" />
      );
    },
    renderEditCell: (value, onCommit) => (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onCommit(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded cursor-pointer accent-[var(--primary)]"
      />
    ),
    sortFn: (a, b) => (a ? 1 : 0) - (b ? 1 : 0),
    filterType: "toggle",
    matchesFilter: (v, f) => {
      const fv = Array.isArray(f) ? f[0] : f;
      return fv === "true" ? Boolean(v) : !v;
    },
    matchesSearch: () => false,
  },

  badge: {
    defaultEditable: false,
    renderCell: (value) => {
      if (value == null || value === "") return null;
      return (
        <Badge variant="default" size="sm">
          {toString(value)}
        </Badge>
      );
    },
    renderEditCell: () => null,
    sortFn: strCompare,
    filterType: "select",
    matchesFilter: multiOptionFilter,
    matchesSearch: defaultSearch,
  },

  person: {
    defaultEditable: false,
    renderCell: (value) => {
      const name = getPersonName(value);
      if (!name)
        return <span className="text-[var(--muted-foreground)]">—</span>;
      const avatarUrl = getPersonAvatar(value);
      return (
        <div className="flex items-center gap-2">
          <Avatar name={name} src={avatarUrl} size="xs" />
          <span className="text-sm truncate">{name}</span>
        </div>
      );
    },
    renderEditCell: () => null,
    sortFn: (a, b) =>
      getPersonName(a)
        .toLowerCase()
        .localeCompare(getPersonName(b).toLowerCase()),
    filterType: "text",
    matchesFilter: (v, f) => {
      const name = getPersonName(v).toLowerCase();
      const fv = toString(Array.isArray(f) ? f[0] : f).toLowerCase();
      return name.includes(fv);
    },
    matchesSearch: (v, q) => getPersonName(v).toLowerCase().includes(q),
  },

  department: {
    defaultEditable: false,
    renderCell: (value) => {
      if (value == null || value === "") return null;
      const s = toString(value);
      const parts = s.split(", ").filter(Boolean);
      return (
        <span className="inline-flex flex-wrap gap-1">
          {parts.map((name, i) => (
            <span key={i} className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm whitespace-nowrap bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]">
              {name}
            </span>
          ))}
        </span>
      );
    },
    renderEditCell: () => null,
    sortFn: strCompare,
    filterType: "select",
    matchesFilter: multiOptionFilter,
    matchesSearch: defaultSearch,
  },

  record: {
    defaultEditable: false,
    renderCell: (value) => {
      const title = getRecordTitle(value);
      if (!title)
        return <span className="text-[var(--muted-foreground)]">—</span>;
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm whitespace-nowrap bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]">
          {title}
        </span>
      );
    },
    renderEditCell: () => null,
    sortFn: (a, b) =>
      getRecordTitle(a)
        .toLowerCase()
        .localeCompare(getRecordTitle(b).toLowerCase()),
    filterType: "text",
    matchesFilter: (v, f) =>
      getRecordTitle(v)
        .toLowerCase()
        .includes(toString(Array.isArray(f) ? f[0] : f).toLowerCase()),
    matchesSearch: (v, q) => getRecordTitle(v).toLowerCase().includes(q),
  },

  priority: {
    defaultEditable: true,
    renderCell: (value) => {
      if (value == null || value === "") return null;
      const s = toString(value);
      if ((PRIORITIES as readonly string[]).includes(s)) {
        return <PriorityBadge priority={s as Priority} />;
      }
      return <Badge variant="default" size="sm">{s}</Badge>;
    },
    renderEditCell: (value, onCommit, onCancel, options) => (
      <select
        defaultValue={toString(value)}
        autoFocus
        onChange={(e) => onCommit(e.target.value)}
        onBlur={() => onCancel()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        className={`${INPUT_CLASS} cursor-pointer`}
      >
        {(
          options ??
          PRIORITIES.map((p) => ({
            value: p,
            label: p.charAt(0).toUpperCase() + p.slice(1),
          }))
        ).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ),
    sortFn: (a, b) => {
      const pa = PRIORITY_ORDER[toString(a)] ?? 999;
      const pb = PRIORITY_ORDER[toString(b)] ?? 999;
      return pa - pb;
    },
    filterType: "select",
    matchesFilter: multiOptionFilter,
    matchesSearch: defaultSearch,
  },

  role: {
    defaultEditable: true,
    renderCell: (value) => {
      if (value == null || value === "") return null;
      const s = toString(value);
      if ((ROLES as readonly string[]).includes(s)) {
        return <RoleBadge role={s as Role} />;
      }
      return <Badge variant="default" size="sm">{s}</Badge>;
    },
    renderEditCell: (value, onCommit, onCancel, options) => (
      <select
        defaultValue={toString(value)}
        autoFocus
        onChange={(e) => onCommit(e.target.value)}
        onBlur={() => onCancel()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        className={`${INPUT_CLASS} cursor-pointer`}
      >
        {(options ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ),
    sortFn: (a, b) => {
      // ROLES order has superadmin first, staff last → lower index = more senior
      const ra = ROLES.indexOf(toString(a) as Role);
      const rb = ROLES.indexOf(toString(b) as Role);
      const norm = (n: number) => (n === -1 ? ROLES.length : n);
      return norm(ra) - norm(rb);
    },
    filterType: "select",
    matchesFilter: multiOptionFilter,
    matchesSearch: defaultSearch,
  },

  actions: {
    defaultEditable: false,
    renderCell: () => null, // Handled by CellRenderer directly
    renderEditCell: () => null,
    sortFn: () => 0,
    filterType: "none",
    matchesFilter: () => true,
    matchesSearch: () => false,
  },
};
