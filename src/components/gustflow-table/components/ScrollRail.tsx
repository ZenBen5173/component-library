"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The table's horizontal scrollbar, moved out from under the rows.
 *
 * The native one belongs to the element that scrolls, which put it between
 * the last row and the totals — inside the table, cutting across it. This one
 * lives wherever it is rendered, so it can sit below the totals where a
 * scrollbar belongs.
 *
 * The body keeps its real overflow, so trackpads, shift-wheel and keyboard
 * still scroll it; only the native bar is hidden. This rail reflects that
 * scroll position and can drive it.
 *
 * It stays faint until the pointer is near it or the table is being scrolled,
 * because a permanent bar under every table is a line of furniture that says
 * nothing most of the time.
 */
export function ScrollRail({
  targetRef,
  className,
}: {
  /** The element that actually scrolls. */
  targetRef: React.RefObject<HTMLElement | null>;
  className?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({ ratio: 1, offset: 0 });
  const [active, setActive] = useState(false);
  const dragRef = useRef<{ startX: number; startScroll: number } | null>(null);

  const measure = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    const ratio = el.clientWidth / Math.max(el.scrollWidth, 1);
    const offset = el.scrollLeft / Math.max(el.scrollWidth, 1);
    setMetrics({ ratio: Math.min(ratio, 1), offset });
  }, [targetRef]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [targetRef, measure]);

  // Nothing to scroll — no rail. A full-width thumb is a decoration.
  if (metrics.ratio >= 1) return null;

  return (
    <div
      ref={railRef}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => {
        if (!dragRef.current) setActive(false);
      }}
      onPointerDown={(e) => {
        const el = targetRef.current;
        const rail = railRef.current;
        if (!el || !rail) return;

        const thumbWidth = rail.clientWidth * metrics.ratio;
        const thumbLeft = rail.clientWidth * metrics.offset;
        const x = e.clientX - rail.getBoundingClientRect().left;
        const scrollable = el.scrollWidth - el.clientWidth;
        const usable = rail.clientWidth - thumbWidth;

        // Clicking the track jumps there; clicking the thumb starts a drag.
        if (x < thumbLeft || x > thumbLeft + thumbWidth) {
          el.scrollLeft = usable > 0 ? ((x - thumbWidth / 2) / usable) * scrollable : 0;
        }

        // Pointer capture rather than document listeners hung off state.
        // The listeners used to be attached by an effect keyed on `active`,
        // and hovering already set `active` — so pressing changed nothing,
        // the effect never re-ran, and the drag was never wired up. Capture
        // needs no state at all, and keeps the pointer even when it leaves
        // the twelve-pixel rail, which any real drag does immediately.
        dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft };
        rail.setPointerCapture(e.pointerId);
        setActive(true);
      }}
      onPointerMove={(e) => {
        const drag = dragRef.current;
        const el = targetRef.current;
        const rail = railRef.current;
        if (!drag || !el || !rail) return;
        const usable = rail.clientWidth - rail.clientWidth * metrics.ratio;
        if (usable <= 0) return;
        const scrollable = el.scrollWidth - el.clientWidth;
        el.scrollLeft = drag.startScroll + ((e.clientX - drag.startX) / usable) * scrollable;
      }}
      onPointerUp={(e) => {
        dragRef.current = null;
        railRef.current?.releasePointerCapture(e.pointerId);
        setActive(false);
      }}
      onPointerCancel={() => {
        dragRef.current = null;
        setActive(false);
      }}
      className={cn(
        "group/rail relative h-3 w-full cursor-pointer select-none touch-none",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--foreground)] transition-opacity duration-200",
          active ? "opacity-[0.06]" : "opacity-0",
        )}
      />
      <div
        style={{
          left: `${metrics.offset * 100}%`,
          width: `${metrics.ratio * 100}%`,
        }}
        className={cn(
          "absolute top-1/2 h-1.5 min-w-6 -translate-y-1/2 rounded-full bg-[var(--foreground)] transition-opacity duration-200",
          active ? "opacity-40" : "opacity-[0.12]",
        )}
      />
    </div>
  );
}
