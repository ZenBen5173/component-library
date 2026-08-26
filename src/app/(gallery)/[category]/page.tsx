import { notFound } from "next/navigation";
import { getCategories } from "@/lib/registry";
import { EntryBrowser } from "@/components/gallery/entry-browser";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-10 py-14">
      <h1 className="text-2xl font-semibold tracking-tight">
        {category.label}
      </h1>
      {category.blurb && (
        <p className="mt-2 max-w-lg text-sm text-g-dim">{category.blurb}</p>
      )}

      <div className="mt-7">
        <EntryBrowser
          entries={category.entries.map((e) => ({
            slug: e.slug,
            category: e.category,
            name: e.name,
            description: e.description,
            tags: e.tags,
            height: e.height,
          }))}
        />
      </div>
    </div>
  );
}
