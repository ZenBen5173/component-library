"use client";

/**
 * @name Morph Text
 * @description Oversized display words that liquid-morph into one another via an SVG blur/contrast filter.
 * @tags portfolio, text, morph, svg-filter, animated
 * @height 520
 * @note Designed for Space Grotesk. Load that font (next/font/google) or pass your own via `fontFamily` — the fallback stack is close but not identical.
 * @source src/components/ui/morph-text.tsx
 */
import { MorphText } from "@/components/ui/morph-text";

export default function MorphTextDemo() {
  return (
    <div className="min-h-[520px] bg-background">
      <MorphText
        words={["CREATE", "DESIGN", "DEVELOP", "SHIP"]}
        interval={2600}
        subtext="A portfolio that doesn't sit still"
        fontFamily='"Space Grotesk", ui-sans-serif, system-ui, sans-serif'
      />
    </div>
  );
}
