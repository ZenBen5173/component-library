import { DURATION, EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/reduced-motion";

/**
 * Reveals a theme change as a circle growing out of the button that triggered
 * it, using the View Transitions API.
 *
 * Shared by the gallery's toggle and the one registry entries use, so the two
 * cannot drift. Callers pass a `commit` that performs the theme change —
 * wrapped in flushSync by the caller if it is React state, since
 * startViewTransition snapshots the DOM as soon as its callback resolves.
 */
export function wipeTheme(origin: HTMLElement | null, commit: () => void) {
  if (!origin || typeof document === "undefined") return commit();
  if (!document.startViewTransition || prefersReducedMotion()) return commit();

  const box = origin.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  // Flags the scoped override in globals.css on for this transition only, so
  // other toggles' CSS keyframes are left alone.
  document.documentElement.dataset.vtWipe = "";

  const transition = document.startViewTransition(commit);
  transition.finished.finally(() => {
    delete document.documentElement.dataset.vtWipe;
  });

  // A skipped transition rejects `ready` — the browser skips it whenever the
  // document is hidden. The theme has already changed by then, so there is
  // nothing to recover, but an uncaught rejection would surface as an error.
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: DURATION.slow * 1000,
          easing: `cubic-bezier(${EASE.expressive.join(",")})`,
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
}
