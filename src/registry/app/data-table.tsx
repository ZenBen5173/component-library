"use client";

/**
 * @name Data Table
 * @description Your GustFlow table, ported — multi-sort, nested AND/OR filters, group-by, column resize/reorder/hide, footer aggregates, CSV export and virtualised rows.
 * @tags table, data, sorting, filtering, grouping, virtualised, app
 * @height 900
 * @deps @tanstack/react-virtual, @dnd-kit/core, @dnd-kit/sortable, date-fns
 * @note Ported from features/datatable in GustFlow — table view only, Kanban and Calendar views dropped. Domain badges (role/priority/status) collapsed into one tone-mapped Badge, and host imports replaced by shims.tsx. Restyled onto shadcn tokens so it matches the rest of App UI.
 * @source src/components/gustflow-table/DataTable.tsx
 * @source src/components/gustflow-table/useDataTable.ts
 * @source src/components/gustflow-table/shims.tsx
 */
import { DataTable } from "@/components/gustflow-table/DataTable";
import type { ColumnDef } from "@/components/gustflow-table/types";

const COLUMNS: ColumnDef[] = [
  { key: "project", label: "Project", type: "title", sortable: true, filterable: true, width: 220 },
  { key: "env", label: "Environment", type: "badge", sortable: true, filterable: true, width: 150,
    options: [
      { value: "production", label: "Production" },
      { value: "preview", label: "Preview" },
      { value: "development", label: "Development" },
    ] },
  { key: "status", label: "Status", type: "status", sortable: true, filterable: true, width: 140,
    options: [
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
    ] },
  { key: "owner", label: "Owner", type: "person", sortable: true, filterable: true, width: 170 },
  { key: "priority", label: "Priority", type: "priority", sortable: true, filterable: true, width: 130 },
  { key: "duration", label: "Duration (s)", type: "number", sortable: true, aggregate: "sum", width: 140 },
  { key: "builds", label: "Builds", type: "number", sortable: true, aggregate: "avg", width: 120 },
  { key: "updated", label: "Updated", type: "date", sortable: true, width: 160 },
];

const PROJECTS = ["acme-dashboard", "acme-marketing", "acme-docs", "acme-api", "acme-admin", "acme-status", "acme-billing", "acme-search"];
const ENVS = ["production", "preview", "development"];
const STATUSES = ["completed", "pending", "failed"];
const OWNERS = ["Ada Okafor", "Ravi Menon", "Lena Fischer", "Tomas Silva", "Mei Tanaka"];
const PRIORITIES = ["low", "medium", "high"];

// Deterministic sample rows — no Math.random, so server and client agree.
const DATA = Array.from({ length: 48 }, (_, i) => ({
  id: String(i + 1),
  project: `${PROJECTS[i % PROJECTS.length]}-${Math.floor(i / PROJECTS.length) + 1}`,
  env: ENVS[i % ENVS.length],
  status: STATUSES[(i * 2) % STATUSES.length],
  owner: OWNERS[i % OWNERS.length],
  priority: PRIORITIES[(i * 3) % PRIORITIES.length],
  duration: 6 + ((i * 7) % 54),
  builds: 12 + ((i * 11) % 180),
  updated: new Date(2026, 7, 1 + (i % 26)).toISOString(),
}));

export default function DataTableDemo() {
  return (
    <div className="min-h-[900px] bg-background p-6">
      <DataTable
        columns={COLUMNS}
        data={DATA}
        searchable
        paginated
        exportable="deploys"
        frozenFirstColumn
      />
    </div>
  );
}
