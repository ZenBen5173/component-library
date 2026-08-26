"use client";

import { useEffect, useRef, useState } from "react";
import { Water } from "@paper-design/shaders-react";
import { useMotionValue, useSpring, useMotionValueEvent } from "motion/react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { SPRING } from "@/lib/motion";

/**
 * An animated caustic water surface that the pointer nudges around.
 *
 * The shader takes `offsetX` / `offsetY` in the range -1 to 1, so the pointer
 * is mapped to that range and passed through a loose spring. Following the
 * cursor exactly reads as a spotlight; letting it lag, and keeping the surface
 * animating on its own, reads as something the cursor is disturbing.
 */
export function WaterField({
  className,
  opacity = 0.55,
  colorBack = "#000000",
  colorHighlight = "#8b93ff",
  /** How far the pointer can push the surface, in shader offset units. */
  reach = 0.35,
}: {
  className?: string;
  opacity?: number;
  colorBack?: string;
  colorHighlight?: string;
  reach?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING.follow);
  const sy = useSpring(y, SPRING.follow);

  // WebGL, so it is switched off rather than frozen under reduced motion.
  useEffect(() => setEnabled(!prefersReducedMotion()), []);

  useEffect(() => {
    const el = host.current;
    if (!el || !enabled) return;

    const onMove = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) return;
      x.set(((e.clientX - box.left) / box.width - 0.5) * 2 * reach);
      y.set(((e.clientY - box.top) / box.height - 0.5) * 2 * reach);
    };

    // Listening on the window rather than the layer itself: the layer sits
    // behind the content and never receives pointer events of its own.
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, reach, x, y]);

  // The shader takes plain numbers, so the spring is read back into state.
  useMotionValueEvent(sx, "change", (v) =>
    setOffset((o) => ({ ...o, x: Number(v.toFixed(3)) })),
  );
  useMotionValueEvent(sy, "change", (v) =>
    setOffset((o) => ({ ...o, y: Number(v.toFixed(3)) })),
  );

  if (!enabled) return null;

  return (
    <div
      ref={host}
      aria-hidden
      className={cn("pointer-events-none overflow-hidden", className)}
      style={{ opacity }}
    >
      <Water
        colorBack={colorBack}
        colorHighlight={colorHighlight}
        highlights={0.5}
        layering={0.4}
        edges={0.3}
        caustic={0.35}
        waves={0.25}
        size={1.4}
        speed={0.4}
        offsetX={offset.x}
        offsetY={offset.y}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
