"use client";

/**
 * @name Team Reveal Grid
 * @description Team roster where hovering a name reveals that person's portrait, auto-cycling while idle.
 * @tags website, team, grid, reveal, about
 * @height 780
 * @deps framer-motion
 * @source src/components/ui/team-reveal-grid.tsx
 */
import { TeamRevealGrid } from "@/components/ui/team-reveal-grid";

const MEMBERS = [
  {
    id: "ada",
    name: "Ada Okafor",
    role: "Founder",
    expertise: "Product strategy",
    image: "https://i.pravatar.cc/600?img=47",
  },
  {
    id: "ravi",
    name: "Ravi Menon",
    role: "Principal Engineer",
    expertise: "Platform & infra",
    image: "https://i.pravatar.cc/600?img=12",
  },
  {
    id: "lena",
    name: "Lena Fischer",
    role: "Design Lead",
    expertise: "Interaction design",
    image: "https://i.pravatar.cc/600?img=32",
  },
  {
    id: "tomas",
    name: "Tomas Silva",
    role: "Engineer",
    expertise: "Front of the front-end",
    image: "https://i.pravatar.cc/600?img=15",
  },
];

export default function TeamRevealGridDemo() {
  return (
    <div className="min-h-[780px] bg-white dark:bg-black">
      <TeamRevealGrid members={MEMBERS} />
    </div>
  );
}
