"use client";

/**
 * @name Fading Scroll Area
 * @description Scroll container whose top and bottom edges fade out, so cut-off rows read as continuing.
 * @tags scroll-area, fade, list, mask, versatile
 * @height 620
 * @source src/components/ui/skiper-ui/skiper87.tsx
 * @source src/components/ui/scroll-area.tsx
 */
import { Skiper87 } from "@/components/ui/skiper-ui/skiper87";

export default function FadingScrollAreaDemo() {
  return (
    <div className="h-[620px] w-full">
      <Skiper87 />
    </div>
  );
}
