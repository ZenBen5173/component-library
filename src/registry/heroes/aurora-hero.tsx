"use client";

/**
 * @name Aurora Hero
 * @description Full-bleed aurora gradient with a glass-displacement title and a background-mode switch.
 * @tags portfolio, hero, gradient, glass, animated
 * @height screen
 * @deps framer-motion
 * @source src/components/ui/aurora-hero.tsx
 */
import { AuroraHero } from "@/components/ui/aurora-hero";

export default function AuroraHeroDemo() {
  return <AuroraHero title="Design that moves" className="min-h-dvh" />;
}
