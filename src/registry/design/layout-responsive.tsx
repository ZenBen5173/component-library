"use client";

/**
 * @name Layout & Responsive
 * @description Breakpoints, container widths and how components should reflow rather than just shrink.
 * @tags layout, responsive, breakpoints, container-queries, design-system
 * @height 1100
 * @note Resize the preview with the toolbar's device buttons to watch the rules apply. The grid below uses container queries, so it reflows to its own width — not the window's.
 */
const BREAKPOINTS = [
  ["sm", "640px", "Large phone landscape"],
  ["md", "768px", "Tablet portrait — sidebars start appearing"],
  ["lg", "1024px", "Desktop — the app shell becomes viable"],
  ["xl", "1280px", "Wide desktop — the design target here"],
  ["2xl", "1536px", "Cap content; don't keep stretching"],
];

const RULES = [
  ["Reflow, don't shrink", "A 3-column grid becomes 1 column. It does not become three squeezed columns."],
  ["Cap the measure", "Body text stops at ~65 characters regardless of screen width."],
  ["Sidebars collapse, then hide", "Icon-only at md, off-canvas below it — never a squeezed 120px rail."],
  ["Tables scroll, not wrap", "Horizontal scroll with a frozen first column beats stacking cells."],
  ["Touch targets grow", "44px minimum below md, even where the desktop control is 32px."],
];

export default function LayoutResponsiveDemo() {
  return (
    <div className="min-h-[1100px] bg-background p-10">
      <div className="mx-auto grid max-w-3xl gap-5">
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 text-sm font-semibold">Breakpoints</h3>
          <div className="grid gap-2.5">
            {BREAKPOINTS.map(([name, width, use]) => (
              <div key={name} className="flex items-center gap-4">
                <span className="w-8 shrink-0 font-mono text-[11px]">{name}</span>
                <span className="w-16 shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {width}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${(parseInt(width) / 1536) * 100}%` }}
                  />
                </div>
                <span className="hidden w-56 shrink-0 text-[11px] text-muted-foreground sm:block">
                  {use}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold">Container queries</h3>
          <p className="mt-1 mb-5 max-w-xl text-xs leading-relaxed text-muted-foreground">
            The right tool for components. A card in a narrow sidebar should
            reflow even on a wide screen — viewport breakpoints can't express
            that, container queries can.
          </p>
          <div className="@container grid gap-3">
            <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @2xl:grid-cols-3">
              {["Deploys", "Builds", "Domains", "Members", "Usage", "Logs"].map(
                (label) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border p-4"
                  >
                    <p className="text-xs font-medium">{label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {label.length * 7}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 text-sm font-semibold">Rules</h3>
          <div className="grid gap-4">
            {RULES.map(([rule, detail]) => (
              <div key={rule}>
                <p className="text-[13px] font-medium">{rule}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold">Content widths</h3>
          <p className="mt-1 mb-5 text-xs text-muted-foreground">
            Three that cover almost everything.
          </p>
          <div className="grid gap-3">
            {[
              ["max-w-md", "448px", "Forms, auth, single-column dialogs"],
              ["max-w-3xl", "768px", "Reading and documentation"],
              ["max-w-6xl", "1152px", "App shells and dashboards"],
            ].map(([cls, px, use]) => (
              <div key={cls} className="grid gap-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px]">{cls}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {px} — {use}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full bg-primary/60"
                  style={{ width: `${(parseInt(px) / 1152) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
