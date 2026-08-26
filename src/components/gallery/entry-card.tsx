"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";

/**
 * A card that renders the component itself rather than describing it.
 *
 * The thumbnail is a real iframe of the preview route, scaled down — the same
 * trick PreviewFrame uses, for the same reason: a component gated behind `lg:`
 * needs a genuine 1280px viewport, so we render at full width and shrink the
 * result instead of squeezing the layout.
 *
 * Iframes are expensive, so none mount until they're near the viewport, and
 * arrivals are staggered — twenty pages compiling at once makes the whole grid
 * judder on first scroll.
 */
const FRAME_WIDTH = 1280;
const WELL_HEIGHT = 190;

export type CardEntry = {
  slug: string;
  category: string;
  name: string;
  description: string;
  tags: string[];
  height: number | "screen";
};

export function EntryCard({ entry, index }: { entry: CardEntry; index: number }) {
  const wellRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = wellRef.current;
    if (!el) return;

    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);

    let stagger: ReturnType<typeof setTimeout>;
    let watchdog: ReturnType<typeof setTimeout>;
    let scrolling = false;
    let done = false;

    const near = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight + 400 && r.bottom > -400;
    };

    const detach = () => {
      if (scrolling) window.removeEventListener("scroll", onScroll, true);
      scrolling = false;
    };

    const go = () => {
      if (done) return;
      done = true;
      detach();
      // Stagger within the batch that scrolls in together.
      stagger = setTimeout(() => setLive(true), (index % 6) * 140);
    };

    function onScroll() {
      if (near()) go();
    }

    let fired = false;
    const io = new IntersectionObserver(
      ([e]) => {
        fired = true;
        if (!e.isIntersecting) return;
        io.disconnect();
        go();
      },
      { rootMargin: "400px" },
    );
    io.observe(el);

    // IntersectionObserver rides the rendering lifecycle, and some embedded
    // views never composite — there the callback simply never arrives and the
    // whole grid would sit on skeletons. Fall back to measuring directly.
    watchdog = setTimeout(() => {
      if (fired || done) return;
      io.disconnect();
      if (near()) return go();
      window.addEventListener("scroll", onScroll, true);
      scrolling = true;
    }, 1200);

    return () => {
      io.disconnect();
      ro.disconnect();
      detach();
      clearTimeout(stagger);
      clearTimeout(watchdog);
    };
  }, [index]);

  const frameHeight = entry.height === "screen" ? 800 : entry.height;
  const scale = width ? width / FRAME_WIDTH : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DURATION.base,
        ease: EASE.expressive,
        delay: Math.min(index, 8) * 0.03,
      }}
    >
      <Link
        href={`/${entry.category}/${entry.slug}`}
        className="group block overflow-hidden rounded-xl border border-g-line bg-g-surface transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-g-brand"
      >
        <div
          ref={wellRef}
          style={{ height: WELL_HEIGHT }}
          className="relative overflow-hidden border-b border-g-line bg-g-canvas"
        >
          {live && scale > 0 && (
            <iframe
              src={`/preview/${entry.category}/${entry.slug}`}
              title={entry.name}
              loading="lazy"
              tabIndex={-1}
              onLoad={() => setLoaded(true)}
              style={{
                width: FRAME_WIDTH,
                height: frameHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className={cn(
                "pointer-events-none absolute left-0 top-0 border-0 transition-opacity duration-500",
                loaded ? "opacity-100" : "opacity-0",
              )}
            />
          )}

          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-g-surface via-g-canvas to-g-surface" />
          )}

          {/* Keeps busy previews from fighting the card's own text. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-g-surface to-transparent" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium leading-tight">{entry.name}</span>
            <ArrowUpRight
              size={14}
              className="mt-0.5 shrink-0 text-g-dim transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-g-brand"
            />
          </div>
          {entry.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-g-dim">
              {entry.description}
            </p>
          )}
          {entry.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {entry.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-g-line px-1.5 py-0.5 text-[10px] text-g-dim"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
