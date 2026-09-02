"use client";

/**
 * @name Tag Select
 * @description Notion's option picker — search, create what's missing, drag to reorder, every option shown as the tag it becomes. Single and multi.
 * @tags select, multiselect, tags, picker, notion, form, must-have, versatile
 * @height 640
 * @deps @dnd-kit/core, @dnd-kit/sortable, motion
 * @note Replaces a native `<select>`, which is drawn by the operating system: it cannot show a tag, cannot be searched, and arrives as a white rectangle in the middle of a dark page. Colours are derived from the value, so an unknown tag still gets one and gets the same one every time — a random colour would differ between server and client and break the page. Words that carry meaning are pinned: "failed" is always red whatever the hash says.
 * @source src/components/ui/tag-select.tsx
 * @source src/components/ui/tag.tsx
 */
import { useState } from "react";
import { Tag, tagColorFor } from "@/components/ui/tag";
import { TagSelect, type TagOption } from "@/components/ui/tag-select";

const STATUS: TagOption[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

const LABELS: TagOption[] = [
  { value: "small_task", label: "Small task" },
  { value: "medium_tasks", label: "Medium tasks" },
  { value: "large_project", label: "Large project" },
  { value: "needs_review", label: "Needs review" },
];

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

export default function TagSelectDemo() {
  const [status, setStatus] = useState<string[]>(["in_progress"]);
  const [statusOptions, setStatusOptions] = useState(STATUS);
  const [labels, setLabels] = useState<string[]>(["medium_tasks", "needs_review"]);
  const [labelOptions, setLabelOptions] = useState(LABELS);

  return (
    <div className="min-h-[640px] bg-background p-10">
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-2">
        <Panel
          title="Single"
          hint="Picking one closes it. Type a name that isn't there and it offers to make it."
        >
          <TagSelect
            options={statusOptions}
            value={status}
            onChange={setStatus}
            onOptionsChange={setStatusOptions}
            className="w-full"
          />
        </Panel>

        <Panel
          title="Multiple"
          hint="Stays open while you pick. Backspace on the empty field takes the last one off; drag a handle to reorder."
        >
          <TagSelect
            options={labelOptions}
            value={labels}
            multiple
            onChange={setLabels}
            onOptionsChange={setLabelOptions}
            className="w-full"
          />
        </Panel>

        <div className="lg:col-span-2">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            What comes back
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-4">
            {[...status, ...labels].length === 0 ? (
              <span className="text-xs text-muted-foreground">Nothing selected.</span>
            ) : (
              [...status, ...labels].map((value) => (
                <Tag key={value} color={tagColorFor(value)} size="md">
                  {[...statusOptions, ...labelOptions].find((o) => o.value === value)
                    ?.label ?? value}
                </Tag>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
