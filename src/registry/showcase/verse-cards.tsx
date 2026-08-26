"use client";

/**
 * @name Verse Cards
 * @description Nav tile that opens into a stacked card deck; click the front card to flick it away.
 * @tags versatile, cards, deck, stack, interactive, portfolio
 * @height 640
 * @deps framer-motion
 * @source src/components/ui/verse-cards.tsx
 */
import { VerseCards } from "@/components/ui/verse-cards";

export default function VerseCardsDemo() {
  return (
    <div className="grid min-h-[640px] place-items-center bg-neutral-950 p-8">
      <VerseCards
        cards={[
          "Meridian",
          "Ledgerline",
          "Halcyon",
          "Northbound",
          "Fieldnote",
        ]}
        footerText="Click the front card to deal it away."
      />
    </div>
  );
}
