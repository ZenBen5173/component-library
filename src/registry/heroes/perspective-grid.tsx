"use client";

/**
 * @name Perspective Grid
 * @description Tilted 3D tile grid that fades out at the edges; tiles light up under the cursor and fade back over 1.5s.
 * @tags portfolio, hero, 3d, grid, background, cool
 * @height screen
 * @note Upstream shipped the tiles with `transition-colors duration-[1500ms] hover:duration-0` but no hover colour, so nothing lit up. Added `hover:bg-gray-400/70` — tint it to taste.
 * @source src/components/ui/perspective-grid.tsx
 */
import { PerspectiveGrid } from "@/components/ui/perspective-grid";

export default function PerspectiveGridDemo() {
  return (
    <div className="h-dvh w-full">
      <PerspectiveGrid />
    </div>
  );
}
