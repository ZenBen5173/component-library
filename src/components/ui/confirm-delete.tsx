"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Type-to-confirm dialog for irreversible actions.
 *
 * The friction is the feature: muscle memory can click a red button, but it
 * cannot type a resource's name by accident. Each field only unlocks once the
 * one above it matches exactly — case included, since a name is a name.
 *
 * Confirmation is compared against the raw value with no trimming or case
 * folding. Being lenient here would defeat the point.
 */
export type ConfirmField = {
  /** The exact string the person has to reproduce. */
  expect: string;
  /** Shown above the field. Defaults to a sentence naming what to type. */
  label?: React.ReactNode;
};

export function ConfirmDelete({
  open,
  onOpenChange,
  title = "Delete project",
  description,
  fields,
  warnings,
  confirmLabel = "Delete project",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  /** One field is usual; Vercel asks for two. Order is the order they unlock. */
  fields: ConfirmField[];
  /** Consequences worth stating before the button turns on. */
  warnings?: React.ReactNode[];
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const [values, setValues] = useState<string[]>(() => fields.map(() => ""));
  const firstRef = useRef<HTMLInputElement>(null);

  // Reset between openings — a half-typed name left over from last time would
  // be a nasty head start on a destructive action.
  useEffect(() => {
    if (open) {
      setValues(fields.map(() => ""));
      const id = window.setTimeout(() => firstRef.current?.focus(), 80);
      return () => window.clearTimeout(id);
    }
  }, [open, fields]);

  const matched = fields.map((f, i) => values[i] === f.expect);
  const readyAt = (i: number) => i === 0 || matched.slice(0, i).every(Boolean);
  const armed = matched.every(Boolean);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <AlertDialogHeader className="space-y-2 p-6">
          <AlertDialogTitle className="font-display text-xl">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="leading-relaxed">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <div className="space-y-4 border-t border-border px-6 py-5">
          {fields.map((field, i) => {
            const enabled = readyAt(i);
            const done = matched[i];
            return (
              <div
                key={field.expect}
                className={cn(
                  "transition-opacity duration-200",
                  !enabled && "pointer-events-none opacity-40",
                )}
              >
                <label className="text-sm text-muted-foreground">
                  {field.label ?? (
                    <>
                      To confirm, type{" "}
                      <span className="font-medium text-foreground">
                        “{field.expect}”
                      </span>
                    </>
                  )}
                </label>
                <div className="relative mt-2">
                  <Input
                    ref={i === 0 ? firstRef : undefined}
                    value={values[i]}
                    disabled={!enabled}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) =>
                      setValues((prev) =>
                        prev.map((v, j) => (j === i ? e.target.value : v)),
                      )
                    }
                    className={cn("pr-9", done && "border-emerald-500/60")}
                  />
                  <AnimatePresence>
                    {done && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{
                          duration: DURATION.fast,
                          ease: EASE.expressive,
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                      >
                        <Check className="size-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {warnings && warnings.length > 0 && (
          <div className="space-y-2 border-t border-border px-6 py-4">
            {warnings.map((warning, i) => (
              <p
                key={i}
                className={cn(
                  "flex gap-2 rounded-md border px-3 py-2 text-xs leading-relaxed",
                  i === warnings.length - 1
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-500",
                )}
              >
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>{warning}</span>
              </p>
            ))}
          </div>
        )}

        <AlertDialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          {/* Deliberately not AlertDialogAction: that closes the dialog on
              click regardless, and a disabled-until-typed button should not
              be wired to something that dismisses either way. */}
          <Button
            variant="destructive"
            disabled={!armed}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="transition-opacity disabled:opacity-40"
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
