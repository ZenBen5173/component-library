/**
 * Design-system check.
 *
 * Flags values that bypass the documented scales. Vendored implementations are
 * reported separately and do not fail the run — they're third-party code that
 * gets re-fetched, so rewriting their internals just creates merge pain. What
 * has to stay clean is the code this library actually owns.
 *
 *   node scripts/check-design.mjs         # report, exit 1 on owned violations
 *   node scripts/check-design.mjs --all   # include the vendored listing
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SHOW_ALL = process.argv.includes("--all");

/** Third-party implementation trees — informational only. */
const VENDOR = [
  "src/components/animate-ui",
  "src/components/smoothui",
  "src/components/kibo-ui",
  "src/components/ui",
  "src/components/gustflow-table",
];

/** radius scale from globals.css: --radius 0.625rem = 10px */
const RADII = { 6: "rounded-sm", 8: "rounded-md", 10: "rounded-lg", 14: "rounded-xl" };
const DURATIONS = { 100: "instant", 200: "fast", 300: "base", 500: "slow", 800: "deliberate" };
const SPRINGS = {
  "400/30": "snappy",
  "300/24": "default",
  "160/26": "soft",
  "500/15": "bouncy",
  "220/18": "follow",
};

function walk(dir, out = []) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(d.name)) out.push(p);
  }
  return out;
}

const files = [
  ...walk(path.join(ROOT, "src/registry")),
  ...walk(path.join(ROOT, "src/components")),
  ...walk(path.join(ROOT, "src/lib")),
];

const owned = [];
const vendored = [];

for (const abs of files) {
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  if (rel === "src/lib/motion.ts") continue; // defines the scales
  const isVendor = VENDOR.some((v) => rel.startsWith(v));
  const src = fs.readFileSync(abs, "utf8");
  const lines = src.split("\n");
  const hits = [];

  lines.forEach((line, i) => {
    // Metadata blocks and comments quote upstream values on purpose.
    const t = line.trim();
    if (t.startsWith("*") || t.startsWith("//") || t.startsWith("/*")) return;
    const at = (msg) => hits.push({ line: i + 1, msg });

    for (const m of line.matchAll(/rounded(?:-[a-z]+)?-\[(\d+(?:\.\d+)?)px\]/g)) {
      const px = Number(m[1]);
      at(
        RADII[px]
          ? `${m[0]} is exactly ${RADII[px]}`
          : `${m[0]} is off the radius scale (6/8/10/14)`,
      );
    }
    for (const m of line.matchAll(/duration-\[(\d+)ms\]/g)) {
      const ms = Number(m[1]);
      at(
        DURATIONS[ms]
          ? `${m[0]} is DURATION.${DURATIONS[ms]}`
          : `${m[0]} is off the duration scale (100/200/300/500/800)`,
      );
    }
    for (const m of line.matchAll(/duration:\s*(\d*\.?\d+)\b/g)) {
      const ms = Math.round(Number(m[1]) * 1000);
      if (ms === 0) continue; // duration 0 is how motion gets switched off
      if (ms > 1000) continue; // long ambients & loops are their own thing
      if (!DURATIONS[ms]) at(`duration: ${m[1]} is off the duration scale`);
    }
    const spring = line.match(/stiffness:\s*(\d+),\s*damping:\s*(\d+)/);
    if (spring && !SPRINGS[`${spring[1]}/${spring[2]}`]) {
      at(`spring ${spring[1]}/${spring[2]} matches no SPRING preset`);
    }
  });

  if (hits.length) (isVendor ? vendored : owned).push({ rel, hits });
}

const count = (g) => g.reduce((n, f) => n + f.hits.length, 0);

if (owned.length) {
  console.log(`\n${count(owned)} off-scale value(s) in owned code:\n`);
  for (const f of owned) {
    console.log(`  ${f.rel}`);
    for (const h of f.hits) console.log(`    ${h.line}: ${h.msg}`);
  }
} else {
  console.log("\nOwned code is on-scale.");
}

console.log(
  `\n${count(vendored)} in ${vendored.length} vendored file(s) — not enforced.` +
    (SHOW_ALL ? "" : " Pass --all to list."),
);
if (SHOW_ALL) {
  for (const f of vendored) {
    console.log(`  ${f.rel}`);
    for (const h of f.hits) console.log(`    ${h.line}: ${h.msg}`);
  }
}

process.exit(owned.length ? 1 : 0);
