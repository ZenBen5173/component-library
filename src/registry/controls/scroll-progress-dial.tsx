"use client";

/**
 * @name Scroll Progress Dial
 * @description Draggable dial that tracks page scroll, with the percentage rolling on a NumberFlow readout.
 * @tags scroll-progress, indicator, website, versatile
 * @height 700
 * @deps motion, @number-flow/react
 * @note Reads window scroll, so it needs a genuinely scrollable page — the preview below is tall on purpose.
 * @source src/components/ui/skiper-ui/skiper89.tsx
 */
import { Skiper89 } from "@/components/ui/skiper-ui/skiper89";

export default function ScrollProgressDialDemo() {
  return (
    <div className="flex w-full justify-center bg-background">
      <Skiper89 />
    </div>
  );
}
