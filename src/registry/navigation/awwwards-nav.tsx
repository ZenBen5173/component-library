"use client";

/**
 * @name Awwwards Nav
 * @description Floating pill nav that expands upward into a columned menu panel.
 * @tags navigation, navbar, expandable, awwwards, portfolio
 * @height 520
 * @deps framer-motion
 * @source src/components/ui/awwwards-nav.tsx
 */
import { AwwwardsNav } from "@/components/ui/awwwards-nav";

export default function AwwwardsNavDemo() {
  return (
    <div className="relative min-h-[520px] overflow-hidden bg-background">
      <AwwwardsNav className="absolute bottom-6 left-1/2 -translate-x-1/2" />
    </div>
  );
}
