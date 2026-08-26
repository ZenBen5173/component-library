"use client";

import type { ReactNode } from "react";
import { MotionConfig as MotionConfigFramer } from "framer-motion";
import { MotionConfig } from "motion/react";

/**
 * Honour the operating system's "reduce motion" setting everywhere.
 *
 * `reducedMotion="user"` makes every animation in the tree skip transforms and
 * fades when the user has asked for less movement, while still letting opacity
 * and colour changes through so interfaces stay legible.
 *
 * Two providers because the library pulls in both `motion` and `framer-motion`
 * — they're separate instances and a provider from one does not reach the
 * other's components.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <MotionConfigFramer reducedMotion="user">{children}</MotionConfigFramer>
    </MotionConfig>
  );
}
