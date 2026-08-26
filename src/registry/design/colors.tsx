"use client";

/**
 * @name Colours
 * @description The Radix scales this library runs on — 12 steps per hue, each step with a fixed job, matched across light and dark.
 * @tags color, palette, tokens, radix, design-system
 * @height 1200
 * @deps @radix-ui/colors
 * @note Adopted, not proposed — globals.css now defines these scales and every shadcn token resolves to a step, so all 78 entries inherit them. The GustFlow ramp and the old hand-picked oklch values are gone.
 */
import {
  amber, amberDark, grass, grassDark, indigo, indigoDark,
  red, redDark, slate, slateDark,
} from "@radix-ui/colors";

const STEP_ROLES = [
  ["1", "App background"], ["2", "Subtle background"],
  ["3", "Component fill"], ["4", "Hovered fill"],
  ["5", "Active fill"], ["6", "Subtle border"],
  ["7", "Border"], ["8", "Hovered border"],
  ["9", "Solid"], ["10", "Hovered solid"],
  ["11", "Low-contrast text"], ["12", "High-contrast text"],
];

const SCALES: [string, Record<string, string>, Record<string, string>, string][] = [
  ["slate", slate, slateDark, "Neutral — backgrounds, borders, body text"],
  ["indigo", indigo, indigoDark, "Accent — primary, ring, focus"],
  ["red", red, redDark, "Destructive — delete, failure"],
  ["amber", amber, amberDark, "Warning — pending, caution"],
  ["grass", grass, grassDark, "Success — completed, healthy"],
];

const MAPPING = [
  ["--background", "slate-1"], ["--card", "slate-2"],
  ["--muted", "slate-3"], ["--secondary", "slate-4"],
  ["--border", "slate-6"], ["--input", "slate-7"],
  ["--primary", "indigo-9"], ["--ring", "indigo-8"],
  ["--muted-foreground", "slate-11"], ["--foreground", "slate-12"],
  ["--destructive", "red-9"],
];

function Scale({
  name,
  light,
  dark,
  use,
}: {
  name: string;
  light: Record<string, string>;
  dark: Record<string, string>;
  use: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-medium capitalize">{name}</span>
        <span className="text-[10px] text-muted-foreground">{use}</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex">
          {Object.values(light).map((c, i) => (
            <div key={i} className="relative h-9 flex-1" style={{ background: c }}>
              <span className="absolute inset-0 grid place-items-center text-[9px] tabular-nums text-black/40">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
        <div className="flex border-t border-border">
          {Object.values(dark).map((c, i) => (
            <div key={i} className="relative h-9 flex-1" style={{ background: c }}>
              <span className="absolute inset-0 grid place-items-center text-[9px] tabular-nums text-white/40">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ColoursDemo() {
  return (
    <div className="min-h-[1200px] bg-background p-10">
      <div className="mx-auto grid max-w-3xl gap-5">
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold">Scales</h3>
          <p className="mt-1 mb-6 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Light row above, dark row below. The same step number does the same
            job in both — that's the whole point, and it's why dark mode needs no
            second round of colour picking.
          </p>
          <div className="grid gap-5">
            {SCALES.map(([name, light, dark, use]) => (
              <Scale key={name} name={name} light={light} dark={dark} use={use} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 text-sm font-semibold">What each step is for</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
            {STEP_ROLES.map(([step, role]) => (
              <p key={step} className="text-[11px] text-muted-foreground">
                <span className="mr-2 inline-block w-4 font-mono tabular-nums text-foreground">
                  {step}
                </span>
                {role}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold">Token mapping</h3>
          <p className="mt-1 mb-5 text-xs text-muted-foreground">
            Live values — these are what globals.css resolves right now.
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {MAPPING.map(([token, step]) => (
              <div
                key={token}
                className="flex items-center gap-2.5 rounded-md border border-border px-2.5 py-1.5"
              >
                <span
                  className="size-5 shrink-0 rounded border border-border"
                  style={{ background: `var(${token})` }}
                />
                <span className="font-mono text-[10px]">{token}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
