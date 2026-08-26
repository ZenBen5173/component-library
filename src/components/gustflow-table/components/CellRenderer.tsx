"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
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

  // Boolean — direct toggle (no pencil/edit-mode)
  if (column.type === "boolean" && editable) {
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
    return (
      <div
        className={`group/edit flex items-center gap-1 min-w-0 cursor-pointer ${isWrapped ? "whitespace-normal break-words" : ""}`}
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      >
        <span className={isWrapped ? "" : "truncate"}>{content}</span>
        <Pencil className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover/edit:opacity-100 shrink-0 transition-opacity" />
      </div>
    );
  }

  return (
    <div className={`min-w-0 ${isWrapped ? "whitespace-normal break-words" : "truncate"} ${column.type === "number" ? "text-right tabular-nums" : ""}`}>
      {content}
    </div>
  );
}
