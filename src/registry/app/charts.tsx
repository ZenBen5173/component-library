"use client";

/**
 * @name Charts
 * @description KPI tiles with drawing sparklines, an area chart with a tracking crosshair and live pulse, staggered bars and a sweeping donut.
 * @tags chart, data, analytics, recharts, dashboard, animated, app
 * @height 1100
 * @deps recharts, motion, @number-flow/react
 * @note Still recharts underneath — the difference is the motion layer on top: crosshair, springing tooltip, pulsing latest point, animated bar growth. Colours come from `--chart-1..5` so they re-theme with the app.
 * @source src/components/ui/chart-motion.tsx
 * @source src/components/ui/chart.tsx
 */
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Crosshair,
  LiveDot,
  MotionTooltip,
  Sparkline,
} from "@/components/ui/chart-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const TRAFFIC = [
  { month: "Mar", visitors: 1840, signups: 320 },
  { month: "Apr", visitors: 2210, signups: 410 },
  { month: "May", visitors: 1960, signups: 380 },
  { month: "Jun", visitors: 2740, signups: 520 },
  { month: "Jul", visitors: 3180, signups: 610 },
  { month: "Aug", visitors: 3620, signups: 740 },
];

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  signups: { label: "Signups", color: "var(--chart-2)" },
} satisfies ChartConfig;

const RUNTIME = [
  { env: "Production", builds: 142 },
  { env: "Preview", builds: 318 },
  { env: "Development", builds: 96 },
];

const runtimeConfig = {
  builds: { label: "Builds", color: "var(--chart-3)" },
} satisfies ChartConfig;

const SPLIT = [
  { name: "Edge", value: 58, fill: "var(--chart-1)" },
  { name: "Node", value: 27, fill: "var(--chart-2)" },
  { name: "Static", value: 15, fill: "var(--chart-4)" },
];

const splitConfig = {
  value: { label: "Share" },
  Edge: { label: "Edge", color: "var(--chart-1)" },
  Node: { label: "Node", color: "var(--chart-2)" },
  Static: { label: "Static", color: "var(--chart-4)" },
} satisfies ChartConfig;

const KPIS = [
  { label: "Visitors", value: 3620, delta: 13.8, trend: [1840, 2210, 1960, 2740, 3180, 3620], color: "var(--chart-1)" },
  { label: "Signups", value: 740, delta: 21.3, trend: [320, 410, 380, 520, 610, 740], color: "var(--chart-2)" },
  { label: "Build minutes", value: 1284, delta: -4.2, trend: [1490, 1420, 1380, 1350, 1310, 1284], color: "var(--chart-4)" },
];

function KpiTile({ kpi, index }: { kpi: (typeof KPIS)[number]; index: number }) {
  const up = kpi.delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {kpi.label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <NumberFlow value={kpi.value} className="text-2xl font-semibold tabular-nums" />
        <Sparkline data={kpi.trend} color={kpi.color} className="h-6 w-[72px] shrink-0" />
      </div>
      <p className={up ? "mt-2 text-xs font-medium text-emerald-500" : "mt-2 text-xs font-medium text-rose-500"}>
        {up ? "+" : ""}{kpi.delta}% vs last month
      </p>
    </motion.div>
  );
}

export default function ChartsDemo() {
  const lastIndex = TRAFFIC.length - 1;

  return (
    <div className="min-h-[1100px] bg-background p-10">
      <div className="mx-auto grid max-w-3xl gap-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {KPIS.map((kpi, i) => (
            <KpiTile key={kpi.label} kpi={kpi} index={i} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Traffic</CardTitle>
            <CardDescription>
              Hover to track — the crosshair follows and the tooltip springs between points.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trafficConfig} className="h-[260px] w-full">
              <AreaChart data={TRAFFIC} margin={{ left: 8, right: 16, top: 8 }}>
                <defs>
                  {(["visitors", "signups"] as const).map((key) => (
                    <linearGradient key={key} id={"fx-" + key} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={"var(--color-" + key + ")"} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={"var(--color-" + key + ")"} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="2 6" className="stroke-border/60" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                <Tooltip cursor={<Crosshair />} content={<MotionTooltip />} />
                <Area
                  dataKey="signups"
                  type="natural"
                  stroke="var(--color-signups)"
                  fill="url(#fx-signups)"
                  strokeWidth={2}
                  animationDuration={1100}
                  animationEasing="ease-out"
                  dot={<LiveDot lastIndex={lastIndex} color="var(--chart-2)" />}
                  activeDot={{ r: 4 }}
                />
                <Area
                  dataKey="visitors"
                  type="natural"
                  stroke="var(--color-visitors)"
                  fill="url(#fx-visitors)"
                  strokeWidth={2}
                  animationDuration={1100}
                  animationBegin={120}
                  animationEasing="ease-out"
                  dot={<LiveDot lastIndex={lastIndex} color="var(--chart-1)" />}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Builds by environment</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={runtimeConfig} className="h-[240px] w-full">
                <BarChart data={RUNTIME} margin={{ top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="2 6" className="stroke-border/60" />
                  <XAxis dataKey="env" tickLine={false} axisLine={false} tickMargin={10} />
                  <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.35 }} content={<MotionTooltip />} />
                  <Bar
                    dataKey="builds"
                    fill="var(--color-builds)"
                    radius={[8, 8, 4, 4]}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Runtime split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <ChartContainer config={splitConfig} className="h-[240px] w-full">
                  <PieChart>
                    <Tooltip content={<MotionTooltip valueSuffix="%" />} />
                    <Pie
                      data={SPLIT}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={3}
                      cornerRadius={4}
                      strokeWidth={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </PieChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <NumberFlow value={58} suffix="%" className="text-2xl font-semibold tabular-nums" />
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Edge
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
