"use client";

/**
 * @name Flip Fade Text
 * @description Words swap on an interval, each letter flipping in and out on a stagger. Good for loading states.
 * @tags loading, text, flip, rotating, animated
 * @height 360
 * @deps framer-motion
 * @source src/components/ui/flip-fade-text.tsx
 */
import { FlipFadeText } from "@/components/ui/flip-fade-text";

export default function FlipFadeTextDemo() {
  return (
    <div className="grid min-h-[360px] place-items-center bg-background">
      <FlipFadeText
        words={["Compiling", "Bundling", "Optimising", "Almost there"]}
        interval={2000}
        textClassName="text-3xl font-medium text-foreground sm:text-4xl"
      />
    </div>
  );
}
