"use client";

/**
 * @name Testimonials
 * @description Two shapes — a scrolling wall that never stops, and a static three-up for when the words need reading.
 * @tags testimonials, social-proof, marquee, website, portfolio
 * @height 900
 * @deps react-fast-marquee
 * @note Hand-built on the Marquee component — the registries were unreachable when this was written. The scrolling wall pauses on hover so a quote can actually be read; without that it's decoration pretending to be evidence.
 * @source src/components/kibo-ui/marquee/index.tsx
 */
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Quote = {
  body: string;
  name: string;
  role: string;
  avatar: string;
};

const QUOTES: Quote[] = [
  { body: "Cut our deploy time from fifteen minutes to four. The preview URLs changed how the whole team reviews work.", name: "Ada Okafor", role: "Founder, Northbound", avatar: "https://i.pravatar.cc/96?img=47" },
  { body: "A bad migration went out on a Friday. Rolling back took one click and about nine seconds.", name: "Ravi Menon", role: "Principal Engineer, Ledgerline", avatar: "https://i.pravatar.cc/96?img=12" },
  { body: "Every pull request gets its own URL and its own database branch. Design reviews stopped needing a call.", name: "Lena Fischer", role: "Design Lead, Halcyon", avatar: "https://i.pravatar.cc/96?img=32" },
  { body: "Asked about edge caching at 2am and had a real answer, with a code sample, before standup.", name: "Tomas Silva", role: "CTO, Meridian", avatar: "https://i.pravatar.cc/96?img=15" },
  { body: "The part I didn't expect: six months later nobody has had to touch it.", name: "Mei Tanaka", role: "Platform, Fieldnote", avatar: "https://i.pravatar.cc/96?img=45" },
];

function QuoteCard({ quote, className }: { quote: Quote; className?: string }) {
  return (
    <figure
      className={
        "flex h-full w-[340px] flex-col justify-between rounded-xl border border-border bg-card p-5 " +
        (className ?? "")
      }
    >
      <blockquote className="text-[13px] leading-relaxed text-foreground">
        &ldquo;{quote.body}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-2.5">
        <Avatar className="size-7">
          <AvatarImage src={quote.avatar} alt="" />
          <AvatarFallback className="text-[9px]">
            {quote.name.split(" ").map((w) => w[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{quote.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {quote.role}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function TestimonialsDemo() {
  return (
    <div className="min-h-[900px] bg-background py-16">
      <div className="mb-10 px-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          What people say
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">
          Hover to stop and read one
        </h3>
      </div>

      <Marquee>
        <MarqueeFade side="left" />
        <MarqueeFade side="right" />
        <MarqueeContent speed={26}>
          {QUOTES.map((quote) => (
            <MarqueeItem key={quote.name} className="mx-2.5">
              <QuoteCard quote={quote} />
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>

      <Marquee className="mt-5">
        <MarqueeFade side="left" />
        <MarqueeFade side="right" />
        <MarqueeContent speed={20} direction="right">
          {[...QUOTES].reverse().map((quote) => (
            <MarqueeItem key={quote.name} className="mx-2.5">
              <QuoteCard quote={quote} />
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>

      <div className="mx-auto mt-16 max-w-4xl px-6">
        <p className="mb-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Static three-up
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUOTES.slice(0, 3).map((quote) => (
            <QuoteCard key={quote.name} quote={quote} className="w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
