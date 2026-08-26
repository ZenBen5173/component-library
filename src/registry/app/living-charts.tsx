"use client";

/**
 * @name Living Charts
 * @description Fixed figures that never sit still — a light travelling the line, a drifting gradient under it, bars caught by a sweeping shimmer, and a ring with a rotating sheen.
 * @tags chart, data, analytics, dashboard, animated, hover, must-have, app
 * @height 760
 * @note The data is static and never changes — the motion is entirely in how it is drawn, which is the point. Live Charts is the other case, where the numbers themselves stream. Everything loops through `motion`, so the gallery's reduced-motion toggle stops all of it; nothing here is on a rAF loop of its own.
 */
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";

const REVENUE = [42, 55, 48, 71, 65, 88, 79, 96];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const CHANNELS = [
  { label: "Direct", value: 44, tint: "var(--chart-1)" },
  { label: "Search", value: 28, tint: "var(--chart-2)" },
  { label: "Social", value: 18, tint: "var(--chart-3)" },
  { label: "Email", value: 10, tint: "var(--chart-4)" },
];

const W = 620;
const H = 200;
const MAX = 100;

function linePath(values: number[]) {
  const step = W / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = H - (v / MAX) * (H - 24) - 12;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function AreaChart() {
  const d = linePath(REVENUE);
  const step = W / (REVENUE.length - 1);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-baseline justify-between px-4 pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Revenue
          </p>
          <p className="font-display text-2xl font-semibold tabular-nums">
            $96,400
          </p>
        </div>
        <span className="text-xs font-medium text-emerald-500">+18.2%</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" aria-hidden>
        <defs>
          {/* Drifts sideways forever, so the fill is never quite the same
              twice even though the numbers behind it never move. */}
          <linearGradient id="living-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient
            id="living-sheen"
            x1="0"
            y1="0"
            x2="0.35"
            y2="0"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.18" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <clipPath id="living-clip">
            <path d={`${d} L ${W} ${H} L 0 ${H} Z`} />
          </clipPath>
        </defs>

        <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#living-fill)" />

        {/* Sheen sweeping through the filled area. */}
        <g clipPath="url(#living-clip)">
          <motion.rect
            y="0"
            width={W * 0.6}
            height={H}
            fill="url(#living-sheen)"
            initial={{ x: -W * 0.6 }}
            animate={{ x: W }}
            transition={{ duration: 5.5, ease: "linear", repeat: Infinity }}
          />
        </g>

        {/* The resting line. */}
        <path
          d={d}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.45}
        />

        {/* A short bright segment running the length of the line — the same
            idea as the metal rim, applied to a stroke. */}
        <motion.path
          d={d}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="0.12 0.88"
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: -1 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        />

        {/* Points breathe in sequence rather than all at once. */}
        {REVENUE.map((v, i) => {
          const x = i * step;
          const y = H - (v / MAX) * (H - 24) - 12;
          return (
            <motion.circle
              key={MONTHS[i]}
              cx={x}
              cy={y}
              r={2.5}
              fill="var(--chart-1)"
              animate={{ opacity: [0.35, 1, 0.35], r: [2.5, 3.5, 2.5] }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.22,
              }}
            />
          );
        })}
      </svg>

      <div className="flex justify-between px-4 pb-3 text-[10px] text-muted-foreground">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

function ShimmerBars() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Weekly volume
      </p>
      <div className="mt-4 flex h-32 items-end gap-2">
        {REVENUE.map((v, i) => (
          <div key={MONTHS[i]} className="relative flex-1">
            <motion.div
              className="relative w-full overflow-hidden rounded-t-sm bg-[var(--chart-1)]/25"
              style={{ height: `${v}%` }}
              // A slow breath, offset per bar, so the row is never level.
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{
                duration: 3.4,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.12,
              }}
            >
              <motion.span
                className="absolute inset-x-0 h-1/2 bg-gradient-to-t from-transparent via-[var(--chart-1)]/70 to-transparent"
                initial={{ y: "120%" }}
                animate={{ y: "-120%" }}
                transition={{
                  duration: 2.8,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: i * 0.18,
                }}
              />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SheenRing() {
  const size = 132;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5 rounded-lg border border-border bg-card p-4">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          {CHANNELS.map((seg) => {
            const len = (seg.value / 100) * c;
            const dash = `${len - 3} ${c - len + 3}`;
            const el = (
              <motion.circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.tint}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                animate={{ opacity: [0.72, 1, 0.72] }}
                transition={{
                  duration: 3.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: offset / c,
                }}
              />
            );
            offset += len;
            return el;
          })}
        </svg>

        {/* Sheen rotating over the ring, clipped to the donut band. */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.22) 30deg, transparent 70deg)",
            mask: `radial-gradient(circle, transparent ${r - stroke / 2}px, black ${r - stroke / 2}px, black ${r + stroke / 2}px, transparent ${r + stroke / 2}px)`,
            WebkitMask: `radial-gradient(circle, transparent ${r - stroke / 2}px, black ${r - stroke / 2}px, black ${r + stroke / 2}px, transparent ${r + stroke / 2}px)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 7, ease: "linear", repeat: Infinity }}
        />

        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-xl font-semibold tabular-nums">
            44%
          </span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {CHANNELS.map((seg, i) => (
          <li key={seg.label} className="flex items-center gap-2 text-xs">
            <motion.span
              className="size-2 shrink-0 rounded-full"
              style={{ background: seg.tint }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 3.6,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
            <span className="flex-1 truncate text-muted-foreground">
              {seg.label}
            </span>
            <span className="tabular-nums">{seg.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LivingCharts() {
  return (
    <div className="min-h-[760px] bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, ease: EASE.expressive }}
        className={cn("mx-auto max-w-3xl space-y-4")}
      >
        <AreaChart />
        <div className="grid gap-4 lg:grid-cols-2">
          <ShimmerBars />
          <SheenRing />
        </div>
      </motion.div>
    </div>
  );
}
