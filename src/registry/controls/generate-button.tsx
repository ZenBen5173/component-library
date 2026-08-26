"use client";

/**
 * @name Generate Button
 * @description Pill button with a travelling border light and letters that lift one after another while it works.
 * @tags button, hover, micro-interaction, ai, cta, portfolio, versatile
 * @height 520
 * @note Upstream hard-codes the words "Generate" and "Generating", which makes it an AI-demo button and nothing else. Patched locally to take `label` and `activeLabel`, so it works as any primary action — reapply that if `npx shadcn add` ever overwrites the file. `hue` shifts the border light; leaving `isGenerating` unset lets it drive itself from focus.
 * @source src/components/ui/generate-button.tsx
 */
import { useState } from "react";
import { GenerateButton } from "@/components/ui/generate-button";

export default function GenerateButtonDemo() {
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center gap-10 bg-background p-10">
      <div className="flex flex-col items-center gap-3">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Driving itself from focus
        </p>
        <GenerateButton />
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Its own label, and a controlled state
        </p>
        <GenerateButton
          label="New task"
          activeLabel="Adding"
          hue={265}
          isGenerating={busy}
          onClick={() => {
            setBusy(true);
            window.setTimeout(() => setBusy(false), 1800);
          }}
        />
      </div>

      <div className="flex items-center gap-6">
        {[10, 140, 300].map((hue) => (
          <GenerateButton key={hue} hue={hue} label="Run" activeLabel="Running" />
        ))}
      </div>
    </div>
  );
}
