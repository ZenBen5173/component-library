"use client";

/**
 * @name Theme Toggle Expand
 * @description Theme switch where the new theme expands across the page as a circle, rectangle or blur wipe.
 * @tags theme-toggle, dark-mode, view-transition, versatile
 * @height 720
 * @deps framer-motion
 * @note The expansion is the point here — the reveal direction and shape are configurable via the controls.
 * @source src/components/ui/skiper-ui/skiper26.tsx
 */
import { Skiper26 } from "@/components/ui/skiper-ui/skiper26";

export default function ThemeToggleExpandDemo() {
  return (
    <div className="h-[720px] w-full bg-background">
      <Skiper26 />
    </div>
  );
}
