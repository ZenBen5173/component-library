"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING } from "@/lib/motion";
import { EntryCard, type CardEntry } from "./entry-card";

/**
 * Tag and category filtering over a set of entries.
 *
 * Every entry has carried tags since the first batch went in, but nothing ever
 * surfaced them — the only way to use one was to guess it in the sidebar's
 * text search. Single-select rather than multi: for a shelf this size, "show me
 * the portfolio ones" is the actual question, and stacked filters just produce
 * empty grids.
 */
export function EntryBrowser({
  entries,
  categories,
}: {
  entries: CardEntry[];
  /** Slug → label. Omit to hide the category row (already inside one). */
  categories?: { slug: string; label: string }[];
}) {
  const [tag, setTag] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const scoped = useMemo(
    () => (category ? entries.filter((e) => e.category === category) : entries),
    [entries, category],
  );

  // Ordered by how much of the shelf they cover, so the useful ones lead.
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of scoped) {
      for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n > 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 14)
      .map(([t]) => t);
  }, [scoped]);

  // Every card stays mounted and non-matches are hidden, rather than filtering
  // the list. Unmounting throws away thumbnails that have already loaded, so
  // toggling a tag twice would re-fetch and re-compile every preview behind it.
  const matches = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      const ok =
        (!category || e.category === category) &&
        (!tag || e.tags.includes(tag));
      if (ok) set.add(`${e.category}/${e.slug}`);
    }
    return set;
  }, [entries, category, tag]);

  const chip =
    "rounded-full border px-3 py-1 text-xs transition-colors duration-200";

  return (
    <div>
      {categories && (
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={category === null}
            onClick={() => {
              setCategory(null);
              setTag(null);
            }}
          >
            Everything
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.slug}
              active={category === c.slug}
              onClick={() => {
                setCategory(category === c.slug ? null : c.slug);
                setTag(null);
              }}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className={cn("flex flex-wrap items-center gap-1.5", categories && "mt-3")}>
          <span className="mr-1 text-[10px] uppercase tracking-widest text-g-dim">
            Tags
          </span>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? null : t)}
              className={cn(
                chip,
                tag === t
                  ? "border-g-brand bg-g-brand/10 text-g-brand"
                  : "border-g-line text-g-dim hover:border-g-brand/50 hover:text-g-ink",
              )}
            >
              {t}
            </button>
          ))}
          {tag && (
            <button
              onClick={() => setTag(null)}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-g-dim hover:text-g-ink"
            >
              <X size={11} /> clear
            </button>
          )}
        </div>
      )}

      <p className="mt-5 text-[11px] uppercase tracking-widest text-g-dim">
        {matches.size} {matches.size === 1 ? "component" : "components"}
      </p>

      {matches.size === 0 && (
        <p className="mt-8 text-sm text-g-dim">Nothing matches that filter.</p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry, i) => {
          const id = `${entry.category}/${entry.slug}`;
          return (
            <div key={id} hidden={!matches.has(id)}>
              <EntryCard entry={entry} index={i} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="relative rounded-full px-3 py-1 text-xs">
      {active && (
        <motion.span
          layoutId="browser-chip"
          transition={SPRING.default}
          className="absolute inset-0 rounded-full bg-g-brand/15 ring-1 ring-g-brand/40"
        />
      )}
      <span
        className={cn(
          "relative transition-colors duration-200",
          active ? "text-g-brand" : "text-g-dim hover:text-g-ink",
        )}
      >
        {children}
      </span>
    </button>
  );
}
