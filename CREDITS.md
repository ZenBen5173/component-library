# Credits

Most components here were installed from public component registries rather than
written from scratch. Each gallery entry names its implementation files in a
`@source` line; this is where those files came from.

| Source | Used for | Licence |
| --- | --- | --- |
| [shadcn/ui](https://ui.shadcn.com) | Form controls, table, dialog, calendar, chart wrapper, resizable, and the token conventions the whole library uses | MIT |
| [Kibo UI](https://www.kibo-ui.com) | Kanban, tree, dropzone, banner, mini-calendar, spinner, table | MIT |
| [SmoothUI](https://smoothui.dev) | Combobox, context menu, drawer, pagination, breadcrumb, animated stepper, OTP input, toggle, carousel, notification badge | MIT |
| [full-calendar](https://github.com/yassir-jeraidi/full-calendar) | The event calendar — month/week/day/agenda views with drag and resize | MIT |
| [Animate UI](https://animate-ui.com) | Radix primitives with motion — dialog, sheet, popover, dropdown, tabs, accordion, sidebar, toggle, hover card, progress | MIT + Commons Clause — **redistribution prohibited**, see below |
| [lucide-animated](https://lucide-animated.com) | The animated nav and toolbar icons — Motion-powered Lucide | MIT |
| [Paper shaders](https://github.com/paper-design/shaders) | The WebGL surfaces — liquid metal, and the caustic water field | Apache-2.0 (npm dependency, not vendored) |
| [Radix Colors](https://www.radix-ui.com/colors) | The 12-step colour scales the design system runs on | MIT (npm dependency, not vendored) |
| [skiper-ui](https://skiper-ui.com) | Smooth input, tooltip, theme toggles, link effects, number displays, menu icons, scroll progress, video player, hover-expand gallery, crowd canvas | **Redistribution prohibited** — see below |
| [vengenceui](https://www.vengenceui.com) | Heroes, navigation, bento grids, kinetic text, footers, showcases — the largest single source. The hand photographs in `public/animated-footer/` are theirs too: the registry ships the component without them | MIT — © 2025-2026 Ashutoshx7 |

## Components not included here

Two sources permit use but not republication, so their components are absent
from this repository. They remain in the author's working copy; the gallery is
simply larger there.

### skiper-ui

**Their [Terms of Service](https://skiper-ui.com/docs/terms-of-service)
forbid redistribution.** They state you must not "Republish material",
"Reproduce, duplicate or copy material" or "Redistribute content from
skiper-ui.com", and draw no distinction between their free and paid components.
Using them inside a project is what they are for; publishing their source in a
public repository is not permitted.

Twelve entries were built on skiper-ui, along with
`public/images/peeps/all-peeps.png`, which is their sprite artwork.

### Animate UI

Their licence is MIT with a **Commons Clause**: free to use for any purpose,
including commercially, so long as you do not *sell or redistribute the
components themselves in their original form — whether alone or in a bundle*.
A component library is precisely that bundle, so they are excluded too.

Nine entries were built on Animate UI — the overlays, app shell, tabs and
accordion, toggles, and parts of the form and feedback demos.

Everything else is clear:

- **vengenceui — MIT.** The copyright notice is reproduced in
  [LICENSE-THIRD-PARTY.md](LICENSE-THIRD-PARTY.md), as the licence requires.
- **shadcn/ui, Kibo UI, SmoothUI, full-calendar — MIT.**
- **`src/components/gustflow-table/`** is a port of the author's own work from a
  private project. Fine to publish, but a deliberate decision rather than an
  oversight.

Both are excellent libraries and worth installing directly from source — that
is what their licences are for. Nothing here discourages using them; this
repository simply cannot be the thing that hands you their code.

Components were modified during installation — several arrived broken and were
repaired, and most were restyled onto this project's tokens. Those changes are
described in each entry's `@note`.
