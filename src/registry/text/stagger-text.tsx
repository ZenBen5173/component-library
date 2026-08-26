"use client";

/**
 * @name Stagger Text
 * @description Copy that reveals word by word (or letter by letter) as it scrolls into view.
 * @tags portfolio, website, text, stagger, reveal, scroll
 * @height 460
 * @deps framer-motion
 * @source src/components/ui/staggerText.tsx
 */
import TextAnimation from "@/components/ui/staggerText";

export default function StaggerTextDemo() {
  return (
    <div className="min-h-[460px] bg-neutral-950 px-8 py-20">
      <div className="mx-auto max-w-2xl space-y-8 text-white">
        <TextAnimation divideBy="letter">Selected work</TextAnimation>
        <TextAnimation delay={0.3}>
          We design and build digital products for teams who care about the
          details — the kind you notice only when they are missing.
        </TextAnimation>
      </div>
    </div>
  );
}
