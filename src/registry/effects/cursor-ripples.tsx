"use client";

/**
 * @name Cursor Ripples
 * @description Still water that only moves where you touch it — rings spread from the pointer, bend what is under them, and settle.
 * @tags cursor, water, ripple, glass, canvas, interactive, must-have, portfolio
 * @height 620
 * @note The surface is genuinely still until you move. Ripples are spaced by pointer distance rather than by time, so moving slowly does not stack rings on one spot, and they all share one canvas — a node per ripple would mount and unmount elements dozens of times a second. Pair it over Water Field if you want both a living surface and cursor response. Canvas and rAF, so it is guarded with `prefersReducedMotion()`.
 * @source src/components/ui/ripple-field.tsx
 */
import { RippleField } from "@/components/ui/ripple-field";

export default function CursorRipplesDemo() {
  return (
    <div className="relative min-h-[620px] overflow-hidden bg-background">
      {/* Something with edges underneath, so the rings have work to do. */}
      <div className="absolute inset-0 grid grid-cols-6 opacity-[0.09]">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="border-r border-foreground" />
        ))}
      </div>

      <RippleField className="absolute inset-0" />

      <div className="relative grid min-h-[620px] place-items-center px-8">
        <div className="max-w-md text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Still, until you move
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Nothing happens on its own. Drag the pointer across and the surface
            answers, then settles back.
          </p>
        </div>
      </div>
    </div>
  );
}
