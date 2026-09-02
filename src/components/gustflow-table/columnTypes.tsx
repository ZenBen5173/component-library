"use client";

import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ExternalLink, MapPin, Paperclip } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { CursorCard } from "@/components/ui/cursor-card";
import { Tag, tagColorFor, tagLabel } from "@/components/ui/tag";
import { TagSelect, type TagOption } from "@/components/ui/tag-select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar } from "./shims";
// The badge shims these columns used are gone — status, priority, role and
// badge all render as tags now.
import { TASK_STATUSES, PRIORITIES, ROLES } from "./shims";
import type { ColumnType, FilterOperator, SelectOption } from "./types";

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

/**
 * One collator, built once.
 *
 * `localeCompare` with options constructs a collator on every call, and a sort
 * calls it n log n times: measured on this data it cost 1.3 seconds to sort
 * ten thousand rows by text and seven seconds for fifty thousand. Reusing a
 * single Intl.Collator does the same work in 51ms and 276ms — twenty-five
 * times faster, for the same comparison.
 *
 * `sensitivity: "base"` folds case, which is what the lowercasing was for and
 * saves allocating two lowercase strings per comparison as well.
 */
const COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function strCompare(a: unknown, b: unknown): number {
  return COLLATOR.compare(toString(a), toString(b));
}

/**
 * The editing field carries no outline of its own.
 *
 * It had a primary-coloured border, which turned the cell you were typing in
 * into the loudest thing on screen. A cell that becomes editable in place
 * should look like the cell it already was — the caret says where you are.
 */
const INPUT_CLASS =
  "w-full h-7 px-1.5 -mx-1.5 text-sm rounded bg-transparent text-[var(--foreground)] outline-none";

/**
 * The same field, without the spinner.
 *
 * A number cell is typed into, not nudged: the up/down arrows steal width in
 * an already narrow column, appear only on hover so the value shifts under the
 * pointer, and step by one, which is never the amount anyone wanted.
 */
const NUMBER_INPUT_CLASS = `${INPUT_CLASS} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0`;

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

function getPersonSubtitle(value: unknown): string | undefined {
  if (value == null || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const sub = obj.email ?? obj.role ?? obj.title;
  return sub == null ? undefined : String(sub);
}

type Person = { name: string; avatar?: string; subtitle?: string };

/**
 * A person column may hold one person, several, or a comma-joined string —
 * which is what a flat export gives you. All three arrive here as a list.
 */
function toPeople(value: unknown): Person[] {
  if (value == null || value === "") return [];
  const list = Array.isArray(value) ? value : [value];
  return list
    .flatMap<Person>((v) =>
      typeof v === "string"
        ? v
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((name) => ({ name }))
        : [
            {
              name: getPersonName(v),
              avatar: getPersonAvatar(v),
              subtitle: getPersonSubtitle(v),
            },
          ],
    )
    .filter((person) => person.name);
}

/** Faces shown before the rest collapse into a +N. */
const PERSON_FACE_LIMIT = 3;

/**
 * A person cell. The face carries the tooltip, so a name the column is too
 * narrow for is still readable, and a person object holding an email or a
 * role shows it on hover.
 *
 * Radix portals the tooltip out of the row, which is what makes this work at
 * all — the cell clips its overflow, so anything positioned inside it would
 * be cut off by the row above.
 */
function PersonCell({ people }: { people: Person[] }) {
  const shown = people.slice(0, PERSON_FACE_LIMIT);
  const rest = people.slice(PERSON_FACE_LIMIT);

  return (
    <TooltipProvider delayDuration={80}>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {shown.map((person, i) => (
            <Tooltip key={`${person.name}-${i}`}>
              <TooltipTrigger asChild>
                <span className="relative inline-flex rounded-full ring-2 ring-[var(--background)] transition-transform duration-200 hover:z-10 hover:-translate-y-0.5">
                  <Avatar name={person.name} src={person.avatar} size="xs" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-medium">{person.name}</span>
                {person.subtitle && (
                  <span className="ml-2 text-muted-foreground">{person.subtitle}</span>
                )}
              </TooltipContent>
            </Tooltip>
          ))}

          {rest.length > 0 && (
            /* A popover, not a tooltip: a tooltip vanishes the moment you
               move towards it, so the names it holds can be read but never
               reached. This one opens on click and stays put, which is what
               anyone poking at a +N is actually trying to do. */
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`Show all ${people.length} people`}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-[1] grid size-6 place-items-center rounded-full bg-[var(--card)] text-[10px] font-medium text-[var(--muted-foreground)] ring-2 ring-[var(--background)] transition-[transform,color,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[var(--muted)] hover:text-[var(--foreground)] data-[state=open]:-translate-y-0.5 data-[state=open]:text-[var(--foreground)]"
                >
                  +{rest.length}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-56 p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                  {people.length} people
                </p>
                {/* Everyone, not only the hidden ones — the faces in the row
                    are 24px and half-covered, so the list is where you
                    actually read who is on this. */}
                <div className="max-h-56 overflow-y-auto">
                  {people.map((person, i) => (
                    <div
                      key={`${person.name}-${i}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--muted)]"
                    >
                      <Avatar name={person.name} src={person.avatar} size="xs" />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium">{person.name}</span>
                        {person.subtitle && (
                          <span className="block truncate text-[11px] text-[var(--muted-foreground)]">
                            {person.subtitle}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* One person gets their name in the row; a crowd would not fit. */}
        {people.length === 1 && (
          <span className="truncate text-sm">{people[0]!.name}</span>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * The calendar date the value names, not the one the reader's clock is on.
 *
 * `2026-08-01T00:00:00Z` is the 31st of July in New York, so parsing to a
 * moment and formatting it locally moves every date backwards for half the
 * world. Where the value starts with a plain date those digits are the
 * answer, and are used as written.
 */
const DATE_PARTS = /^(\d{4})-(\d{2})-(\d{2})/;

function toLocalDate(value: unknown): Date | undefined {
  if (value == null || value === "") return undefined;
  const raw = String(value);
  const parts = DATE_PARTS.exec(raw);
  if (parts) return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** What a date cell commits: the plain shape the column already held. */
function toDateValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * A text comparison under one of the named operators.
 *
 * Kept apart from each type's own `matchesFilter`, which is handed a value and
 * nothing else — the operator arrives with the filter, not with the column.
 */
/**
 * Turns one rule into a test, with everything that does not depend on the row
 * worked out first.
 *
 * The value you typed is the same for every row, so lowercasing it, trimming
 * it, and — for a number or a date — converting it, only needs doing once.
 * Doing it inside the test instead repeated that work per row: measured on
 * fifty thousand rows, a text rule cost 78ms rather than 28ms, and a number
 * rule 18ms rather than 8ms. Filters combine, so that multiplies by the number
 * of rules in force.
 */
export function makeMatcher(
  op: FilterOperator,
  filterValue: string | string[],
  type: string = "text",
): (cellValue: unknown) => boolean {
  // Presence and state ignore the value entirely.
  switch (op) {
    case "is_empty":
      return (v) => toString(v).trim() === "" || (Array.isArray(v) && v.length === 0);
    case "is_not_empty":
      return (v) => toString(v).trim() !== "" && !(Array.isArray(v) && v.length === 0);
    case "is_checked":
      return (v) => Boolean(v);
    case "is_unchecked":
      return (v) => !v;
  }

  const wanted = toString(Array.isArray(filterValue) ? filterValue[0] : filterValue)
    .toLowerCase()
    .trim();

  // An empty box is not a filter — every row passes until something is typed.
  if (wanted === "") return () => true;

  const numeric = type === "number";
  const dated = type === "date" || type === "created_time" || type === "last_edited_time";

  if (numeric || dated) {
    const target = numeric ? Number(wanted) : new Date(wanted).getTime();
    if (!Number.isFinite(target)) return () => false;
    const valueOf = numeric
      ? (v: unknown) => Number(v)
      : (v: unknown) => new Date(String(v)).getTime();

    switch (op) {
      case "is":
        return dated ? (v) => sameDay(v, wanted) : (v) => valueOf(v) === target;
      case "is_not":
        return dated ? (v) => !sameDay(v, wanted) : (v) => valueOf(v) !== target;
      case "gt": case "after": return (v) => valueOf(v) > target;
      case "gte": case "on_or_after": return (v) => valueOf(v) >= target;
      case "lt": case "before": return (v) => valueOf(v) < target;
      case "lte": case "on_or_before": return (v) => valueOf(v) <= target;
      default: return () => true;
    }
  }

  // Multi-value cells answer "contains" about their members, not their text —
  // otherwise "small" would match "small_task" and nothing else would behave.
  const members = (v: unknown) =>
    Array.isArray(v) ? v.map((x) => toString(x).toLowerCase()) : null;
  const text = (v: unknown) => toString(v).toLowerCase().trim();

  switch (op) {
    case "is":
      return (v) => members(v)?.includes(wanted) ?? text(v) === wanted;
    case "is_not":
      return (v) => { const m = members(v); return m ? !m.includes(wanted) : text(v) !== wanted; };
    case "contains":
      return (v) => members(v)?.includes(wanted) ?? text(v).includes(wanted);
    case "not_contains":
      return (v) => { const m = members(v); return m ? !m.includes(wanted) : !text(v).includes(wanted); };
    case "starts_with":
      return (v) => text(v).startsWith(wanted);
    case "ends_with":
      return (v) => text(v).endsWith(wanted);
    default:
      return (v) => text(v).includes(wanted);
  }
}

/** Dates compare by the day they name, not the millisecond. */
function sameDay(a: unknown, b: string): boolean {
  const da = toLocalDate(a);
  const db = toLocalDate(b);
  if (!da || !db) return false;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function textContains(v: unknown, f: string | string[]): boolean {
  return toString(v)
    .toLowerCase()
    .includes(toString(Array.isArray(f) ? f[0] : f).toLowerCase());
}

function dateCompare(a: unknown, b: unknown): number {
  const da = a == null || a === "" ? 0 : new Date(String(a)).getTime();
  const db = b == null || b === "" ? 0 : new Date(String(b)).getTime();
  return da - db;
}

function dateInRange(v: unknown, f: string | string[]): boolean {
  if (v == null) return false;
  const d = new Date(String(v)).getTime();
  const range = Array.isArray(f) ? f : [f];
  if (range.length === 2 && range[0] && range[1]) {
    return d >= new Date(range[0]).getTime() && d <= new Date(range[1]).getTime();
  }
  if (range[0]) return d >= new Date(range[0]).getTime();
  return true;
}

/** "https://acme.com/a/b?c=1" → "acme.com/a/b". A column of full URLs is noise. */
function prettyUrl(raw: string): string {
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const path = url.pathname === "/" ? "" : url.pathname;
    return `${url.host.replace(/^www\./, "")}${path}`;
  } catch {
    return raw;
  }
}

type CellFile = { url: string; name: string; image: boolean };

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i;

/** Files arrive as a URL, a list of them, or objects carrying a name. */
function toFiles(value: unknown): CellFile[] {
  if (value == null || value === "") return [];
  const list = Array.isArray(value) ? value : [value];
  return list
    .map((item) => {
      const url =
        typeof item === "string"
          ? item
          : toString((item as Record<string, unknown>)?.url ?? "");
      if (!url) return null;
      const named =
        typeof item === "object" && item !== null
          ? toString((item as Record<string, unknown>).name ?? "")
          : "";
      const name = named || url.split("/").pop()?.split("?")[0] || url;
      // The name as well as the address: plenty of image URLs carry no
      // extension at all (a CDN path, a signed link), and testing only the
      // address quietly demoted every one of them to a paperclip.
      return { url, name, image: IMAGE_EXT.test(url) || IMAGE_EXT.test(name) };
    })
    .filter((file): file is CellFile => file !== null);
}

/**
 * An attachment you can actually open.
 *
 * A link rather than a click handler, so it behaves like one: middle-click,
 * copy address and open-in-new-tab all work. `stopPropagation` keeps the click
 * off the row, which would otherwise treat opening a file as selecting a row.
 */
/**
 * An attachment you can open, and see before you do.
 *
 * A 24px thumbnail tells you almost nothing, so the card that follows the
 * cursor carries the real one — CursorCard from the library, which already
 * does the following and the spring. `asChild` matters here: without it the
 * component wraps its own styled anchor around the chip, and a table cell
 * gets prose styling it never asked for.
 *
 * A link rather than a click handler, so it behaves like one: middle-click,
 * copy address and open-in-new-tab all work. `stopPropagation` keeps the click
 * off the row, which would otherwise treat opening a file as selecting a row.
 */
function FileChip({ file }: { file: CellFile }) {
  const shared = {
    href: file.url,
    target: "_blank",
    rel: "noreferrer noopener",
    title: file.name,
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  const preview = (
    <>
      {file.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={file.url}
          alt=""
          className="mb-2 h-auto w-full rounded-md object-cover"
        />
      ) : (
        // Nothing to show for a file with no picture, so the card says what
        // it is instead of rendering a broken image.
        <span className="mb-2 grid h-20 w-full place-items-center rounded-md bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
          <Paperclip className="size-6" />
        </span>
      )}
      <p className="m-0 truncate text-xs text-neutral-600 dark:text-neutral-400">
        {file.name}
      </p>
    </>
  );

  return (
    <CursorCard asChild preview={preview}>
      {file.image ? (
        <a
          {...shared}
          className="block shrink-0 rounded ring-1 ring-[var(--border)] transition-transform duration-200 hover:-translate-y-0.5 hover:ring-[var(--foreground)]/30"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={file.url} alt={file.name} className="size-6 rounded object-cover" />
        </a>
      ) : (
        <a
          {...shared}
          className="inline-flex max-w-[120px] items-center gap-1 rounded-[3px] bg-[var(--card)] px-1.5 py-px text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          <Paperclip className="size-3 shrink-0 text-[var(--muted-foreground)]" />
          <span className="truncate">{file.name}</span>
        </a>
      )}
    </CursorCard>
  );
}

/**
 * The system-filled timestamps: date and time, since "when" is the point.
 *
 * Parsed as an instant rather than through `toLocalDate`, which reads only the
 * date digits and would report every timestamp as midnight. A date column
 * wants the calendar date it names; a timestamp wants the moment, shown in the
 * reader's own timezone.
 */
function MetaTime({ value }: { value: unknown }) {
  const raw = toString(value);
  if (!raw) return <span className="text-[var(--muted-foreground)]">—</span>;
  const hasTime = /\d{2}:\d{2}/.test(raw);
  const d = hasTime ? new Date(raw) : toLocalDate(raw);
  if (!d || Number.isNaN(d.getTime()))
    return <span className="text-[var(--muted-foreground)]">—</span>;
  return (
    <span className="text-[var(--muted-foreground)]">
      {format(d, hasTime ? "d MMM yyyy, HH:mm" : "d MMM yyyy")}
    </span>
  );
}

/** The plain input shared by text, url, email, phone and place. */
function TextEditCell({
  value,
  onCommit,
  onCancel,
  type,
}: {
  value: unknown;
  onCommit: (v: unknown) => void;
  onCancel: () => void;
  type: "text" | "url" | "email" | "tel";
}) {
  return (
    <input
      type={type}
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
  );
}

/**
 * The several values a multi-select cell holds.
 *
 * They arrive either as a list or as "a, b, c" — a flat export gives the
 * second — and are written back in whichever shape they came in, so a column
 * does not silently change type the first time somebody edits it.
 */
function toValues(value: unknown): string[] {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.map(toString).filter(Boolean);
  return toString(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function fromValues(next: string[], original: unknown): unknown {
  if (Array.isArray(original)) return next;
  return next.join(", ");
}

/**
 * A categorical value, drawn as a tag.
 *
 * Replaces the bordered pills these columns used to render. A pill reads as
 * something to press; a tinted block reads as a label, which is what a status
 * is, and a column of them scans as data rather than as a row of buttons.
 */
function TagCell({ value, options }: { value: unknown; options?: SelectOption[] }) {
  const raw = toString(value);
  if (!raw) return null;
  const option = options?.find((o) => o.value === raw);
  return (
    <Tag color={tagColorFor(raw)}>{option?.label ?? tagLabel(raw)}</Tag>
  );
}

/**
 * The editor for those columns.
 *
 * It was a native `<select>`, which is drawn by the operating system: a white
 * rectangle in the middle of a dark table, unable to show a tag, unsearchable,
 * and nothing like the rest of the app. This opens the same picker Notion
 * uses — search, create, drag to reorder, every option shown as its tag.
 */
function TagEditCell({
  value,
  onCommit,
  onCancel,
  options,
  fallback,
  multiple = false,
}: {
  value: unknown;
  onCommit: (v: unknown) => void;
  onCancel: () => void;
  options?: SelectOption[];
  /** Used when the column declares none — status and priority know theirs. */
  fallback?: readonly string[];
  multiple?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const current = multiple ? toValues(value) : [toString(value)].filter(Boolean);
  // Multi-select stays open and edits in place; single-select commits on the
  // pick, so it holds its own draft only for the former.
  const [draft, setDraft] = useState(current);
  const chosen = multiple ? draft : current;

  const declared: TagOption[] =
    options && options.length > 0
      ? options.map((o) => ({ value: o.value, label: o.label }))
      : (fallback ?? []).map((v) => ({ value: v, label: tagLabel(v) }));

  // A value the column never declared is still a real value — showing the
  // picker without it would quietly offer to delete it.
  const missing = chosen
    .filter((v) => !declared.some((o) => o.value === v))
    .map((v) => ({ value: v, label: tagLabel(v) }));

  const [choices, setChoices] = useState<TagOption[]>([...declared, ...missing]);

  function close(next: boolean) {
    setOpen(next);
    if (next) return;
    // Multi-select has no single moment of commitment, so closing is it.
    if (multiple) onCommit(fromValues(draft, value));
    else onCancel();
  }

  return (
    <Popover open={open} onOpenChange={close}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`${INPUT_CLASS} flex items-center gap-1 overflow-hidden text-left`}
        >
          {chosen.length > 0 ? (
            chosen.map((v) => <TagCell key={v} value={v} options={options} />)
          ) : (
            <span className="text-[var(--muted-foreground)]">Empty</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <TagSelect
          options={choices}
          value={chosen}
          multiple={multiple}
          onOptionsChange={setChoices}
          onChange={(next) => {
            if (multiple) {
              setDraft(next);
              return;
            }
            setOpen(false);
            onCommit(next[0] ?? null);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * Editing a date opens the calendar, not a native date field — whose look,
 * keyboard behaviour and ordering of day and month are the browser's rather
 * than the app's.
 */
function DateEditCell({
  value,
  onCommit,
  onCancel,
}: {
  value: unknown;
  onCommit: (v: unknown) => void;
  onCancel: () => void;
}) {
  const selected = toLocalDate(value);
  // Open on arrival: the cell was already clicked once to get here, and a
  // second click to reach the calendar is a click too many.
  const [open, setOpen] = useState(true);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onCancel();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`${INPUT_CLASS} flex items-center justify-between gap-1 text-left`}
        >
          {selected ? format(selected, "d MMM yyyy") : "Pick a date"}
          <CalendarIcon className="h-3 w-3 shrink-0 text-[var(--muted-foreground)]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
        <Calendar
          mode="single"
          autoFocus
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => {
            setOpen(false);
            onCommit(d ? toDateValue(d) : null);
          }}
        />
        <div className="flex items-center justify-between border-t border-[var(--border)] p-2">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onCommit(null);
            }}
            className="rounded px-2 py-1 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onCommit(toDateValue(new Date()));
            }}
            className="rounded px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/10"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
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
        className={`${NUMBER_INPUT_CLASS} text-right tabular-nums`}
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
    renderCell: (value, _row) => <TagCell value={value} />,
    renderEditCell: (value, onCommit, onCancel, options) => (
      <TagEditCell
        value={value}
        onCommit={onCommit}
        onCancel={onCancel}
        options={options}
        fallback={TASK_STATUSES}
      />
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
      const d = toLocalDate(value);
      if (!d) return <span className="text-[var(--muted-foreground)]">—</span>;
      return <span>{format(d, "d MMM yyyy")}</span>;
    },
    renderEditCell: (value, onCommit, onCancel) => (
      <DateEditCell value={value} onCommit={onCommit} onCancel={onCancel} />
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
    renderCell: (value) => (
      <Checkbox
        checked={Boolean(value)}
        animateIn={false}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none"
      />
    ),
    renderEditCell: (value, onCommit) => (
      <Checkbox
        checked={Boolean(value)}
        onCheckedChange={(v) => onCommit(v === true)}
        onClick={(e) => e.stopPropagation()}
        // No entrance in a table. Rows are virtualised, so they mount and
        // unmount as you scroll, and the tick would redraw itself every pass.
        animateIn={false}
        className="cursor-pointer"
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
    defaultEditable: true,
    renderCell: (value, _row) => <TagCell value={value} />,
    renderEditCell: (value, onCommit, onCancel, options) => (
      <TagEditCell value={value} onCommit={onCommit} onCancel={onCancel} options={options} />
    ),
    sortFn: strCompare,
    filterType: "select",
    matchesFilter: multiOptionFilter,
    matchesSearch: defaultSearch,
  },

  person: {
    defaultEditable: false,
    renderCell: (value) => {
      const people = toPeople(value);
      if (people.length === 0)
        return <span className="text-[var(--muted-foreground)]">—</span>;
      return <PersonCell people={people} />;
    },
    renderEditCell: () => null,
    sortFn: (a, b) =>
      COLLATOR.compare(getPersonName(a), getPersonName(b)),
    filterType: "text",
    matchesFilter: (v, f) => {
      const name = getPersonName(v).toLowerCase();
      const fv = toString(Array.isArray(f) ? f[0] : f).toLowerCase();
      return name.includes(fv);
    },
    matchesSearch: (v, q) => getPersonName(v).toLowerCase().includes(q),
  },

  department: {
    defaultEditable: true,
    renderCell: (value) => {
      const values = toValues(value);
      if (values.length === 0) return null;
      return (
        <span className="inline-flex flex-wrap items-center gap-1">
          {values.map((v) => (
            <Tag key={v} color={tagColorFor(v)}>
              {tagLabel(v)}
            </Tag>
          ))}
        </span>
      );
    },
    renderEditCell: (value, onCommit, onCancel, options) => (
      <TagEditCell
        value={value}
        onCommit={onCommit}
        onCancel={onCancel}
        options={options}
        multiple
      />
    ),
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
      COLLATOR.compare(getRecordTitle(a), getRecordTitle(b)),
    filterType: "text",
    matchesFilter: (v, f) =>
      getRecordTitle(v)
        .toLowerCase()
        .includes(toString(Array.isArray(f) ? f[0] : f).toLowerCase()),
    matchesSearch: (v, q) => getRecordTitle(v).toLowerCase().includes(q),
  },

  priority: {
    defaultEditable: true,
    renderCell: (value, _row) => <TagCell value={value} />,
    renderEditCell: (value, onCommit, onCancel, options) => (
      <TagEditCell
        value={value}
        onCommit={onCommit}
        onCancel={onCancel}
        options={options}
        fallback={PRIORITIES}
      />
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
    renderCell: (value, _row) => <TagCell value={value} />,
    renderEditCell: (value, onCommit, onCancel, options) => (
      <TagEditCell
        value={value}
        onCommit={onCommit}
        onCancel={onCancel}
        options={options}
        fallback={ROLES}
      />
    ),
    sortFn: strCompare,
    filterType: "select",
    matchesFilter: multiOptionFilter,
    matchesSearch: defaultSearch,
  },

  // --- Notion's remaining property types ---------------------------------

  /** Notion's name for the tick. `boolean` is the same entry under the old name. */
  checkbox: {
    defaultEditable: true,
    // A checkbox, not a tick-or-cross pair. The cross reads as a failure
    // rather than as "not ticked", and neither shape invites the click that
    // the column is entirely about.
    renderCell: (value) => (
      <Checkbox
        checked={Boolean(value)}
        animateIn={false}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none"
      />
    ),
    renderEditCell: (value, onCommit) => (
      <Checkbox
        checked={Boolean(value)}
        onCheckedChange={(v) => onCommit(v === true)}
        onClick={(e) => e.stopPropagation()}
        // No entrance in a table. Rows are virtualised, so they mount and
        // unmount as you scroll, and the tick would redraw itself every pass.
        animateIn={false}
        className="cursor-pointer"
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



  /** Single select. A tag, and the picker that chooses it. */
  select: {
    defaultEditable: true,
    renderCell: (value, _row) => <TagCell value={value} />,
    renderEditCell: (value, onCommit, onCancel, options) => (
      <TagEditCell value={value} onCommit={onCommit} onCancel={onCancel} options={options} />
    ),
    sortFn: strCompare,
    filterType: "select",
    matchesFilter: multiOptionFilter,
    matchesSearch: defaultSearch,
  },

  /** Several tags at once. */
  multi_select: {
    defaultEditable: true,
    renderCell: (value) => {
      const values = toValues(value);
      if (values.length === 0) return null;
      return (
        <span className="inline-flex flex-wrap items-center gap-1">
          {values.map((v) => (
            <Tag key={v} color={tagColorFor(v)}>
              {tagLabel(v)}
            </Tag>
          ))}
        </span>
      );
    },
    renderEditCell: (value, onCommit, onCancel, options) => (
      <TagEditCell
        value={value}
        onCommit={onCommit}
        onCancel={onCancel}
        options={options}
        multiple
      />
    ),
    sortFn: strCompare,
    filterType: "select",
    matchesFilter: (v, f) => {
      const values = toValues(v);
      const wanted = Array.isArray(f) ? f : [f];
      // A row matches if it carries any of the chosen tags — the alternative,
      // demanding all of them, makes a two-tag filter return almost nothing.
      return wanted.some((w) => values.includes(toString(w)));
    },
    matchesSearch: (v, q) => toValues(v).some((x) => x.toLowerCase().includes(q)),
  },

  /** Attachments. Images show as thumbnails, everything else as a chip. */
  files: {
    defaultEditable: false,
    renderCell: (value) => {
      const files = toFiles(value);
      if (files.length === 0) return null;
      return (
        // flex-wrap so a second chip stacks instead of running past the
        // column edge; the cell clips, so unwrapped columns show one row.
        <span className="inline-flex flex-wrap items-center gap-1">
          {files.slice(0, 4).map((file, i) => (
            <FileChip key={`${file.url}-${i}`} file={file} />
          ))}
          {files.length > 4 && (
            <span className="text-xs text-[var(--muted-foreground)]">
              +{files.length - 4}
            </span>
          )}
        </span>
      );
    },
    renderEditCell: () => null,
    sortFn: (a, b) => toFiles(a).length - toFiles(b).length,
    filterType: "text",
    matchesFilter: (v, f) =>
      toFiles(v).some((file) =>
        file.name.toLowerCase().includes(toString(Array.isArray(f) ? f[0] : f).toLowerCase()),
      ),
    matchesSearch: (v, q) => toFiles(v).some((file) => file.name.toLowerCase().includes(q)),
  },

  /** A link. Shows the host, not the whole URL — a column of them is unreadable. */
  url: {
    defaultEditable: true,
    renderCell: (value) => {
      const raw = toString(value);
      if (!raw) return <span className="text-[var(--muted-foreground)]">—</span>;
      return (
        <a
          href={raw}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-2 transition-colors hover:decoration-current"
        >
          <span className="truncate">{prettyUrl(raw)}</span>
          <ExternalLink className="size-3 shrink-0 opacity-50" />
        </a>
      );
    },
    renderEditCell: (value, onCommit, onCancel) => (
      <TextEditCell value={value} onCommit={onCommit} onCancel={onCancel} type="url" />
    ),
    sortFn: strCompare,
    filterType: "text",
    matchesFilter: textContains,
    matchesSearch: defaultSearch,
  },

  email: {
    defaultEditable: true,
    renderCell: (value) => {
      const raw = toString(value);
      if (!raw) return <span className="text-[var(--muted-foreground)]">—</span>;
      return (
        <a
          href={`mailto:${raw}`}
          onClick={(e) => e.stopPropagation()}
          className="truncate text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-2 transition-colors hover:decoration-current"
        >
          {raw}
        </a>
      );
    },
    renderEditCell: (value, onCommit, onCancel) => (
      <TextEditCell value={value} onCommit={onCommit} onCancel={onCancel} type="email" />
    ),
    sortFn: strCompare,
    filterType: "text",
    matchesFilter: textContains,
    matchesSearch: defaultSearch,
  },

  phone: {
    defaultEditable: true,
    renderCell: (value) => {
      const raw = toString(value);
      if (!raw) return <span className="text-[var(--muted-foreground)]">—</span>;
      return (
        <a
          href={`tel:${raw.replace(/\s+/g, "")}`}
          onClick={(e) => e.stopPropagation()}
          className="truncate tabular-nums text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-2 transition-colors hover:decoration-current"
        >
          {raw}
        </a>
      );
    },
    renderEditCell: (value, onCommit, onCancel) => (
      <TextEditCell value={value} onCommit={onCommit} onCancel={onCancel} type="tel" />
    ),
    sortFn: strCompare,
    filterType: "text",
    matchesFilter: textContains,
    matchesSearch: defaultSearch,
  },

  /**
   * The four columns the system fills in. Read-only on purpose — a "last
   * edited" you can type into is a lie.
   */
  created_time: {
    defaultEditable: false,
    renderCell: (value) => <MetaTime value={value} />,
    renderEditCell: () => null,
    sortFn: dateCompare,
    filterType: "date-range",
    matchesFilter: dateInRange,
    matchesSearch: defaultSearch,
  },

  last_edited_time: {
    defaultEditable: false,
    renderCell: (value) => <MetaTime value={value} />,
    renderEditCell: () => null,
    sortFn: dateCompare,
    filterType: "date-range",
    matchesFilter: dateInRange,
    matchesSearch: defaultSearch,
  },

  created_by: {
    defaultEditable: false,
    renderCell: (value) => {
      const people = toPeople(value);
      if (people.length === 0) return <span className="text-[var(--muted-foreground)]">—</span>;
      return <PersonCell people={people} />;
    },
    renderEditCell: () => null,
    sortFn: (a, b) => COLLATOR.compare(getPersonName(a), getPersonName(b)),
    filterType: "text",
    matchesFilter: (v, f) =>
      getPersonName(v).toLowerCase().includes(toString(Array.isArray(f) ? f[0] : f).toLowerCase()),
    matchesSearch: (v, q) => getPersonName(v).toLowerCase().includes(q),
  },

  last_edited_by: {
    defaultEditable: false,
    renderCell: (value) => {
      const people = toPeople(value);
      if (people.length === 0) return <span className="text-[var(--muted-foreground)]">—</span>;
      return <PersonCell people={people} />;
    },
    renderEditCell: () => null,
    sortFn: (a, b) => COLLATOR.compare(getPersonName(a), getPersonName(b)),
    filterType: "text",
    matchesFilter: (v, f) =>
      getPersonName(v).toLowerCase().includes(toString(Array.isArray(f) ? f[0] : f).toLowerCase()),
    matchesSearch: (v, q) => getPersonName(v).toLowerCase().includes(q),
  },

  /** An action in a cell. The column definition says what it does. */
  button: {
    defaultEditable: false,
    renderCell: () => null,
    renderEditCell: () => null,
    sortFn: () => 0,
    filterType: "none",
    matchesFilter: () => true,
    matchesSearch: () => false,
  },

  place: {
    defaultEditable: true,
    renderCell: (value) => {
      const raw = toString(value);
      if (!raw) return <span className="text-[var(--muted-foreground)]">—</span>;
      return (
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin className="size-3 shrink-0 text-[var(--muted-foreground)]" />
          <span className="truncate">{raw}</span>
        </span>
      );
    },
    renderEditCell: (value, onCommit, onCancel) => (
      <TextEditCell value={value} onCommit={onCommit} onCancel={onCancel} type="text" />
    ),
    sortFn: strCompare,
    filterType: "text",
    matchesFilter: textContains,
    matchesSearch: defaultSearch,
  },

  /** A stable handle for the row. Never editable — that is the point of it. */
  id: {
    defaultEditable: false,
    renderCell: (value) => {
      const raw = toString(value);
      if (!raw) return <span className="text-[var(--muted-foreground)]">—</span>;
      return (
        <span className="font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
          {raw}
        </span>
      );
    },
    renderEditCell: () => null,
    sortFn: (a, b) => strCompare(a, b),
    filterType: "text",
    matchesFilter: textContains,
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
