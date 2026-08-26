# Component Library

A personal library of UI components, browsed through a local gallery. **75 components** across app UI, marketing sections, heroes, navigation, kinetic text and a design-system reference.

This is **not an app** — it's the shelf you pull from when you start one.

```bash
npm install
npm run dev
```

Then open **http://localhost:3333**

See [INVENTORY.md](INVENTORY.md) for the full list. Regenerate it with `npm run inventory`.

---

## How it's organised

Two layers, and the split matters:

| Layer | Path | What it is |
| --- | --- | --- |
| **Implementations** | `src/components/` | The real components. Installed by the shadcn CLI or ported by hand. |
| **Registry entries** | `src/registry/<category>/` | One small file per gallery entry — metadata plus a demo that renders the implementation with sample data. |

The gallery re-scans `src/registry/` on every request, so a new entry appears as soon as you refresh. No registration step.

Implementations live in sub-folders by origin — `ui/` (shadcn + vengenceui), `animate-ui/`, `kibo-ui/`, `smoothui/`, `gustflow-table/`.

### Categories

`design` · `app` · `heroes` · `navigation` · `pages` · `sections` · `showcase` · `text` · `controls` · `media` · `effects`

Any new folder under `src/registry/` becomes a category. Give it a label and sort order in `CATEGORIES` in [src/lib/registry.ts](src/lib/registry.ts).

---

## Adding a component

**From a shadcn-compatible registry:**

```bash
npx shadcn@latest add https://some-registry.com/r/thing.json
```

Namespaced registries (e.g. `@skiper-ui/skiper42`) resolve through `registries` in [components.json](components.json).

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
 * @note Anything future-you needs to know — a caveat, a quirk, a decision.
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

All optional — a bare file with a default export works.

| Field | Effect |
| --- | --- |
| `@name` | Sidebar name. Defaults to the title-cased filename. |
| `@description` | Shown under the title and on category cards. |
| `@tags` | Comma-separated, searchable from the sidebar. |
| `@height` | Preview height in px, or `screen`. Default 560. |
| `@deps` | npm packages needed when you copy this out. |
| `@note` | Your own remark. Rendered as a callout. |
| `@source` | Implementation file(s). Repeat the line for several — they accumulate. |

Metadata is a comment, not an export, so pasting the file elsewhere leaves nothing to strip.

---

## Design system

Five reference pages under **Design System** in the gallery, and two of them are live rather than advisory:

- **Colour — adopted.** [Radix Colors](https://www.radix-ui.com/colors), five 12-step scales. Every shadcn token resolves to a step (`--background: var(--slate-1)`, `--primary: var(--indigo-9)`), so components inherit the palette automatically. Each step has a fixed job and the same number does that job in dark mode.
- **Type — adopted.** Instrument Sans for headings (via `next/font`, exposed as `--font-display`), system stack for body and UI text.
- **Spacing / radii / shadows, motion, layout** — documented, not enforced.

---

## Reduced motion

The library is mostly animation, so this matters more here than most projects.

- Both animation libraries are wrapped so they respect the OS setting (see [motion-provider.tsx](src/components/gallery/motion-provider.tsx)).
- A stylesheet rule neutralises CSS animations and transitions.
- Canvas and scroll-driven effects that neither reaches are guarded by hand via [`prefersReducedMotion()`](src/lib/reduced-motion.ts).

**Test it without touching your OS**: the preview toolbar has a **Reduced motion** toggle. It sets a flag the hand-written guards also read, so it exercises the same code path a real preference would.

When adding a component that animates outside of `motion` — canvas, GSAP, `requestAnimationFrame` — guard it with `prefersReducedMotion()`.

---

## Using a component in a real project

Full guide: [USING-THIS-LIBRARY.md](USING-THIS-LIBRARY.md).

1. Copy the implementation file(s) listed in the entry's `@source`.
2. Install the packages in `@deps`.
3. Bring the tokens it uses — most components rely on the shadcn semantic names (`bg-background`, `text-muted-foreground`, `border-border`). Copy the `:root` / `.dark` blocks from [globals.css](src/app/globals.css).
4. If it animates, wrap your app in a `MotionConfig` with `reducedMotion="user"`.

The registry entry itself is the demo — treat it as usage documentation, not something to copy.

---

## Gotchas

Learned the hard way; worth reading before touching this.

- **A broken import in any registry file breaks every preview.** They all load through one dynamic-import context, so a missing package takes down the whole gallery, not just its own entry. If everything 500s at once, look for `Module not found` in the terminal.
- **Registry components ship undeclared dependencies.** Several here did (`imagesloaded`, `swiper`, `react-intersection-observer`, a `use-outside-click` hook). Install what's missing and move on.
- **Two animation libraries are installed** — `motion` and `framer-motion`. They're separate instances, so a provider from one does not reach the other's components.
- **`@tanstack/react-table` is pinned to v8.** The ported table targets the v8 API; v9 renames everything. If you upgrade, the table breaks.
- **Gallery chrome tokens are namespaced `--color-g-*`** (`bg-g-canvas`, `text-g-dim`). Registry installers have collided with `muted`, `accent` and `brand` in the past — never use the `g-` names inside a component.
- **Re-running an installer can clobber local fixes.** Animate UI's install has overwritten patched files before. Typecheck after any `shadcn add`.
- **`npm run dev` is the authoring mode.** A production build freezes the set of importable registry files, so a component added after a build won't render until you rebuild.

---

## Layout

```
src/
  app/
    (gallery)/            gallery UI — sidebar shell, category and detail pages
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
