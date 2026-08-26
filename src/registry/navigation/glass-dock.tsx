"use client";

/**
 * @name Glass Dock
 * @description macOS-style dock: icons scale and lift as the cursor sweeps past, on a frosted glass bar.
 * @tags navigation, dock, glass, hover, macos
 * @height 420
 * @deps framer-motion, gsap
 * @source src/components/ui/glass-dock.tsx
 */
import {
  Camera,
  Home,
  Mail,
  Music,
  Settings,
  User,
} from "lucide-react";
import { GlassDock } from "@/components/ui/glass-dock";

const ITEMS = [
  { title: "Home", icon: Home, href: "#" },
  { title: "Profile", icon: User, href: "#" },
  { title: "Mail", icon: Mail, href: "#" },
  { title: "Photos", icon: Camera, href: "#" },
  { title: "Music", icon: Music, href: "#" },
  { title: "Settings", icon: Settings, href: "#" },
];

export default function GlassDockDemo() {
  return (
    <div className="flex min-h-[420px] items-center justify-center bg-[url('https://picsum.photos/seed/dock/1600/900')] bg-cover bg-center p-8">
      <GlassDock items={ITEMS} />
    </div>
  );
}
