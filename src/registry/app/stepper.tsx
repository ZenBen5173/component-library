"use client";

/**
 * @name Stepper — Horizontal
 * @description Multi-step wizard progress — connector fills on a spring, completed tick scales in.
 * @tags stepper, wizard, progress, onboarding, checkout, app
 * @height 480
 * @deps motion
 * @note Horizontal only — the vertical variant of this one didn't connect properly, so vertical lives in its own entry using SmoothUI's stepper instead. Drive this from form state via `current`.
 * @source src/components/ui/stepper.tsx
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";

const STEPS = [
  { label: "Account", description: "Email and password" },
  { label: "Workspace", description: "Name and region" },
  { label: "Team", description: "Invite collaborators" },
  { label: "Done", description: "Start deploying" },
];

export default function StepperDemo() {
  const [current, setCurrent] = useState(1);

  return (
    <div className="min-h-[480px] bg-background p-10">
      <div className="mx-auto grid max-w-2xl gap-12">
        <div>
          <Stepper steps={STEPS} current={current} />

          <div className="mt-8 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              Back
            </Button>
            <Button
              size="sm"
              disabled={current === STEPS.length - 1}
              onClick={() =>
                setCurrent((c) => Math.min(STEPS.length - 1, c + 1))
              }
            >
              Continue
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
