"use client";

/**
 * @name Staggered Grid
 * @description Scroll-driven gallery: columns drift at different speeds, then converge into a bento layout.
 * @tags portfolio, grid, scroll, gsap, gallery
 * @height 900
 * @deps gsap
 * @source src/components/ui/staggered-grid.tsx
 */
import { Compass, Feather, Layers, Sparkles } from "lucide-react";
import { StaggeredGrid } from "@/components/ui/staggered-grid";

const IMAGES = Array.from(
  { length: 16 },
  (_, i) => `https://picsum.photos/seed/stagger-${i + 1}/600/800`,
);

const BENTO_ITEMS = [
  {
    id: 1,
    title: "Direction",
    subtitle: "Strategy",
    description: "Where the work is going, and why that is the right way.",
    icon: <Compass className="size-5" />,
    image: "https://picsum.photos/seed/bento-a/800/600",
  },
  {
    id: 2,
    title: "Craft",
    subtitle: "Design",
    description: "The details nobody asks for and everybody notices.",
    icon: <Feather className="size-5" />,
    image: "https://picsum.photos/seed/bento-b/800/600",
  },
  {
    id: 3,
    title: "Systems",
    subtitle: "Engineering",
    description: "Built to be extended by whoever comes next.",
    icon: <Layers className="size-5" />,
    image: "https://picsum.photos/seed/bento-c/800/600",
  },
  {
    id: 4,
    title: "Polish",
    subtitle: "Motion",
    description: "Timing, easing and restraint, in that order.",
    icon: <Sparkles className="size-5" />,
    image: "https://picsum.photos/seed/bento-d/800/600",
  },
];

export default function StaggeredGridDemo() {
  return (
    <StaggeredGrid
      images={IMAGES}
      bentoItems={BENTO_ITEMS}
      centerText="Halcyon"
      showFooter={false}
    />
  );
}
