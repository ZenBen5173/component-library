"use client";

/**
 * @name Spotlight Card
 * @description Card with a radial glow that tracks the cursor and a border that lights up on hover.
 * @tags card, hover, spotlight, dark
 * @height 420
 */
import { useRef, useState } from "react";

export default function SpotlightCard({
  title = "Edge caching",
  body = "Responses are served from the node nearest your user, so cold starts stop being a tail-latency problem.",
}: {
  title?: string;
  body?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  return (
    <div className="grid min-h-[420px] place-items-center bg-background p-8">
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-8 transition-colors duration-300 hover:border-foreground/20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: visible ? 1 : 0,
            background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, rgba(99,102,241,0.18), transparent 70%)`,
          }}
        />

        <div className="relative">
          <div className="grid size-9 place-items-center rounded-lg border border-border bg-muted">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-4 text-primary"
            >
              <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="mt-5 text-base font-medium text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </div>
    </div>
  );
}
