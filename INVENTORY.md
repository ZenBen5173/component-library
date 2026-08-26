# Component Inventory

**66 components.** Generated from `src/registry`. Run `npm run inventory` to refresh.

## controls (6)

| Component | What it is | Tags |
| --- | --- | --- |
| [Animated Button](src/registry/controls/animated-button.tsx) | Button with a shine sweeping across the label and a matching gradient running the border. | button, shine, hover, spring, versatile |
| [Cursor Card](src/registry/controls/cursor-card.tsx) | Card that reveals a floating image preview pinned to the cursor while hovered. | versatile, card, cursor, hover, image, portfolio |
| [Liquid Metal](src/registry/controls/liquid-metal.tsx) | A WebGL shader used as a moving metal rim — on a button, and around an input that only comes alive once it has focus. | button, input, shader, webgl, metal, hover, portfolio |
| [Magnetic Button](src/registry/controls/magnetic-button.tsx) | Button whose label and body lean toward the cursor, then spring back on exit. | micro-interaction, hover, spring, button |
| [Shared Tooltip Avatars](src/registry/controls/shared-tooltip-avatars.tsx) | Overlapping avatar stack with one tooltip that slides between faces instead of popping per avatar. | must-have, versatile, avatars, tooltip, hover, social-proof |
| [Spotlight Card](src/registry/controls/spotlight-card.tsx) | Card with a radial glow that tracks the cursor and a border that lights up on hover. | card, hover, spotlight, dark |

## effects (4)

| Component | What it is | Tags |
| --- | --- | --- |
| [Custom Cursor](src/registry/effects/custom-cursor.tsx) | A dot that tracks the pointer with a ring trailing on a spring, swelling over anything clickable. Plus labelled presence cursors for multiplayer. | cursor, portfolio, micro-interaction, hover, must-have |
| [Highlight Grid](src/registry/effects/highlight-grid.tsx) | Grid of labels where a single coloured highlight glides to whichever cell you point at. | cool, grid, highlight, hover, website |
| [Scroll Dissolve Reveal](src/registry/effects/scroll-dissolve-reveal.tsx) | WebGL shader that dissolves one image into another as you scroll past it. | portfolio, scroll, webgl, shader, image, three |
| [Solar System](src/registry/effects/solar-system.tsx) | Tech-stack orbit: labelled nodes revolve on concentric rings around a centre logo, pausable on hover. | cool, orbit, tech-stack, animated, showcase, portfolio |

## media (1)

| Component | What it is | Tags |
| --- | --- | --- |
| [Music Player](src/registry/media/music-player.tsx) | Floating player with artwork, a decorative equalizer, seekable progress and a collapsed pill mode. | player, audio, widget, floating, cool |

## pages (2)

| Component | What it is | Tags |
| --- | --- | --- |
| [Article](src/registry/pages/article.tsx) | Long-form reading layout — headings, lists, quotes, code and captions, with the measure capped for readability. | typography, prose, article, blog, case-study, website |
| [Case Study](src/registry/pages/case-study.tsx) | The page a project index links to — sticky meta rail, alternating image and text, pull quote, results, and next-project navigation. | case-study, portfolio, project, layout, must-have |

## showcase (4)

| Component | What it is | Tags |
| --- | --- | --- |
| [Books Showcase](src/registry/showcase/books-showcase.tsx) | 3D bookshelf — books tilt, open and reveal a detail panel. Works for any collectible catalogue, not just books. | cool, showcase, 3d, carousel, books |
| [Image Reveal List](src/registry/showcase/image-reveal-list.tsx) | Numbered index list where hovering a row slides its image in alongside. Great for project indexes. | versatile, list, hover, image-reveal, portfolio |
| [Staggered Grid](src/registry/showcase/staggered-grid.tsx) | Scroll-driven gallery: columns drift at different speeds, then converge into a bento layout. | portfolio, grid, scroll, gsap, gallery |
| [Verse Cards](src/registry/showcase/verse-cards.tsx) | Nav tile that opens into a stacked card deck; click the front card to flick it away. | versatile, cards, deck, stack, interactive, portfolio |

## Design System (5)

| Component | What it is | Tags |
| --- | --- | --- |
| [Colours](src/registry/design/colors.tsx) | The Radix scales this library runs on — 12 steps per hue, each step with a fixed job, matched across light and dark. | color, palette, tokens, radix, design-system |
| [Layout & Responsive](src/registry/design/layout-responsive.tsx) | Breakpoints, container widths and how components should reflow rather than just shrink. | layout, responsive, breakpoints, container-queries, design-system |
| [Motion Tokens](src/registry/design/motion.tsx) | Standard durations, easings and springs — so every component's animation feels like the same hand. | motion, animation, easing, spring, design-system |
| [Spacing, Radii & Shadows](src/registry/design/spacing-radii-shadows.tsx) | The scales components should pull from, so values stop being invented per component. | spacing, radius, shadow, tokens, design-system |
| [Typography](src/registry/design/typography.tsx) | Type scale, weights and line heights — plus the case for replacing system-ui with a real typeface. | typography, fonts, scale, design-system |

## App UI (20)

| Component | What it is | Tags |
| --- | --- | --- |
| [Activity Feed](src/registry/app/activity-feed.tsx) | Chronological event stream with self-updating relative timestamps, plus a notification bell with an unread count. | activity, feed, notifications, timeline, app |
| [Breadcrumbs](src/registry/app/breadcrumbs.tsx) | Trail that staggers in on mount, with animated separators and a hover state on each crumb. | breadcrumb, navigation, app |
| [Calendar View](src/registry/app/calendar-view.tsx) | Full event calendar — month, week, day, year and agenda views, with drag-to-move, resize and event editing. | calendar, schedule, events, drag-drop, app |
| [Carousel](src/registry/app/carousel.tsx) | Stacked card carousel — cards recede behind the active one, with autoplay, arrows and indicators. | carousel, slider, testimonials, cards, app |
| [Combobox](src/registry/app/combobox.tsx) | Searchable select with keyboard navigation and animated option filtering — for lists too long for a plain select. | combobox, select, search, autocomplete, form, app |
| [Data Table](src/registry/app/data-table.tsx) | Your GustFlow table, ported — multi-sort, nested AND/OR filters, group-by, column resize/reorder/hide, footer aggregates, CSV export and virtualised rows. | table, data, sorting, filtering, grouping, virtualised, app |
| [Date Picker](src/registry/app/date-picker.tsx) | Full month calendar in a popover, plus a compact inline strip for picking a day near today. | date, calendar, picker, form, app |
| [Drawer](src/registry/app/drawer.tsx) | Bottom sheet that drags to dismiss — the mobile counterpart to the side sheet in Overlays. | drawer, bottom-sheet, mobile, overlay, app |
| [File Upload](src/registry/app/file-upload.tsx) | Drag-and-drop dropzone with file-type and size limits, plus a filled state listing what was accepted. | upload, dropzone, file, form, app |
| [Form Validation](src/registry/app/form-validation.tsx) | Real form wiring — schema validation, per-field errors, and a submit button that shows pending state. | form, validation, zod, react-hook-form, app |
| [Kanban Board](src/registry/app/kanban.tsx) | Drag-and-drop board — cards move between columns with pointer and keyboard, backed by dnd-kit. | kanban, board, drag-drop, dnd-kit, app |
| [Living Charts](src/registry/app/living-charts.tsx) | Fixed figures that never sit still — a light travelling the line, a drifting gradient under it, bars caught by a sweeping shimmer, and a ring with a rotating sheen. | chart, data, analytics, dashboard, animated, hover, must-have, app |
| [Logo Generator](src/registry/app/logo-generator.tsx) | Generative brand marks laid out from geometric tiles — pick a style and a palette, press once for a new mark, copy it as SVG. | logo, brand, generative, svg, geometry, icon, app |
| [OTP Input](src/registry/app/otp-input.tsx) | Six-digit code entry — digits animate in as you type, paste fills every box, backspace walks back. | otp, input, auth, verification, form, app |
| [Pagination](src/registry/app/pagination.tsx) | Page numbers with a highlight that slides between them on a spring — the same shared-layout trick as the tabs. | pagination, navigation, sliding-indicator, app |
| [Resizable Panels](src/registry/app/resizable-panels.tsx) | Drag-to-resize split panes, nested and persistable — the shell for editors, inspectors and previews. | resizable, split-pane, layout, editor, app |
| [Empty & Error States](src/registry/app/states.tsx) | Empty, no-results, error and 404 states — the screens every app needs and no registry ships. | empty-state, error, 404, loading, app |
| [Stepper — Vertical](src/registry/app/stepper-vertical.tsx) | Vertical wizard where the rail fills between steps and each step's content panel expands in place. | stepper, wizard, vertical, onboarding, app |
| [Stepper — Horizontal](src/registry/app/stepper.tsx) | Multi-step wizard progress — connector fills on a spring, completed tick scales in. | stepper, wizard, progress, onboarding, checkout, app |
| [Tree View](src/registry/app/tree-view.tsx) | Expandable file tree with connector lines, icons and selection — for file browsers and nav hierarchies. | tree, file-browser, hierarchy, navigation, app |

## Heroes (2)

| Component | What it is | Tags |
| --- | --- | --- |
| [Aurora Hero](src/registry/heroes/aurora-hero.tsx) | Full-bleed aurora gradient with a glass-displacement title and a background-mode switch. | portfolio, hero, gradient, glass, animated |
| [Perspective Grid](src/registry/heroes/perspective-grid.tsx) | Tilted 3D tile grid that fades out at the edges; tiles light up under the cursor and fade back over 1.5s. | portfolio, hero, 3d, grid, background, cool |

## Navigation (6)

| Component | What it is | Tags |
| --- | --- | --- |
| [Awwwards Nav](src/registry/navigation/awwwards-nav.tsx) | Floating pill nav that expands upward into a columned menu panel. | navigation, navbar, expandable, awwwards, portfolio |
| [Glass Dock](src/registry/navigation/glass-dock.tsx) | macOS-style dock: icons scale and lift as the cursor sweeps past, on a frosted glass bar. | navigation, dock, glass, hover, macos |
| [Mega Menu Navbar](src/registry/navigation/mega-menu-navbar.tsx) | Sticky top bar whose panels expand into a mega menu — a promo sidebar card plus grouped link columns. | navigation, navbar, mega-menu, saas, website |
| [Page Transitions](src/registry/navigation/page-transitions.tsx) | Four ways one page can hand over to the next — fade, slide, a wipe curtain, and a masked reveal. | page-transition, navigation, portfolio, motion, must-have |
| [Search Modal](src/registry/navigation/search-modal.tsx) | Collapsed search bar that expands into a full command palette — filter tags, grouped results, ⌘K. | navigation, search, modal, command-palette, hotkey |
| [Spotlight Navbar](src/registry/navigation/spotlight-navbar.tsx) | Nav links lit by a sliding spotlight that tracks the hovered item and settles on the active one. | navigation, navbar, spotlight, hover |

## Sections (10)

| Component | What it is | Tags |
| --- | --- | --- |
| [Agent Bento Grid](src/registry/sections/agent-bento-grid.tsx) | Five-panel bento of self-animating feature cards. A drop-in replacement for a plain feature grid. | versatile, bento, grid, cards, feature, website |
| [Animated Footer](src/registry/sections/animated-footer.tsx) | Footer whose side images are sampled into interactive ASCII art, with parallax and oversized wordmark. | portfolio, footer, ascii, canvas, parallax |
| [Expandable Bento Grid](src/registry/sections/expandable-bento-grid.tsx) | Bento tiles that expand in place into a full detail panel when clicked. | bento, grid, expandable, cards, versatile |
| [FAQ Accordion](src/registry/sections/faq-accordion.tsx) | Disclosure list with a smooth height transition — the standard bottom-of-page FAQ block. | website, faq, accordion, disclosure, versatile |
| [Logo Marquee](src/registry/sections/logo-marquee.tsx) | Continuously scrolling strip of client logos, pausing on hover, with the edges faded out. | marquee, logos, social-proof, portfolio, website, ticker |
| [Pricing Table](src/registry/sections/pricing-table.tsx) | Three tiers with a monthly/annual toggle, prices that roll rather than swap, and one plan marked out. | pricing, saas, website, toggle, marketing |
| [Research Bento Grid](src/registry/sections/research-bento-grid.tsx) | Three-panel bento: rotating brand showcase, animated invoice/pricing tile and a pause-anytime tile. | portfolio, website, bento, grid, pricing, saas |
| [Team Reveal Grid](src/registry/sections/team-reveal-grid.tsx) | Team roster where hovering a name reveals that person's portrait, auto-cycling while idle. | website, team, grid, reveal, about |
| [Testimonials](src/registry/sections/testimonials.tsx) | Two shapes — a scrolling wall that never stops, and a static three-up for when the words need reading. | testimonials, social-proof, marquee, website, portfolio |
| [Why Us Bento](src/registry/sections/why-us-bento.tsx) | Bento grid of value props — animated avatar row, globe, feature tiles. A "why choose us" section. | versatile, bento, grid, website, feature, marketing |

## Text & Numbers (6)

| Component | What it is | Tags |
| --- | --- | --- |
| [Animated Number](src/registry/text/animated-number.tsx) | Odometer-style digits that roll to a new value. Two variants: a plain counter and a scored one. | number, counter, odometer, animated |
| [ASCII Glitch Ripple](src/registry/text/ascii-glitch-ripple.tsx) | Hovering sends a wave of scrambled ASCII glyphs rippling across the label before it resolves. | portfolio, text, ascii, glitch, hover, link |
| [Flip Fade Text](src/registry/text/flip-fade-text.tsx) | Words swap on an interval, each letter flipping in and out on a stagger. Good for loading states. | loading, text, flip, rotating, animated |
| [Morph Text](src/registry/text/morph-text.tsx) | Oversized display words that liquid-morph into one another via an SVG blur/contrast filter. | portfolio, text, morph, svg-filter, animated |
| [Stagger Text](src/registry/text/stagger-text.tsx) | Copy that reveals word by word (or letter by letter) as it scrolls into view. | portfolio, website, text, stagger, reveal, scroll |
| [Stats Counter](src/registry/text/stats-counter.tsx) | Number that counts up to its target, with prefix/suffix and decimal support. For stat strips. | number, counter, stats, scroll, website |

---

22 further components exist in the author's working copy but are not
redistributable, so they are not part of this repository. See
[CREDITS.md](CREDITS.md).
