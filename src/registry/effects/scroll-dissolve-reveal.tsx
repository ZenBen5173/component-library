"use client";

/**
 * @name Scroll Dissolve Reveal
 * @description WebGL shader that dissolves one image into another as you scroll past it.
 * @tags portfolio, scroll, webgl, shader, image, three
 * @height 900
 * @deps three, @react-three/fiber, @react-three/drei
 * @source src/components/ui/scroll-dissolve-reveal.tsx
 */
import { ScrollDissolveReveal } from "@/components/ui/scroll-dissolve-reveal";

export default function ScrollDissolveRevealDemo() {
  return (
    <ScrollDissolveReveal
      imageFront="https://picsum.photos/seed/dissolve-front/1200/1600"
      imageBack="https://picsum.photos/seed/dissolve-back/1200/1600"
    />
  );
}
