"use client";

/**
 * @name Link Hover Effects
 * @description Five inline-link treatments — sliding underlines, swapped labels and masked reveals.
 * @tags link, hover, underline, text, versatile
 * @height 560
 * @deps framer-motion
 * @source src/components/ui/skiper-ui/skiper40.tsx
 */
import { Skiper40 } from "@/components/ui/skiper-ui/skiper40";

export default function LinkHoverEffectsDemo() {
  return (
    <div className="h-[560px] w-full bg-background">
      <Skiper40 />
    </div>
  );
}
