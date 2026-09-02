"use client";

import { useState } from "react";
import type { ColumnDef } from "../types";
import { COLUMN_TYPE_REGISTRY } from "../columnTypes";

interface CellRendererProps {
  column: ColumnDef;
  value: unknown;
  row: Record<string, unknown>;
  isWrapped: boolean;
  onEdit?: (newValue: unknown) => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  isTitleColumn?: boolean;
}

export function CellRenderer({ column, value, row, isWrapped, onEdit, onRowClick, isTitleColumn }: CellRendererProps) {
  const [editing, setEditing] = useState(false);
  const typeDef = COLUMN_TYPE_REGISTRY[column.type];
  const editable = (column.editable ?? typeDef.defaultEditable) && !!onEdit;

  // ID column — the prefix lives on the column, which the type registry
  // cannot see either. Rendered here so the stored value stays bare.
  if (column.type === "id" && column.idPrefix) {
    const raw = String(value ?? "");
    return (
      <div className="truncate font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
        {raw ? `${column.idPrefix}${raw}` : "—"}
      </div>
    );
  }

  // Button column — the action lives on the column definition, which the type
  // registry cannot see: renderCell is handed the value and the row, not the
  // column it belongs to.
  if (column.type === "button") {
    if (!column.button) return null;
    return (
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => column.button!.onClick(row)}
          className="rounded-[3px] border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--card)] active:scale-95"
        >
          {column.button.label}
        </button>
      </div>
    );
  }

  // Actions column — render action buttons directly
  if (column.type === "actions" && column.actions) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {column.actions.map((action) => {
          if (action.show && !action.show(row)) return null;
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => action.onClick(row)}
              className={`p-1.5 rounded-sm transition-colors ${
                action.variant === "destructive"
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
              }`}
              title={action.label}
            >
              {Icon ? <Icon className="h-4 w-4" /> : action.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Title column — clickable, triggers onRowClick (determined by titleKey prop)
  if ((isTitleColumn || column.type === "title") && onRowClick) {
    const s = String(value ?? "");
    return (
      <div
        className={`min-w-0 ${isWrapped ? "whitespace-normal break-words" : "truncate"}`}
        onClick={(e) => { e.stopPropagation(); onRowClick(row); }}
      >
        <span className="font-medium text-[var(--foreground)] hover:underline cursor-pointer">
          {s || <span className="text-[var(--muted-foreground)]">—</span>}
        </span>
      </div>
    );
  }

  // A checkbox toggles where it stands — going through an edit mode to tick a
  // box is a step for nothing.
  if ((column.type === "boolean" || column.type === "checkbox") && editable) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        {typeDef.renderEditCell(value, (v) => onEdit!(v), () => {}, column.options)}
      </div>
    );
  }

  // Editing mode
  if (editing && editable) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        {typeDef.renderEditCell(
          value,
          (newValue) => { setEditing(false); onEdit!(newValue); },
          () => setEditing(false),
          column.options
        )}
      </div>
    );
  }

  // Read-only mode
  const content = column.renderCell ? column.renderCell(value, row) : typeDef.renderCell(value, row);

  if (editable) {
    // No pencil and no outline: the cell is the control. An icon in every row
    // of every editable column is a lot of furniture to say something the
    // click already says, and it costs the numbers their right edge.
    const numeric = column.type === "number";
    return (
      <div
        className={`flex items-center min-w-0 cursor-pointer ${numeric ? "justify-end tabular-nums" : ""} ${isWrapped ? "whitespace-normal break-words" : ""}`}
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      >
        <span className={isWrapped ? "" : "truncate"}>{content}</span>
      </div>
    );
  }

  return (
    <div className={`min-w-0 ${isWrapped ? "whitespace-normal break-words" : "truncate"} ${column.type === "number" ? "text-right tabular-nums" : ""}`}>
      {content}
    </div>
  );
}
