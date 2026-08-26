"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { wipeTheme } from "@/lib/theme-wipe";
import { DURATION, EASE } from "@/lib/motion";

/**
 * The gallery's theme toggle — same circle wipe as the one components use,
 * dressed in the gallery's own chrome tokens.
 *
 * The wipe itself comes from src/lib/theme-wipe.ts rather than a second copy
 * of the logic. Keeping two versions is how the two drifted apart last time.
 */
export function ThemeToggle() {
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
          flushSync(() => setTheme(isDark ? "light" : "dark")),
        )
      }
      className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md border border-g-line text-g-dim transition-colors hover:bg-g-canvas hover:text-g-ink"
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
