"use client";

/**
 * @name Liquid Metal
 * @description A WebGL shader used as a moving metal rim — on a button, and around an input that only comes alive once it has focus.
 * @tags button, input, shader, webgl, metal, hover, portfolio
 * @height 560
 * @deps @paper-design/shaders-react
 * @note The shader is a real WebGL surface, so it is guarded with `prefersReducedMotion()` — with reduced motion on it falls back to a plain border rather than a frozen canvas. It renders as an absolutely-positioned layer, so it needs a `relative` parent with padding; the padding is the only part of it you see.
 * @source src/components/ui/liquid-metal.tsx
 */
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { LiquidMetal, LiquidMetalButton } from "@/components/ui/liquid-metal";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { cn } from "@/lib/utils";

/** Rim thickness in px — the shader shows through the parent's padding. */
const RIM = 2;

export default function LiquidMetalDemo() {
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Read after mount: the server has no window, and reading during render
  // would make the two disagree.
  useEffect(() => setReduced(prefersReducedMotion()), []);

  const live = focused && !reduced;

  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center gap-12 bg-background p-10">
      <div className="w-full max-w-md">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          As an input rim — click into it
        </p>

        <div
          className={cn(
            "relative overflow-hidden rounded-lg transition-colors",
            !live && "bg-border",
          )}
          style={{ padding: RIM }}
        >
          {live && (
            <LiquidMetal
              colorBack="#6366f1"
              colorTint="#ffffff"
              speed={0.4}
              repetition={4}
              distortion={0.15}
              className="absolute inset-0 z-0 rounded-lg"
            />
          )}

          <div className="relative z-10 rounded-md bg-card px-3 py-2.5">
            <input
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="essay due fri 5pm"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Quiet at rest, alive while you are typing into it.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          As a button
        </p>
        <LiquidMetalButton icon={<ArrowRight className="size-4" />}>
          Get started
        </LiquidMetalButton>
      </div>
    </div>
  );
}
