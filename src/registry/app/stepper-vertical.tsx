"use client";

/**
 * @name Stepper — Vertical
 * @description Vertical wizard where the rail fills between steps and each step's content panel expands in place.
 * @tags stepper, wizard, vertical, onboarding, app
 * @height 720
 * @deps motion
 * @note From SmoothUI, not the horizontal one — my own vertical rail stopped ~70px short of the next circle and never visually connected. Kept as a separate entry so the horizontal version stays untouched.
 * @source src/components/smoothui/animated-stepper/index.tsx
 */
import AnimatedStepper from "@/components/smoothui/animated-stepper";

const STEPS = [
  {
    label: "Account",
    description: "Email and password",
    content: (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Create your login. We'll send a verification link before anything is
        provisioned.
      </p>
    ),
  },
  {
    label: "Workspace",
    description: "Name and region",
    content: (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Pick the region closest to your users — it sets where builds run and
        where data is stored at rest.
      </p>
    ),
  },
  {
    label: "Team",
    description: "Invite collaborators",
    content: (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Invite by email now, or skip and add people once the first deploy is
        live.
      </p>
    ),
  },
  {
    label: "Done",
    description: "Start deploying",
    content: (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Push to your connected branch and the first build starts automatically.
      </p>
    ),
  },
];

export default function StepperVerticalDemo() {
  return (
    <div className="min-h-[720px] bg-background p-10">
      <div className="mx-auto max-w-xl">
        <AnimatedStepper steps={STEPS} variant="vertical" allowClickNavigation />
      </div>
    </div>
  );
}
