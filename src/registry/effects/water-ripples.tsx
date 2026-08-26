"use client";

/**
 * @name Water Ripples
 * @description Real water: the pointer dents a simulated surface and the ripples bend what is behind them, rather than drawing rings on top.
 * @tags cursor, water, ripple, webgl, shader, interactive, hero, must-have, portfolio
 * @height 620
 * @note The difference from Cursor Ripples is refraction. A height field runs on the GPU across two float textures, and the draw pass offsets its lookup into the source by the slope of the surface — so the thing underneath genuinely warps. The cost is that it can only bend a texture: give it an image, or it generates a backdrop. It cannot refract live DOM, which is why the drawn version still exists for use over app content. Needs WebGL2 with float render targets; without them it renders nothing rather than something broken.
 * @source src/components/ui/water-ripples.tsx
 */
import { WaterRipples } from "@/components/ui/water-ripples";

export default function WaterRipplesDemo() {
  return (
    <div className="relative min-h-[620px] overflow-hidden bg-background">
      <WaterRipples className="absolute inset-0" />

      <div className="relative grid min-h-[620px] place-items-center px-8">
        <div className="max-w-md rounded-xl bg-background/40 p-6 text-center backdrop-blur-sm">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Drag across the surface
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Rings spread from the pointer at half pace and settle. The bending is
            deliberately slight — the highlight does most of the work.
          </p>
        </div>
      </div>
    </div>
  );
}
