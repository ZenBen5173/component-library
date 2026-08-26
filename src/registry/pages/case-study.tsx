"use client";

/**
 * @name Case Study
 * @description The page a project index links to — sticky meta rail, alternating image and text, pull quote, results, and next-project navigation.
 * @tags case-study, portfolio, project, layout, must-have
 * @height 2400
 * @deps motion
 * @note The gap you couldn't work around: three ways to list work, no way to show one. A layout rather than a component — take the structure and replace the content. The meta rail sticks while the body scrolls, which is what stops a long case study feeling like an essay.
 */
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Marquee, MarqueeContent, MarqueeFade, MarqueeItem } from "@/components/kibo-ui/marquee";
import { tween } from "@/lib/motion";

const META = [
  ["Client", "Meridian"],
  ["Year", "2026"],
  ["Role", "Design & Frontend"],
  ["Stack", "Next.js, Postgres"],
  ["Duration", "11 weeks"],
];

const RESULTS = [
  ["4m 05s", "median build, from 15m 20s"],
  ["11", "releases a week, from 2"],
  ["9s", "to roll back, from 41m"],
];

const SECTIONS = [
  {
    title: "The problem",
    body: "Meridian shipped twice a week and dreaded both. Fifteen-minute builds, failures nobody could reproduce, and a rollback plan that was a person who knew which commit to revert.",
    image: "https://picsum.photos/seed/cs-problem/1200/800",
  },
  {
    title: "What we found",
    body: "The pipeline wasn't slow, it was repetitive. Three of the fifteen minutes were work; the rest was the same dependency tree resolved four times across four jobs that each started from nothing.",
    image: "https://picsum.photos/seed/cs-found/1200/800",
  },
  {
    title: "The fix",
    body: "One cached install shared across jobs, type checking moved off the critical path, a preview URL per pull request, and rollback that promotes a previous build instead of reverting source.",
    image: "https://picsum.photos/seed/cs-fix/1200/800",
  },
];

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...tween("slow"), delay }}
    >
      {children}
    </motion.div>
  );
}

export default function CaseStudyDemo() {
  return (
    <div className="min-h-[2400px] bg-background">
      {/* Hero */}
      <header className="border-b border-border px-6 pb-14 pt-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Case study
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Rebuilding a deploy pipeline nobody trusted
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Making deploying boring — and in doing so, making it frequent.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-14 lg:grid-cols-[200px_1fr]">
        {/* Sticky meta rail */}
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <dl className="grid gap-5">
            {META.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4"
          >
            Visit site
            <ArrowUpRight className="size-3.5" />
          </a>
        </aside>

        {/* Body */}
        <div className="grid gap-16">
          {SECTIONS.map((section, i) => (
            <Reveal key={section.title}>
              <section>
                <h2 className="text-lg font-medium tracking-tight">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
                <div className="mt-6 overflow-hidden rounded-xl border border-border">
                  <img
                    src={section.image}
                    alt=""
                    className="aspect-[3/2] w-full object-cover"
                  />
                </div>
                <p className="mt-2.5 text-[11px] text-muted-foreground">
                  Fig. {i + 1} — {section.title.toLowerCase()}
                </p>
              </section>
            </Reveal>
          ))}

          <Reveal>
            <blockquote className="border-l-2 border-primary pl-6">
              <p className="text-xl font-medium leading-snug tracking-tight">
                &ldquo;The build wasn&rsquo;t waiting on the code. It was waiting
                on itself.&rdquo;
              </p>
              <footer className="mt-3 text-xs text-muted-foreground">
                Ravi Menon — Principal Engineer
              </footer>
            </blockquote>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="text-lg font-medium tracking-tight">Results</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {RESULTS.map(([figure, caption]) => (
                  <div key={figure} className="rounded-xl border border-border p-5">
                    <p className="text-2xl font-semibold tabular-nums">{figure}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {caption}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        </div>
      </div>

      {/* Tools used */}
      <div className="border-y border-border py-8">
        <Marquee>
          <MarqueeFade side="left" />
          <MarqueeFade side="right" />
          <MarqueeContent speed={24}>
            {["Next.js", "Postgres", "Turborepo", "Playwright", "Figma", "Linear"].map(
              (tool) => (
                <MarqueeItem key={tool} className="mx-6">
                  <span className="text-sm text-muted-foreground">{tool}</span>
                </MarqueeItem>
              ),
            )}
          </MarqueeContent>
        </Marquee>
      </div>

      {/* Next project */}
      <a href="#" className="group block px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Next project
          </p>
          <div className="mt-3 flex items-baseline justify-between gap-6">
            <h2 className="text-3xl font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-4xl">
              Ledgerline
            </h2>
            <ArrowUpRight className="size-7 shrink-0 text-muted-foreground transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Design system and marketing site for a payments startup
          </p>
        </div>
      </a>
    </div>
  );
}
