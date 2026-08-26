"use client";

/**
 * @name Crowd Canvas
 * @description Canvas full of little characters that stroll across the footer, sampled from a sprite sheet.
 * @tags portfolio, canvas, crowd, playful, cool
 * @height 700
 * @note Needs the sprite sheet at public/images/peeps/all-peeps.png — that artwork ships from skiper-ui, so swap in your own before publishing.
 * @source src/components/ui/skiper-ui/skiper39.tsx
 */
import { Skiper39 } from "@/components/ui/skiper-ui/skiper39";

export default function CrowdCanvasDemo() {
  return (
    <div className="h-[700px] w-full">
      <Skiper39 />
    </div>
  );
}
