/**
 * Whether motion should be suppressed right now.
 *
 * Checks the operating system setting, and also a `data-reduce-motion` flag the
 * gallery's preview toggle sets — otherwise component-level guards would only
 * ever fire on a real machine with the OS preference on, and the toggle would
 * silently fail to test them.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  if (document.documentElement.dataset.reduceMotion === "1") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
