"use client";

/**
 * @name Animated Button
 * @description Button with a shine sweeping across the label and a matching gradient running the border.
 * @tags button, shine, hover, spring, versatile
 * @height 320
 * @deps framer-motion
 * @source src/components/ui/animated-button.tsx
 */
import AnimatedButton from "@/components/ui/animated-button";

export default function AnimatedButtonDemo() {
  return (
    <div className="flex min-h-[320px] items-center justify-center gap-4 bg-white dark:bg-black">
      <AnimatedButton>Browse Components</AnimatedButton>
      <AnimatedButton className="px-8 py-3">Get started</AnimatedButton>
    </div>
  );
}
