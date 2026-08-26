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
          // h-full matters: `items-end` shrinks the column to its content, and
          // a percentage height inside a zero-height parent resolves to zero —
          // the bars simply do not draw.
          <div key={MONTHS[i]} className="relative h-full flex-1">
            <motion.div
              className="absolute bottom-0 w-full overflow-hidden rounded-t-sm bg-gradient-to-t from-[var(--chart-1)]/30 to-[var(--chart-1)]/70"
              // A real rise and fall, staggered along the row, so the whole
              // chart reads as a wave rather than a still frame.
              // Rests at its real value rather than 0 — if the loop never
              // runs (reduced motion, a backgrounded tab), the chart still
              // shows the data instead of an empty row.
              initial={{ height: `${v}%` }}
              animate={{ height: [`${v}%`, `${Math.min(v + 9, 100)}%`, `${v}%`] }}
              transition={{
                duration: 3.2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.16,
              }}
            >
              <motion.span
                className="absolute inset-x-0 h-8 bg-gradient-to-t from-transparent via-white/45 to-transparent"
                initial={{ y: "140%" }}
                animate={{ y: "-140%" }}
                transition={{
                  duration: 2.4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.6,
                  delay: i * 0.14,
                }}
              />
            </motion.div>

            {/* Tip light, so the top edge catches the eye as it moves. */}
            <motion.span
              className="absolute inset-x-0 h-[2px] rounded-full bg-[var(--chart-1)]"
              initial={{ bottom: `${v}%`, opacity: 0.7 }}
              animate={{
                bottom: [`${v}%`, `${Math.min(v + 9, 100)}%`, `${v}%`],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3.2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.16,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        {MONTHS.map((m) => (
          <span key={m} className="flex-1 text-center">
            {m}
          </span>
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
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        {/* The whole ring turns. Opacity alone read as static — nothing was
            actually moving, which is what made it look dead. */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 26, ease: "linear", repeat: Infinity }}
        >
          <svg width={size} height={size} className="-rotate-90" aria-hidden>
            {CHANNELS.map((seg, i) => {
              const len = (seg.value / 100) * c;
              const dash = `${len - 4} ${c - len + 4}`;
              const el = (
                <motion.circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={seg.tint}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  animate={{ strokeWidth: [stroke - 2, stroke + 2, stroke - 2] }}
                  transition={{
                    duration: 3.4,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: i * 0.35,
                  }}
                />
              );
              offset += len;
              return el;
            })}
          </svg>
        </motion.div>

        {/* A bright arc orbiting the band, faster than the ring itself. */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 4.5, ease: "linear", repeat: Infinity }}
        >
          <svg width={size} height={size} className="-rotate-90" aria-hidden>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="white"
              strokeOpacity={0.55}
              strokeWidth={stroke}
              strokeDasharray={`${c * 0.07} ${c}`}
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        <div className="absolute inset-0 grid place-items-center">
          <motion.span
            className="font-display text-xl font-semibold tabular-nums"
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
          >
            44%
          </motion.span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {CHANNELS.map((seg, i) => (
          <li key={seg.label} className="flex items-center gap-2 text-xs">
            <motion.span
              className="size-2 shrink-0 rounded-full"
              style={{ background: seg.tint }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.55, 1, 0.55] }}
              transition={{
                duration: 3.4,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.35,
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
