"use client";

/**
 * @name Research Bento Grid
 * @description Three-panel bento: rotating brand showcase, animated invoice/pricing tile and a pause-anytime tile.
 * @tags portfolio, website, bento, grid, pricing, saas
 * @height 900
 * @deps framer-motion, react-icons
 * @source src/components/ui/research-bento-grid.tsx
 */
import { ResearchBentoGrid } from "@/components/ui/research-bento-grid";

export default function ResearchBentoGridDemo() {
  return (
    <div className="min-h-[900px] bg-[#f7f7f5] p-6 dark:bg-[#050505]">
      <ResearchBentoGrid />
    </div>
  );
}
