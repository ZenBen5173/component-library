/**
 * Motion tokens.
 *
 * The single source for timing across the library — the Motion Tokens page in
 * the gallery renders these values rather than restating them, so the docs
 * cannot drift from the code.
 *
 * Rule of thumb: duration scales with distance. A 24px toggle at 500ms feels
 * broken; a full-screen panel at 100ms feels like a cut. Anything past 800ms
 * should be scroll-driven rather than time-driven.
 */

export const DURATION = {
  /** State flips — checkbox, toggle. */
  instant: 0.1,
  /** Hover, focus, colour change. */
  fast: 0.2,
  /** Most transitions. */
  base: 0.3,
  /** Entrances, layout shifts. */
  slow: 0.5,
  /** Hero reveals, scroll effects. */
  deliberate: 0.8,
} as const;

export const EASE = {
  /** Default — moves in and settles. */
  standard: [0.4, 0, 0.2, 1],
  /** Entering the screen. */
  decelerate: [0, 0, 0.2, 1],
  /** Leaving the screen. */
  accelerate: [0.4, 0, 1, 1],
  /** The one used across this library. */
  expressive: [0.16, 1, 0.3, 1],
} as const;

export const SPRING = {
  /** Tooltips, small pops. */
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  /** Sliding indicators, tabs. */
  default: { type: "spring", stiffness: 300, damping: 24 },
  /** Progress rails, large panels. */
  soft: { type: "spring", stiffness: 160, damping: 26 },
  /** Playful — use sparingly. */
  bouncy: { type: "spring", stiffness: 500, damping: 15 },
  /**
   * Cursor-following — magnetic buttons, trackers. Deliberately looser and
   * lighter than the UI presets: a follow spring should trail the pointer,
   * and anything stiffer reads as snapping to it.
   */
  follow: { type: "spring", stiffness: 220, damping: 18, mass: 0.6 },
} as const;

/** A tween transition from the scales above. */
export function tween(
  duration: keyof typeof DURATION = "base",
  ease: keyof typeof EASE = "expressive",
) {
  return { duration: DURATION[duration], ease: EASE[ease] };
}
