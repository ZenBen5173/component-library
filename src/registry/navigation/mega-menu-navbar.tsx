"use client";

/**
 * @name Mega Menu Navbar
 * @description Sticky top bar whose panels expand into a mega menu — a promo sidebar card plus grouped link columns.
 * @tags navigation, navbar, mega-menu, saas, website
 * @height 620
 * @deps framer-motion
 * @note The promo card copy inside the Resources panel ("State of SaaS 2026") is hard-coded in the component, not a prop — edit it there. The plain link between Use Cases and Resources is `pricingHref` and its label is fixed as "Pricing".
 * @source src/components/ui/mega-menu-navbar.tsx
 */
import {
  BookOpen,
  Boxes,
  FileCode,
  Github,
  LayoutTemplate,
  Component,
  ScrollText,
} from "lucide-react";
import { MegaMenuNavbar } from "@/components/ui/mega-menu-navbar";

const RESOURCE_GROUPS = [
  {
    title: "Explore",
    links: [
      { title: "Components", href: "#", icon: Component },
      { title: "Blocks", href: "#", icon: Boxes },
      { title: "Templates", href: "#", icon: LayoutTemplate },
    ],
  },
  {
    title: "Learn",
    links: [
      { title: "Documentation", href: "#", icon: BookOpen },
      { title: "Changelog", href: "#", icon: ScrollText },
      { title: "GitHub", href: "#", icon: Github },
    ],
  },
];

export default function MegaMenuNavbarDemo() {
  return (
    <div className="min-h-[620px] bg-background">
      <MegaMenuNavbar
        brandName="VengeanceUI"
        logo={<FileCode className="size-5" />}
        ctaLabel="Browse components"
        resourceGroups={RESOURCE_GROUPS}
      />
      <div className="px-8 py-24 text-center">
        <p className="text-sm text-muted-foreground">
          A quieter navigation system for exploring the component library.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Hover &ldquo;Features&rdquo;, &ldquo;Use Cases&rdquo; or
          &ldquo;Resources&rdquo; in the bar above.
        </p>
      </div>
    </div>
  );
}
