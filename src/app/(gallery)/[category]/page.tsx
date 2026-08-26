import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/registry";

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
    <div className="mx-auto max-w-5xl px-10 py-14">
      <h1 className="text-2xl font-semibold tracking-tight">
        {category.label}
      </h1>
      {category.blurb && (
        <p className="mt-2 text-sm text-g-dim">{category.blurb}</p>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {category.entries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/${entry.category}/${entry.slug}`}
            className="rounded-xl border border-g-line bg-g-surface p-4 transition-colors hover:border-g-brand"
          >
            <div className="text-sm font-medium">{entry.name}</div>
            {entry.description && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-g-dim">
                {entry.description}
              </p>
            )}
            {entry.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-g-line px-1.5 py-0.5 text-[10px] text-g-dim"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
