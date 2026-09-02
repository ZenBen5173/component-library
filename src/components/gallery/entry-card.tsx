"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";

/**
 * A card that shows the component itself — but only the one you are pointing
 * at.
 *
 * Every thumbnail is a real iframe of the preview route, scaled down: the same
 * trick PreviewFrame uses, for the same reason: a component gated behind `lg:`
 * needs a genuine 1280px viewport, so it renders at full width and the result
 * is shrunk rather than the layout squeezed.
 *
 * They used to mount on approach and stay mounted, which does not survive a
 * library this size. Each is a whole application, and fourteen entries drive
 * canvas or WebGL; browsers permit only a handful of live WebGL contexts and
 * past that they tear them down and rebuild them, which seizes the page
 * instead of slowing it. Scrolling the gallery could leave it unusable.
 *
 * So nothing runs until you hover. At most one preview is ever live, which is
 * the only version of this that stays responsive at seventy-five components.
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
  const retire = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const el = wellRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => {
      ro.disconnect();
      clearTimeout(retire.current);
    };
  }, []);

  const wake = () => {
    clearTimeout(retire.current);
    setLive(true);
  };

  const sleep = () => {
    // A grace period, so brushing across a grid does not mount and unmount a
    // dozen previews on the way through.
    clearTimeout(retire.current);
    retire.current = setTimeout(() => {
      setLive(false);
      setLoaded(false);
    }, 400);
  };

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
        onPointerEnter={wake}
        onPointerLeave={sleep}
        onFocus={wake}
        onBlur={sleep}
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
                "pointer-events-none absolute left-0 top-0 border-0 transition-opacity duration-300",
                loaded ? "opacity-100" : "opacity-0",
              )}
            />
          )}

          {/* At rest: the name, and an invitation. Cheaper than a screenshot
              and honest about the fact that nothing is running yet. */}
          {!loaded && (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-g-surface via-g-canvas to-g-surface">
              <span className="flex items-center gap-1.5 text-[11px] text-g-dim transition-opacity duration-200 group-hover:opacity-0">
                <Play size={11} />
                Hover to run
              </span>
            </div>
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
