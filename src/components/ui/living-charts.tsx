"use client";

import { useId } from "react";
import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Charts whose data never changes but whose drawing never settles.
 *
 * Every highlight here is masked rather than dashed. A dash has hard ends and
 * slides along like a block; a gradient mask lets the light fade up and away,
 * which is the difference between something travelling and something sliding.
 *
 * Mask ids come from useId — several of these on one page sharing an id would
 * all take the first one's sweep and pulse in lockstep.
 */

export type Segment = { label: string; value: number; tint: string };

/** The moving light, shared by the line and the sparkline. */
function useSweep(w: number, h: number, duration: number, band = 0.5) {
  const id = useId().replace(/:/g, "");
  const defs = (
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="white" stopOpacity="0" />
        <stop offset="50%" stopColor="white" stopOpacity="1" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-w} y={0} width={w * 3} height={h}>
        <motion.rect
          y={0}
          width={w * band}
          height={h}
          fill={`url(#${id}-g)`}
          initial={{ x: -w * band }}
          animate={{ x: w }}
          transition={{ duration, ease: "linear", repeat: Infinity }}
        />
      </mask>
    </defs>
  );
  return { defs, mask: `url(#${id}-m)` };
}

function toPath(data: number[], w: number, h: number, pad: number) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / Math.max(data.length - 1, 1);
  return data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * (h - pad * 2) - pad;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function SweepSparkline({
  data,
  className,
  duration = 5,
  tooltip,
}: {
  data: number[];
  className?: string;
  duration?: number;
  /** Shown on hover. The line is too small to label in place. */
  tooltip?: React.ReactNode;
}) {
  const w = 96;
  const h = 28;
  const { defs, mask } = useSweep(w, h, duration, 0.55);
  const d = toPath(data, w, h, 2.5);

  const chart = (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("overflow-visible", className)}>
      {defs}
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
      <g mask={mask}>
        <path d={d} fill="none" stroke="currentColor" strokeWidth={1.9}
          strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* A 1.5px stroke is not a hover target; this is. */}
      <rect x={0} y={0} width={w} height={h} fill="transparent" />
    </svg>
  );

  if (!tooltip) return chart;

  return (
    <TooltipProvider delayDuration={80}>
      <Tooltip>
        <TooltipTrigger asChild>{chart}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * A donut whose ring turns, whose segments breathe, and which reads as one
 * figure broken into parts rather than several separate numbers.
 */
export function SheenRing({
  segments,
  size = 132,
  stroke = 14,
  centre,
  caption,
  className,
  spin = 26,
}: {
  segments: Segment[];
  size?: number;
  stroke?: number;
  centre?: React.ReactNode;
  caption?: string;
  className?: string;
  /** Seconds for one full turn. */
  spin?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((n, s) => n + s.value, 0) || 1;
  let offset = 0;

  return (
    <TooltipProvider delayDuration={80}>
    <div className={cn("flex items-center gap-5", className)}>
      <div
        className="group/ring relative shrink-0"
        style={{ width: size, height: size }}
      >
        {/* CSS rather than motion, so hovering pauses it where it stands.
            Stopping a motion loop would snap the ring back to zero, and a
            tooltip anchored to a segment that keeps turning drifts away from
            the thing it labels. */}
        <div
          className="absolute inset-0 [animation:spin_var(--spin)_linear_infinite] group-hover/ring:[animation-play-state:paused]"
          style={{ "--spin": `${spin}s` } as React.CSSProperties}
        >
          <svg width={size} height={size} className="-rotate-90">
            {segments.map((seg, i) => {
              const len = (seg.value / total) * c;
              const dash = `${Math.max(len - 4, 0)} ${c - len + 4}`;
              const share = Math.round((seg.value / total) * 100);
              const el = (
                <g key={seg.label}>
                  {/* Visual arc. Its width is animated, so it is not a
                      reliable hit target — motion only sets stroke-width once
                      the loop runs, and until then it computes to 1px. */}
                  <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={seg.tint}
                    strokeDasharray={dash}
                    strokeDashoffset={-offset}
                    strokeLinecap="round"
                    style={{ pointerEvents: "none" }}
                    animate={{ strokeWidth: [stroke - 2, stroke + 2, stroke - 2] }}
                    transition={{
                      duration: 3.4,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: i * 0.35,
                    }}
                  />

                  {/* Hit target: fatter than the arc, and pointer-events
                      "stroke" so it registers despite being transparent —
                      "visiblePainted" would ignore it entirely. */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={stroke + 12}
                        strokeDasharray={dash}
                        strokeDashoffset={-offset}
                        style={{ pointerEvents: "stroke", cursor: "default" }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="font-medium">{seg.label}</span>
                      <span className="ml-2 tabular-nums text-muted-foreground">
                        {seg.value} · {share}%
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </g>
              );
              offset += len;
              return el;
            })}
          </svg>
        </div>

        {/* pointer-events-none is load-bearing: this covers the whole ring,
            band included, so without it every hover lands here and the
            segments underneath never see the pointer. */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            {centre}
            {caption && (
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {caption}
              </p>
            )}
          </div>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((seg, i) => (
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
            <span className="flex-1 truncate text-muted-foreground">{seg.label}</span>
            <span className="tabular-nums">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
    </TooltipProvider>
  );
}

/** Bars that rise and fall in a staggered wave. */
export function BreathingBars({
  data,
  labels,
  className,
  tint = "var(--chart-1)",
}: {
  data: number[];
  labels?: string[];
  className?: string;
  tint?: string;
}) {
  const max = Math.max(...data) || 1;

  return (
    <TooltipProvider delayDuration={80}>
    <div className={className}>
      <div className="flex h-28 items-end gap-2">
        {data.map((v, i) => {
          const pct = (v / max) * 100;
          // h-full below matters: `items-end` shrinks the column to its
          // content, and a percentage height inside a zero-height parent
          // resolves to zero.
          //
          // Keyed by index, not label: day and month names repeat — two Ts and
          // two Ss in a week — and duplicate keys make React drop or duplicate
          // children.
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
            <div className="relative h-full flex-1 cursor-default">
              <motion.div
                className="absolute bottom-0 w-full rounded-t-sm"
                style={{
                  background: `linear-gradient(to top, color-mix(in oklab, ${tint} 30%, transparent), ${tint})`,
                }}
                // Rests at its real value — if the loop never runs, the chart
                // still shows its data instead of an empty row.
                initial={{ height: `${pct}%` }}
                animate={{ height: [`${pct}%`, `${Math.min(pct + 9, 100)}%`, `${pct}%`] }}
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
                {labels?.[i] && (
                  <span className="font-medium">{labels[i]}</span>
                )}
                <span className={cn("tabular-nums", labels?.[i] && "ml-2 text-muted-foreground")}>
                  {v}
                </span>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          {labels.map((l, i) => (
            <span key={`${l}-${i}`} className="flex-1 text-center">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
