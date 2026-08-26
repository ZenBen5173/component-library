"use client";

/**
 * @name Solar System
 * @description Tech-stack orbit: labelled nodes revolve on concentric rings around a centre logo, pausable on hover.
 * @tags cool, orbit, tech-stack, animated, showcase, portfolio
 * @height 760
 * @note Recovered by hand — vengenceui documents this component and publishes an install command, but /r/solar-system.json 404s, so the CLI cannot fetch it. Source lifted from their component page. Re-run the CLI if they ever ship the registry file.
 * @source src/components/ui/solar-system.tsx
 */
import { SolarSystem } from "@/components/ui/solar-system";

export default function SolarSystemDemo() {
  return (
    <div className="grid min-h-[760px] w-full place-items-center bg-background">
      <SolarSystem />
    </div>
  );
}
