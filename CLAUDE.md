# Working in this repo

A personal **component library**, not an application. `src/registry/` is the point; everything else exists to serve it. Read [README.md](README.md) first, and [INVENTORY.md](INVENTORY.md) for what already exists — check there before adding anything, several things look similar.

## Commands

```bash
npm run dev         # authoring mode, port 3333 — always work here
                    # restarts itself past 2.8GB; DEV_MEM_LIMIT_MB=0 disables
npm run typecheck   # run after every change; this catches most breakage
npm run inventory   # regenerate INVENTORY.md after adding or removing entries
npm run design      # flag timings and radii that bypass the design scales
npm run new <category> <slug>
```

## The owner's taste

This matters more than usual here — components get rejected on feel.

- **Static reads as unfinished.** Add micro-interactions by default; don't wait to be asked. Hover reveals, cursor tracking, staggered entrances.
- **High bar on motion quality.** They have caught a 100ms stall in a digit roll, a stretched icon mid-morph, a 6px misaligned badge, and a 32px gap in a list. Verify frame behaviour, not just that something renders.
- **Finished components, not primitives.** A configurable filter or a tuning playground gets deleted; a visible, usable component stays.
- **Dark-first**, precise, awwwards-adjacent. Plain shadcn defaults read as boring to them.
- Prefers **sourcing components over hand-written ones**. Look for an existing one first; say plainly when nothing suitable exists rather than quietly building.

## House rules for registry entries

1. Sample data lives in the entry file, not a shared fixtures module.
2. Use shadcn semantic tokens (`bg-background`, `text-muted-foreground`) or plain Tailwind colours. **Never** the gallery's `g-` tokens.
3. The entry renders its own background so it looks right in isolation.
4. `"use client"` unless the component is genuinely a server component (the calendar is one).
5. Props have defaults so the entry renders with no arguments.
6. Deterministic sample data — no `Math.random()` or `Date.now()` during render. Both break hydration; this has happened twice.
7. Timings come from `@/lib/motion` (`DURATION`, `EASE`, `SPRING`, `tween()`), not hand-picked numbers. `npm run design` catches strays. If a value genuinely doesn't fit the scale, add a named preset with a comment saying why — don't inline it. Vendored trees are exempt and stay that way; they get re-fetched, and rewriting their internals only creates merge pain.

## Before you finish

- `npm run typecheck` — must be clean.
- `npm run design` — must be clean.
- Hit every touched preview: `curl -o /dev/null -w '%{http_code}' http://localhost:3333/preview/<cat>/<slug>` — 200 is necessary but not sufficient, since a failed component renders a fallback with a 200.
- If it animates outside `motion`/`framer-motion` (canvas, GSAP, rAF), guard it with `prefersReducedMotion()` from `@/lib/reduced-motion`, then verify with the preview toolbar's **Reduced motion** toggle.

## Traps

- **One broken import breaks every preview**, not just its own — they share a dynamic-import context.
- **Two animation libraries** (`motion` and `framer-motion`) are installed and are separate instances.
- **`@tanstack/react-table` is pinned to v8**; the ported table breaks on v9.
- **`npx shadcn add` can overwrite local fixes.** Typecheck after every install.
- **Third-party registry components are frequently broken** — corrupted files, undeclared deps, imports of hooks and CSS they never ship, install commands whose JSON 404s. Assume repair work, and check hover and animation states rather than trusting that something renders.
- Restart the dev server after editing `src/lib/registry.ts` or `next.config.ts` — Turbopack holds stale copies of those.
- **Never read `sessionStorage` or `localStorage` while rendering.** The server has neither, so it draws one thing and the browser draws another and React throws the server's HTML away. Seed state from props, then apply anything remembered in an effect after mount. This has bitten the data table once, silently, and the symptom was a column in the wrong place rather than an obvious error.
- **Sorting text: reuse one `Intl.Collator`.** `localeCompare` with options builds a collator per call and a sort makes n·log n of them — measured at 7 seconds for fifty thousand rows, versus 276ms with one shared collator.

## Style

Match the surrounding code. Comments explain *why*, not *what*, and are used sparingly — most entries need none beyond the metadata block. Put caveats in the entry's `@note` so they surface in the gallery rather than being lost in a commit message.
