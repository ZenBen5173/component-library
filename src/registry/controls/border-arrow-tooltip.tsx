"use client";

/**
 * @name Border Arrow Tooltip
 * @description Tooltip whose arrow is cut out of the border itself, so the outline stays continuous.
 * @tags tooltip, hover, overlay, versatile
 * @height 460
 * @deps framer-motion
 * @source src/components/ui/skiper-ui/skiper101.tsx
 */
import { Skiper102 } from "@/components/ui/skiper-ui/skiper101";

export default function BorderArrowTooltipDemo() {
  return (
    <div className="grid h-[460px] w-full place-items-center bg-muted">
      <Skiper102 />
    </div>
  );
}
