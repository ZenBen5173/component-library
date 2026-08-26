"use client";

/**
 * @name Typography
 * @description Type scale, weights and line heights — plus the case for replacing system-ui with a real typeface.
 * @tags typography, fonts, scale, design-system
 * @height 1200
 * @note Decided: Instrument Sans for headings (loaded via next/font in the root layout, exposed as `--font-display`), system-ui for body and UI text. The other candidates stay here for reference — swap by changing the one import in layout.tsx.
 */
const SCALE = [
  { name: "Display", cls: "text-5xl font-semibold tracking-tight", size: "48 / 1.05", use: "Hero headlines only" },
  { name: "H1", cls: "text-3xl font-semibold tracking-tight", size: "30 / 1.15", use: "Page title" },
  { name: "H2", cls: "text-2xl font-semibold tracking-tight", size: "24 / 1.2", use: "Section heading" },
  { name: "H3", cls: "text-lg font-medium", size: "18 / 1.4", use: "Card and panel titles" },
  { name: "Body", cls: "text-sm leading-relaxed", size: "14 / 1.6", use: "Default reading size" },
  { name: "Small", cls: "text-xs leading-relaxed", size: "12 / 1.5", use: "Descriptions, help text" },
  { name: "Micro", cls: "text-[11px] font-medium uppercase tracking-[0.08em]", size: "11 / 1.4", use: "Labels, table headers" },
  { name: "Mono", cls: "font-mono text-xs", size: "12 / 1.5", use: "Code, IDs, filenames" },
];

const PAIRINGS: {
  name: string;
  note: string;
  family: string;
  inUse?: boolean;
}[] = [
  { name: "Geist", note: "Vercel's. Neutral and tight, excellent at small sizes. The safe modern default.", family: "Geist" },
  { name: "Inter", note: "Ubiquitous — reads as competent but anonymous. Great metrics, no personality.", family: "Inter" },
  { name: "Instrument Sans", note: "IN USE for headings. Slightly editorial, a little warmth in the curves — enough character to not read as default.", family: "Instrument Sans", inUse: true },
  { name: "Space Grotesk", note: "Technical and distinctive. Strong for portfolio work, tiring for long UI copy.", family: "Space Grotesk" },
  { name: "System UI", note: "IN USE for body and UI text. Renders natively, costs nothing to load, and stays legible at 11px where display faces get muddy.", family: "ui-sans-serif", inUse: true },
];

const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Inter:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap";

export default function TypographyDemo() {
  return (
    <div className="min-h-[1200px] bg-background p-10">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONT_CSS} />
      <div className="mx-auto grid max-w-3xl gap-5">
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 text-sm font-semibold">Scale</h3>
          <div className="grid gap-6">
            {SCALE.map((row) => (
              <div key={row.name} className="grid gap-1">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    {row.name}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {row.size}
                  </span>
                </div>
                <p className={row.cls}>The quick brown fox jumps</p>
                <p className="text-[11px] text-muted-foreground">{row.use}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold">Weights</h3>
          <p className="mt-1 mb-5 text-xs text-muted-foreground">
            Three is enough. More than that and hierarchy stops reading as
            deliberate.
          </p>
          <div className="grid gap-3">
            {[
              ["Regular 400", "font-normal"],
              ["Medium 500", "font-medium"],
              ["Semibold 600", "font-semibold"],
            ].map(([label, cls]) => (
              <div key={label} className="flex items-baseline gap-4">
                <span className="w-28 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
                <span className={`text-base ${cls}`}>
                  Ship the thing that works
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold">Typeface candidates</h3>
          <p className="mt-1 mb-5 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Headings now render in Instrument Sans; body and UI text stay on the
            system stack. The rest are kept for comparison — each sample below
            loads its own face, so what you see is the real thing.
          </p>
          <div className="grid gap-3">
            {PAIRINGS.map((font) => (
              <div
                key={font.name}
                className={
                  font.inUse
                    ? "rounded-lg border border-primary/40 bg-primary/5 p-4"
                    : "rounded-lg border border-border p-4"
                }
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">
                    {font.name}
                    {font.inUse && (
                      <span className="ml-2 rounded-full border border-primary/40 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-primary">
                        in use
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {font.family}
                  </span>
                </div>
                <p
                  className="mt-3 text-2xl tracking-tight"
                  style={{ fontFamily: `"${font.family}", ui-sans-serif, system-ui` }}
                >
                  Ship the thing that works
                </p>
                <p
                  className="mt-1.5 text-sm leading-relaxed"
                  style={{ fontFamily: `"${font.family}", ui-sans-serif, system-ui` }}
                >
                  Handgloves 0123456789 — the quick brown fox jumps over the lazy
                  dog while a11y, Il1 and O0 stay legible.
                </p>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                  {font.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
