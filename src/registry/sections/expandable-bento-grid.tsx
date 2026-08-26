"use client";

/**
 * @name Expandable Bento Grid
 * @description Bento tiles that expand in place into a full detail panel when clicked.
 * @tags bento, grid, expandable, cards, versatile
 * @height 760
 * @note Collapsed state restyled: the flat blue card/chip is now a neutral bordered card with a 44px chip and inherited icon colour. The expanded panel and "Visit" button were re-toned to match (white-on-pale-blue was unreadable).
 * @deps framer-motion
 * @source src/components/ui/expandable-bento-grid.tsx
 */
import { Boxes, Gauge, Layers, ShieldCheck } from "lucide-react";
import ExpandableBentoGrid from "@/components/ui/expandable-bento-grid";

const ICON = "size-5";

const ITEMS = [
  {
    id: 1,
    title: "Edge runtime",
    subtitle: "Sub-50ms cold starts",
    description:
      "Requests are handled at the node nearest the user, so latency stops depending on where your database happens to live.",
    icon: <Gauge className={ICON} />,
    content: (
      <img
        src="https://picsum.photos/seed/bento-edge/900/600"
        alt=""
        className="size-full object-cover"
      />
    ),
  },
  {
    id: 2,
    title: "Type-safe by default",
    subtitle: "End to end",
    description:
      "Schemas generate the client, so a breaking change fails at compile time instead of in production.",
    icon: <ShieldCheck className={ICON} />,
    content: (
      <img
        src="https://picsum.photos/seed/bento-types/900/600"
        alt=""
        className="size-full object-cover"
      />
    ),
  },
  {
    id: 3,
    title: "Composable primitives",
    subtitle: "No framework lock-in",
    description:
      "Every piece is a plain module you can lift out on its own. Nothing depends on the whole being present.",
    icon: <Layers className={ICON} />,
    content: (
      <img
        src="https://picsum.photos/seed/bento-compose/900/600"
        alt=""
        className="size-full object-cover"
      />
    ),
  },
  {
    id: 4,
    title: "Batteries included",
    subtitle: "Auth, jobs, storage",
    description:
      "The boring infrastructure is already wired up, so day one is spent on the product rather than the plumbing.",
    icon: <Boxes className={ICON} />,
    content: (
      <img
        src="https://picsum.photos/seed/bento-batteries/900/600"
        alt=""
        className="size-full object-cover"
      />
    ),
  },
];

export default function ExpandableBentoGridDemo() {
  return (
    <div className="min-h-[760px] bg-white p-6 dark:bg-background">
      <ExpandableBentoGrid items={ITEMS} />
    </div>
  );
}
