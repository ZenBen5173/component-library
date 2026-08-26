"use client";

/**
 * @name Logo Generator
 * @description Generative brand marks laid out from geometric tiles — pick a style and a palette, press once for a new mark, copy it as SVG.
 * @tags logo, brand, generative, svg, geometry, icon, app
 * @height 780
 * @deps motion, lucide-react
 * @note Marks come from a seeded LCG rather than Math.random, so the server and the first client render agree — the seed only moves when you press. Symmetry is an SVG transform rather than mirrored geometry, so the two halves cannot drift apart. Copy SVG serialises from the same tile model the stage renders, so the clipboard gets the settled mark and never a tile caught mid-spring. The pointer tilt checks `prefersReducedMotion()` on hover, not on mount: the gallery sets its flag from an ancestor effect, and those run after the effects in here — worth knowing for any other entry that guards by hand.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Check, Copy, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING, tween } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/reduced-motion";

/* --------------------------------------------------------------- geometry */

const SIZE = 120;

type Kind =
  | "quarter"
  | "half"
  | "leaf"
  | "disc"
  | "ring"
  | "square"
  | "tri"
  | "bar"
  | "truchet"
  | "arc"
  | "cross"
  | "diagonal";

/**
 * One tile, drawn in a cell-sized box at the origin. Rotation is applied on top.
 * Built per cell size rather than once: a line mark wants a couple of large
 * gestures where a filled mark wants sixteen small ones, so the two styles run
 * on different grids and their tiles are different sizes.
 */
const pathCache = new Map<number, Record<Kind, string>>();

function pathsFor(cell: number): Record<Kind, string> {
  const cached = pathCache.get(cell);
  if (cached) return cached;

  const h = cell / 2;
  const d = cell * 0.34;
  const ro = cell * 0.38;
  const ri = cell * 0.19;

  const paths: Record<Kind, string> = {
    quarter: `M0 0H${cell}A${cell} ${cell} 0 0 1 0 ${cell}Z`,
    half: `M0 ${h}A${h} ${h} 0 0 1 ${cell} ${h}Z`,
    leaf: `M0 ${cell}A${cell} ${cell} 0 0 1 ${cell} 0A${cell} ${cell} 0 0 1 0 ${cell}Z`,
    disc: `M${h} ${h - d}A${d} ${d} 0 1 0 ${h} ${h + d}A${d} ${d} 0 1 0 ${h} ${h - d}Z`,
    ring: `M${h - ro} ${h}a${ro} ${ro} 0 1 0 ${ro * 2} 0a${ro} ${ro} 0 1 0 ${-ro * 2} 0ZM${h - ri} ${h}a${ri} ${ri} 0 1 0 ${ri * 2} 0a${ri} ${ri} 0 1 0 ${-ri * 2} 0Z`,
    square: `M0 0H${cell}V${cell}H0Z`,
    tri: `M0 0H${cell}L0 ${cell}Z`,
    bar: `M0 0H${cell}V${h}H0Z`,
    truchet: `M${h} 0A${h} ${h} 0 0 1 0 ${h}M${cell} ${h}A${h} ${h} 0 0 0 ${h} ${cell}`,
    arc: `M0 ${h}A${h} ${h} 0 0 1 ${cell} ${h}`,
    cross: `M${h} 0V${cell}M0 ${h}H${cell}`,
    diagonal: `M0 0L${cell} ${cell}`,
  };

  pathCache.set(cell, paths);
  return paths;
}

/**
 * Pools are weighted by repetition — three `quarter` entries against one `disc`
 * is what keeps a style recognisable rather than a bag of unrelated shapes. The
 * `null` is deliberate negative space, roughly one tile in seven.
 */
type StyleDef = {
  id: string;
  label: string;
  stroke: boolean;
  /** Cells per side. Half of them are generated; the rest is symmetry. */
  grid: number;
  pool: (Kind | null)[];
};

const STYLES: StyleDef[] = [
  {
    id: "arcs",
    label: "Arcs",
    stroke: false,
    grid: 4,
    pool: ["quarter", "quarter", "quarter", "half", "half", "leaf", "disc", null],
  },
  {
    id: "blocks",
    label: "Blocks",
    stroke: false,
    grid: 4,
    pool: ["tri", "tri", "tri", "square", "bar", "bar", "disc", "ring", null],
  },
  {
    id: "lines",
    label: "Lines",
    stroke: true,
    grid: 2,
    pool: ["truchet", "truchet", "arc", "arc", "disc", "cross", "diagonal", null],
  },
];

type Palette = { id: string; label: string; base: string; tones: [string, string, string] };

const PALETTES: Palette[] = [
  { id: "indigo", label: "Indigo", base: "#1e1b4b", tones: ["#818cf8", "#c7d2fe", "#f8fafc"] },
  { id: "ember", label: "Ember", base: "#1c1917", tones: ["#f97316", "#fbbf24", "#fef3c7"] },
  { id: "mint", label: "Mint", base: "#022c22", tones: ["#10b981", "#6ee7b7", "#ecfdf5"] },
  { id: "sky", label: "Sky", base: "#0f172a", tones: ["#38bdf8", "#818cf8", "#e2e8f0"] },
  { id: "rose", label: "Rose", base: "#4c0519", tones: ["#fb7185", "#fda4af", "#ffe4e6"] },
  { id: "paper", label: "Paper", base: "#f4f4f5", tones: ["#18181b", "#52525b", "#a1a1aa"] },
];

const NAMES = [
  "Meridian",
  "Halcyon",
  "Northwind",
  "Vantage",
  "Cobalt",
  "Aperture",
  "Foundry",
  "Lumen",
  "Ridgeline",
  "Quartz",
  "Sable",
  "Beacon",
];

/* ------------------------------------------------------------- generation */

/** Deterministic, so the first client render matches what the server sent. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Tile = { kind: Kind | null; rot: number; tone: number };
type Mark = {
  tiles: Tile[];
  stroke: boolean;
  radius: number;
  mirror: boolean;
  grid: number;
  cell: number;
};

function buildMark(seed: number, style: StyleDef): Mark {
  const rand = lcg(seed);
  const cell = SIZE / style.grid;
  const tiles: Tile[] = [];

  for (let i = 0; i < (style.grid / 2) * style.grid; i++) {
    tiles.push({
      kind: style.pool[Math.floor(rand() * style.pool.length)],
      rot: Math.floor(rand() * 4) * 90,
      tone: Math.floor(rand() * 3),
    });
  }

  // A half that comes up mostly empty reads as a mistake rather than as
  // negative space, so backfill until the mark carries some weight.
  const minFilled = Math.max(1, Math.round(tiles.length * 0.55));
  const filled = () => tiles.filter((t) => t.kind).length;
  for (let i = 0; i < tiles.length && filled() < minFilled; i++) {
    if (!tiles[i].kind) tiles[i] = { ...tiles[i], kind: style.pool[0] };
  }

  return {
    tiles,
    stroke: style.stroke,
    radius: rand() < 0.32 ? SIZE / 2 : SIZE * 0.22,
    mirror: rand() < 0.7,
    grid: style.grid,
    cell,
  };
}

type Placed = { key: number; d: string; transform: string; paint: string };

function placeTiles(mark: Mark, palette: Palette): Placed[] {
  const paths = pathsFor(mark.cell);
  const halfCols = mark.grid / 2;
  const out: Placed[] = [];

  mark.tiles.forEach((tile, i) => {
    if (!tile.kind) return;
    const col = i % halfCols;
    const row = Math.floor(i / halfCols);
    out.push({
      key: i,
      d: paths[tile.kind],
      transform: `translate(${col * mark.cell} ${row * mark.cell}) rotate(${tile.rot} ${mark.cell / 2} ${mark.cell / 2})`,
      paint: palette.tones[tile.tone],
    });
  });
  return out;
}

/** The second half is the first one flipped or turned — never generated twice. */
function halfTransform(mark: Mark) {
  return mark.mirror
    ? `translate(${SIZE} 0) scale(-1 1)`
    : `rotate(180 ${SIZE / 2} ${SIZE / 2})`;
}

/**
 * Filled tiles are meant to run off the plate — that's where the shape comes
 * from. A stroke cut by the same edge just looks severed, so the line styles
 * are pulled in far enough for every cap to land inside.
 */
function insetTransform(mark: Mark) {
  return mark.stroke ? `translate(${SIZE * 0.09} ${SIZE * 0.09}) scale(0.82)` : undefined;
}

/* ----------------------------------------------------------------- render */

function MarkArt({
  mark,
  palette,
  seed,
  animated = false,
  depth,
  className,
}: {
  mark: Mark;
  palette: Palette;
  seed: number;
  animated?: boolean;
  depth?: { x: MotionValue<number>; y: MotionValue<number> };
  className?: string;
}) {
  const tiles = placeTiles(mark, palette);

  const paint = (t: Placed) =>
    mark.stroke
      ? {
          fill: "none",
          stroke: t.paint,
          strokeWidth: mark.cell * 0.17,
          strokeLinecap: "round" as const,
          strokeLinejoin: "round" as const,
        }
      : { fill: t.paint, fillRule: "evenodd" as const };

  const half = animated ? (
    <AnimatePresence>
      {tiles.map((t, i) => (
        <motion.g
          key={`${seed}-${palette.id}-${t.key}`}
          initial={{ opacity: 0, scale: 0.3, rotate: -25 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.3, rotate: 20, transition: tween("fast") }}
          transition={{ ...SPRING.default, delay: i * 0.035 }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <g transform={t.transform}>
            <path d={t.d} {...paint(t)} />
          </g>
        </motion.g>
      ))}
    </AnimatePresence>
  ) : (
    <>
      {tiles.map((t) => (
        <g key={t.key} transform={t.transform}>
          <path d={t.d} {...paint(t)} />
        </g>
      ))}
    </>
  );

  return (
    // Clipped in CSS rather than with a <clipPath id>: a mark renders five times
    // over, and a generated id is one more thing to keep unique — and to keep
    // matching between the server and the client, which useId did not.
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      style={{ clipPath: `inset(0 round ${(mark.radius / SIZE) * 100}%)` }}
      aria-hidden
    >
      <rect width={SIZE} height={SIZE} fill={palette.base} />
      <motion.g style={depth ? { x: depth.x, y: depth.y } : undefined}>
        <g transform={insetTransform(mark)}>
          {half}
          <g transform={halfTransform(mark)}>{half}</g>
        </g>
      </motion.g>
    </svg>
  );
}

function toSvgString(mark: Mark, palette: Palette, name: string) {
  const tiles = placeTiles(mark, palette);
  const shape = (t: Placed) =>
    mark.stroke
      ? `<path d="${t.d}" fill="none" stroke="${t.paint}" stroke-width="${mark.cell * 0.17}" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="${t.d}" fill="${t.paint}" fill-rule="evenodd"/>`;
  const half = tiles.map((t) => `<g transform="${t.transform}">${shape(t)}</g>`).join("");
  const inset = insetTransform(mark);
  const body = `${half}<g transform="${halfTransform(mark)}">${half}</g>`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img" aria-label="${name} mark">`,
    `<clipPath id="m"><rect width="${SIZE}" height="${SIZE}" rx="${mark.radius}"/></clipPath>`,
    `<rect width="${SIZE}" height="${SIZE}" rx="${mark.radius}" fill="${palette.base}"/>`,
    `<g clip-path="url(#m)">${inset ? `<g transform="${inset}">${body}</g>` : body}</g>`,
    `</svg>`,
  ].join("");
}

/* -------------------------------------------------------------- component */

const FIELD = "text-[11px] font-medium uppercase tracking-widest text-muted-foreground";
const SIZES: { px: number; className: string }[] = [
  { px: 48, className: "size-12" },
  { px: 32, className: "size-8" },
  { px: 20, className: "size-5" },
];

export default function LogoGenerator({ seed: initialSeed = 20260826 }: { seed?: number }) {
  const [seed, setSeed] = useState(initialSeed);
  const [styleId, setStyleId] = useState(STYLES[0].id);
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);
  const [history, setHistory] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [spins, setSpins] = useState(0);

  // Read on entry rather than on mount: the gallery's reduced-motion toggle
  // sets its flag from an ancestor effect, and ancestor effects run after the
  // ones in here — a mount-time read would miss the toggle on the first render.
  const stillRef = useRef(false);

  const style = STYLES.find((s) => s.id === styleId) ?? STYLES[0];
  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];
  const mark = useMemo(() => buildMark(seed, style), [seed, style]);
  const name = NAMES[seed % NAMES.length];

  // The pointer tilts the plate and drifts the tiles the other way, so the mark
  // reads as artwork floating a little above its plate rather than printed on it.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-14, 14]), SPRING.follow);
  const rotateX = useSpring(useTransform(py, [0, 1], [12, -12]), SPRING.follow);
  const driftX = useSpring(useTransform(px, [0, 1], [3.5, -3.5]), SPRING.follow);
  const driftY = useSpring(useTransform(py, [0, 1], [3.5, -3.5]), SPRING.follow);

  function handleEnter() {
    stillRef.current = prefersReducedMotion();
  }

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (stillRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  }

  function recentre() {
    px.set(0.5);
    py.set(0.5);
  }

  function generate() {
    setHistory((h) => [seed, ...h.filter((s) => s !== seed)].slice(0, 5));
    setSeed((s) => (Math.imul(s, 1664525) + 1013904223) >>> 0);
    setSpins((n) => n + 1);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(toSvgString(mark, palette, name));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <section className="grid min-h-[780px] place-items-center bg-background p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Mark generator
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Geometric tiles on a {mark.grid}×{mark.grid} grid,{" "}
              {mark.mirror ? "mirrored" : "turned"} into symmetry
            </p>
          </div>
          <span className="hidden rounded-full border border-border px-2.5 py-1 font-mono text-[11px] tabular-nums text-muted-foreground sm:block">
            seed {seed.toString(16).padStart(8, "0")}
          </span>
        </header>

        <div className="grid gap-px bg-border md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6 bg-card p-8">
            <div
              onPointerEnter={handleEnter}
              onPointerMove={handleMove}
              onPointerLeave={recentre}
              className="relative grid flex-1 place-items-center overflow-hidden rounded-xl border border-border bg-muted/20 p-8 text-border"
              style={{
                backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                perspective: 900,
              }}
            >
              <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="drop-shadow-xl"
              >
                <MarkArt
                  mark={mark}
                  palette={palette}
                  seed={seed}
                  animated
                  depth={{ x: driftX, y: driftY }}
                  className="size-[220px]"
                />
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              <MarkArt mark={mark} palette={palette} seed={seed} className="size-9 shrink-0" />
              <div className="min-w-0">
                <p
                  key={name}
                  className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground"
                >
                  {name.split("").map((ch, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...tween("base"), delay: i * 0.03 }}
                      className="inline-block"
                    >
                      {ch}
                    </motion.span>
                  ))}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {style.label.toLowerCase()} · {palette.label.toLowerCase()} ·{" "}
                  {mark.radius === SIZE / 2 ? "round" : "squircle"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 bg-card p-6">
            <div>
              <span className={FIELD}>Style</span>
              <div className="mt-2 flex rounded-lg border border-border bg-muted/40 p-1">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyleId(s.id)}
                    className={cn(
                      "relative flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                      s.id === styleId
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s.id === styleId && (
                      <motion.span
                        layoutId="logo-style-pill"
                        transition={SPRING.default}
                        className="absolute inset-0 rounded-md border border-border bg-background shadow-sm"
                      />
                    )}
                    <span className="relative">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={FIELD}>Palette</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {PALETTES.map((p) => (
                  <motion.button
                    key={p.id}
                    type="button"
                    onClick={() => setPaletteId(p.id)}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    transition={SPRING.snappy}
                    aria-label={p.label}
                    aria-pressed={p.id === paletteId}
                    className={cn(
                      "size-9 rounded-lg ring-offset-2 ring-offset-card transition-shadow duration-200",
                      p.id === paletteId
                        ? "ring-2 ring-foreground/60"
                        : "ring-1 ring-border hover:ring-foreground/30",
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${p.tones[0]} 0 38%, ${p.tones[1]} 38% 62%, ${p.base} 62%)`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={generate}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING.snappy}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90"
              >
                <motion.span
                  animate={{ rotate: spins * 180 }}
                  transition={SPRING.default}
                  className="grid place-items-center"
                >
                  <Shuffle className="size-4" />
                </motion.span>
                Generate
              </motion.button>
              <motion.button
                type="button"
                onClick={copy}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING.snappy}
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
              >
                <span className="relative grid size-4 place-items-center">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "done" : "copy"}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={SPRING.snappy}
                      className="absolute"
                    >
                      {copied ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {copied ? "Copied" : "SVG"}
              </motion.button>
            </div>

            <div>
              <span className={FIELD}>Holds up small</span>
              <div className="mt-2 flex items-end gap-5 rounded-lg border border-border bg-muted/20 p-4">
                {SIZES.map((s) => (
                  <div key={s.px} className="flex flex-col items-center gap-1.5">
                    <MarkArt
                      mark={mark}
                      palette={palette}
                      seed={seed}
                      className={cn("shrink-0", s.className)}
                    />
                    <span className="text-[10px] tabular-nums text-muted-foreground">{s.px}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <span className={FIELD}>Recent</span>
              <div className="mt-2 flex min-h-8 items-center gap-2">
                <AnimatePresence initial={false}>
                  {history.map((s) => (
                    <motion.button
                      key={s}
                      type="button"
                      layout
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      whileHover={{ y: -3 }}
                      transition={SPRING.default}
                      onClick={() => setSeed(s)}
                      aria-label={`Restore ${NAMES[s % NAMES.length]}`}
                      // No frame: a round plate inside a square ring reads as a
                      // mistake. The lift and the fade carry the affordance.
                      className="opacity-70 transition-opacity duration-200 hover:opacity-100"
                    >
                      <MarkArt
                        mark={buildMark(s, style)}
                        palette={palette}
                        seed={s}
                        className="size-8"
                      />
                    </motion.button>
                  ))}
                </AnimatePresence>
                {history.length === 0 && (
                  <p className="text-xs text-muted-foreground">Marks you generate land here.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
