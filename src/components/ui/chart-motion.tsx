"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Motion pieces for recharts.
 *
 * Recharts' own defaults are static once mounted — a plain grid, a tooltip that
 * pops in and out, no cursor feedback. These swap in the parts that move:
 * a crosshair that follows the pointer, a tooltip that springs between points
 * rather than reappearing, a dot that keeps pulsing on the latest value, and a
 * standalone sparkline that draws itself in.
 */

type CursorProps = {
  points?: { x: number; y: number }[];
  height?: number;
  top?: number;
};

/** Vertical crosshair. Pass to a Tooltip via `cursor={<Crosshair />}`. */
export function Crosshair({ points, height, top = 0 }: CursorProps) {
  const x = points?.[0]?.x;
  if (x == null) return null;

  return (
    <g>
      <motion.line
        x1={x}
        x2={x}
        y1={top}
        y2={top + (height ?? 0)}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="3 3"
        className="text-foreground/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
    </g>
  );
}

type TooltipPayload = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

/** Tooltip body that slides between hovered points instead of blinking. */
export function MotionTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="pointer-events-none rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur"
    >
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-1">
        {payload.map((item) => (
          <div
            key={String(item.dataKey)}
            className="flex items-center gap-2 text-xs"
          >
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {typeof item.value === "number"
                ? item.value.toLocaleString()
                : item.value}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** Pulsing marker for the most recent point. Pass via `dot={<LiveDot .../>}`. */
export function LiveDot({
  cx,
  cy,
  index,
  lastIndex,
  color = "var(--chart-1)",
}: {
  cx?: number;
  cy?: number;
  index?: number;
  lastIndex?: number;
  color?: string;
}) {
  if (cx == null || cy == null || index !== lastIndex) return null;

  return (
    <g>
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        initial={{ scale: 1, opacity: 0.7 }}
        animate={{ scale: [1, 2.6], opacity: [0.7, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 1 }}
      />
    </g>
  );
}

/** Standalone sparkline that draws itself in. Independent of recharts. */
export function Sparkline({
  data,
  className,
  color = "currentColor",
  width = 72,
  height = 24,
}: {
  data: number[];
  className?: string;
  color?: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / Math.max(data.length - 1, 1);
  const d = data
    .map((value, i) => {
      const x = i * step;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      fill="none"
      aria-hidden
    >
      <motion.path
        d={d}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
