"use client";

/**
 * @name Highlight Grid
 * @description Grid of labels where a single coloured highlight glides to whichever cell you point at.
 * @tags cool, grid, highlight, hover, website
 * @height 560
 * @source src/components/ui/highlight-grid.tsx
 */
import { HighlightGrid } from "@/components/ui/highlight-grid";

export default function HighlightGridDemo() {
  return (
    <div className="grid min-h-[560px] place-items-center bg-white p-8 dark:bg-background">
      <HighlightGrid />
    </div>
  );
}
