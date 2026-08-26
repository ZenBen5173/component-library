"use client";

/**
 * @name Custom Cursor
 * @description A dot that tracks the pointer with a ring trailing on a spring, swelling over anything clickable. Plus labelled presence cursors for multiplayer.
 * @tags cursor, portfolio, micro-interaction, hover, must-have
 * @height 620
 * @deps motion
 * @note Two different things despite the name. The follower is the portfolio one; Kibo's Cursor is for showing other people's pointers in a shared document. The follower hides itself on touch devices and under reduced motion — a ring that lags is exactly what that setting exists to remove.
 * @source src/components/ui/cursor-follower.tsx
 * @source src/components/kibo-ui/cursor/index.tsx
 */
import {
  Cursor,
  CursorBody,
  CursorMessage,
  CursorName,
  CursorPointer,
} from "@/components/kibo-ui/cursor";
import { CursorFollower } from "@/components/ui/cursor-follower";

export default function CustomCursorDemo() {
  return (
    <div className="relative min-h-[620px] cursor-none bg-background p-10">
      <CursorFollower />

      <div className="mx-auto max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Move your pointer
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">
          The ring trails, then swells over anything you can click.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Hover the{" "}
          <a href="#" className="underline underline-offset-4">
            links
          </a>{" "}
          and{" "}
          <button type="button" className="underline underline-offset-4">
            buttons
          </button>{" "}
          in this paragraph, then anything marked with{" "}
          <span data-cursor className="underline underline-offset-4">
            data-cursor
          </span>
          .
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3">
          {["Meridian", "Ledgerline", "Halcyon", "Northbound"].map((project) => (
            <a
              key={project}
              href="#"
              className="rounded-xl border border-border p-5 transition-colors hover:bg-muted/40"
            >
              <p className="text-sm font-medium">{project}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Brand & site
              </p>
            </a>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="mb-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Presence cursors — for shared documents
          </p>
          <div className="relative h-24">
            <div className="absolute left-4 top-0">
              <Cursor>
                <CursorPointer className="text-sky-500" />
                <CursorBody className="bg-sky-500/15">
                  <CursorName className="text-sky-600 dark:text-sky-400">
                    Ada
                  </CursorName>
                  <CursorMessage>Editing the hero copy</CursorMessage>
                </CursorBody>
              </Cursor>
            </div>
            <div className="absolute left-52 top-10">
              <Cursor>
                <CursorPointer className="text-emerald-500" />
                <CursorBody className="bg-emerald-500/15">
                  <CursorName className="text-emerald-600 dark:text-emerald-400">
                    Ravi
                  </CursorName>
                </CursorBody>
              </Cursor>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
