"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PAGES = [
  { href: "/app", label: "App Shell" },
  { href: "/logo", label: "Logo Generator" },
  { href: "/", label: "Library" },
];

/**
 * The bar across the three main pages.
 *
 * On semantic tokens rather than the gallery's `g-` ones, because it sits on
 * top of the showcased pages and has to belong to whatever theme they use.
 */
export function ShowcaseBar() {
  const pathname = usePathname();

  return (
    <header className="relative z-50 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} />
        <span className="hidden sm:inline">Library</span>
      </Link>

      <nav className="mx-auto flex items-center gap-1">
        {PAGES.map((page) => {
          const active = pathname === page.href;
          return (
            <Link
              key={page.href}
              href={page.href}
              className="relative rounded-md px-3 py-1.5 text-xs"
            >
              {active && (
                <motion.span
                  layoutId="showcase-active"
                  transition={SPRING.default}
                  className="absolute inset-0 rounded-md bg-muted"
                />
              )}
              <span
                className={cn(
                  "relative transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {page.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <ThemeToggle className="shrink-0" />
    </header>
  );
}
