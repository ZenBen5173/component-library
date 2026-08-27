# Component Library

**Ever let the AI scaffold your UI and get handed the same grey card with the same dead grey
button, for the hundredth time?** Technically an interface. Nothing you'd be proud to ship.
And every new project, you rip it out and re-tune the same hovers, the same entrances, from
scratch.

I got tired of doing that, so I built a shelf.

**71 components I actually picked, tuned, and would reach for again.** Every one has the
micro-interactions already baked in: hover reveals, cursor tracking, staggered entrances, the
small stuff that makes an interface feel alive instead of generated. You browse them in a live
gallery, find the one you want, and copy it into your project. Done.

This is **not an app you deploy**. It's the drawer you open when you start one.

**▶ Browse the live gallery: [component-library-rho.vercel.app](https://component-library-rho.vercel.app/)**

Or run it locally:

```bash
npm install
npm run dev
```

Then open **http://localhost:3333**.

---

## What's on the shelf

**71 components across 11 categories:** app UI, marketing sections, heroes, navigation,
kinetic text, media, effects, and a design-system reference. Every entry renders live with
sample data, so you see the real thing moving before you commit to it.

`design` · `app` · `heroes` · `navigation` · `pages` · `sections` · `showcase` · `text` · `controls` · `media` · `effects`

The full catalogue with one-line descriptions is in [INVENTORY.md](INVENTORY.md) (regenerate
it any time with `npm run inventory`).

## Taking a component into your own project

The gallery entry *is* the usage doc, so treat it as the worked example. Full guide in
[USING-THIS-LIBRARY.md](USING-THIS-LIBRARY.md); the short version:

1. Copy the implementation file(s) listed in the entry's `@source`.
2. Install the packages in its `@deps`.
3. Bring the tokens it uses. Most rely on shadcn's semantic names (`bg-background`,
   `text-muted-foreground`, `border-border`); copy the `:root` / `.dark` blocks from
   [globals.css](src/app/globals.css).
4. If it animates, wrap your app in a `MotionConfig` with `reducedMotion="user"`.

## Reduced motion, because most of this *is* motion

The whole library is animation, so respecting "reduce motion" matters more here than in most
projects. Both animation libraries are wrapped to honour the OS setting, a stylesheet rule
neutralises CSS transitions, and canvas / scroll effects are guarded by hand with
[`prefersReducedMotion()`](src/lib/reduced-motion.ts). The preview toolbar has a **Reduced
motion** toggle so you can feel the difference without touching your OS.

---

# Under the hood

Everything below is for working *inside* this repo: adding components, understanding the
gallery, and the traps I hit so you don't have to.

## How it's organised

Two layers, and the split matters:

| Layer | Path | What it is |
| --- | --- | --- |
| **Implementations** | `src/components/` | The real components. Installed by the shadcn CLI or ported by hand. |
| **Registry entries** | `src/registry/<category>/` | One small file per gallery entry: metadata plus a demo that renders the implementation with sample data. |

The gallery re-scans `src/registry/` on every request, so a new entry appears the moment you
refresh. No registration step. Any new folder under `src/registry/` becomes a category; give
it a label and sort order in `CATEGORIES` in [src/lib/registry.ts](src/lib/registry.ts).

Implementations live in sub-folders by origin: `ui/` (shadcn + vengenceui), `animate-ui/`,
`kibo-ui/`, `smoothui/`, `gustflow-table/`.

## Adding a component

**From a shadcn-compatible registry:**

```bash
npx shadcn@latest add https://some-registry.com/r/thing.json
```

Namespaced registries (e.g. `@skiper-ui/skiper42`) resolve through `registries` in
[components.json](components.json).

**Then write the gallery entry:**

```tsx
// src/registry/app/thing.tsx
"use client";

/**
 * @name Thing
 * @description One line on what it does and when to reach for it.
 * @tags app, form, versatile
 * @height 520
 * @deps motion
 * @note Anything future-you needs to know: a caveat, a quirk, a decision.
 * @source src/components/ui/thing.tsx
 */
import { Thing } from "@/components/ui/thing";

export default function ThingDemo() {
  return (
    <div className="grid min-h-[520px] place-items-center bg-background p-10">
      <Thing />
    </div>
  );
}
```

Or scaffold a blank one: `npm run new app my-thing`

### Metadata

All optional. A bare file with a default export works.

| Field | Effect |
| --- | --- |
| `@name` | Sidebar name. Defaults to the title-cased filename. |
| `@description` | Shown under the title and on category cards. |
| `@tags` | Comma-separated, searchable from the sidebar. |
| `@height` | Preview height in px, or `screen`. Default 560. |
| `@deps` | npm packages needed when you copy this out. |
| `@note` | Your own remark. Rendered as a callout. |
| `@source` | Implementation file(s). Repeat the line for several; they accumulate. |

Metadata is a comment, not an export, so pasting the file elsewhere leaves nothing to strip.

## Design system

Five reference pages under **Design System** in the gallery, and two of them are live rather
than advisory:

- **Colour, adopted.** [Radix Colors](https://www.radix-ui.com/colors), five 12-step scales.
  Every shadcn token resolves to a step (`--background: var(--slate-1)`,
  `--primary: var(--indigo-9)`), so components inherit the palette automatically. Each step has
  a fixed job and the same number does that job in dark mode.
- **Type, adopted.** Instrument Sans for headings (via `next/font`, exposed as
  `--font-display`), system stack for body and UI text.
- **Spacing / radii / shadows, motion, layout:** documented, not enforced.

## Gotchas

Learned the hard way; worth reading before touching this.

- **A broken import in any registry file breaks every preview.** They all load through one
  dynamic-import context, so a missing package takes down the whole gallery, not just its own
  entry. If everything 500s at once, look for `Module not found` in the terminal.
- **Registry components ship undeclared dependencies.** Several here did (`imagesloaded`,
  `swiper`, `react-intersection-observer`, a `use-outside-click` hook). Install what's missing
  and move on.
- **Two animation libraries are installed:** `motion` and `framer-motion`. They're separate
  instances, so a provider from one does not reach the other's components.
- **`@tanstack/react-table` is pinned to v8.** The ported table targets the v8 API; v9 renames
  everything. If you upgrade, the table breaks.
- **Gallery chrome tokens are namespaced `--color-g-*`** (`bg-g-canvas`, `text-g-dim`).
  Registry installers have collided with `muted`, `accent` and `brand` in the past, so never
  use the `g-` names inside a component.
- **Re-running an installer can clobber local fixes.** Animate UI's install has overwritten
  patched files before. Typecheck after any `shadcn add`.
- **`npm run dev` is the authoring mode.** A production build freezes the set of importable
  registry files, so a component added after a build won't render until you rebuild.

## Layout

```
src/
  app/
    (gallery)/            gallery UI: sidebar shell, category and detail pages
    preview/[c]/[s]/      bare render of one entry (what the iframe loads)
  components/
    gallery/              sidebar, code block, preview frame, motion provider
    ui/                   shadcn primitives + vengenceui components
    animate-ui/           Radix primitives with motion
    kibo-ui/              app components (kanban, tree, dropzone, table…)
    smoothui/             motion-first components
    gustflow-table/       the ported data table
  hooks/  lib/  registry/
scripts/
  gen-inventory.mjs       regenerates INVENTORY.md
  new-component.mjs       scaffolds a blank entry
```
