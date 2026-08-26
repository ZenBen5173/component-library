"use client";

/**
 * @name Page Transitions
 * @description Four ways one page can hand over to the next — fade, slide, a wipe curtain, and a masked reveal.
 * @tags page-transition, navigation, portfolio, motion, must-have
 * @height 760
 * @deps motion
 * @note Hand-built — this is app wiring, not something a registry ships. In a real Next.js app the pattern is the same: put `AnimatePresence mode="wait"` in your layout, key the children on the pathname, and give the exit a shorter duration than the entrance so navigation still feels immediate.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { tween } from "@/lib/motion";

const PAGES = ["Work", "Studio", "Journal", "Contact"];

const VARIANTS = {
  fade: {
    label: "Fade",
    note: "Safest. Reads as a change without claiming direction.",
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    label: "Slide",
    note: "Implies sequence — good when pages are ordered.",
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  },
  scale: {
    label: "Scale",
    note: "Feels like arriving. Keep it subtle or it reads as a popup.",
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.01 },
  },
  mask: {
    label: "Mask",
    note: "The showy one. A curtain wipes across, content swaps behind it.",
    initial: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
    animate: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
    exit: { opacity: 0, clipPath: "inset(100% 0 0 0)" },
  },
} as const;

type VariantKey = keyof typeof VARIANTS;

export default function PageTransitionsDemo() {
  const [page, setPage] = useState(0);
  const [variant, setVariant] = useState<VariantKey>("mask");
  const active = VARIANTS[variant];

  return (
    <div className="min-h-[760px] bg-background p-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setVariant(key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                variant === key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {VARIANTS[key].label}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">{active.note}</p>

        <nav className="mt-8 flex gap-1 border-b border-border">
          {PAGES.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setPage(i)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors",
                page === i
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {name}
            </button>
          ))}
        </nav>

        <div className="relative mt-6 min-h-[320px] overflow-hidden rounded-xl border border-border">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${variant}-${page}`}
              initial={active.initial}
              animate={active.animate}
              exit={active.exit}
              transition={tween("slow")}
              className="p-8"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                0{page + 1}
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                {PAGES[page]}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Switching tabs unmounts this panel and mounts the next one.
                `mode=&quot;wait&quot;` holds the incoming page until the
                outgoing one has finished leaving — without it the two overlap
                and the whole thing reads as a flicker.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg border border-border bg-muted/40"
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
