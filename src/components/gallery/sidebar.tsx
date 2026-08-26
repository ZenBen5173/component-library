"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export type SidebarEntry = {
  slug: string;
  category: string;
  name: string;
  tags: string[];
};

export type SidebarCategory = {
  slug: string;
  label: string;
  entries: SidebarEntry[];
};

export function Sidebar({ categories }: { categories: SidebarCategory[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => ({
        ...c,
        entries: c.entries.filter((e) =>
          [e.name, e.slug, ...e.tags].join(" ").toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.entries.length > 0);
  }, [categories, query]);

  const total = categories.reduce((n, c) => n + c.entries.length, 0);

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col border-r border-g-line bg-g-surface">
      <div className="flex items-center justify-between gap-2 border-b border-g-line px-4 py-3">
        <Link href="/" className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">
            Component Library
          </div>
          <div className="text-[11px] text-g-dim">{total} components</div>
        </Link>
        <ThemeToggle />
      </div>

      <div className="border-b border-g-line p-3">
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-g-dim"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter…"
            className="w-full rounded-md border border-g-line bg-g-canvas py-1.5 pl-7 pr-12 text-xs outline-none transition-colors placeholder:text-g-dim focus:border-g-brand"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-g-line bg-g-surface px-1 py-0.5 font-mono text-[9px] text-g-dim">
            ⌘K
          </kbd>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto p-3">
        {filtered.length === 0 && (
          <p className="px-1 py-4 text-xs text-g-dim">No matches.</p>
        )}

        {filtered.map((category) => (
          <div key={category.slug} className="mb-5">
            <Link
              href={`/${category.slug}`}
              className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-widest text-g-dim hover:text-g-ink"
            >
              {category.label}
            </Link>
            <ul className="space-y-px">
              {category.entries.map((entry) => {
                const href = `/${entry.category}/${entry.slug}`;
                const active = pathname === href;
                return (
                  <li key={entry.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "relative block truncate rounded-md py-1.5 pl-3 pr-2 text-[13px] transition-all duration-200",
                        active
                          ? "bg-g-brand/10 font-medium text-g-brand"
                          : "text-g-dim hover:bg-g-canvas hover:pl-3.5 hover:text-g-ink",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-g-brand transition-transform duration-200",
                          active ? "scale-y-100" : "scale-y-0",
                        )}
                      />
                      {entry.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
