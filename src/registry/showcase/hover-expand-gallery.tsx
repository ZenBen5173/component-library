"use client";

/**
 * @name Hover Expand Gallery
 * @description Row of thin image slats; the one under the cursor expands into a full panel.
 * @tags portfolio, gallery, hover, expand, images
 * @height 620
 * @deps framer-motion
 * @source src/components/ui/skiper-ui/skiper52.tsx
 */
import { HoverExpand_001 } from "@/components/ui/skiper-ui/skiper52";

const IMAGES = [
  { src: "https://picsum.photos/seed/expand-1/900/900", alt: "Project one", code: "# 01" },
  { src: "https://picsum.photos/seed/expand-2/900/900", alt: "Project two", code: "# 02" },
  { src: "https://picsum.photos/seed/expand-3/900/900", alt: "Project three", code: "# 03" },
  { src: "https://picsum.photos/seed/expand-4/900/900", alt: "Project four", code: "# 04" },
  { src: "https://picsum.photos/seed/expand-5/900/900", alt: "Project five", code: "# 05" },
  { src: "https://picsum.photos/seed/expand-6/900/900", alt: "Project six", code: "# 06" },
];

export default function HoverExpandGalleryDemo() {
  return (
    <div className="grid min-h-[620px] w-full place-items-center bg-background">
      <HoverExpand_001 images={IMAGES} />
    </div>
  );
}
