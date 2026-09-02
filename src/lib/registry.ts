import fs from "node:fs/promises";
import path from "node:path";

export const REGISTRY_DIR = path.join(process.cwd(), "src", "registry");

/**
 * Categories are just folders inside src/registry.
 * Adding an entry here gives the folder a nice label, blurb and sort order.
 * Any folder NOT listed here still shows up, using a title-cased folder name.
 */
export const CATEGORIES: Record<
  string,
  { label: string; blurb: string; order: number }
> = {
  design: {
    label: "Design System",
    blurb: "Colour, type, spacing, motion and layout foundations.",
    order: 5,
  },
  app: {
    label: "App UI",
    blurb: "Forms, overlays, tables and feedback — the logged-in surface.",
    order: 10,
  },
  heroes: {
    label: "Heroes",
    blurb: "Above-the-fold landing sections.",
    order: 20,
  },
  navigation: {
    label: "Navigation",
    blurb: "Navbars, docks, mega menus, command palettes and footers.",
    order: 25,
  },
  pages: {
    label: "Pages",
    blurb: "Whole-page layouts you'd build a route from.",
    order: 28,
  },
  sections: {
    label: "Sections",
    blurb: "Full-width page blocks — bento grids, FAQs, teams, pricing.",
    order: 30,
  },
  showcase: {
    label: "Showcase",
    blurb: "Ways to display work, images and collections.",
    order: 35,
  },
  text: {
    label: "Text & Numbers",
    blurb: "Kinetic type, counters and reveal effects.",
    order: 40,
  },
  controls: {
    label: "Controls",
    blurb: "Buttons, cards, tooltips, toggles and other small primitives.",
    order: 50,
  },
  media: {
    label: "Media",
    blurb: "Audio and video players.",
    order: 55,
  },
  effects: {
    label: "Effects",
    blurb: "Decorative and background — canvas, WebGL, cursor-reactive fields.",
    order: 60,
  },
};

export type Entry = {
  /** URL-safe id, taken from the filename. */
  slug: string;
  /** Folder name inside src/registry. */
  category: string;
  /** Display name — @name annotation, else title-cased filename. */
  name: string;
  description: string;
  tags: string[];
  /** Preview viewport height in px. Use `screen` for a full-viewport preview. */
  height: number | "screen";
  /** Extra npm packages this component needs when you copy it out. */
  deps: string[];
  /** Your own remark about this component — quirks, caveats, what to fix. */
  note: string;
  /**
   * Underlying implementation files this entry is a demo of, relative to the
   * project root. Shown as extra collapsible source panels on the detail page.
   */
  sources: string[];
  /** Path relative to the project root, for display. */
  file: string;
};

export type Category = {
  slug: string;
  label: string;
  blurb: string;
  order: number;
  entries: Entry[];
};

function titleCase(slug: string) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Metadata lives in a leading JSDoc-ish comment so that copying the file into a
 * real app carries no gallery-specific imports or exports:
 *
 *   /**
 *    * @name Aurora Hero
 *    * @description Animated aurora gradient behind centered copy.
 *    * @tags hero, gradient, animated
 *    * @height screen
 *    * @deps motion
 *    *\/
 *
 * Every field is optional — a bare .tsx file with a default export works fine.
 */
function parseMeta(source: string) {
  const block = source.match(/\/\*\*([\s\S]*?)\*\//);
  const fields: Record<string, string> = {};

  for (const rawLine of (block ? block[1] : "").split("\n")) {
    // Strip the leading " * " of the comment line.
    const line = rawLine.replace(/^\s*\*?\s*/, "").trim();
    if (!line.startsWith("@")) continue;
    const gap = line.indexOf(" ");
    if (gap === -1) continue;
    const key = line.slice(1, gap);
    const value = line.slice(gap + 1).trim();
    fields[key] = fields[key] ? `${fields[key]}, ${value}` : value;
  }

  const read = (key: string) => fields[key] ?? "";
  const list = (key: string) =>
    read(key)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  return {
    name: read("name"),
    description: read("description"),
    tags: list("tags"),
    deps: list("deps"),
    note: read("note"),
    sources: list("source"),
    height: read("height"),
  };
}

async function readEntry(category: string, file: string): Promise<Entry> {
  const slug = file.replace(/\.tsx?$/, "");
  const abs = path.join(REGISTRY_DIR, category, file);
  const source = await fs.readFile(abs, "utf8");
  const meta = parseMeta(source);

  const height =
    meta.height === "screen"
      ? ("screen" as const)
      : meta.height && Number(meta.height)
        ? Number(meta.height)
        : 560;

  return {
    slug,
    category,
    name: meta.name || titleCase(slug),
    description: meta.description,
    tags: meta.tags,
    deps: meta.deps,
    note: meta.note,
    sources: meta.sources,
    height,
    file: `src/registry/${category}/${file}`,
  };
}

/** Scan src/registry on every call, so new files appear without a restart. */
export async function getCategories(): Promise<Category[]> {
  let dirs: string[] = [];
  try {
    const dirents = await fs.readdir(REGISTRY_DIR, { withFileTypes: true });
    dirs = dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }

  const categories = await Promise.all(
    dirs.map(async (dir): Promise<Category> => {
      const files = (await fs.readdir(path.join(REGISTRY_DIR, dir)))
        .filter((f) => /\.tsx?$/.test(f) && !f.startsWith("_"))
        .sort();
      const entries = await Promise.all(files.map((f) => readEntry(dir, f)));
      const config = CATEGORIES[dir];
      return {
        slug: dir,
        label: config?.label ?? titleCase(dir),
        blurb: config?.blurb ?? "",
        order: config?.order ?? 100,
        entries: entries.sort((a, b) => a.name.localeCompare(b.name)),
      };
    }),
  );

  return categories
    .filter((c) => c.entries.length > 0)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

export async function getAllEntries(): Promise<Entry[]> {
  return (await getCategories()).flatMap((c) => c.entries);
}

export async function getEntry(
  category: string,
  slug: string,
): Promise<Entry | null> {
  const all = await getAllEntries();
  return all.find((e) => e.category === category && e.slug === slug) ?? null;
}

/** Raw file contents, for the code panel and the copy button. */
export async function getSource(entry: Entry): Promise<string> {
  return fs.readFile(path.join(process.cwd(), entry.file), "utf8");
}

/**
 * Contents of every file listed in `@source`. A missing file is skipped rather
 * than thrown, so a stale annotation never takes the page down.
 */
export async function getLinkedSources(
  entry: Entry,
): Promise<{ file: string; code: string }[]> {
  const files = await Promise.all(
    entry.sources.map(async (file) => {
      try {
        const code = await fs.readFile(path.join(process.cwd(), file), "utf8");
        return { file, code };
      } catch {
        return null;
      }
    }),
  );
  return files.filter((f): f is { file: string; code: string } => f !== null);
}
