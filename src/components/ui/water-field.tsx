"use client";

import { useEffect, useState } from "react";
import { Water } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/reduced-motion";

/**
 * A slow caustic water surface, for use behind content.
 *
 * Deliberately independent of the pointer. Tying it to the cursor turned it
 * into a spotlight that followed you around; left alone it just breathes, and
 * cursor interaction belongs to RippleField instead.
 */
export function WaterField({
  className,
  opacity = 0.55,
  colorBack = "#000000",
  colorHighlight = "#8b93ff",
  /** Shader time scale. Low on purpose — this sits behind readable text. */
  speed = 0.1,
  /** Pattern scale. Larger means broader, calmer shapes. */
  size = 1.6,
}: {
  className?: string;
  opacity?: number;
  colorBack?: string;
  colorHighlight?: string;
  speed?: number;
  size?: number;
}) {
  const [enabled, setEnabled] = useState(false);

  // WebGL, so it is switched off rather than left frozen under reduced motion.
  useEffect(() => setEnabled(!prefersReducedMotion()), []);
  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none overflow-hidden", className)}
      style={{ opacity }}
    >
      <Water
        colorBack={colorBack}
        colorHighlight={colorHighlight}
        highlights={0.45}
        layering={0.35}
        edges={0.25}
        caustic={0.3}
        waves={0.2}
        size={size}
        speed={speed}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
