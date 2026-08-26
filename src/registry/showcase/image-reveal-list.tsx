"use client";

/**
 * @name Image Reveal List
 * @description Numbered index list where hovering a row slides its image in alongside. Great for project indexes.
 * @tags versatile, list, hover, image-reveal, portfolio
 * @height 620
 * @deps framer-motion
 * @source src/components/ui/image-reveal-list.tsx
 */
import { ImageRevealList } from "@/components/ui/image-reveal-list";

const ITEMS = [
  {
    id: "1",
    number: "01",
    title: "Meridian",
    subtitle: "Brand & site",
    image: "https://picsum.photos/seed/reveal-1/800/560",
    href: "#",
  },
  {
    id: "2",
    number: "02",
    title: "Ledgerline",
    subtitle: "Design system",
    image: "https://picsum.photos/seed/reveal-2/800/560",
    href: "#",
  },
  {
    id: "3",
    number: "03",
    title: "Halcyon",
    subtitle: "Product design",
    image: "https://picsum.photos/seed/reveal-3/800/560",
    href: "#",
  },
  {
    id: "4",
    number: "04",
    title: "Northbound",
    subtitle: "Marketing site",
    image: "https://picsum.photos/seed/reveal-4/800/560",
    href: "#",
  },
];

export default function ImageRevealListDemo() {
  return (
    <div className="min-h-[620px] bg-white px-6 py-16 dark:bg-background">
      <ImageRevealList items={ITEMS} />
    </div>
  );
}
