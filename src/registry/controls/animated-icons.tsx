"use client";

/**
 * @name Animated Icons
 * @description Lucide icons that draw themselves on hover — and, more usefully, that a whole row can drive so the icon plays when you hover anything around it.
 * @tags icon, hover, micro-interaction, lucide, navigation, must-have, versatile
 * @height 620
 * @deps motion
 * @note Two traps. They size from a `size` prop, not a class — `className="size-4"` does nothing and they render at their 28px default, which bursts whatever holds them. And they animate on their own hover, which is wrong in a nav: the hover target is the row, not the 16px glyph. Each exposes a `startAnimation` / `stopAnimation` handle through its ref, so the row drives it. Install more from lucide-animated.com; there are around 460.
 * @source src/components/ui/archive.tsx
 * @source src/components/ui/bell.tsx
 * @source src/components/ui/search.tsx
 */
import { useRef } from "react";
import { ArchiveIcon } from "@/components/ui/archive";
import { BellIcon } from "@/components/ui/bell";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { CheckCheckIcon } from "@/components/ui/check-check";
import { CircleCheckIcon } from "@/components/ui/circle-check";
import { ClockIcon } from "@/components/ui/clock";
import { PlusIcon } from "@/components/ui/plus";
import { SearchIcon } from "@/components/ui/search";
import { SettingsIcon } from "@/components/ui/settings";

/** Every one of these exposes the same pair of methods through its ref. */
type IconHandle = { startAnimation: () => void; stopAnimation: () => void };
type AnimatedIcon = React.ForwardRefExoticComponent<
  { size?: number; className?: string } & React.RefAttributes<IconHandle>
>;

const ICONS: { name: string; Icon: AnimatedIcon }[] = [
  { name: "Archive", Icon: ArchiveIcon },
  { name: "Bell", Icon: BellIcon },
  { name: "Calendar", Icon: CalendarDaysIcon },
  { name: "CheckCheck", Icon: CheckCheckIcon },
  { name: "CircleCheck", Icon: CircleCheckIcon },
  { name: "Clock", Icon: ClockIcon },
  { name: "Plus", Icon: PlusIcon },
  { name: "Search", Icon: SearchIcon },
  { name: "Settings", Icon: SettingsIcon },
];

const ROWS = [
  { label: "Inbox", Icon: ArchiveIcon },
  { label: "Today", Icon: CheckCheckIcon },
  { label: "Upcoming", Icon: CalendarDaysIcon },
  { label: "Settings", Icon: SettingsIcon },
];

/** Hands the row a way to play the icon it contains. */
function useIconHover() {
  const ref = useRef<IconHandle>(null);
  return {
    ref,
    onMouseEnter: () => ref.current?.startAnimation(),
    onMouseLeave: () => ref.current?.stopAnimation(),
  };
}

function NavRow({ label, Icon }: { label: string; Icon: AnimatedIcon }) {
  const { ref, onMouseEnter, onMouseLeave } = useIconHover();
  return (
    <button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon ref={ref} size={16} />
      {label}
    </button>
  );
}

export default function AnimatedIconsDemo() {
  return (
    <div className="min-h-[620px] bg-background p-10">
      <div className="mx-auto grid max-w-3xl gap-10 lg:grid-cols-[1fr_240px]">
        <section>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Hover any icon
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {ICONS.map(({ name, Icon }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20"
              >
                {/* size is a prop, not a class. A className of size-6 leaves
                    them at 28px and they burst small containers. */}
                <Icon size={22} className="text-foreground" />
                <span className="text-[10px] text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Driven by the row
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Hover anywhere on a row, not just the glyph — the row plays the
            icon through its ref.
          </p>
          <div className="mt-4 space-y-0.5 rounded-lg border border-border bg-card p-2">
            {ROWS.map((row) => (
              <NavRow key={row.label} label={row.label} Icon={row.Icon} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
