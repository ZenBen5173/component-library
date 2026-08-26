"use client";

/**
 * @name ASCII Glitch Ripple
 * @description Hovering sends a wave of scrambled ASCII glyphs rippling across the label before it resolves.
 * @tags portfolio, text, ascii, glitch, hover, link
 * @height 400
 * @source src/components/ui/ascii-glitch-ripple.tsx
 */
import { AsciiGlitchRipple } from "@/components/ui/ascii-glitch-ripple";

export default function AsciiGlitchRippleDemo() {
  return (
    <div className="grid min-h-[400px] place-items-center bg-background">
      <div className="flex flex-col gap-4 font-mono text-2xl text-foreground">
        <AsciiGlitchRipple href="#">SELECTED WORK</AsciiGlitchRipple>
        <AsciiGlitchRipple href="#" dur={700}>
          ABOUT THE STUDIO
        </AsciiGlitchRipple>
        <AsciiGlitchRipple href="#" spread={1.6}>
          GET IN TOUCH
        </AsciiGlitchRipple>
      </div>
    </div>
  );
}
