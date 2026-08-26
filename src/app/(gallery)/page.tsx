import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/registry";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await getCategories();
  const total = categories.reduce((n, c) => n + c.entries.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-10 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Component Library
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-g-dim">
        {total} components — app UI, marketing sections, heroes, navigation,
        kinetic text, and a design-system reference. Drop a{" "}
        <code className="font-mono text-g-ink">.tsx</code> file into{" "}
        <code className="font-mono text-g-ink">src/registry/&lt;category&gt;/</code>{" "}
        and it appears here on refresh — no registration step.
      </p>
      <p className="mt-3 max-w-xl text-xs leading-relaxed text-g-dim">
        Colour runs on Radix scales and headings on Instrument Sans; see the
        Design System section. Every preview has a{" "}
        <span className="text-g-ink">Reduced motion</span> toggle in its toolbar.
      </p>

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
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="group rounded-xl border border-g-line bg-g-surface p-5 transition-colors hover:border-g-brand"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{category.label}</span>
                <ArrowRight
                  size={14}
                  className="text-g-dim transition-transform group-hover:translate-x-0.5 group-hover:text-g-brand"
                />
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-g-dim">
                {category.blurb || "\u00a0"}
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-widest text-g-dim">
                {category.entries.length}{" "}
                {category.entries.length === 1 ? "component" : "components"}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-14 rounded-xl border border-g-line p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-g-dim">
          Adding a component
        </h2>
        <ol className="mt-3 space-y-2 text-[13px] leading-relaxed text-g-dim">
          <li>
            <span className="text-g-ink">1.</span> Save the file as{" "}
            <code className="font-mono text-g-ink">
              src/registry/&lt;category&gt;/&lt;slug&gt;.tsx
            </code>{" "}
            with a default export.
          </li>
          <li>
            <span className="text-g-ink">2.</span> Add{" "}
            <code className="font-mono text-g-ink">&quot;use client&quot;</code> at
            the top if it uses hooks, state or motion.
          </li>
          <li>
            <span className="text-g-ink">3.</span> Optionally describe it in a
            leading{" "}
            <code className="font-mono text-g-ink">/** @name … */</code> comment.
          </li>
          <li>
            <span className="text-g-ink">4.</span> Refresh — it appears in the
            sidebar.
          </li>
        </ol>
      </div>
    </div>
  );
}
