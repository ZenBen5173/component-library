"use client";

/**
 * @name Magnetic Button
 * @description Button whose label and body lean toward the cursor, then spring back on exit.
 * @tags micro-interaction, hover, spring, button
 * @height 360
 * @deps motion
 */
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { SPRING } from "@/lib/motion";

const { stiffness, damping, mass } = SPRING.follow;
const FOLLOW = { stiffness, damping, mass };

export default function MagneticButton({
  children = "Get started",
  strength = 0.35,
}: {
  children?: React.ReactNode;
  /** 0 = inert, 1 = the button sticks to the cursor. */
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, FOLLOW);
  const sy = useSpring(y, FOLLOW);

  // The label travels a little further than the button itself — that offset is
  // what reads as "magnetic" rather than "the whole thing moved".
  const labelX = useTransform(sx, (v) => v * 0.4);
  const labelY = useTransform(sy, (v) => v * 0.4);

  function handleMove(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="grid min-h-[360px] place-items-center bg-background">
      <motion.button
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{ x: sx, y: sy }}
        whileTap={{ scale: 0.95 }}
        className="relative rounded-full bg-white px-8 py-4 text-sm font-medium text-neutral-950"
      >
        <motion.span
          style={{ x: labelX, y: labelY }}
          className="pointer-events-none block"
        >
          {children}
        </motion.span>
      </motion.button>
    </div>
  );
}
