"use client";

/**
 * @name Water Field
 * @description A slow caustic water surface for sitting behind content — always moving, never asking for attention.
 * @tags water, glass, webgl, shader, background, ambient, portfolio
 * @height 620
 * @deps @paper-design/shaders-react
 * @note Deliberately independent of the pointer. An earlier version tracked the cursor and read as a spotlight following you around; this one just breathes. Cursor interaction belongs to Cursor Ripples instead. Keep `speed` low and opacity under about 0.2 behind text — the caustics are easy to overdo. WebGL, so it is guarded with `prefersReducedMotion()` and disappears rather than freezing.
 * @source src/components/ui/water-field.tsx
 */
import { WaterField } from "@/components/ui/water-field";

export default function WaterFieldDemo() {
  return (
    <div className="relative min-h-[620px] overflow-hidden bg-background">
      <WaterField className="absolute inset-0" opacity={0.5} />

      <div className="relative grid min-h-[620px] place-items-center px-8">
        <div className="max-w-md text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Still worth watching
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            No cursor, no scroll, no trigger. It simply never stops.
          </p>
        </div>
      </div>
    </div>
  );
}
