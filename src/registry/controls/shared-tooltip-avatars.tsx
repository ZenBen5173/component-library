"use client";

/**
 * @name Shared Tooltip Avatars
 * @description Overlapping avatar stack with one tooltip that slides between faces instead of popping per avatar.
 * @tags must-have, versatile, avatars, tooltip, hover, social-proof
 * @height 320
 * @deps framer-motion
 * @source src/components/ui/shared-tooltip-avatars.tsx
 */
import { SharedTooltipAvatars } from "@/components/ui/shared-tooltip-avatars";

const PEOPLE = [
  { id: "1", name: "Ada Okafor", image: "https://i.pravatar.cc/160?img=47" },
  { id: "2", name: "Ravi Menon", image: "https://i.pravatar.cc/160?img=12" },
  { id: "3", name: "Lena Fischer", image: "https://i.pravatar.cc/160?img=32" },
  { id: "4", name: "Tomas Silva", image: "https://i.pravatar.cc/160?img=15" },
  { id: "5", name: "Mei Tanaka", image: "https://i.pravatar.cc/160?img=45" },
];

export default function SharedTooltipAvatarsDemo() {
  return (
    <div className="grid min-h-[320px] place-items-center bg-white dark:bg-neutral-950">
      <div className="text-center">
        <SharedTooltipAvatars items={PEOPLE} />
        <p className="mt-6 text-xs uppercase tracking-widest text-neutral-500">
          Trusted by 2,000+ teams
        </p>
      </div>
    </div>
  );
}
