"use client";

/**
 * @name Logo Generator
 * @description Generative brand marks laid out from geometric tiles — pick a style and a palette, press once for a new mark, copy it as SVG.
 * @tags logo, brand, generative, svg, geometry, icon, app
 * @height 780
 * @deps motion, lucide-react
 * @note Marks come from a seeded LCG rather than Math.random, so the server and the first client render agree — the seed only moves when you press. Symmetry is an SVG transform rather than mirrored geometry, so the two halves cannot drift apart. Copy SVG serialises from the same tile model the stage renders, so the clipboard gets the settled mark and never a tile caught mid-spring.
 */
import { useEffect, useId, useMemo, useState } from "react";
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

const CELL = 30;
const COLS = 4;
const ROWS = 4;
const HALF_COLS = COLS / 2;
const SIZE = CELL * COLS;

const DISC = CELL * 0.34;
const RING_OUT = CELL * 0.38;
const RING_IN = CELL * 0.19;

/** One tile, drawn in a CELL-sized box at the origin. Rotation is applied on top. */
const PATHS = {
  quarter: `M0 0H${CELL}A${CELL} ${CELL} 0 0 1 0 ${CELL}Z`,
  half: `M0 ${CELL / 2}A${CELL / 2} ${CELL / 2} 0 0 1 ${CELL} ${CELL / 2}Z`,
  leaf: `M0 ${CELL}A${CELL} ${CELL} 0 0 1 ${CELL} 0A${CELL} ${CELL} 0 0 1 0 ${CELL}Z`,
  disc: `M${CELL / 2} ${CELL / 2 - DISC}A${DISC} ${DISC} 0 1 0 ${CELL / 2} ${CELL / 2 + DISC}A${DISC} ${DISC} 0 1 0 ${CELL / 2} ${CELL / 2 - DISC}Z`,
  ring: `M${CELL / 2 - RING_OUT} ${CELL / 2}a${RING_OUT} ${RING_OUT} 0 1 0 ${RING_OUT * 2} 0a${RING_OUT} ${RING_OUT} 0 1 0 ${-RING_OUT * 2} 0ZM${CELL / 2 - RING_IN} ${CELL / 2}a${RING_IN} ${RING_IN} 0 1 0 ${RING_IN * 2} 0a${RING_IN} ${RING_IN} 0 1 0 ${-RING_IN * 2} 0Z`,
  square: `M0 0H${CELL}V${CELL}H0Z`,
  tri: `M0 0H${CELL}L0 ${CELL}Z`,
  bar: `M0 0H${CELL}V${CELL / 2}H0Z`,
  truchet: `M${CELL / 2} 0A${CELL / 2} ${CELL / 2} 0 0 1 0 ${CELL / 2}M${CELL} ${CELL / 2}A${CELL / 2} ${CELL / 2} 0 0 0 ${CELL / 2} ${CELL}`,
  arc: `M0 ${CELL / 2}A${CELL / 2} ${CELL / 2} 0 0 1 ${CELL} ${CELL / 2}`,
  cross: `M${CELL / 2} 0V${CELL}M0 ${CELL / 2}H${CELL}`,
  diagonal: `M0 0L${CELL} ${CELL}`,
} as const;

type Kind = keyof typeof PATHS;

/**
 * Pools are weighted by repetition — three `quarter` entries against one `disc`
 * is what keeps a style recognisable rather than a bag of unrelated shapes. The
 * `null` is deliberate negative space, roughly one tile in seven.
 */
type StyleDef = { id: string; label: string; stroke: boolean; pool: (Kind | null)[] };

const STYLES: StyleDef[] = [
  {
    id: "arcs",
    label: "Arcs",
    stroke: false,
    pool: ["quarter", "quarter", "quarter", "half", "half", "leaf", "disc", null],
  },
  {
    id: "blocks",
    label: "Blocks",
    stroke: false,
    pool: ["tri", "tri", "tri", "square", "bar", "bar", "disc", "ring", null],
  },
  {
    id: "lines",
    label: "Lines",
    stroke: true,
    pool: ["truchet", "truchet", "truchet", "arc", "arc", "cross", "diagonal", null],
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
type Mark = { tiles: Tile[]; stroke: boolean; radius: number; mirror: boolean };

function buildMark(seed: number, style: StyleDef): Mark {
  const rand = lcg(seed);
  const tiles: Tile[] = [];

  for (let i = 0; i < HALF_COLS * ROWS; i++) {
    tiles.push({
      kind: style.pool[Math.floor(rand() * style.pool.length)],
      rot: Math.floor(rand() * 4) * 90,
      tone: Math.floor(rand() * 3),
    });
  }

  // A half that comes up mostly empty reads as a mistake rather than as
  // negative space, so backfill until the mark carries some weight.
  const filled = () => tiles.filter((t) => t.kind).length;
  for (let i = 0; i < tiles.length && filled() < 5; i++) {
    if (!tiles[i].kind) tiles[i] = { ...tiles[i], kind: style.pool[0] };
  }

  return {
    tiles,
    stroke: style.stroke,
    radius: rand() < 0.32 ? SIZE / 2 : SIZE * 0.22,
    mirror: rand() < 0.7,
  };
}

type Placed = { key: number; d: string; transform: string; paint: string };

function placeTiles(mark: Mark, palette: Palette): Placed[] {
  const out: Placed[] = [];
  mark.tiles.forEach((tile, i) => {
    if (!tile.kind) return;
    const col = i % HALF_COLS;
    const row = Math.floor(i / HALF_COLS);
    out.push({
      key: i,
      d: PATHS[tile.kind],
      transform: `translate(${col * CELL} ${row * CELL}) rotate(${tile.rot} ${CELL / 2} ${CELL / 2})`,
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
  const clip = `logo-clip-${useId().replace(/:/g, "")}`;
  const tiles = placeTiles(mark, palette);

  const paint = (t: Placed) =>
    mark.stroke
      ? {
          fill: "none",
          stroke: t.paint,
          strokeWidth: CELL * 0.2,
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
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden>
      <defs>
        <clipPath id={clip}>
          <rect width={SIZE} height={SIZE} rx={mark.radius} />
        </clipPath>
      </defs>
      <rect width={SIZE} height={SIZE} rx={mark.radius} fill={palette.base} />
      {/* Clip sits outside the drift group so the plate edge itself stays put. */}
      <g clipPath={`url(#${clip})`}>
        <motion.g style={depth ? { x: depth.x, y: depth.y } : undefined}>
          {half}
          <g transform={halfTransform(mark)}>{half}</g>
        </motion.g>
      </g>
    </svg>
  );
}

function toSvgString(mark: Mark, palette: Palette, name: string) {
  const tiles = placeTiles(mark, palette);
  const shape = (t: Placed) =>
    mark.stroke
      ? `<path d="${t.d}" fill="none" stroke="${t.paint}" stroke-width="${CELL * 0.2}" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="${t.d}" fill="${t.paint}" fill-rule="evenodd"/>`;
  const half = tiles.map((t) => `<g transform="${t.transform}">${shape(t)}</g>`).join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img" aria-label="${name} mark">`,
    `<clipPath id="m"><rect width="${SIZE}" height="${SIZE}" rx="${mark.radius}"/></clipPath>`,
    `<rect width="${SIZE}" height="${SIZE}" rx="${mark.radius}" fill="${palette.base}"/>`,
    `<g clip-path="url(#m)">${half}<g transform="${halfTransform(mark)}">${half}</g></g>`,
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
  const [still, setStill] = useState(false);

  useEffect(() => setStill(prefersReducedMotion()), []);

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

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (still) return;
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
              Geometric tiles on a {COLS}×{ROWS} grid,{" "}
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
                      className="rounded-lg ring-1 ring-border transition-shadow duration-200 hover:ring-foreground/40"
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
