import { ShowcaseBar } from "@/components/gallery/showcase-bar";

/**
 * Full-bleed routes. These are the app shell and the logo generator shown as
 * products rather than catalogue entries, so they get the whole viewport and
 * only a thin bar to get back out of.
 */
export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <ShowcaseBar />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
