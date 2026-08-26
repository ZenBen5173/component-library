"use client";

/**
 * @name Live Charts
 * @description Charts that keep moving — an area chart that scrolls continuously with a pulsing leading edge, sparklines that stream, and a gauge that drifts to new readings.
 * @tags chart, data, analytics, dashboard, animated, live, app, must-have
 * @height 720
 * @note Most chart libraries animate once on mount and then sit still, which reads as a screenshot. These run on a rAF loop and never settle. Values come from a seeded generator, not Math.random, so the server and the first client render agree — the stream only starts after mount. rAF-driven, so it is guarded with `prefersReducedMotion()` and falls back to a still frame.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { DURATION, EASE } from "@/lib/motion";

/** Deterministic, so server and client start from the same numbers. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function seedSeries(seed: number, count: number, min: number, max: number) {
  const rand = lcg(seed);
  const out: number[] = [];
  let v = (min + max) / 2;
  for (let i = 0; i < count; i++) {
    v += (rand() - 0.5) * (max - min) * 0.35;
    v = Math.max(min, Math.min(max, v));
    out.push(v);
  }
  return out;
}

/**
 * Holds a rolling window, and slides the chart between ticks.
 *
 * The slide is written straight to the element rather than kept in state: it
 * updates every frame, and putting it in state re-renders the whole chart
 * sixty times a second for a value only the transform reads. React state is
 * left to the points, which change about once a second.
 */
function useStream(
  seed: number,
  count: number,
  tickMs: number,
  range: [number, number],
  slideRef: React.RefObject<SVGGElement | null>,
  step: number,
) {
  const [points, setPoints] = useState(() =>
    seedSeries(seed, count, range[0], range[1]),
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const rand = lcg(seed + 977);
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      acc += dt;

      while (acc >= tickMs) {
        acc -= tickMs;
        setPoints((prev) => {
          const next = prev.slice(1);
          const head = prev[prev.length - 1];
          const drift = (rand() - 0.5) * (range[1] - range[0]) * 0.35;
          next.push(Math.max(range[0], Math.min(range[1], head + drift)));
          return next;
        });
      }

      slideRef.current?.setAttribute(
        "transform",
        `translate(${(-(acc / tickMs) * step).toFixed(2)} 0)`,
      );
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [seed, tickMs, range, slideRef, step]);

  return points;
}

function path(points: number[], w: number, h: number, range: [number, number]) {
  const step = w / (points.length - 2);
  const span = range[1] - range[0] || 1;
  return points
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - range[0]) / span) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

const RANGE: [number, number] = [20, 100];

function StreamChart() {
  const w = 620;
  const h = 180;
  const slide = useRef<SVGGElement>(null);
  const step = w / 40;
  const points = useStream(20260826, 42, 900, RANGE, slide, step);
  const d = path(points, w, h, RANGE);

  const last = points[points.length - 1];
  const lastY = h - ((last - RANGE[0]) / (RANGE[1] - RANGE[0])) * (h - 6) - 3;

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-baseline justify-between px-4 pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Requests / sec
          </p>
          <p className="font-display text-2xl font-semibold tabular-nums">
            {Math.round(last)}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="relative grid size-2 place-items-center">
            <span className="absolute size-2 animate-ping rounded-full bg-emerald-500/60" />
            <span className="size-1.5 rounded-full bg-emerald-500" />
          </span>
          live
        </span>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-2 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="stream-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
          {/* Fades the incoming edge so new points arrive rather than pop. */}
          <linearGradient id="stream-mask" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="black" stopOpacity="0" />
            <stop offset="6%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id="stream-edge">
            <rect x="0" y="0" width={w} height={h} fill="url(#stream-mask)" />
          </mask>
        </defs>

        <g ref={slide} mask="url(#stream-edge)">
          <path d={`${d} L ${w + step} ${h} L 0 ${h} Z`} fill="url(#stream-fill)" />
          <path
            d={d}
            fill="none"
            stroke="var(--chart-1)"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {/* Leading edge sits outside the sliding group so it stays put. */}
      <span
        className="pointer-events-none absolute right-3 grid size-2.5 place-items-center"
        style={{ top: `calc(${(lastY / h) * 100}% + 3.6rem)` }}
      >
        <span className="absolute size-2.5 animate-ping rounded-full bg-[var(--chart-1)]/50" />
        <span className="size-1.5 rounded-full bg-[var(--chart-1)]" />
      </span>
    </div>
  );
}

function LiveSparkline({
  label,
  seed,
  tone,
  unit,
}: {
  label: string;
  seed: number;
  tone: string;
  unit?: string;
}) {
  const w = 96;
  const h = 30;
  const slide = useRef<SVGGElement>(null);
  const step = w / 16;
  const points = useStream(seed, 18, 1100, RANGE, slide, step);
  const last = points[points.length - 1];

  return (
    <div className="group rounded-lg border border-border bg-card px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className={cn("font-display text-lg font-semibold tabular-nums", tone)}>
          {Math.round(last)}
          {unit && (
            <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span>
          )}
        </p>
        <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-7 w-24", tone)} aria-hidden>
          <g ref={slide}>
            <path
              d={path(points, w, h, RANGE)}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

/** Drifts toward a new reading every few seconds instead of holding one value. */
function Gauge() {
  const [value, setValue] = useState(64);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const rand = lcg(4242);
    const id = setInterval(() => {
      setValue((v) => Math.max(12, Math.min(96, v + (rand() - 0.5) * 26)));
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const r = 52;
  const circumference = Math.PI * r; // half circle
  const offset = circumference * (1 - value / 100);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-4 py-3">
      <p className="self-start text-[10px] uppercase tracking-widest text-muted-foreground">
        Capacity
      </p>
      <svg viewBox="0 0 140 78" className="mt-1 w-full max-w-[180px]" aria-hidden>
        <path
          d="M 18 70 A 52 52 0 0 1 122 70"
          fill="none"
          stroke="var(--muted)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <motion.path
          d="M 18 70 A 52 52 0 0 1 122 70"
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: DURATION.deliberate, ease: EASE.expressive }}
        />
      </svg>
      <motion.p
        key={Math.round(value)}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.fast, ease: EASE.expressive }}
        className="-mt-4 font-display text-xl font-semibold tabular-nums"
      >
        {Math.round(value)}%
      </motion.p>
    </div>
  );
}

export default function LiveCharts() {
  return (
    <div className="min-h-[720px] bg-background p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <StreamChart />

        <div className="grid gap-3 sm:grid-cols-3">
          <LiveSparkline label="Latency" seed={7} tone="text-sky-400" unit="ms" />
          <LiveSparkline label="Errors" seed={31} tone="text-red-400" />
          <LiveSparkline label="Throughput" seed={53} tone="text-emerald-400" />
        </div>

        <Gauge />
      </div>
    </div>
  );
}
