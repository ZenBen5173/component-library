"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig as MotionConfigFramer } from "framer-motion";
import { MotionConfig } from "motion/react";

/**
 * Forces reduced motion inside a preview, without anyone touching an OS setting.
 *
 * `reducedMotion="always"` overrides the user's actual preference for this
 * subtree, and the injected stylesheet does the same job for anything animated
 * with plain CSS. Together they reproduce exactly what a visitor with the
 * setting enabled would see.
 */
export function ReducedMotionScope({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  // Component-level guards read this flag, so the toggle exercises the same
  // code path a real OS preference would.
  useEffect(() => {
    const root = document.documentElement;
    if (active) root.dataset.reduceMotion = "1";
    else delete root.dataset.reduceMotion;
    return () => {
      delete root.dataset.reduceMotion;
    };
  }, [active]);

  if (!active) {
    return (
      <MotionConfig reducedMotion="user">
        <MotionConfigFramer reducedMotion="user">{children}</MotionConfigFramer>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="always">
      <MotionConfigFramer reducedMotion="always">
        <style>{`
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        `}</style>
        {children}
      </MotionConfigFramer>
    </MotionConfig>
  );
}
