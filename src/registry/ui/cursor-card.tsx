"use client";

/**
 * @name Cursor Card
 * @description Card that reveals a floating image preview pinned to the cursor while hovered.
 * @tags versatile, card, cursor, hover, image, portfolio
 * @height 460
 * @deps framer-motion
 * @source src/components/ui/cursor-card.tsx
 */
import { CursorCard } from "@/components/ui/cursor-card";

export default function CursorCardDemo() {
  return (
    <div className="grid min-h-[460px] place-items-center bg-neutral-950 p-8">
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <CursorCard
          image="https://picsum.photos/seed/cursor-a/600/400"
          description="Brand identity and site for a climate research lab."
        >
          Meridian
        </CursorCard>
        <CursorCard
          image="https://picsum.photos/seed/cursor-b/600/400"
          description="Design system and marketing site for a payments startup."
        >
          Ledgerline
        </CursorCard>
      </div>
    </div>
  );
}
