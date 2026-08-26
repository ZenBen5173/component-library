"use client";

/**
 * @name Animated Number
 * @description Odometer-style digits that roll to a new value. Two variants: a plain counter and a scored one.
 * @tags number, counter, odometer, animated
 * @height 380
 * @deps framer-motion
 * @source src/components/ui/animated-number.tsx
 */
import { useEffect, useState } from "react";
import { AnimatedNumber, AnimatedScore } from "@/components/ui/animated-number";

export default function AnimatedNumberDemo() {
  const [value, setValue] = useState(1284);

  // Nudge the number on an interval so the roll is visible without interaction.
  useEffect(() => {
    const id = setInterval(
      () => setValue((v) => v + Math.floor(Math.random() * 90) + 10),
      2200,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid min-h-[380px] place-items-center gap-10 bg-background text-foreground">
      <div className="text-center">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
          AnimatedNumber
        </p>
        <AnimatedNumber value={value} className="text-6xl font-semibold" />
      </div>
      <div className="text-center">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
          AnimatedScore
        </p>
        <AnimatedScore value={value} className="text-6xl font-semibold" />
      </div>
    </div>
  );
}
