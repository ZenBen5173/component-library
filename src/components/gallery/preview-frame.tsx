"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Accessibility,
  ExternalLink,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fixed widths, not percentages. A component gated behind `lg:` needs a real
 * 1024px+ viewport — rendering it into whatever width the page happens to have
 * silently shows you the mobile layout instead.
 */
const VIEWPORTS = [
  { id: "desktop", label: "Desktop — 1280px", width: 1280, Icon: Monitor },
  { id: "tablet", label: "Tablet — 768px", width: 768, Icon: Tablet },
  { id: "mobile", label: "Mobile — 390px", width: 390, Icon: Smartphone },
] as const;

export function PreviewFrame({
  src,
  height,
}: {
  src: string;
  height: number | "screen";
}) {
  const [viewport, setViewport] = useState<string>("desktop");
  const [nonce, setNonce] = useState(0);
  // Reproduces what someone with "reduce motion" enabled would see, without
  // anyone changing an OS setting.
  const [reduceMotion, setReduceMotion] = useState(false);
  const [available, setAvailable] = useState(0);
  const shellRef = useRef<HTMLDivElement>(null);

  // The frame renders at full width and is scaled down to fit, so the page
  // inside always believes it has the viewport it was designed for.
  // Measured directly rather than via ResizeObserver alone — RO callbacks are
  // delivered on the rendering tick, which some embedded views starve.
  const measure = useCallback(() => {
    const el = shellRef.current;
    if (el) setAvailable(el.clientWidth);
  }, []);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    if (shellRef.current) observer.observe(shellRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [measure, viewport]);

  const active = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[0];
  const frameHeight = height === "screen" ? 800 : height;
  const scale = available ? Math.min(1, available / active.width) : 1;

  return (
    <div className="rounded-xl border border-g-line bg-g-surface">
      <div className="flex items-center justify-between gap-3 border-b border-g-line px-3 py-2">
        <div className="flex items-center gap-0.5">
          {VIEWPORTS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => setViewport(id)}
              className={cn(
                "grid size-7 place-items-center rounded-md transition-colors",
                viewport === id ? "bg-g-canvas text-g-ink" : "text-g-dim hover:text-g-ink",
              )}
            >
              <Icon size={14} />
            </button>
          ))}
          <span className="ml-2 font-mono text-[10px] text-g-dim">
            {active.width}px{scale < 1 && ` · ${Math.round(scale * 100)}%`}
          </span>
          <button
            type="button"
            title={
              reduceMotion
                ? "Reduced motion ON — showing what a visitor with animations disabled sees"
                : "Preview with reduced motion"
            }
            onClick={() => setReduceMotion((on) => !on)}
            className={cn(
              "ml-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
              reduceMotion
                ? "bg-g-brand/15 text-g-brand"
                : "text-g-dim hover:text-g-ink",
            )}
          >
            <Accessibility size={12} />
            Reduced motion
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Reload preview"
            onClick={() => setNonce((n) => n + 1)}
            className="grid size-7 place-items-center rounded-md text-g-dim transition-colors hover:text-g-ink"
          >
            <RotateCw size={13} />
          </button>
          <a
            href={reduceMotion ? `${src}?reduce=1` : src}
            target="_blank"
            rel="noreferrer"
            title="Open at full size in a new tab"
            className="grid size-7 place-items-center rounded-md text-g-dim transition-colors hover:text-g-ink"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <div ref={shellRef} className="overflow-hidden bg-g-canvas">
        <div
          className="mx-auto"
          style={{
            width: active.width * scale,
            height: frameHeight * scale,
          }}
        >
          <iframe
            key={`${nonce}-${active.id}-${reduceMotion}`}
            src={reduceMotion ? `${src}?reduce=1` : src}
            title="Component preview"
            style={{
              width: active.width,
              height: frameHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="border-0 bg-white dark:bg-black"
          />
        </div>
      </div>
    </div>
  );
}
