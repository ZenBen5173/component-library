"use client";

/**
 * @name Spotlight Navbar
 * @description Nav links lit by a sliding spotlight that tracks the hovered item and settles on the active one.
 * @tags navigation, navbar, spotlight, hover
 * @height 360
 * @source src/components/ui/spotlight-navbar.tsx
 */
import { SpotlightNavbar } from "@/components/ui/spotlight-navbar";

export default function SpotlightNavbarDemo() {
  return (
    <div className="flex min-h-[360px] items-center justify-center bg-background p-8">
      <SpotlightNavbar
        items={[
          { label: "Work", href: "#work" },
          { label: "Studio", href: "#studio" },
          { label: "Journal", href: "#journal" },
          { label: "Contact", href: "#contact" },
        ]}
      />
    </div>
  );
}
