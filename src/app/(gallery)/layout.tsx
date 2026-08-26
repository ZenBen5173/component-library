import { Sidebar } from "@/components/gallery/sidebar";
import { CommandPalette } from "@/components/gallery/command-palette";
import { getCategories } from "@/lib/registry";

// Always re-scan src/registry so newly added files appear immediately.
export const dynamic = "force-dynamic";

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar
        categories={categories.map((c) => ({
          slug: c.slug,
          label: c.label,
          entries: c.entries.map((e) => ({
            slug: e.slug,
            category: e.category,
            name: e.name,
            tags: e.tags,
          })),
        }))}
      />
      <main className="scrollbar-thin flex-1 overflow-y-auto">{children}</main>
      <CommandPalette
        entries={categories.flatMap((c) =>
          c.entries.map((e) => ({
            slug: e.slug,
            category: e.category,
            categoryLabel: c.label,
            name: e.name,
            tags: e.tags,
          })),
        )}
      />
    </div>
  );
}
