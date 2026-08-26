"use client";

/**
 * @name Water Cursor
 * @description A caustic water surface behind the page that shifts under the pointer — glass-like, and it keeps moving after you stop.
 * @tags cursor, water, glass, webgl, shader, background, ambient, portfolio, must-have
 * @height 620
 * @deps @paper-design/shaders-react
 * @note A gradient that tracks the cursor exactly reads as a spotlight and gets old fast. This is a real caustic surface: it animates on its own, and the pointer only pushes where the pattern sits, on a loose spring, so it drifts rather than sticks. Keep `caustic` and `waves` low behind text — the distortion is easy to overdo. WebGL, so it is guarded with `prefersReducedMotion()` and disappears rather than freezing.
 * @source src/components/ui/water-field.tsx
 */
import { WaterField } from "@/components/ui/water-field";

export default function WaterCursorDemo() {
  return (
    <div className="relative min-h-[620px] overflow-hidden bg-background">
      <WaterField className="absolute inset-0" opacity={0.5} />

      <div className="relative grid min-h-[620px] place-items-center px-8">
        <div className="max-w-md text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Move your cursor
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The surface is always moving. Your pointer only decides where it
            sits, and it takes its time getting there.
          </p>
        </div>
      </div>
    </div>
  );
}
