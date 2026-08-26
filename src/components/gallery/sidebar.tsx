"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "@/components/kibo-ui/tree";
import { cn } from "@/lib/utils";

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

/**
 * The registry is a folder of folders, so it navigates like one.
 *
 * Two things the tree does not do on its own:
 *
 * Expansion is uncontrolled — TreeProvider seeds it from `defaultExpandedIds`
 * and exposes no setter — so the provider is remounted by key when the set of
 * nodes that *should* be open changes. The key is derived from that set rather
 * than from the query, so typing does not remount on every keystroke.
 *
 * Clicking a category row toggles it open, which means it can't also navigate
 * to the category page. That lives on a hover-revealed arrow instead.
 */
export function Sidebar({ categories }: { categories: SidebarCategory[] }) {
  const pathname = usePathname();
  const router = useRouter();
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

  // Route drives selection: /controls/magnetic-button highlights the entry,
  // /controls highlights the category it lives in.
  const activeId = pathname.slice(1);
  const activeCategory = activeId.split("/")[0];

  const expanded = query.trim()
    ? filtered.map((c) => c.slug)
    : activeCategory
      ? [activeCategory]
      : [];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-g-line bg-g-surface">
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

      <nav className="scrollbar-thin flex-1 overflow-y-auto py-2">
        {filtered.length === 0 ? (
          <p className="px-4 py-4 text-xs text-g-dim">No matches.</p>
        ) : (
          <TreeProvider
            key={expanded.join("|")}
            defaultExpandedIds={expanded}
            selectedIds={[activeId]}
            onSelectionChange={() => {}}
            showLines
            showIcons
            indent={14}
          >
            <TreeView>
              {filtered.map((category, ci) => (
                <TreeNode
                  key={category.slug}
                  nodeId={category.slug}
                  level={0}
                  isLast={ci === filtered.length - 1}
                >
                  <TreeNodeTrigger className={rowClass(activeId === category.slug)}>
                    <TreeExpander hasChildren />
                    <TreeIcon hasChildren />
                    <TreeLabel className="text-[13px] font-medium">
                      {category.label}
                    </TreeLabel>
                    <span className="ml-1 text-[10px] tabular-nums text-g-dim group-hover:hidden">
                      {category.entries.length}
                    </span>
                    <button
                      title={`Open ${category.label}`}
                      onClick={(e) => {
                        // The row itself owns expand/collapse.
                        e.stopPropagation();
                        router.push(`/${category.slug}`);
                      }}
                      className="ml-1 hidden text-g-dim transition-colors hover:text-g-brand group-hover:block"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </TreeNodeTrigger>

                  <TreeNodeContent hasChildren>
                    {category.entries.map((entry, ei) => {
                      const id = `${entry.category}/${entry.slug}`;
                      return (
                        <TreeNode
                          key={entry.slug}
                          nodeId={id}
                          level={1}
                          isLast={ei === category.entries.length - 1}
                        >
                          <TreeNodeTrigger
                            className={rowClass(activeId === id)}
                            onClick={() => router.push(`/${id}`)}
                          >
                            <TreeExpander hasChildren={false} />
                            <TreeIcon hasChildren={false} />
                            <TreeLabel className="text-[13px]">
                              {entry.name}
                            </TreeLabel>
                          </TreeNodeTrigger>
                        </TreeNode>
                      );
                    })}
                  </TreeNodeContent>
                </TreeNode>
              ))}
            </TreeView>
          </TreeProvider>
        )}
      </nav>
    </aside>
  );
}

/** Overrides the tree's own accent colours with the gallery's chrome scale. */
function rowClass(active: boolean) {
  return cn(
    "py-1.5 pr-2 hover:bg-g-canvas",
    active ? "bg-g-brand/10 text-g-brand hover:bg-g-brand/10" : "text-g-dim",
  );
}
