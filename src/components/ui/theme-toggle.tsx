"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { wipeTheme } from "@/lib/theme-wipe";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Theme toggle on semantic tokens, for use inside components.
 *
 * The circle wipe is driven straight from the View Transitions API rather than
 * pulled from a theme-toggle library — the two in this registry are skiper
 * based, and skiper source is not redistributable.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Toggle theme"
      onClick={() =>
        wipeTheme(ref.current, () =>
          // flushSync matters: startViewTransition snapshots the DOM once its
          // callback resolves, and React would otherwise batch this to a later
          // tick — the snapshot would catch the old theme and nothing wipes.
          flushSync(() => setTheme(isDark ? "light" : "dark")),
        )
      }
      className={cn(
        "grid size-8 shrink-0 place-items-center overflow-hidden rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted && isDark ? "sun" : "moon"}
          initial={{ y: 10, opacity: 0, rotate: -35 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 35 }}
          transition={{ duration: DURATION.fast, ease: EASE.expressive }}
          className="grid place-items-center"
        >
          {mounted && isDark ? <Sun size={15} /> : <Moon size={15} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
