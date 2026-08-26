import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Some components can't be redistributed and are git-ignored (see CREDITS.md).
// List only what this repository actually contains, so a clone's inventory
// matches its contents.
let ignored = new Set();
try {
  const out = execSync("git ls-files --others --ignored --exclude-standard -- src/registry", {
    encoding: "utf8",
  });
  const NL = String.fromCharCode(10);
  const BS = String.fromCharCode(92);
  ignored = new Set(
    out.split(NL).filter(Boolean).map((p) => p.split(BS).join("/")),
  );
} catch {
  // Not a git checkout — list everything.
}

const ROOT = "src/registry";
const CATEGORY_ORDER = ["design", "app", "heroes", "navigation", "sections", "ui", "text", "animations"];
const LABELS = {
  design: "Design System", app: "App UI", heroes: "Heroes",
  navigation: "Navigation", sections: "Sections", ui: "UI",
  text: "Text & Numbers", animations: "Animations",
};

function meta(file) {
  const src = fs.readFileSync(file, "utf8");
  const block = src.match(/\/\*\*([\s\S]*?)\*\//);
  const fields = {};
  for (const raw of (block ? block[1] : "").split("\n")) {
    const line = raw.replace(/^\s*\*?\s*/, "").trim();
    if (!line.startsWith("@")) continue;
    const gap = line.indexOf(" ");
    if (gap === -1) continue;
    const k = line.slice(1, gap);
    const v = line.slice(gap + 1).trim();
    fields[k] = fields[k] ? `${fields[k]}, ${v}` : v;
  }
  return fields;
}

const cats = fs.readdirSync(ROOT).filter((d) => fs.statSync(path.join(ROOT, d)).isDirectory());
cats.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));

let total = 0;
let out = `# Component Inventory\n\nGenerated from \`src/registry\`. Run \`npm run inventory\` to refresh.\n`;

for (const cat of cats) {
  const files = fs
    .readdirSync(path.join(ROOT, cat))
    .filter((f) => f.endsWith(".tsx"))
    .filter((f) => !ignored.has(`${ROOT}/${cat}/${f}`))
    .sort();
  if (!files.length) continue;
  out += `\n## ${LABELS[cat] ?? cat} (${files.length})\n\n| Component | What it is | Tags |\n| --- | --- | --- |\n`;
  for (const f of files) {
    const m = meta(path.join(ROOT, cat, f));
    const slug = f.replace(".tsx", "");
    out += `| [${m.name ?? slug}](src/registry/${cat}/${f}) | ${m.description ?? "—"} | ${m.tags ?? "—"} |\n`;
    total++;
  }
}

const withheld = ignored.size;
out = out.replace(
  "Generated from",
  `**${total} components.** Generated from`,
);
if (withheld) {
  out += `
---

${withheld} further components exist in the author's working copy but are not
redistributable, so they are not part of this repository. See
[CREDITS.md](CREDITS.md).
`;
}
fs.writeFileSync("INVENTORY.md", out);
console.log(`INVENTORY.md written — ${total} components across ${cats.length} categories`);
