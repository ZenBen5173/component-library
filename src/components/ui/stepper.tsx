"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = {
  /** Short label shown under (or beside) the indicator. */
  label: string;
  /** Optional second line of detail. */
  description?: string;
};

export type StepperProps = {
  steps: Step[];
  /** Zero-based index of the active step. Steps before it render as complete. */
  current: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
};

/**
 * Stepper / wizard progress.
 *
 * Written for this library — no shadcn-compatible registry ships one. The
 * connector fills with a spring rather than snapping, and the completed tick
 * scales in, so progress reads as movement instead of a state swap.
 */
export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  className,
}: StepperProps) {
  const vertical = orientation === "vertical";

  return (
    <ol
      className={cn(
        "flex",
        vertical ? "flex-col gap-0" : "w-full items-start",
        className,
      )}
    >
      {steps.map((step, index) => {
        const complete = index < current;
        const active = index === current;
        const last = index === steps.length - 1;

        return (
          <li
            key={step.label}
            className={cn(
              "relative flex",
              vertical ? "gap-4 pb-8 last:pb-0" : "flex-1 flex-col last:flex-none",
            )}
          >
            <div className={cn("flex items-center", vertical && "flex-col")}>
              <motion.span
                initial={false}
                animate={{
                  scale: active ? 1.1 : 1,
                  backgroundColor: complete || active ? "var(--primary)" : "var(--muted)",
                  color: complete || active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-medium tabular-nums"
              >
                {complete ? (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Check className="size-4" />
                  </motion.span>
                ) : (
                  index + 1
                )}
              </motion.span>

              {!last && (
                <span
                  className={cn(
                    "relative overflow-hidden rounded-full bg-muted",
                    vertical ? "my-1 h-full min-h-8 w-0.5 flex-1" : "mx-3 h-0.5 flex-1",
                  )}
                >
                  <motion.span
                    initial={false}
                    animate={
                      vertical
                        ? { height: complete ? "100%" : "0%" }
                        : { width: complete ? "100%" : "0%" }
                    }
                    transition={{ type: "spring", stiffness: 160, damping: 26 }}
                    className="absolute left-0 top-0 block bg-primary"
                    style={vertical ? { width: "100%" } : { height: "100%" }}
                  />
                </span>
              )}
            </div>

            <div className={cn(vertical ? "pt-1" : "mt-3 pr-6")}>
              <p
                className={cn(
                  "text-sm font-medium transition-colors",
                  active || complete ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
