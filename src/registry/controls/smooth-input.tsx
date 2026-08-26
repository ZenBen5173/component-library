"use client";

/**
 * @name Smooth Input
 * @description Text field whose caret glides between characters instead of jumping, next to a plain styled input.
 * @tags input, form, caret, versatile
 * @height 520
 * @deps framer-motion
 * @source src/components/ui/skiper-ui/skiper106.tsx
 */
import { Skiper106 } from "@/components/ui/skiper-ui/skiper106";

export default function SmoothInputDemo() {
  return (
    <div className="h-[520px] w-full">
      <Skiper106 />
    </div>
  );
}
