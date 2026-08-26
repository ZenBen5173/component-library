"use client";

/**
 * @name Motion Tokens
 * @description Standard durations, easings and springs — so every component's animation feels like the same hand.
 * @tags motion, animation, easing, spring, design-system
 * @height 1000
 * @deps motion
 * @note This library is mostly motion, so inconsistent timing shows more here than anywhere else. Hover or click each row to replay it.
 */
import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const DURATIONS = [
  ["instant", 0.1, "State flips — checkbox, toggle"],
  ["fast", 0.2, "Hover, focus, colour change"],
  ["base", 0.3, "Most transitions"],
  ["slow", 0.5, "Entrances, layout shifts"],
  ["deliberate", 0.8, "Hero reveals, scroll effects"],
];

const EASINGS: [string, [number, number, number, number], string][] = [
  ["standard", [0.4, 0, 0.2, 1], "Default — moves in and settles"],
  ["decelerate", [0, 0, 0.2, 1], "Entering the screen"],
  ["accelerate", [0.4, 0, 1, 1], "Leaving the screen"],
  ["expressive", [0.16, 1, 0.3, 1], "The one used across this library"],
];

const SPRINGS: [string, { stiffness: number; damping: number }, string][] = [
  ["snappy", { stiffness: 400, damping: 30 }, "Tooltips, small pops"],
  ["default", { stiffness: 300, damping: 24 }, "Sliding indicators, tabs"],
  ["soft", { stiffness: 160, damping: 26 }, "Progress rails, large panels"],
  ["bouncy", { stiffness: 500, damping: 15 }, "Playful — use sparingly"],
];

function Track({
  label,
  detail,
  play,
  transition,
}: {
  label: string;
  detail: string;
  play: number;
  transition: object;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (el) setDistance(Math.max(0, el.clientWidth - 24 - 8));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px]">{label}</span>
        <span className="text-[10px] text-muted-foreground">{detail}</span>
      </div>
      <div
        ref={trackRef}
        className="relative h-8 overflow-hidden rounded-md border border-border bg-muted/40"
      >
        {/* Ghost marks the finish line, so a slow track is legible as slow
            rather than looking stalled. */}
        <span className="absolute top-1 right-1 size-6 rounded border border-dashed border-border" />
        <motion.div
          key={play}
          initial={{ x: 0 }}
          animate={{ x: distance }}
          transition={{
            ...transition,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 0.4,
          }}
          className="absolute top-1 left-1 size-6 rounded bg-primary"
        />
      </div>
    </div>
  );
}

export default function MotionTokensDemo() {
  const [play, setPlay] = useState(0);

  return (
    <div className="min-h-[1000px] bg-background p-10">
      <div className="mx-auto grid max-w-2xl gap-5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Every track runs the same distance on a loop, so the differences are
          in the timing, not the path. Watch two rows at once to compare.
        </p>
        <button
          type="button"
          onClick={() => setPlay((n) => n + 1)}
          className="w-fit rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
        >
          Restart all
        </button>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 text-sm font-semibold">Durations</h3>
          <div className="grid gap-4">
            {DURATIONS.map(([name, d, use]) => (
              <Track
                key={String(name)}
                label={`${name} — ${Number(d) * 1000}ms`}
                detail={String(use)}
                play={play}
                transition={{ duration: Number(d), ease: [0.4, 0, 0.2, 1] }}
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 text-sm font-semibold">Easings</h3>
          <div className="grid gap-4">
            {EASINGS.map(([name, ease, use]) => (
              <Track
                key={name}
                label={`${name} — cubic-bezier(${ease.join(", ")})`}
                detail={use}
                play={play}
                transition={{ duration: 0.6, ease }}
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 text-sm font-semibold">Springs</h3>
          <div className="grid gap-4">
            {SPRINGS.map(([name, cfg, use]) => (
              <Track
                key={name}
                label={`${name} — stiffness ${cfg.stiffness}, damping ${cfg.damping}`}
                detail={use}
                play={play}
                transition={{ type: "spring", ...cfg }}
              />
            ))}
          </div>
        </section>

        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          Rule of thumb: durations scale with distance. A 24px toggle at 500ms
          feels broken; a full-screen panel at 100ms feels like a cut. And
          anything above 800ms should be scroll-driven, not time-driven.
        </p>
      </div>
    </div>
  );
}
