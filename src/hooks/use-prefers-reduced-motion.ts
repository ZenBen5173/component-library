"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/reduced-motion";

/**
 * Whether the operating system is asking for reduced motion.
 *
 * For canvas and animation-loop effects that motion's MotionConfig can't reach.
 * Starts `false` so server and client agree on the first render, then updates
 * once mounted and whenever the setting changes.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(prefersReducedMotion());

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
