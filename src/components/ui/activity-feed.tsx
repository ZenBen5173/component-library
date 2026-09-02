"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * A chronological event stream.
 *
 * Events carry a `type` string rather than an icon component, because real
 * events arrive as JSON from a server and a React component cannot travel in
 * JSON. The caller supplies a `type → icon` map; anything unmapped falls back
 * rather than crashing the feed.
 *
 * Times are ISO strings — what an API actually returns — and are rendered only
 * after mount. Computing them during render makes the server and the client
 * disagree about "2m ago" and breaks hydration.
 */

export type ActivityEvent = {
  id: string | number;
  /** Looked up in `icons`. Free-form, so it can be whatever the API sends. */
  type: string;
  who: string;
  avatar?: string;
  /** The verb: "deployed", "pushed 4 commits to". */
  what: string;
  /** What it happened to. */
  target?: string;
  /** ISO 8601. */
  at: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Whole units only — "1h ago", never "1.4h ago". */
function relative(iso: string, now: number) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.max(0, Math.round((now - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function ActivityFeed({
  events,
  icons = {},
  fallbackIcon = Activity,
  /** How often the times refresh, in ms. Set 0 to leave them alone. */
  refreshMs = 30_000,
  emptyState,
  className,
}: {
  events: ActivityEvent[];
  icons?: Record<string, LucideIcon>;
  fallbackIcon?: LucideIcon;
  refreshMs?: number;
  emptyState?: React.ReactNode;
  className?: string;
}) {
  // null until mounted, so the server renders no time at all rather than one
  // the client will immediately disagree with.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (!refreshMs) return;
    // Without this the feed says "3m ago" an hour later.
    const id = setInterval(() => setNow(Date.now()), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  if (events.length === 0) {
    return (
      <div className={cn("py-10 text-center", className)}>
        {emptyState ?? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        )}
      </div>
    );
  }

  return (
    <ol className={className}>
      {events.map((event, index) => {
        const Icon = icons[event.type] ?? fallbackIcon;
        const last = index === events.length - 1;

        return (
          <li key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground">
                <Icon className="size-3" />
              </span>
              {!last && <span className="my-1 w-px flex-1 bg-border" />}
            </div>

            <div className={cn("flex flex-1 items-start gap-3", last ? "pb-1" : "pb-7")}>
              <Avatar className="size-6">
                {event.avatar && <AvatarImage src={event.avatar} alt="" />}
                <AvatarFallback className="text-[9px]">
                  {initials(event.who)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="text-sm leading-snug">
                  <span className="font-medium">{event.who}</span>{" "}
                  <span className="text-muted-foreground">{event.what}</span>
                  {event.target && (
                    <>
                      {" "}
                      <span className="font-medium">{event.target}</span>
                    </>
                  )}
                </p>
                {/* Reserved height, so the row does not jump when the time
                    appears after mount. */}
                <p className="mt-0.5 min-h-4 text-xs text-muted-foreground">
                  {now !== null && (
                    <time dateTime={event.at}>{relative(event.at, now)}</time>
                  )}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
