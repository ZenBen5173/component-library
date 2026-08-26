"use client";

import type { ReactNode } from "react";
import { Avatar as AvatarRoot, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as BadgeRoot } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Shims for the pieces the original table imported from its host app.
 *
 * The port keeps the table's behaviour but drops its domain vocabulary — the
 * role/priority/status badges were specific to that product, so they collapse
 * into one tone-mapped Badge here.
 */

export const TABLE_PAGE_SIZE = 25;

type Tone = "default" | "secondary" | "destructive" | "outline";

const TONE_BY_VALUE: Record<string, Tone> = {
  active: "secondary", enabled: "secondary", approved: "secondary",
  completed: "secondary", published: "secondary", closed: "secondary",
  pending: "outline", draft: "outline", inactive: "outline",
  disabled: "outline", archived: "outline", cancelled: "outline",
  failed: "destructive", rejected: "destructive", expired: "destructive",
  overdue: "destructive", locked: "destructive",
  high: "destructive", medium: "outline", low: "secondary",
};

function toneFor(value: unknown): Tone {
  return TONE_BY_VALUE[String(value ?? "").toLowerCase()] ?? "outline";
}

function label(value: unknown) {
  const raw = String(value ?? "");
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[_-]/g, " ") : "—";
}

export function Badge({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
  variant?: string;
  size?: string;
}) {
  return (
    <BadgeRoot variant="outline" className={cn("text-[11px]", className)}>
      {children}
    </BadgeRoot>
  );
}

export function StatusBadge({ status }: { status?: unknown }) {
  return (
    <BadgeRoot variant={toneFor(status)} className="text-[11px]">
      {label(status)}
    </BadgeRoot>
  );
}

export function PriorityBadge({ priority }: { priority?: unknown }) {
  return (
    <BadgeRoot variant={toneFor(priority)} className="text-[11px]">
      {label(priority)}
    </BadgeRoot>
  );
}

export function RoleBadge({ role }: { role?: unknown }) {
  return (
    <BadgeRoot variant="outline" className="text-[11px]">
      {label(role)}
    </BadgeRoot>
  );
}

export function Avatar({
  src,
  name,
  className,
}: {
  src?: string;
  name?: string;
  className?: string;
  size?: string;
}) {
  const initials: string = (name ?? "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AvatarRoot className={cn("size-6", className)}>
      {src && <AvatarImage src={src} alt={name ?? ""} />}
      <AvatarFallback className="text-[9px]">{initials || "?"}</AvatarFallback>
    </AvatarRoot>
  );
}

export function EmptyState({
  title = "Nothing here",
  description,
  icon: Icon,
}: {
  title?: string;
  description?: string;
  icon?: React.ElementType | ReactNode;
}) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 grid size-10 place-items-center rounded-xl border border-border bg-muted text-muted-foreground [&_svg]:size-4">
          {typeof Icon === "function" ? <Icon /> : Icon}
        </div>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

/** Domain vocabularies the original imported from config; kept generic here. */
export const TASK_STATUSES = ["todo", "in_progress", "blocked", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const ROLES = ["owner", "admin", "member", "viewer"] as const;
export type Role = (typeof ROLES)[number];
