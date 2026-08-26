#!/usr/bin/env node
// Usage: npm run new <category> <slug> ["Display Name"]
import fs from "node:fs/promises";
import path from "node:path";

const [category, slug, name] = process.argv.slice(2);

if (!category || !slug) {
  console.error('Usage: npm run new <category> <slug> ["Display Name"]');
  console.error("Example: npm run new heroes split-image-hero");
  process.exit(1);
}

const title =
  name ||
  slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

const pascal = title.replace(/[^a-zA-Z0-9]/g, "");
const dir = path.join(process.cwd(), "src", "registry", category);
const file = path.join(dir, `${slug}.tsx`);

try {
  await fs.access(file);
  console.error(`Already exists: src/registry/${category}/${slug}.tsx`);
  process.exit(1);
} catch {
  // doesn't exist — good
}

const template = `"use client";

/**
 * @name ${title}
 * @description One line about what this is and when to use it.
 * @tags ${category}
 * @height 560
 */
export default function ${pascal}() {
  return (
    <section className="grid min-h-[560px] place-items-center bg-white p-8 text-neutral-900">
      <p className="text-sm">${title}</p>
    </section>
  );
}
`;

await fs.mkdir(dir, { recursive: true });
await fs.writeFile(file, template, "utf8");
console.log(`Created src/registry/${category}/${slug}.tsx`);
