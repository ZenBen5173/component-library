"use client";

/**
 * @name Stats Counter
 * @description Number that counts up to its target, with prefix/suffix and decimal support. For stat strips.
 * @tags number, counter, stats, scroll, website
 * @height 360
 * @deps framer-motion
 * @source src/components/ui/stats-counter.tsx
 */
import StatsCounter from "@/components/ui/stats-counter";

const STATS = [
  { value: 128, suffix: "k", label: "Downloads" },
  { value: 99.98, suffix: "%", decimals: 2, label: "Uptime" },
  { value: 4.2, suffix: "M", decimals: 1, prefix: "$", label: "ARR" },
];

export default function StatsCounterDemo() {
  return (
    <div className="grid min-h-[360px] place-items-center bg-neutral-950 px-8">
      <div className="grid w-full max-w-3xl grid-cols-1 gap-10 text-center sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <StatsCounter
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              decimals={stat.decimals}
              className="text-5xl font-semibold text-white"
            />
            <p className="mt-2 text-xs uppercase tracking-widest text-white/40">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
