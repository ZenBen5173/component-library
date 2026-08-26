"use client";

/**
 * @name Confirm Delete
 * @description Type-to-confirm dialog for irreversible actions — each field unlocks the next, and the button stays dead until every one matches.
 * @tags dialog, confirm, destructive, danger-zone, form, app, must-have
 * @height 620
 * @note The friction is the point: muscle memory can click a red button, it cannot type a resource name by accident. Matching is exact — no trimming, no case folding — because being lenient defeats the purpose. Fields reset every time the dialog opens, so a half-typed name never survives as a head start. Also called a danger zone, after GitHub's.
 * @source src/components/ui/confirm-delete.tsx
 */
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

export default function ConfirmDeleteDemo() {
  const [single, setSingle] = useState(false);
  const [strict, setStrict] = useState(false);
  const [deleted, setDeleted] = useState<string | null>(null);

  return (
    <div className="flex min-h-[620px] flex-col items-center justify-center gap-8 bg-background p-10">
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Danger zone
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          One field is usual. Two is the strict version, where the second only
          wakes up once the first matches.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="destructive" onClick={() => setSingle(true)}>
          <Trash2 className="size-4" />
          Delete repository
        </Button>
        <Button variant="outline" onClick={() => setStrict(true)}>
          Delete project (strict)
        </Button>
      </div>

      {deleted && (
        <p className="text-xs text-muted-foreground">
          Confirmed: <span className="text-foreground">{deleted}</span>
        </p>
      )}

      <ConfirmDelete
        open={single}
        onOpenChange={setSingle}
        title="Delete repository"
        description="This will permanently delete component-library and everything in it. This cannot be undone."
        fields={[{ expect: "component-library" }]}
        confirmLabel="Delete repository"
        onConfirm={() => setDeleted("component-library")}
      />

      <ConfirmDelete
        open={strict}
        onOpenChange={setStrict}
        title="Delete Project"
        description="This will permanently delete the project and related resources like Deployments, Domains and Environment Variables."
        fields={[
          { expect: "uniguide" },
          { expect: "delete my project" },
        ]}
        warnings={[
          "Deleting won't revoke the secrets in these environment variables. Revoke them at the source.",
          "Deleting uniguide cannot be undone.",
        ]}
        confirmLabel="Delete Project"
        onConfirm={() => setDeleted("uniguide")}
      />
    </div>
  );
}
