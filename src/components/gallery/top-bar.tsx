"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Github, Search } from "lucide-react";
import { CommandPalette, type PaletteEntry } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

/**
 * Full-width bar above the sidebar.
 *
 * It owns the palette's open state so the search field and the ⌘K shortcut are
 * the same thing — a separate trigger that opened its own dialog would drift
 * out of sync with the shortcut.
 */
export function TopBar({
  entries,
  total,
}: {
  entries: PaletteEntry[];
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const [mac, setMac] = useState(true);

  // Read after mount — navigator does not exist on the server, and branching
  // on it during render makes the two disagree.
  useEffect(() => {
    setMac(/mac/i.test(navigator.platform || navigator.userAgent));
  }, []);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-g-line bg-g-surface px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="size-6 shrink-0" />

          <span className="font-display text-sm font-semibold tracking-tight">
            Component Library
          </span>
          <span className="hidden text-[11px] tabular-nums text-g-dim sm:inline">
            {total}
          </span>
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="group ml-auto flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-g-line bg-g-canvas px-3 text-left transition-colors hover:border-g-brand/50"
        >
          <Search size={14} className="shrink-0 text-g-dim" />
          <span className="flex-1 truncate text-xs text-g-dim">
            Search components…
          </span>
          <kbd className="shrink-0 rounded border border-g-line bg-g-surface px-1.5 py-0.5 font-mono text-[10px] text-g-dim">
            {mac ? "⌘" : "Ctrl"}K
          </kbd>
        </button>

        {/* The two showcase pages, not registry categories — they are
            products built from the shelf rather than things on it. */}
        <nav className="hidden items-center gap-1 md:flex">
          <TopLink href="/app-shell">App Shell</TopLink>
          <TopLink href="/logo-generator">Logo Generator</TopLink>
        </nav>

        <a
          href="https://github.com/ZenBen5173/component-library"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub repository"
          className="grid size-8 shrink-0 place-items-center rounded-md text-g-dim transition-colors hover:bg-g-canvas hover:text-g-ink"
        >
          <Github size={15} />
        </a>

        <ThemeToggle />
      </header>

      <CommandPalette entries={entries} open={open} onOpenChange={setOpen} />
    </>
  );
}

function TopLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-2.5 py-1.5 text-xs text-g-dim transition-colors hover:bg-g-canvas hover:text-g-ink"
    >
      {children}
    </Link>
  );
}
