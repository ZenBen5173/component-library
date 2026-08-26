"use client";

/**
 * @name Logo Marquee
 * @description Continuously scrolling strip of client logos, pausing on hover, with the edges faded out.
 * @tags marquee, logos, social-proof, portfolio, website, ticker
 * @height 420
 * @deps react-fast-marquee
 * @note Covers both jobs — a logo cloud that moves, and a ticker for any repeating row. Set `autoFill` so short lists still fill the width instead of leaving a gap.
 * @source src/components/kibo-ui/marquee/index.tsx
 */
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";

const CLIENTS = [
  "Meridian", "Ledgerline", "Halcyon", "Northbound",
  "Fieldnote", "Vantage", "Kestrel", "Lumen",
];

export default function LogoMarqueeDemo() {
  return (
    <div className="grid min-h-[420px] place-items-center bg-background">
      <div className="w-full">
        <p className="mb-8 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by
        </p>

        <Marquee>
          <MarqueeFade side="left" />
          <MarqueeFade side="right" />
          <MarqueeContent speed={30}>
            {CLIENTS.map((name) => (
              <MarqueeItem key={name} className="mx-8">
                <span className="text-xl font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground">
                  {name}
                </span>
              </MarqueeItem>
            ))}
          </MarqueeContent>
        </Marquee>

        <Marquee className="mt-6">
          <MarqueeFade side="left" />
          <MarqueeFade side="right" />
          <MarqueeContent speed={22} direction="right">
            {["Design", "Motion", "Frontend", "Systems", "Brand", "Prototyping"].map(
              (word) => (
                <MarqueeItem key={word} className="mx-4">
                  <span className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
                    {word}
                  </span>
                </MarqueeItem>
              ),
            )}
          </MarqueeContent>
        </Marquee>
      </div>
    </div>
  );
}
