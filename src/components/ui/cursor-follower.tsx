"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/reduced-motion";

/**
 * Portfolio-style cursor: a small dot that tracks the pointer exactly, and a
 * ring that trails behind on a spring and swells over anything interactive.
 *
 * Written for this library — the registries carry multiplayer presence cursors,
 * not this. Hidden entirely when the pointer is coarse (touch) or when reduced
 * motion is asked for, since a lagging ring is the exact effect that setting is
 * meant to remove.
 */
export function CursorFollower({
  className,
  hoverSelector = "a, button, [data-cursor]",
}: {
  className?: string;
  /** Elements that make the ring expand. */
  hoverSelector?: string;
}) {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return;
    setEnabled(true);

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target as Element | null;
      setHovering(Boolean(target?.closest?.(hoverSelector)));
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y, hoverSelector]);

  if (!enabled) return null;

  return (
    <div className={cn("pointer-events-none fixed inset-0 z-[60]", className)}>
      <motion.span
        style={{ x, y }}
        className="absolute -ml-[3px] -mt-[3px] block size-1.5 rounded-full bg-foreground mix-blend-difference"
      />
      <motion.span
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hovering ? 2.2 : 1, opacity: hovering ? 0.5 : 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="absolute -ml-4 -mt-4 block size-8 rounded-full border border-foreground mix-blend-difference"
      />
    </div>
  );
}
