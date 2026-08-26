"use client";

/**
 * @name Breadcrumbs
 * @description Trail that staggers in on mount, with animated separators and a hover state on each crumb.
 * @tags breadcrumb, navigation, app
 * @height 420
 * @deps motion
 * @note Replaced the static shadcn breadcrumb with SmoothUI's — same structure, but the crumbs stagger in and the separators animate instead of sitting inert.
 * @source src/components/smoothui/breadcrumb/index.tsx
 */
import Breadcrumb from "@/components/smoothui/breadcrumb";

export default function BreadcrumbsDemo() {
  return (
    <div className="grid min-h-[420px] place-items-center bg-background p-10">
      <Breadcrumb
        items={[
          { label: "Acme", href: "#" },
          { label: "Projects", href: "#" },
          { label: "acme-dashboard", href: "#" },
          { label: "Settings" },
        ]}
      />
    </div>
  );
}
