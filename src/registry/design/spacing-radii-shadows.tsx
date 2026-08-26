"use client";

/**
 * @name Spacing, Radii & Shadows
 * @description The scales components should pull from, so values stop being invented per component.
 * @tags spacing, radius, shadow, tokens, design-system
 * @height 1100
 * @note This is the gap that made porting the table messy — it arrived with `rounded-squircle-sm` and `bg-accent-subtle`, neither of which exist here. A documented scale is what prevents that.
 */
const SPACING = [
  ["0.5", "2px", "Hairline gaps, icon nudges"],
  ["1", "4px", "Tight icon/label gaps"],
  ["2", "8px", "Inside small controls"],
  ["3", "12px", "Cell and input padding"],
  ["4", "16px", "Card padding, form rows"],
  ["6", "24px", "Section padding"],
  ["10", "40px", "Page gutters"],
  ["14", "56px", "Between major sections"],
];

const RADII = [
  ["rounded-sm", "2px", "Tiny chips, swatches"],
  ["rounded-md", "6px", "Buttons, inputs"],
  ["rounded-lg", "8px", "Cards, popovers"],
  ["rounded-xl", "12px", "Panels, previews"],
  ["rounded-2xl", "16px", "Feature tiles"],
  ["rounded-full", "999px", "Pills, avatars"],
];

const SHADOWS = [
  ["shadow-none", "Flat — most surfaces in a dark UI"],
  ["shadow-sm", "Resting cards"],
  ["shadow-md", "Dropdowns, hover lift"],
  ["shadow-lg", "Popovers, tooltips"],
  ["shadow-xl", "Dialogs"],
];

function Panel({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 mb-5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
        {note}
      </p>
      {children}
    </section>
  );
}

export default function SpacingRadiiShadowsDemo() {
  return (
    <div className="min-h-[1100px] bg-background p-10">
      <div className="mx-auto grid max-w-3xl gap-5">
        <Panel
          title="Spacing"
          note="A 4px base. Skipping steps (2 → 4 → 6) reads as intentional; 5s and 7s read as accidents."
        >
          <div className="grid gap-2.5">
            {SPACING.map(([step, px, use]) => (
              <div key={step} className="flex items-center gap-4">
                <span className="w-8 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {step}
                </span>
                <span className="h-3 rounded bg-primary/70" style={{ width: px }} />
                <span className="w-12 shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {px}
                </span>
                <span className="text-[11px] text-muted-foreground">{use}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Radii"
          note="Nest them consistently — an inner element should never be rounder than its container."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {RADII.map(([cls, px, use]) => (
              <div key={cls} className="flex items-center gap-3">
                <span
                  className={`size-11 shrink-0 border border-border bg-muted ${cls}`}
                />
                <div className="min-w-0">
                  <p className="truncate font-mono text-[10px]">{cls}</p>
                  <p className="text-[10px] text-muted-foreground">{px}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{use}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Shadows"
          note="On dark surfaces shadows barely read — separate with borders and background steps instead, and save shadow for things that genuinely float."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {SHADOWS.map(([cls, use]) => (
              <div
                key={cls}
                className={`rounded-lg border border-border bg-card p-4 ${cls}`}
              >
                <p className="font-mono text-[11px]">{cls}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{use}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
