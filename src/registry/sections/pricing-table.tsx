"use client";

/**
 * @name Pricing Table
 * @description Three tiers with a monthly/annual toggle, prices that roll rather than swap, and one plan marked out.
 * @tags pricing, saas, website, toggle, marketing
 * @height 900
 * @deps motion, @number-flow/react
 * @note Hand-built — the block registries were unreachable when this was written. Prices roll with NumberFlow rather than cutting, so switching billing reads as a change rather than a re-render. The highlighted tier is the middle one on purpose: it's the one people pick when it isn't the cheapest or the most.
 */
import { useState } from "react";
import NumberFlow from "@number-flow/react";
import { Check, Minus } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Hobby",
    monthly: 0,
    blurb: "For side projects and trying things out.",
    features: ["1 project", "Preview deploys", "Community support", "1 GB bandwidth"],
    missing: ["Custom domains", "Audit logs"],
    cta: "Start free",
  },
  {
    name: "Pro",
    monthly: 20,
    blurb: "For people shipping work that other people rely on.",
    features: ["Unlimited projects", "Preview deploys", "Custom domains", "100 GB bandwidth", "Email support"],
    missing: ["Audit logs"],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Team",
    monthly: 60,
    blurb: "For teams who need to see who changed what.",
    features: ["Everything in Pro", "Audit logs", "SSO", "1 TB bandwidth", "Priority support"],
    missing: [],
    cta: "Talk to us",
  },
];

export default function PricingTableDemo() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-[900px] bg-background px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h3 className="text-2xl font-semibold tracking-tight">
            Priced per person, not per deploy
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Ship as often as you like. Annual billing saves two months.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative flex rounded-full border border-border p-1 text-xs">
            {[
              { label: "Monthly", value: false },
              { label: "Annual", value: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setAnnual(option.value)}
                className="relative rounded-full px-4 py-1.5 font-medium"
              >
                {annual === option.value && (
                  <motion.span
                    layoutId="billing-pill"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="absolute inset-0 rounded-full bg-foreground"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 transition-colors",
                    annual === option.value
                      ? "text-background"
                      : "text-muted-foreground",
                  )}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => {
            const price = annual ? Math.round(tier.monthly * 10) / 12 : tier.monthly;

            return (
              <div
                key={tier.name}
                className={cn(
                  "relative flex flex-col rounded-xl border p-6",
                  tier.featured
                    ? "border-primary/50 bg-card shadow-[0_0_0_1px_var(--primary)]"
                    : "border-border bg-card",
                )}
              >
                {tier.featured && (
                  <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary-foreground">
                    Most picked
                  </span>
                )}

                <p className="text-sm font-medium">{tier.name}</p>
                <p className="mt-1 min-h-[32px] text-xs leading-relaxed text-muted-foreground">
                  {tier.blurb}
                </p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tabular-nums">
                    $<NumberFlow value={price} />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    /month{annual && ", billed yearly"}
                  </span>
                </div>

                <Button
                  className="mt-5 w-full"
                  variant={tier.featured ? "default" : "outline"}
                >
                  {tier.cta}
                </Button>

                <ul className="mt-6 grid gap-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {tier.missing.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-muted-foreground/60"
                    >
                      <Minus className="mt-0.5 size-3.5 shrink-0" />
                      <span className="line-through">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
