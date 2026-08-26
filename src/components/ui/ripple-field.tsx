"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/reduced-motion";

type Ripple = { x: number; y: number; born: number };

/**
 * Still water that only moves where the pointer touches it.
 *
 * Each ripple is a pair of rings — a crest and a shallower trough behind it —
 * that expand on a cubic ease-out and fade. They are drawn, not composited:
 * this tints, it does not refract what sits beneath. Real refraction needs the
 * content sampled into a texture, which is a much heavier component; over a
 * dark or textured ground the difference is not worth the cost.
 *
 * One canvas for all of them rather than a node per ripple, which would mount
 * and unmount elements dozens of times a second.
 */
export function RippleField({
  className,
  /** Milliseconds a ripple takes to fade out. */
  life = 1500,
  /** Furthest radius a ripple reaches, in px. */
  spread = 150,
  /**
   * Pointer travel needed before another ripple is dropped, in px. Large on
   * purpose: at 34px a normal sweep of the mouse left two dozen rings
   * overlapping at once and the whole thing turned into a spirograph.
   */
  spacing = 120,
  color = "139, 147, 255",
}: {
  className?: string;
  life?: number;
  spread?: number;
  spacing?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const box = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(box.width * dpr);
    c.height = Math.round(box.height * dpr);
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || prefersReducedMotion()) return;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const onMove = (e: PointerEvent) => {
      const box = c.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      if (x < 0 || y < 0 || x > box.width || y > box.height) return;

      // Space ripples by distance, not by time: moving slowly should not
      // stack a hundred rings on one spot.
      const prev = last.current;
      if (prev && Math.hypot(x - prev.x, y - prev.y) < spacing) return;
      last.current = { x, y };
      ripples.current.push({ x, y, born: performance.now() });
      // A handful at most. Water settles; it does not accumulate.
      if (ripples.current.length > 5) ripples.current.shift();
    };

    let raf = 0;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const now = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, c.width / dpr, c.height / dpr);

      ripples.current = ripples.current.filter((r) => now - r.born < life);

      for (const r of ripples.current) {
        const t = (now - r.born) / life;
        // Fast out of the gate, then coasting — water, not a balloon.
        const eased = 1 - Math.pow(1 - t, 3);
        const radius = eased * spread;
        const fade = (1 - t) ** 2;

        // Two rings a little apart read as a crest and its trough.
        for (const [scale, weight] of [
          [1, 0.4],
          [0.86, 0.16],
        ] as const) {
          const rr = radius * scale;
          if (rr < 1) continue;
          const grad = ctx.createRadialGradient(r.x, r.y, Math.max(rr - 12, 0), r.x, r.y, rr + 6);
          grad.addColorStop(0, `rgba(${color}, 0)`);
          grad.addColorStop(0.7, `rgba(${color}, ${fade * weight})`);
          grad.addColorStop(1, `rgba(${color}, 0)`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 5 * (1 - t) + 0.75;
          ctx.beginPath();
          ctx.arc(r.x, r.y, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
    };
  }, [life, spread, spacing, color, resize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none block size-full", className)}
    />
  );
}
