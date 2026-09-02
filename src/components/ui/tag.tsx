"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A tag, in Notion's sense: a soft tinted rectangle, not a bordered pill.
 *
 * The distinction matters more than it sounds. A pill with a 1px border reads
 * as a control — something to press. A tinted block reads as a label, which is
 * what a status or a category actually is, and a column of them scans as data
 * rather than as a row of buttons.
 */

export type TagColor =
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

export const TAG_COLORS: TagColor[] = [
  "gray",
  "brown",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
];

/**
 * Written out rather than composed, because Tailwind reads class names as
 * literal strings — `bg-${color}-500/15` generates nothing at all.
 */
const TAG_CLASS: Record<TagColor, string> = {
  gray: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/20 dark:text-neutral-200",
  brown: "bg-amber-800/15 text-amber-900 dark:bg-amber-700/25 dark:text-amber-200",
  orange: "bg-orange-500/15 text-orange-700 dark:bg-orange-400/20 dark:text-orange-200",
  yellow: "bg-yellow-500/20 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-200",
  green: "bg-green-500/15 text-green-700 dark:bg-green-400/20 dark:text-green-200",
  blue: "bg-blue-500/15 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200",
  purple: "bg-purple-500/15 text-purple-700 dark:bg-purple-400/20 dark:text-purple-200",
  pink: "bg-pink-500/15 text-pink-700 dark:bg-pink-400/20 dark:text-pink-200",
  red: "bg-red-500/15 text-red-700 dark:bg-red-400/20 dark:text-red-200",
};

/**
 * Words that should always land on the same colour, whatever else is in the
 * column — "failed" being green because of where it fell in a hash would be
 * worse than no colour at all.
 */
const MEANING: [TagColor, string[]][] = [
  ["green", ["complete", "done", "active", "approved", "published", "enabled", "verified", "success", "paid", "live", "open"]],
  ["yellow", ["pending", "progress", "review", "waiting", "medium", "partial", "draft"]],
  ["red", ["failed", "error", "rejected", "cancelled", "overdue", "blocked", "high", "urgent", "critical", "expired", "disabled"]],
  ["blue", ["scheduled", "planned", "queued", "new", "todo", "assigned"]],
  ["gray", ["archived", "closed", "inactive", "none", "low", "backlog"]],
];

/** Stable across server and client — a random colour would break hydration. */
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * The colour for a value. Meaning first, then a hash of the text — so an
 * unknown tag still gets a colour, gets the same one every time, and two
 * different tags rarely collide.
 */
export function tagColorFor(value: string): TagColor {
  const lc = value.toLowerCase().replace(/[_-]/g, " ");
  for (const [color, words] of MEANING) {
    if (words.some((word) => lc.includes(word))) return color;
  }
  return TAG_COLORS[hash(lc) % TAG_COLORS.length]!;
}

/** "in_progress" → "In progress". */
export function tagLabel(value: string): string {
  const spaced = value.replace(/[_-]/g, " ").trim();
  return spaced ? spaced.charAt(0).toUpperCase() + spaced.slice(1) : "";
}

export function Tag({
  children,
  color,
  size = "sm",
  onRemove,
  className,
}: {
  children: React.ReactNode;
  color?: TagColor;
  size?: "sm" | "md";
  /** Renders the × that removes it from a selection. */
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-[3px] font-medium whitespace-nowrap",
        size === "sm" ? "px-1.5 py-px text-xs" : "px-2 py-0.5 text-sm",
        TAG_CLASS[color ?? "gray"],
        className,
      )}
    >
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-0.5 shrink-0 rounded-sm opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
