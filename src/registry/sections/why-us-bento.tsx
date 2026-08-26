"use client";

/**
 * @name Why Us Bento
 * @description Bento grid of value props — animated avatar row, globe, feature tiles. A "why choose us" section.
 * @tags versatile, bento, grid, website, feature, marketing
 * @height 900
 * @deps framer-motion, @phosphor-icons/react
 * @note Recovered by hand — vengenceui publishes an install command but /r/why-us-bento.json 404s. It also imports three things it never ships: `@/components/container` and two bundled isometric illustrations. Those are local stand-ins (see @source list); swap in your own artwork.
 * @source src/components/ui/why-us-bento.tsx
 * @source src/components/container.tsx
 * @source src/assets/svgs/isometric-box-01.tsx
 */
import { WhyUsBento } from "@/components/ui/why-us-bento";

const AVATARS = [
  "https://i.pravatar.cc/160?img=47",
  "https://i.pravatar.cc/160?img=12",
  "https://i.pravatar.cc/160?img=32",
  "https://i.pravatar.cc/160?img=15",
];

export default function WhyUsBentoDemo() {
  return (
    <div className="min-h-[900px] w-full bg-background py-12">
      <WhyUsBento teamAvatars={AVATARS} />
    </div>
  );
}
