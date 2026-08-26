# Using this library in a project

Written for whoever — or whatever — is building an app and wants a component
from here. This library is a **source of code to copy**, not a package to
install. Nothing imports from it at runtime.

## Finding a component

1. Open [INVENTORY.md](INVENTORY.md) — every component with a one-line
   description and tags.
2. Or browse it: `npm run dev` in this folder, then http://localhost:3333.
   The gallery is the better option when the choice is visual.

Categories: `design` (foundations) · `app` (logged-in UI) · `heroes` ·
`navigation` · `sections` (marketing) · `ui` (primitives) · `text` (kinetic
type) · `animations`.

## Taking one

Each registry entry is a demo, not the component. Open it and read the
metadata block at the top:

```
@source   the implementation file(s) — copy these
@deps     npm packages to install
@note     caveats worth knowing before you rely on it
```

Then:

1. **Copy the `@source` files** into your project, keeping their relative
   position under `src/components/`.
2. **Install the `@deps`.** Also install `clsx` and `tailwind-merge`, and copy
   `src/lib/utils.ts` — almost everything uses its `cn()` helper.
3. **Copy the colour tokens.** Components use shadcn's semantic names
   (`bg-background`, `text-muted-foreground`, `border-border`). Take the
   `:root` and `.dark` blocks from [src/app/globals.css](src/app/globals.css).
   Without them a component renders unstyled or invisible.
4. **If it animates**, wrap your app once in a `MotionConfig` with
   `reducedMotion="user"` — see
   [motion-provider.tsx](src/components/gallery/motion-provider.tsx). Some
   components also import `prefersReducedMotion()` from
   [src/lib/reduced-motion.ts](src/lib/reduced-motion.ts); copy that too.
5. **Use the registry entry as the usage example.** It shows the props and the
   shape of the data. Don't copy the entry itself — it contains gallery
   metadata and sample data.

## What not to assume

- **Most components are dark-first.** They were chosen for a dark aesthetic and
  many hard-code dark surfaces. Check before dropping one into a light UI.
- **Sample data is deliberately fake and deterministic** — no `Math.random()`
  or `Date.now()` during render, because both break hydration.
- **Two animation libraries are in play** (`motion` and `framer-motion`).
  Check which one a component imports and install that one.
- **`@tanstack/react-table` must be v8** for the data table. v9 renames its API.
- Some components had to be repaired after installation. Those changes are
  described in the entry's `@note` — read it before assuming upstream behaviour.

## Licensing

Components come from several sources with different terms. See
[CREDITS.md](CREDITS.md). Two of them permit use but forbid republication, so
they are absent from the public repository — if a component you want is
missing, that is why, and installing it from its own site is the fix.
