"use client";

/**
 * @name Data Table
 * @description Notion's database as a component: every property type, a property menu behind each heading, a sort and filter builder, group-by, per-column calculations, CSV export and virtualised rows.
 * @tags table, data, sorting, filtering, grouping, virtualised, app
 * @height 900
 * @deps @tanstack/react-virtual, @dnd-kit/core, @dnd-kit/sortable, date-fns
 * @note Files preview on hover, the card following the cursor. Sort and filter are built in the bar under the toolbar rather than only per column: a chip says what is applied, and the popover behind it edits the rules — column, condition, value, joined by one And/Or across the set, the way Notion's simple mode works. Conditions are offered per type, so a number gets > and ≥ and a checkbox gets is-checked rather than a list of text comparisons that mean nothing to it. Each column can carry any icon from lucide — around eighteen hundred — chosen from the button at the top of its property menu, and every one of them draws itself on rather than sitting still. That is derived rather than hand-authored: each shape is given a normalised path length so one dash sweep fits every glyph, which is the only way it works for the whole set. Every Notion property type except Formula and Relation, which were excluded, and Rollup, which cannot exist without them — a rollup summarises values reached through a relation, so with no relations there is nothing to reach. The column heading opens Notion's property menu: rename in place, change type, filter, sort, group, wrap and hide. Text filters carry the full condition set (is, is not, contains, does not contain, starts with, ends with, is empty, is not empty) rather than only "contains". Person columns take a name, a person object, a comma-joined string or a list of any of those — faces overlap, each carries a hover card with the name and email, and the rest collapse into a +N. Date columns edit through the calendar rather than the browser\'s native date field, and filter by dragging a range across a month; both read the calendar date the value names rather than converting through a moment, which moves every date back a day west of UTC. Ported from GustFlow — table view only, Kanban and Calendar dropped, domain badges collapsed into one tone-mapped Badge. Rows identify themselves through `rowId`, which defaults to `row.id`; pass your own if your data is keyed on something else, or selection silently does nothing. Paged at `pageSize` rows; `paginated={false}` hands the whole set to the virtualiser instead. Grouped rows are not virtualised, because the group headers stick — so each group stops at 200 rows and offers the rest.
 * @source src/components/gustflow-table/DataTable.tsx
 * @source src/components/gustflow-table/useDataTable.ts
 * @source src/components/gustflow-table/components/ViewBar.tsx
 * @source src/components/ui/cursor-card.tsx
 */
import { useState } from "react";
import { DataTable } from "@/components/gustflow-table/DataTable";
import type { ColumnDef } from "@/components/gustflow-table/types";

const COLUMNS: ColumnDef[] = [
  { key: "project", label: "Project", type: "title", sortable: true, filterable: true, width: 220 },
  { key: "env", label: "Environment", type: "select", sortable: true, filterable: true, width: 150,
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
  // A multi-select: the picker stays open, and closing it commits.
  { key: "labels", label: "Labels", type: "multi_select", sortable: true, filterable: true, width: 210,
    options: [
      { value: "small_task", label: "Small task" },
      { value: "medium_tasks", label: "Medium tasks" },
      { value: "large_project", label: "Large project" },
      { value: "needs_review", label: "Needs review" },
    ] },
  { key: "priority", label: "Priority", type: "select", sortable: true, filterable: true, width: 130 },
  { key: "duration", label: "Duration (s)", type: "number", icon: "timer", sortable: true, aggregate: "sum", width: 140 },
  { key: "builds", label: "Builds", type: "number", icon: "package", sortable: true, aggregate: "avg", width: 120 },
  { key: "updated", label: "Updated", type: "date", sortable: true, filterable: true, width: 160 },
  { key: "ok", label: "Verified", type: "checkbox", sortable: true, width: 110 },
  { key: "repo", label: "Repository", type: "url", icon: "git-branch", sortable: true, filterable: true, width: 200 },
  { key: "contact", label: "Contact", type: "email", sortable: true, filterable: true, width: 190 },
  { key: "phone", label: "On call", type: "phone", sortable: true, width: 150 },
  { key: "region", label: "Region", type: "place", sortable: true, filterable: true, width: 160 },
  { key: "assets", label: "Assets", type: "files", width: 170 },
  { key: "createdAt", label: "Created time", type: "created_time", sortable: true, width: 180 },
  { key: "createdBy", label: "Created by", type: "created_by", sortable: true, width: 160 },
  { key: "editedAt", label: "Last edited time", type: "last_edited_time", sortable: true, width: 190 },
  { key: "ref", label: "ID", type: "id", idPrefix: "DEP-", sortable: true, width: 110 },
];

const PROJECTS = ["acme-dashboard", "acme-marketing", "acme-docs", "acme-api", "acme-admin", "acme-status", "acme-billing", "acme-search"];
const ENVS = ["production", "preview", "development"];
const STATUSES = ["completed", "pending", "failed"];
/**
 * People as objects, not names. The person column reads `name`, `avatar_url`
 * and an `email`/`role`/`title` for the hover card — a bare string still works
 * and falls back to initials, it just has nothing extra to say.
 */
const OWNERS = [
  { name: "Ada Okafor", avatar_url: "https://i.pravatar.cc/64?img=47", email: "ada@acme.com" },
  { name: "Ravi Menon", avatar_url: "https://i.pravatar.cc/64?img=12", email: "ravi@acme.com" },
  { name: "Lena Fischer", avatar_url: "https://i.pravatar.cc/64?img=32", email: "lena@acme.com" },
  { name: "Tomas Silva", avatar_url: "https://i.pravatar.cc/64?img=15", email: "tomas@acme.com" },
  { name: "Mei Tanaka", avatar_url: "https://i.pravatar.cc/64?img=45", email: "mei@acme.com" },
];
const PRIORITIES = ["low", "medium", "high"];
const REGIONS = ["London, UK", "Frankfurt, DE", "Ashburn, US", "Singapore, SG"];

/**
 * A thousand deterministic rows — enough that paging, the virtualiser and the
 * per-group cap all have something to do.
 *
 * Dates are built in UTC on purpose. `new Date(y, m, d)` reads the machine's
 * timezone, so the server would produce one ISO string and the browser another
 * and the date column would arrive mismatched.
 */
const DATA = Array.from({ length: 1000 }, (_, i) => ({
  id: `row-${i + 1}`,
  project: `${PROJECTS[i % PROJECTS.length]}-${Math.floor(i / PROJECTS.length) + 1}`,
  env: ENVS[i % ENVS.length],
  status: STATUSES[(i * 2) % STATUSES.length],
  // Every fourth deploy has a pair on it, so the stack and its +N have
  // something to show alongside the single-owner rows.
  owner:
    i % 4 === 0
      ? [0, 1, 2, 3].map((n) => OWNERS[(i + n) % OWNERS.length])
      : i % 4 === 2
        ? [OWNERS[i % OWNERS.length], OWNERS[(i + 3) % OWNERS.length]]
        : OWNERS[i % OWNERS.length],
  priority: PRIORITIES[(i * 3) % PRIORITIES.length],
  // Stored joined, which is what a flat export gives you; the picker writes
  // it back in the same shape.
  labels: [
    ["small_task"],
    ["medium_tasks", "needs_review"],
    ["large_project"],
    ["small_task", "medium_tasks", "large_project"],
  ][i % 4]!.join(", "),
  duration: 6 + ((i * 7) % 54),
  builds: 12 + ((i * 11) % 180),
  updated: new Date(Date.UTC(2026, 7, 1 + (i % 26))).toISOString(),
  ok: i % 3 === 0,
  repo: `https://github.com/acme/${PROJECTS[i % PROJECTS.length]}`,
  contact: OWNERS[i % OWNERS.length]!.email,
  phone: `+44 20 7${String(1000 + (i % 9000)).padStart(4, "0")} ${String(100 + (i % 900))}`,
  region: REGIONS[i % REGIONS.length],
  assets:
    i % 5 === 0
      ? [
          { url: `https://picsum.photos/seed/${i}/80/80`, name: "preview.png" },
          { url: "https://example.com/build-log.txt", name: "build-log.txt" },
        ]
      : [],
  createdAt: new Date(Date.UTC(2026, 6, 1 + (i % 28), 9, (i * 7) % 60)).toISOString(),
  createdBy: OWNERS[(i + 1) % OWNERS.length],
  editedAt: new Date(Date.UTC(2026, 7, 1 + (i % 26), 14, (i * 11) % 60)).toISOString(),
  // Bare: the "DEP-" in front of it belongs to the column, so renaming
  // the prefix does not mean rewriting every row.
  ref: String(i + 1).padStart(4, "0"),
}));

export default function DataTableDemo() {
  const [rows, setRows] = useState(DATA);
  // Held in state so the property menu can rename a column and change its
  // type. Without a home for the result those two rows are not offered.
  const [columns, setColumns] = useState(COLUMNS);

  return (
    <div className="min-h-[900px] bg-background p-6">
      <DataTable
        columns={columns}
        onColumnsChange={setColumns}
        data={rows}
        // Without this nothing is editable, and the date column never opens
        // its calendar.
        onEdit={(id, key, value) =>
          setRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
          )
        }
        // Saved views land in this browser — no endpoint behind them.
        viewId="registry-deploys"
        searchable
        paginated
        exportable="deploys"
        bulkActions={{
          onDelete: (ids) => {
            const gone = new Set(ids);
            setRows((prev) => prev.filter((r) => !gone.has(r.id)));
          },
        }}
      />
    </div>
  );
}
