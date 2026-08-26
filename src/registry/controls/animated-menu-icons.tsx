"use client";

/**
 * @name Animated Menu Icons
 * @description Arrow, hamburger and volume icons that morph on hover and click. The menu icon is the standout.
 * @tags icon, menu, hamburger, micro-interaction, must-have
 * @height 520
 * @deps framer-motion
 * @source src/components/ui/skiper-ui/skiper99.tsx
 */
import { Skiper99 } from "@/components/ui/skiper-ui/skiper99";

export default function AnimatedMenuIconsDemo() {
  return (
    <div className="h-[520px] w-full">
      <Skiper99 />
    </div>
  );
}
