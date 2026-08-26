"use client";

/**
 * @name Empty & Error States
 * @description Empty, no-results, error and 404 states — the screens every app needs and no registry ships.
 * @tags empty-state, error, 404, loading, app
 * @height 900
 * @note TODO — the 404 is the strongest of these. The icon-led ones read plain and generic; they need something beyond a centred glyph (illustration, motion, or an inline preview of the thing that's missing).
 */
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Inbox,
  Plus,
  RefreshCw,
  SearchX,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function State({
  icon: Icon,
  tone = "muted",
  title,
  body,
  children,
}: {
  icon: LucideIcon;
  tone?: "muted" | "danger";
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <div
        className={
          tone === "danger"
            ? "grid size-11 place-items-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive"
            : "grid size-11 place-items-center rounded-xl border border-border bg-muted text-muted-foreground"
        }
      >
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {body}
      </p>
      {children && <div className="mt-5 flex gap-2">{children}</div>}
    </div>
  );
}

export default function StatesDemo() {
  return (
    <div className="min-h-[900px] bg-background p-10">
      <div className="mx-auto grid max-w-xl gap-5">
        <State
          icon={Inbox}
          title="No projects yet"
          body="Create your first project to start deploying. It takes about a minute."
        >
          <Button size="sm">
            <Plus className="size-3.5" />
            New project
          </Button>
          <Button size="sm" variant="outline">
            Import from Git
          </Button>
        </State>

        <State
          icon={SearchX}
          title="No results for “analytics”"
          body="Try a shorter query, or clear your filters to see everything again."
        >
          <Button size="sm" variant="outline">
            Clear filters
          </Button>
        </State>

        <State
          icon={AlertTriangle}
          tone="danger"
          title="Couldn't load deploys"
          body="The request timed out after 30 seconds. This is usually temporary."
        >
          <Button size="sm" variant="outline">
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </State>

        <State
          icon={WifiOff}
          title="You're offline"
          body="We'll keep your unsaved changes and sync them the moment you reconnect."
        />

        <div className="grid place-items-center rounded-xl border border-border px-6 py-16 text-center">
          <p className="font-mono text-5xl font-semibold tracking-tight text-muted-foreground/40">
            404
          </p>
          <p className="mt-4 text-sm font-medium">This page doesn't exist</p>
          <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
            The link may be broken, or the project was renamed or deleted.
          </p>
          <Button size="sm" variant="outline" className="mt-5">
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
