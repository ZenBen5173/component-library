"use client";

/**
 * @name Icon Picker
 * @description Search all 1,865 lucide icons and pick one — every tile draws itself on as you pass it.
 * @tags icon, picker, search, lucide, animated, must-have, versatile
 * @height 620
 * @note The animation is derived, not authored. Animated Icons holds nine icons built by hand, one glyph at a time, which is the right answer for nine and impossible for eighteen hundred. Here each shape is given a normalised path length so a single dash sweep draws any icon correctly whatever its real geometry — without that, a dasharray tuned for one glyph draws the next unevenly or not at all. Icons load one module at a time, so the grid is capped and search is the way through rather than scrolling; rendering the whole set would fetch the whole set. The ref exposes startAnimation / stopAnimation, the same pair the hand-built icons use, so a row can play the icon it contains rather than making you hover the 16px glyph.
 * @source src/components/ui/icon-picker.tsx
 * @source src/components/ui/animated-lucide.tsx
 */
import { useRef, useState } from "react";
import type { IconName } from "lucide-react/dynamic";
import { AnimatedLucide, type IconHandle } from "@/components/ui/animated-lucide";
import { IconPicker } from "@/components/ui/icon-picker";

const ROWS: { label: string; icon: IconName }[] = [
  { label: "Deployments", icon: "rocket" },
  { label: "Incidents", icon: "flame" },
  { label: "Repositories", icon: "git-branch" },
  { label: "Team", icon: "users" },
];

/** A row that plays the icon it contains, rather than the other way round. */
function NavRow({ label, icon }: { label: string; icon: IconName }) {
  const ref = useRef<IconHandle>(null);
  return (
    <button
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <AnimatedLucide ref={ref} name={icon} size={16} trigger="manual" />
      {label}
    </button>
  );
}

export default function IconPickerDemo() {
  const [icon, setIcon] = useState<IconName>("sparkles");

  return (
    <div className="min-h-[620px] bg-background p-10">
      <div className="mx-auto grid max-w-3xl gap-10 lg:grid-cols-[288px_1fr]">
        <section>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Pick one
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
            <IconPicker value={icon} onChange={setIcon} className="w-full" />
          </div>
        </section>

        <div className="space-y-10">
          <section>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Chosen
            </p>
            <div className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-card p-5">
              <span className="grid size-12 place-items-center rounded-lg bg-muted text-foreground">
                <AnimatedLucide name={icon} size={24} />
              </span>
              <div>
                <p className="font-mono text-sm">{icon}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hover it — every icon draws, not just the hand-built ones.
                </p>
              </div>
            </div>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Driven by the row
            </p>
            <div className="mt-4 space-y-0.5 rounded-lg border border-border bg-card p-2">
              {ROWS.map((row) => (
                <NavRow key={row.label} label={row.label} icon={row.icon} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
