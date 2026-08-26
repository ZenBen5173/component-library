"use client";

/**
 * @name Theme Toggle Buttons
 * @description Five light/dark switch designs — the button itself, with sliders to compare them side by side.
 * @tags theme-toggle, dark-mode, button, versatile
 * @height 620
 * @deps framer-motion
 * @note This one is the button. Pair it with [Theme Toggle Expand] when you also want the new theme to sweep across the page.
 * @source src/components/ui/skiper-ui/skiper4.tsx
 */
import { Skiper4 } from "@/components/ui/skiper-ui/skiper4";

export default function ThemeToggleButtonsDemo() {
  return (
    <div className="h-[620px] w-full bg-background">
      <Skiper4 />
    </div>
  );
}
