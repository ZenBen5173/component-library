"use client";

/**
 * @name Living Charts
 * @description Fixed figures that never sit still — a light travelling the line, a drifting gradient under it, bars caught by a sweeping shimmer, and a ring with a rotating sheen.
 * @tags chart, data, analytics, dashboard, animated, hover, must-have, app
 * @height 760
 * @note The data is static and never changes — the motion is entirely in how it is drawn, which is the point. Live Charts is the other case, where the numbers themselves stream. Everything loops through `motion`, so the gallery's reduced-motion toggle stops all of it; nothing here is on a rAF loop of its own.
 */
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DURATION, EASE, SPRING } from "@/lib/motion";

const REVENUE = [42, 55, 48, 71, 65, 88, 79, 96];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const TILES = [
  { label: "Sessions", value: "8,420", tone: "text-foreground", trend: [30, 44, 38, 61, 55, 72, 68, 81] },
  { label: "Bounce", value: "24%", tone: "text-amber-500", trend: [70, 62, 66, 54, 58, 46, 44, 40] },
  { label: "Signups", value: "1,204", tone: "text-emerald-500", trend: [20, 26, 31, 29, 42, 48, 60, 66] },
];

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
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<number | null>(null);

  /** Client x → the nearest point index, through the viewBox scale. */
  const track = (clientX: number) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const vx = ((clientX - box.left) / box.width) * W;
    setActive(
      Math.max(0, Math.min(REVENUE.length - 1, Math.round(vx / step))),
    );
  };

  const y = (v: number) => H - (v / MAX) * (H - 24) - 12;

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

      <div className="relative mt-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onPointerMove={(e) => track(e.clientX)}
          onPointerLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id="living-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
            </linearGradient>

            {/* The highlight is masked rather than dashed. A dash has hard
                ends, which is why it read as a block sliding along the line;
                a gradient mask lets it fade up and away at both ends. */}
            <linearGradient id="living-sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="35%" stopColor="white" stopOpacity="0.7" />
              <stop offset="50%" stopColor="white" stopOpacity="1" />
              <stop offset="65%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="living-sweep-mask" maskUnits="userSpaceOnUse">
              <motion.rect
                y={0}
                width={W * 0.42}
                height={H}
                fill="url(#living-sweep)"
                initial={{ x: -W * 0.42 }}
                animate={{ x: W }}
                transition={{ duration: 4.5, ease: "linear", repeat: Infinity }}
              />
            </mask>
          </defs>

          <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#living-fill)" />

          <path
            d={d}
            fill="none"
            stroke="var(--chart-1)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.45}
          />

          {/* A light travelling the line, softened at both ends by the mask
              above so it emerges and fades rather than arriving as a block. */}
          <g mask="url(#living-sweep-mask)">
            <path
              d={d}
              fill="none"
              stroke="var(--chart-1)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.28}
            />
            <path
              d={d}
              fill="none"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Crosshair, snapped to the nearest point. */}
          {active !== null && (
            <motion.line
              x1={active * step}
              x2={active * step}
              y1={0}
              y2={H}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.5}
              initial={false}
              animate={{ x: 0 }}
              transition={SPRING.default}
            />
          )}

          {/* Points breathe in sequence rather than all at once. */}
          {REVENUE.map((v, i) => (
            <motion.circle
              key={MONTHS[i]}
              cx={i * step}
              cy={y(v)}
              r={active === i ? 4.5 : 2.5}
              fill="var(--chart-1)"
              stroke="var(--card)"
              strokeWidth={active === i ? 2 : 0}
              animate={
                active === i
                  ? { opacity: 1 }
                  : { opacity: [0.35, 1, 0.35], r: [2.5, 3.5, 2.5] }
              }
              transition={
                active === i
                  ? { duration: DURATION.fast }
                  : {
                      duration: 3,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: i * 0.22,
                    }
              }
            />
          ))}
        </svg>

        {/* Springs between points rather than reappearing at each one. */}
        <AnimatePresence>
          {active !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: 1,
                y: 0,
                left: `${(active / (REVENUE.length - 1)) * 100}%`,
              }}
              exit={{ opacity: 0, y: 6 }}
              transition={SPRING.default}
              style={{ top: `${(y(REVENUE[active]) / H) * 100}%` }}
              className="pointer-events-none absolute z-10 -translate-x-1/2 translate-y-3 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {MONTHS[active]}
              </p>
              <p className="mt-1 flex items-center gap-2 text-xs">
                <span className="size-1.5 rounded-full bg-[var(--chart-1)]" />
                <span className="text-muted-foreground">revenue</span>
                <span className="ml-auto font-semibold tabular-nums">
                  ${REVENUE[active]}k
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between px-4 pb-3 text-[10px] text-muted-foreground">
        {MONTHS.map((m, i) => (
          <span
            key={m}
            className={cn(
              "transition-colors",
              active === i && "font-medium text-foreground",
            )}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The area chart's sweep, at tile size.
 *
 * Masked rather than dashed for the same reason: a dash has hard ends and
 * slides along like a block, where a gradient mask lets the light fade up and
 * away. Mask ids come from useId, or every tile shares the first one's sweep
 * and they all pulse together.
 */
function SweepSparkline({ data, className }: { data: number[]; className?: string }) {
  const id = useId().replace(/:/g, "");
  const w = 96;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / Math.max(data.length - 1, 1);
  const d = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * (h - 5) - 2.5;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-w} y={0} width={w * 3} height={h}>
          <motion.rect
            y={0}
            width={w * 0.55}
            height={h}
            fill={`url(#${id}-g)`}
            initial={{ x: -w * 0.55 }}
            animate={{ x: w }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
          />
        </mask>
      </defs>

      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
      <g mask={`url(#${id}-m)`}>
        <path d={d} fill="none" stroke="currentColor" strokeWidth={1.9}
          strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function SparkTiles() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {TILES.map((t) => (
        <div key={t.label} className="rounded-lg border border-border bg-card px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {t.label}
          </p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className={cn("font-display text-lg font-semibold tabular-nums", t.tone)}>
              {t.value}
            </p>
            <SweepSparkline data={t.trend} className={cn("h-7 w-24 shrink-0", t.tone)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BarChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Weekly volume
      </p>
      <TooltipProvider delayDuration={80}>
        <div className="mt-4 flex h-32 items-end gap-2">
          {REVENUE.map((v, i) => (
            // h-full matters: `items-end` shrinks the column to its content, and
            // a percentage height inside a zero-height parent resolves to zero —
            // the bars simply do not draw.
            <Tooltip key={MONTHS[i]}>
              <TooltipTrigger asChild>
                <div className="group relative h-full flex-1 cursor-default">
                  <motion.div
                    className="absolute bottom-0 w-full rounded-t-sm bg-gradient-to-t from-[var(--chart-1)]/30 to-[var(--chart-1)]/70 transition-[filter] group-hover:brightness-125"
                    // Rests at its real value rather than 0 — if the loop never
                    // runs (reduced motion, a backgrounded tab), the chart still
                    // shows the data instead of an empty row.
                    initial={{ height: `${v}%` }}
                    animate={{
                      height: [`${v}%`, `${Math.min(v + 9, 100)}%`, `${v}%`],
                    }}
                    transition={{
                      duration: 3.2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: i * 0.16,
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-medium">{MONTHS[i]}</span>
                <span className="ml-2 tabular-nums text-muted-foreground">
                  ${v}k
                </span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
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
        <SparkTiles />
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart />
          <SheenRing />
        </div>
      </motion.div>
    </div>
  );
}
