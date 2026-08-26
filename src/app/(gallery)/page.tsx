import Link from "next/link";
import { getCategories } from "@/lib/registry";
import { EntryBrowser } from "@/components/gallery/entry-browser";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await getCategories();
  const total = categories.reduce((n, c) => n + c.entries.length, 0);

  const entries = categories.flatMap((c) =>
    c.entries.map((e) => ({
      slug: e.slug,
      category: e.category,
      name: e.name,
      description: e.description,
      tags: e.tags,
      height: e.height,
    })),
  );

  return (
    <div className="mx-auto max-w-6xl px-10 py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Component Library
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-g-dim">
            {total} components on Radix colour and Instrument Sans. Every card
            below is the component itself, running live.
          </p>
        </div>
        <p className="text-xs text-g-dim">
          Press{" "}
          <kbd className="rounded border border-g-line bg-g-surface px-1.5 py-0.5 font-mono text-[10px] text-g-ink">
            ⌘K
          </kbd>{" "}
          to jump anywhere
        </p>
      </header>

      {total === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-g-line p-10 text-center">
          <p className="text-sm font-medium">Nothing in the library yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-g-dim">
            Add a file to{" "}
            <code className="font-mono">src/registry/heroes/my-hero.tsx</code>{" "}
            with a default export, or run{" "}
            <code className="font-mono">npm run new heroes my-hero</code>.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <EntryBrowser
            entries={entries}
            categories={categories.map((c) => ({
              slug: c.slug,
              label: c.label,
            }))}
          />
        </div>
      )}

      <footer className="mt-16 border-t border-g-line pt-6 text-xs leading-relaxed text-g-dim">
        Drop a <code className="font-mono text-g-ink">.tsx</code> file with a
        default export into{" "}
        <code className="font-mono text-g-ink">
          src/registry/&lt;category&gt;/
        </code>{" "}
        and it appears here on refresh — describe it in a leading{" "}
        <code className="font-mono text-g-ink">/** @name … */</code> comment.
        Full notes in{" "}
        <Link href="/design" className="text-g-brand hover:underline">
          Design System
        </Link>
        .
      </footer>
    </div>
  );
}
