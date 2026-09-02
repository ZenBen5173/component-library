"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Any lucide icon, drawn on rather than switched on.
 *
 * The library already carries a handful of hand-animated icons, each built by
 * hand for that one glyph. That does not scale to eighteen hundred, and an
 * icon picker that offers the whole set cannot have nine of them move and the
 * rest sit still.
 *
 * So the animation is derived instead of authored. Every shape inside the
 * icon is given `pathLength="1"`, which rescales its dash units so a single
 * dash length fits every path in every icon regardless of its real geometry —
 * without it, a dasharray tuned for one glyph draws the next one unevenly or
 * not at all. From there, sweeping the dash offset from 1 to 0 draws the
 * strokes in.
 *
 * The ref exposes `startAnimation` / `stopAnimation`, the same pair the
 * hand-built icons expose, so a row can drive the icon it contains rather than
 * making you hover the 16px glyph itself.
 */

export type IconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

/** The shapes lucide draws with. */
const SHAPES = "path, circle, line, rect, polyline, polygon, ellipse";

export const AnimatedLucide = forwardRef<
  IconHandle,
  {
    name: IconName;
    size?: number;
    className?: string;
    /** "hover" plays on its own; "manual" waits to be told, via the ref. */
    trigger?: "hover" | "manual";
    /** Seconds. Defaults to the library's slow step. */
    duration?: number;
  }
>(function AnimatedLucide(
  { name, size = 16, className, trigger = "hover", duration = DURATION.slow },
  ref,
) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);

  /**
   * Normalise every shape's path length.
   *
   * It cannot simply be done on mount: DynamicIcon fetches the icon module, so
   * on the first pass there is no SVG to mark up yet and the attributes would
   * land nowhere. The observer waits for it to arrive, marks it, and stops.
   */
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const mark = () => {
      const svg = host.querySelector("svg");
      if (!svg) return false;
      for (const shape of svg.querySelectorAll(SHAPES)) {
        shape.setAttribute("pathLength", "1");
      }
      return true;
    };

    if (mark()) return;
    const observer = new MutationObserver(() => {
      if (mark()) observer.disconnect();
    });
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [name, playing]);

  const start = useCallback(() => setPlaying(true), []);
  const stop = useCallback(() => setPlaying(false), []);

  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  return (
    <span
      ref={hostRef}
      data-icon-draw
      onMouseEnter={trigger === "hover" ? start : undefined}
      onMouseLeave={trigger === "hover" ? stop : undefined}
      // The animation is restarted by remounting the run: React drops the old
      // element when `playing` flips, and a fresh element runs the keyframe
      // from the top. Toggling a class alone would not replay it.
      key={playing ? "on" : "off"}
      className={cn("inline-grid shrink-0 place-items-center", className)}
      style={
        {
          "--icon-draw-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      <DynamicIcon
        name={name}
        size={size}
        className={cn(
          playing &&
            "[&_*]:[stroke-dasharray:1] [&_*]:[animation:icon-draw_var(--icon-draw-duration)_var(--icon-draw-ease)_forwards]",
        )}
        style={
          {
            "--icon-draw-ease": `cubic-bezier(${EASE.standard.join(",")})`,
          } as React.CSSProperties
        }
      />
    </span>
  );
});
