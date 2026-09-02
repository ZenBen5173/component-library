"use client";

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical } from "lucide-react";
import { Tag, tagColorFor, tagLabel, type TagColor } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

/**
 * The option picker, built the way Notion builds it.
 *
 * A native `<select>` is the browser's widget, not the app's: its list is
 * drawn by the operating system, it cannot show a tag, it cannot be searched,
 * and on Windows it arrives as a white rectangle in the middle of a dark
 * table. This is the same job done in the page — search as you type, create
 * what is missing, reorder by dragging, and every option shown as the tag it
 * will become.
 */

export type TagOption = {
  value: string;
  label: string;
  /** Fixed colour. Left off, one is derived from the value and stays put. */
  color?: TagColor;
};

function colorOf(option: TagOption): TagColor {
  return option.color ?? tagColorFor(option.value);
}

/**
 * A row in the list. The whole row selects; only the handle drags, so
 * pointing at an option and clicking it never turns into a drag by accident.
 */
function OptionRow({
  option,
  selected,
  onPick,
  reorderable,
}: {
  option: TagOption;
  selected: boolean;
  onPick: () => void;
  reorderable: boolean;
}) {
  const sortable = useSortable({ id: option.value, disabled: !reorderable });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center gap-1 rounded-md px-1 py-1 transition-colors hover:bg-accent/60"
    >
      {reorderable ? (
        <span
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${option.label}`}
          className="grid size-4 shrink-0 cursor-grab place-items-center text-muted-foreground/50 transition-colors hover:text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" />
        </span>
      ) : (
        <span className="size-4 shrink-0" />
      )}

      <button
        type="button"
        onClick={onPick}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <Tag color={colorOf(option)} size="md">
          {option.label}
        </Tag>
        {/* The chips at the top say what is chosen; this says which row they
            came from, which only matters once several can be. */}
        {selected && <Check className="ml-auto size-3.5 shrink-0 text-muted-foreground" />}
      </button>
    </div>
  );
}

export function TagSelect({
  options,
  value,
  multiple = false,
  onChange,
  onOptionsChange,
  allowCreate = true,
  reorderable = true,
  className,
}: {
  options: TagOption[];
  /** A single value, or several when `multiple`. */
  value: string[];
  multiple?: boolean;
  onChange: (next: string[]) => void;
  /** Called when an option is created or dragged into a new order. */
  onOptionsChange?: (next: TagOption[]) => void;
  allowCreate?: boolean;
  reorderable?: boolean;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Held locally so creating and reordering work with no wiring, and are
  // reported upwards for anyone who wants to persist them.
  const [localOptions, setLocalOptions] = useState(options);
  const allOptions = onOptionsChange ? options : localOptions;

  const setOptions = (next: TagOption[]) => {
    setLocalOptions(next);
    onOptionsChange?.(next);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const selected = useMemo(
    () =>
      value
        .map((v) => allOptions.find((o) => o.value === v) ?? { value: v, label: tagLabel(v) })
        .filter((o) => o.value !== ""),
    [value, allOptions],
  );

  const q = query.trim().toLowerCase();
  const matches = q
    ? allOptions.filter((o) => o.label.toLowerCase().includes(q))
    : allOptions;

  const exact = allOptions.some((o) => o.label.toLowerCase() === q);
  const canCreate = allowCreate && q.length > 0 && !exact;

  function pick(optionValue: string) {
    if (multiple) {
      const next = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(next);
      setQuery("");
      inputRef.current?.focus();
      return;
    }
    onChange([optionValue]);
  }

  function create() {
    const label = query.trim();
    if (!label) return;
    const option: TagOption = { value: label.toLowerCase().replace(/\s+/g, "_"), label };
    setOptions([...allOptions, option]);
    pick(option.value);
    setQuery("");
  }

  function remove(optionValue: string) {
    onChange(value.filter((v) => v !== optionValue));
    inputRef.current?.focus();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = allOptions.findIndex((o) => o.value === active.id);
    const to = allOptions.findIndex((o) => o.value === over.id);
    if (from === -1 || to === -1) return;
    const next = [...allOptions];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    setOptions(next);
  }

  return (
    <div className={cn("w-80", className)}>
      {/* The selection sits in a field of its own, chips first and the caret
          after them, so typing filters from wherever the cursor already is.
          Flush to the edges with a hairline under it, rather than inset — an
          inset box reads as a search field inside a menu instead of as the
          field the menu belongs to. */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-accent/40 px-2 py-2">
        {selected.map((option) => (
          <Tag
            key={option.value}
            color={colorOf(option)}
            size="md"
            onRemove={() => remove(option.value)}
          >
            {option.label}
          </Tag>
        ))}
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (canCreate) create();
              else if (matches[0]) pick(matches[0].value);
            }
            // Backspace on an empty box takes the last chip off, which is what
            // every tag field does and what fingers expect.
            if (e.key === "Backspace" && query === "" && selected.length > 0) {
              remove(selected[selected.length - 1]!.value);
            }
          }}
          className="min-w-[60px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder={selected.length === 0 ? "Search or create…" : ""}
        />
      </div>

      <p className="px-3 pb-1 pt-2.5 text-xs text-muted-foreground">
        {canCreate ? "Create a new option" : "Select an option or create one"}
      </p>

      <div className="max-h-56 overflow-y-auto px-1.5 pb-1.5">
        <DndContext
          id="tag-select"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={matches.map((o) => o.value)}
            strategy={verticalListSortingStrategy}
          >
            {matches.map((option) => (
              <OptionRow
                key={option.value}
                option={option}
                selected={value.includes(option.value)}
                onPick={() => pick(option.value)}
                // Dragging a filtered list would reorder against a view of
                // itself, so the handles stand down while searching.
                reorderable={reorderable && !q}
              />
            ))}
          </SortableContext>
        </DndContext>

        {canCreate && (
          <button
            type="button"
            onClick={create}
            className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left transition-colors hover:bg-accent/60"
          >
            <span className="size-4 shrink-0" />
            <span className="text-sm text-muted-foreground">Create</span>
            <Tag color={tagColorFor(query.trim())} size="md">
              {query.trim()}
            </Tag>
          </button>
        )}

        {matches.length === 0 && !canCreate && (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            No options.
          </p>
        )}
      </div>
    </div>
  );
}
