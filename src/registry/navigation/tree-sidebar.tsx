"use client";

/**
 * @name Tree Sidebar
 * @description The nav this library runs on — a filterable file tree with connector lines, a hover highlight that glides between rows, and a shortcut hint.
 * @tags sidebar, navigation, tree, file-browser, docs, hover, sliding-indicator, app, must-have
 * @height 640
 * @deps motion
 * @note This is the gallery's own sidebar as a component, rebuilt on semantic tokens. Filtering expands the sections holding matches: the tree seeds expansion from `defaultExpandedIds` and exposes no setter, so the provider is remounted by key when the set of nodes that should be open changes — keyed on that set rather than the query, so typing does not remount on every keystroke. The row selector needs `.group`, since the tree's expander chevrons also carry `cursor-pointer` and are 16px wide; the highlight collapses to a stub without it.
 * @source src/components/kibo-ui/tree/index.tsx
 */
import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
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
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "components",
    label: "Components",
    items: ["Button", "Card", "Dialog", "Input", "Tooltip"],
  },
  {
    id: "patterns",
    label: "Patterns",
    items: ["Data Table", "Empty State", "Onboarding"],
  },
  {
    id: "foundations",
    label: "Foundations",
    items: ["Colour", "Motion", "Spacing", "Typography"],
  },
];

export default function TreeSidebarDemo() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("Motion");

  const navRef = useRef<HTMLDivElement>(null);
  const [glide, setGlide] = useState<
    { top: number; left: number; width: number; height: number } | null
  >(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter((i) => i.toLowerCase().includes(q)),
    })).filter((s) => s.items.length > 0);
  }, [query]);

  const expanded = query.trim()
    ? filtered.map((s) => s.id)
    : [SECTIONS.find((s) => s.items.includes(active))?.id ?? "components"];

  /**
   * One handler for the whole tree. `.group` narrows it to row triggers —
   * plain `.cursor-pointer` also matches the expander chevrons, which are
   * 16px wide, and the highlight would collapse to a stub crossing one.
   */
  const track = (e: React.PointerEvent) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>(
      ".group.cursor-pointer",
    );
    const host = navRef.current;
    if (!row || !host || !host.contains(row)) return;
    const r = row.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    setGlide({
      // Against the scroll container's content box, so it stays right as
      // the tree scrolls.
      top: r.top - h.top + host.scrollTop,
      left: r.left - h.left,
      width: r.width,
      height: r.height,
    });
  };

  const rowClass = (isActive: boolean) =>
    cn(
      // No hover fill of its own: the gliding highlight behind the rows is
      // the hover state, and both at once reads as a double flash.
      "relative z-10 py-1.5 pr-2 text-[13px] hover:bg-transparent",
      isActive
        ? "bg-primary/10 text-primary hover:bg-primary/10"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="flex h-[640px] w-full bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="truncate font-display text-sm font-semibold">
            Design Docs
          </p>
          <p className="text-[11px] text-muted-foreground">
            {SECTIONS.reduce((n, s) => n + s.items.length, 0)} pages
          </p>
        </div>

        <div className="border-b border-border p-3">
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter…"
              className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-12 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        <div
          ref={navRef}
          onPointerOver={track}
          onPointerLeave={() => setGlide(null)}
          className="relative flex-1 overflow-y-auto py-2"
        >
          <motion.span
            aria-hidden
            className="pointer-events-none absolute z-0 rounded-md bg-muted"
            initial={false}
            animate={
              glide
                ? {
                    opacity: 1,
                    top: glide.top,
                    left: glide.left,
                    width: glide.width,
                    height: glide.height,
                  }
                : { opacity: 0 }
            }
            transition={SPRING.default}
          />

          {filtered.length === 0 ? (
            <p className="px-4 py-4 text-xs text-muted-foreground">No matches.</p>
          ) : (
            <TreeProvider
              key={expanded.join("|")}
              defaultExpandedIds={expanded}
              selectedIds={[active]}
              onSelectionChange={() => {}}
              showLines
              showIcons
              indent={14}
            >
              <TreeView>
                {filtered.map((section, si) => (
                  <TreeNode
                    key={section.id}
                    nodeId={section.id}
                    level={0}
                    isLast={si === filtered.length - 1}
                  >
                    <TreeNodeTrigger className={rowClass(false)}>
                      <TreeExpander hasChildren />
                      <TreeIcon hasChildren />
                      <TreeLabel className="text-[13px] font-medium">
                        {section.label}
                      </TreeLabel>
                      <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">
                        {section.items.length}
                      </span>
                    </TreeNodeTrigger>

                    <TreeNodeContent hasChildren>
                      {section.items.map((item, ii) => (
                        <TreeNode
                          key={item}
                          nodeId={item}
                          level={1}
                          isLast={ii === section.items.length - 1}
                        >
                          <TreeNodeTrigger
                            className={rowClass(active === item)}
                            onClick={() => setActive(item)}
                          >
                            <TreeExpander hasChildren={false} />
                            <TreeIcon hasChildren={false} />
                            <TreeLabel className="text-[13px]">{item}</TreeLabel>
                          </TreeNodeTrigger>
                        </TreeNode>
                      ))}
                    </TreeNodeContent>
                  </TreeNode>
                ))}
              </TreeView>
            </TreeProvider>
          )}
        </div>
      </aside>

      <main className="grid flex-1 place-items-center p-8">
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {active}
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Run the pointer down the tree — the highlight follows it between
            sections and pages alike.
          </p>
        </div>
      </main>
    </div>
  );
}
