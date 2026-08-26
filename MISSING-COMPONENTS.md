# Components not in this repository

Twenty-one components are absent because their licences permit use but not
republication (see [CREDITS.md](CREDITS.md)). **You can still install them** —
straight from the people who made them, which is what their licences are for.

Run these in your project, then look up the component in the gallery of a full
checkout, or read the source you just installed.

## Animate UI

Radix primitives with motion. MIT with a Commons Clause — free to use, including
commercially; you just may not redistribute the components themselves.

```bash
npx shadcn@latest add https://animate-ui.com/r/components-radix-dialog.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-sheet.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-popover.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-dropdown-menu.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-tabs.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-accordion.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-sidebar.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-toggle.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-toggle-group.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-hover-card.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-alert-dialog.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-progress.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-checkbox.json
npx shadcn@latest add https://animate-ui.com/r/components-radix-switch.json
```

| Missing entry | Needs |
| --- | --- |
| Overlays | dialog, sheet, popover, dropdown-menu |
| App Sidebar · Sidebar with File Tree | sidebar |
| Tabs & Accordion | tabs, accordion |
| Toggles & Disclosure | toggle, toggle-group |
| Alerts & Confirms | alert-dialog |
| Context Menu & Hover Card | hover-card |
| Feedback & Status | progress |
| Form Controls | checkbox, switch |

Two caveats from experience: their installer has **overwritten locally patched
files** before, so typecheck after installing; and two of their primitives
needed small type fixes under `strict` — a cast in `primitives/animate/slot.tsx`
and in `primitives/effects/highlight.tsx`.

## skiper-ui

Their [terms](https://skiper-ui.com/docs/terms-of-service) forbid redistribution
but the components are free to install and use.

| Missing entry | Install |
| --- | --- |
| Smooth Input | `npx shadcn@latest add @skiper-ui/skiper106` |
| Border Arrow Tooltip | `npx shadcn@latest add @skiper-ui/skiper101` |
| Theme Toggle Buttons | `npx shadcn@latest add @skiper-ui/skiper4` |
| Theme Toggle Expand | `npx shadcn@latest add @skiper-ui/skiper26` |
| Link Hover Effects | `npx shadcn@latest add @skiper-ui/skiper40` |
| Scroll Number Showcase | `npx shadcn@latest add @skiper-ui/skiper37` |
| Fading Scroll Area | `npx shadcn@latest add @skiper-ui/skiper87` |
| Animated Menu Icons | `npx shadcn@latest add @skiper-ui/skiper99` |
| Hover Expand Gallery | `npx shadcn@latest add @skiper-ui/skiper52` |
| Crowd Canvas | `npx shadcn@latest add @skiper-ui/skiper39` |
| Scroll Progress Dial | `npx shadcn@latest add @skiper-ui/skiper89` |
| Video Player | `npx shadcn@latest add @skiper-ui/skiper67` |

The `@skiper-ui` namespace resolves through `registries` in
[components.json](components.json), which is already configured here.

Known issues found while using these: the Fading Scroll Area ships **no fade** —
it pulls in the stock shadcn scroll area, so add a mask yourself. The Crowd
Canvas needs a sprite sheet at `public/images/peeps/all-peeps.png` which is
their artwork, not included. The Combobox's option rows animated in on a
per-index delay, which leaves visible gaps in the list; drop the delay.
