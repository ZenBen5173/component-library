"use client";

/**
 * @name Agent Bento Grid
 * @description Five-panel bento of self-animating feature cards. A drop-in replacement for a plain feature grid.
 * @tags versatile, bento, grid, cards, feature, website
 * @height 900
 * @deps framer-motion
 * @source src/components/ui/agent-bento-grid.tsx
 */
import { AgentBentoGrid } from "@/components/ui/agent-bento-grid";

export default function AgentBentoGridDemo() {
  return (
    <div className="min-h-[900px] bg-white p-6 dark:bg-black">
      <AgentBentoGrid />
    </div>
  );
}
