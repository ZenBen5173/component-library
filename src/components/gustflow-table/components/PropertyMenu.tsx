"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight } from "lucide-react";
import {
  CHANGEABLE_COLUMN_TYPES,
  type ColumnDef,
  type ColumnType,
  type SortDir,
} from "../types";
import { AnimatedLucide, type IconHandle } from "@/components/ui/animated-lucide";
import { IconPicker } from "@/components/ui/icon-picker";
import { cn } from "@/lib/utils";

/**
 * The menu behind a column heading, in the shape Notion gives it.
 *
 * The previous one stacked every control as a labelled section with pill
 * buttons, so the panel was tall, loud, and read as a settings form. A
 * property menu is a menu: one row per thing, an icon, a label, and a
 * submenu arrow where there is more.
 */

/**
 * Each type's icon, as a lucide *name* rather than a component.
 *
 * Names, because every icon in the menu and in the headings is rendered
 * through AnimatedLucide — which loads by name. Holding components here meant
 * a column with a chosen icon animated and a column relying on its type's
 * default did not, which is the inconsistency that showed.
 */
export const TYPE_META: Record<string, { label: string; icon: string }> = {
  text: { label: "Text", icon: "align-left" },
  number: { label: "Number", icon: "hash" },
  select: { label: "Select", icon: "circle-chevron-down" },
  multi_select: { label: "Multi-select", icon: "list" },
  status: { label: "Status", icon: "circle-dashed" },
  date: { label: "Date", icon: "calendar-days" },
  person: { label: "Person", icon: "users" },
  files: { label: "Files & media", icon: "paperclip" },
  checkbox: { label: "Checkbox", icon: "square-check" },
  url: { label: "URL", icon: "link" },
  email: { label: "Email", icon: "at-sign" },
  phone: { label: "Phone", icon: "phone" },
  created_time: { label: "Created time", icon: "clock" },
  created_by: { label: "Created by", icon: "circle-user" },
  last_edited_time: { label: "Last edited time", icon: "clock" },
  last_edited_by: { label: "Last edited by", icon: "circle-user" },
  button: { label: "Button", icon: "mouse-pointer-click" },
  place: { label: "Place", icon: "map-pin" },
  id: { label: "ID", icon: "id-card" },
  // The older names, so a column declared before these existed still shows
  // something sensible at the top of its menu.
  title: { label: "Text", icon: "align-left" },
  boolean: { label: "Checkbox", icon: "square-check" },
  badge: { label: "Select", icon: "circle-chevron-down" },
  department: { label: "Multi-select", icon: "list" },
  record: { label: "Text", icon: "align-left" },
  priority: { label: "Select", icon: "circle-chevron-down" },
  role: { label: "Select", icon: "circle-chevron-down" },
  actions: { label: "Actions", icon: "mouse-pointer-click" },
};

/** The icon a column shows: the one it was given, else its type's. */
export function columnIconName(column: { type: string; icon?: string }): string {
  return column.icon ?? TYPE_META[column.type]?.icon ?? "align-left";
}

/**
 * A menu row. The row plays its icon, not the icon itself — a 16px glyph is
 * not something anyone aims at on purpose.
 */
function Row({
  icon,
  label,
  onClick,
  submenu,
  active,
}: {
  icon: string;
  label: React.ReactNode;
  onClick?: () => void;
  submenu?: boolean;
  active?: boolean;
}) {
  const iconRef = useRef<IconHandle>(null);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-accent text-[var(--foreground)]"
          : "text-[var(--foreground)] hover:bg-accent/60",
      )}
    >
      <AnimatedLucide
        ref={iconRef}
        name={icon as never}
        size={16}
        trigger="manual"
        className="text-[var(--muted-foreground)]"
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {submenu && <ChevronRight className="size-3.5 shrink-0 text-[var(--muted-foreground)]" />}
    </button>
  );
}

const Divider = () => <div className="my-1 h-px bg-[var(--border)]" />;

export interface PropertyMenuProps {
  column: ColumnDef;
  sort: Array<{ key: string; dir: SortDir }>;
  toggleSort: (key: string, opts?: { shiftKey?: boolean }) => void;
  /** Adds a rule for this column to the filter bar and opens it. */
  onFilterColumn: (key: string) => void;
  isWrapped: boolean;
  toggleWrap: (key: string) => void;
  isGroupedBy: boolean;
  setGroupBy: (key: string | null) => void;
  toggleColumn: (key: string) => void;
  /** Absent when the consumer does not own its columns — the two rows that
   *  change a column rather than the view are then left out. */
  onRename?: (key: string, label: string) => void;
  onChangeType?: (key: string, type: ColumnType) => void;
  onSetIcon?: (key: string, icon: string | undefined) => void;
  onSetIdPrefix?: (key: string, prefix: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function PropertyMenu({
  column,
  sort,
  toggleSort,
  onFilterColumn,
  isWrapped,
  toggleWrap,
  isGroupedBy,
  setGroupBy,
  toggleColumn,
  onRename,
  onChangeType,
  onSetIcon,
  onSetIdPrefix,
  onClose,
  anchorRef,
}: PropertyMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [pane, setPane] = useState<"root" | "type" | "sort" | "icon">("root");
  const [name, setName] = useState(column.label);
  const [prefix, setPrefix] = useState(column.idPrefix ?? "");

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - 276));
    setPos({ top: rect.bottom + 4, left });
  }, [anchorRef]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        ref.current && !ref.current.contains(target) &&
        anchorRef.current && !anchorRef.current.contains(target)
      ) {
        commitName();
        commitPrefix();
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // Escape backs out of a submenu before it closes the menu, so a wrong
      // turn does not cost you the whole thing.
      if (pane !== "root") setPane("root");
      else onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, anchorRef, pane, name, prefix]);

  function commitPrefix() {
    if (prefix !== (column.idPrefix ?? "")) onSetIdPrefix?.(column.key, prefix);
  }

  function commitName() {
    const next = name.trim();
    if (next && next !== column.label) onRename?.(column.key, next);
  }

  const entry = sort.find((s) => s.key === column.key);
  const isSortable = column.sortable !== false && column.type !== "actions";
  const isFilterable = column.filterable !== false && column.type !== "actions";

  function sortAsc() {
    if (!entry) toggleSort(column.key);
    else if (entry.dir === "desc") toggleSort(column.key, { shiftKey: true });
    onClose();
  }

  function sortDesc() {
    if (!entry) {
      toggleSort(column.key);
      toggleSort(column.key, { shiftKey: true });
    } else if (entry.dir === "asc") {
      toggleSort(column.key, { shiftKey: true });
    }
    onClose();
  }

  return createPortal(
    <div
      ref={ref}
      style={{ top: pos.top, left: pos.left, zIndex: 9999 }}
      className="fixed w-[268px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-card-lg"
    >
      {pane === "root" && (
        <div className="p-1.5">
          {/* The name, editable in place — the first thing in Notion's menu
              and the one thing you cannot do anywhere else. */}
          <div className="flex items-center gap-2 px-0.5 pb-1.5">
            {/* The icon is a button, not a label: it is the only place to
                choose one, and Notion puts it exactly here. */}
            <button
              type="button"
              disabled={!onSetIcon}
              onClick={() => setPane("icon")}
              title={onSetIcon ? "Change icon" : undefined}
              className="grid size-7 shrink-0 place-items-center rounded-md bg-accent/60 text-[var(--muted-foreground)] transition-colors enabled:hover:bg-accent enabled:hover:text-[var(--foreground)]"
            >
              <AnimatedLucide name={columnIconName(column) as never} size={16} />
            </button>
            <input
              value={name}
              autoFocus
              disabled={!onRename}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitName();
                  onClose();
                }
              }}
              className="h-7 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-primary disabled:opacity-60"
            />
          </div>

          {/* ID columns carry a prefix, and it is the only thing about them
              worth setting — the value itself is not editable by design. */}
          {column.type === "id" && onSetIdPrefix && (
            <div className="flex items-center gap-2 px-0.5 pb-1.5">
              <span className="w-7 shrink-0 text-center text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">
                ID
              </span>
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                onBlur={commitPrefix}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitPrefix();
                    onClose();
                  }
                }}
                placeholder="Prefix, e.g. DEP-"
                className="h-7 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 font-mono text-xs text-[var(--foreground)] outline-none transition-colors focus:border-primary"
              />
            </div>
          )}

          {onChangeType && (
            <Row
              icon="refresh-cw"
              label="Change type"
              submenu
              onClick={() => setPane("type")}
            />
          )}

          <Divider />

          {/* An action, not a submenu. Filtering happens in one place now —
              the bar under the toolbar — and having a second, per-column
              filter that quietly ANDed itself with the first was a way to get
              a result neither of them explained. */}
          {isFilterable && (
            <Row
              icon="filter"
              label="Filter"
              onClick={() => {
                onFilterColumn(column.key);
                onClose();
              }}
            />
          )}
          {isSortable && (
            <Row
              icon="arrow-down-up"
              label={
                entry ? `Sort — ${entry.dir === "asc" ? "A → Z" : "Z → A"}` : "Sort"
              }
              submenu
              onClick={() => setPane("sort")}
            />
          )}
          {column.type !== "actions" && (
            <Row
              icon="rows-3"
              label={isGroupedBy ? "Stop grouping" : "Group"}
              onClick={() => {
                setGroupBy(isGroupedBy ? null : column.key);
                onClose();
              }}
            />
          )}
          {column.type !== "actions" && (
            <Row
              icon="wrap-text"
              label={isWrapped ? "Unwrap content" : "Wrap content"}
              onClick={() => {
                toggleWrap(column.key);
                onClose();
              }}
            />
          )}
          {column.type !== "actions" && (
            <Row
              icon="eye-off"
              label="Hide"
              onClick={() => {
                toggleColumn(column.key);
                onClose();
              }}
            />
          )}
        </div>
      )}

      {pane === "type" && (
        <div className="p-1.5">
          <Row icon="chevron-left" label="Back" onClick={() => setPane("root")} />
          <Divider />
          <div className="max-h-[320px] overflow-y-auto">
            {CHANGEABLE_COLUMN_TYPES.map((type) => {
              const meta = TYPE_META[type]!;
              const current = column.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onChangeType?.(column.key, type);
                    onClose();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-accent/60"
                >
                  <AnimatedLucide
                    name={meta.icon as never}
                    size={16}
                    className="text-[var(--muted-foreground)]"
                  />
                  <span className="min-w-0 flex-1 truncate">{meta.label}</span>
                  {current && <Check className="size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {pane === "icon" && (
        <div>
          <div className="p-1.5 pb-0">
            <Row icon="chevron-left" label="Back" onClick={() => setPane("root")} />
          </div>
          <IconPicker
            value={column.icon}
            onChange={(name) => {
              onSetIcon?.(column.key, name);
              setPane("root");
            }}
            onClear={
              column.icon
                ? () => {
                    onSetIcon?.(column.key, undefined);
                    setPane("root");
                  }
                : undefined
            }
            className="w-full"
          />
        </div>
      )}

      {pane === "sort" && (
        <div className="p-1.5">
          <Row icon="chevron-left" label="Back" onClick={() => setPane("root")} />
          <Divider />
          <Row
            icon="arrow-down-up"
            label="Sort A → Z"
            active={entry?.dir === "asc"}
            onClick={sortAsc}
          />
          <Row
            icon="arrow-down-up"
            label="Sort Z → A"
            active={entry?.dir === "desc"}
            onClick={sortDesc}
          />
          {entry && (
            <>
              <Divider />
              <Row
                icon="arrow-down-up"
                label="Remove sort"
                onClick={() => {
                  toggleSort(column.key);
                  onClose();
                }}
              />
              {sort.length > 1 && (
                <p className="px-2 py-1 text-[11px] text-[var(--muted-foreground)]">
                  Position {sort.findIndex((s) => s.key === column.key) + 1} of {sort.length}
                </p>
              )}
            </>
          )}
        </div>
      )}

    </div>,
    document.body,
  );
}
