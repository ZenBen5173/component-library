import { notFound } from "next/navigation";
import { ReducedMotionScope } from "@/components/gallery/reduced-motion-scope";
import { loadComponent } from "@/lib/load-component";
import { getEntry } from "@/lib/registry";

export const dynamic = "force-dynamic";

/** Bare render of a single registry component — this is what the iframe loads. */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; slug: string }>;
  searchParams: Promise<{ reduce?: string }>;
}) {
  const { category, slug } = await params;
  const { reduce } = await searchParams;
  const entry = await getEntry(category, slug);
  if (!entry) notFound();

  const Component = await loadComponent(category, slug);

  if (!Component) {
    return (
      <div className="grid min-h-dvh place-items-center p-8 text-center">
        <div>
          <p className="text-sm font-medium">Nothing to render.</p>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-g-dim">
            <code className="font-mono">{entry.file}</code> has no default
            export, or it threw while loading. Check the terminal for the error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ReducedMotionScope active={reduce === "1"}>
      <Component />
    </ReducedMotionScope>
  );
}
