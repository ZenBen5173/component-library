"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Theme toggle with the circle wipe.
 *
 * The library's two theme-toggle entries are skiper-based, and skiper source is
 * not redistributable — importing one here would put a tracked file in the
 * public repo pointing at an untracked one, which is the exact break that took
 * eleven entries down. So the wipe is done directly against the View
 * Transitions API instead: same effect, nothing republished.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    const btn = ref.current;

    // No View Transitions, or motion suppressed — just switch.
    if (!document.startViewTransition || !btn || prefersReducedMotion()) {
      setTheme(next);
      return;
    }

    // Grow from the button, out to whichever corner is furthest away.
    const box = btn.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    // flushSync matters: startViewTransition snapshots the DOM when its
    // callback resolves, and React would otherwise batch setTheme to a later
    // tick — the snapshot would catch the old theme and nothing would wipe.
    // Flags the scoped override in globals.css on for the length of this
    // transition only, so other toggles' CSS keyframes are left alone.
    document.documentElement.dataset.vtWipe = "";

    const transition = document.startViewTransition(() =>
      flushSync(() => setTheme(next)),
    );
    transition.finished.finally(() => {
      delete document.documentElement.dataset.vtWipe;
    });
    // A skipped transition rejects `ready` — the browser skips it whenever the
    // document is hidden. The theme has already changed by then, so there is
    // nothing to recover, but an uncaught rejection would surface as an error.
    // A skipped transition rejects `ready` — the browser skips it whenever the
    // document is hidden. The theme has already changed by then, so there is
    // nothing to recover, but an uncaught rejection would surface as an error.
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: DURATION.slow * 1000,
            easing: `cubic-bezier(${EASE.expressive.join(",")})`,
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
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
