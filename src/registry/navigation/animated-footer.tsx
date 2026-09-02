"use client";

/**
 * @name Animated Footer
 * @description Footer whose side images are sampled into interactive ASCII art, with parallax and oversized wordmark.
 * @tags portfolio, footer, ascii, canvas, parallax
 * @height 720
 * @note Source images must be CORS-enabled — the canvas reads their pixels. Same-origin files in /public are the safest choice.
 * @source src/components/ui/animated-footer.tsx
 */
import { AnimatedFooter } from "@/components/ui/animated-footer";

export default function AnimatedFooterDemo() {
  return (
    <AnimatedFooter
      headingLines={["STUDIO", "NORTH"]}
      leftImage="https://picsum.photos/seed/footer-left/800/1000"
      rightImage="https://picsum.photos/seed/footer-right/800/1000"
    />
  );
}
