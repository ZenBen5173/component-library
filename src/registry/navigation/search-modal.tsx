"use client";

/**
 * @name Search Modal
 * @description Collapsed search bar that expands into a full command palette — filter tags, grouped results, ⌘K.
 * @tags navigation, search, modal, command-palette, hotkey
 * @height 620
 * @deps framer-motion
 * @note The component ships the expanded panel and the overlay transition, but no trigger — you supply the collapsed bar and drive `open`, as below. Pass `modal={false}` if you want the panel inline instead.
 * @source src/components/ui/search-modal.tsx
 */
import { useState } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "@/components/ui/search-modal";

export default function SearchModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-[620px] items-start justify-center bg-neutral-100 p-8 pt-24 dark:bg-neutral-950">
      {/* The collapsed state — your own trigger. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-neutral-500 shadow-sm transition-colors hover:border-black/20 dark:border-white/10 dark:bg-neutral-900 dark:hover:border-white/20"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-black/10 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 dark:border-white/15">
          ⌘K
        </kbd>
      </button>

      <SearchModal modal open={open} onOpenChange={setOpen} />
    </div>
  );
}
