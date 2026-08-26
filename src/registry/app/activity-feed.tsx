"use client";

/**
 * @name Activity Feed
 * @description Chronological event stream with self-updating relative timestamps, plus a notification bell with an unread count.
 * @tags activity, feed, notifications, timeline, app
 * @height 680
 * @note Timestamps are stored as plain minute offsets and rendered after mount — computing dates during render makes server and client disagree and breaks hydration.
 * @source src/components/kibo-ui/announcement/index.tsx
 * @source src/components/smoothui/notification-badge/index.tsx
 */
import { useEffect, useState } from "react";
import { Bell, GitCommit, Rocket, ShieldCheck, UserPlus } from "lucide-react";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/kibo-ui/announcement";
import NotificationBadge from "@/components/smoothui/notification-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function relative(minutes: number) {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const EVENTS = [
  { id: 1, icon: Rocket, who: "Ada Okafor", avatar: "https://i.pravatar.cc/64?img=47", what: "deployed", target: "acme-dashboard", minutes: 3 },
  { id: 2, icon: GitCommit, who: "Ravi Menon", avatar: "https://i.pravatar.cc/64?img=12", what: "pushed 4 commits to", target: "main", minutes: 21 },
  { id: 3, icon: UserPlus, who: "Lena Fischer", avatar: "https://i.pravatar.cc/64?img=32", what: "invited", target: "tomas@acme.com", minutes: 96 },
  { id: 4, icon: ShieldCheck, who: "Tomas Silva", avatar: "https://i.pravatar.cc/64?img=15", what: "rotated credentials for", target: "acme-api", minutes: 340 },
];

export default function ActivityFeedDemo() {
  // Timestamps render only after mount so server and client agree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-[680px] bg-background p-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <Announcement>
            <AnnouncementTag>New</AnnouncementTag>
            <AnnouncementTitle>Audit logs are now available</AnnouncementTitle>
          </Announcement>

          <NotificationBadge count={12} ping>
            <Button variant="outline" size="icon">
              <Bell className="size-4" />
            </Button>
          </NotificationBadge>
        </div>

        <ol>
          {EVENTS.map((event, index) => (
            <li key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground">
                  <event.icon className="size-3" />
                </span>
                {index < EVENTS.length - 1 && (
                  <span className="my-1 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="flex flex-1 items-start gap-3 pb-7">
                <Avatar className="size-6">
                  <AvatarImage src={event.avatar} alt="" />
                  <AvatarFallback className="text-[9px]">
                    {event.who
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{event.who}</span>{" "}
                    <span className="text-muted-foreground">{event.what}</span>{" "}
                    <span className="font-medium">{event.target}</span>
                  </p>
                  <p className="mt-0.5 min-h-[16px] text-xs text-muted-foreground">
                    {mounted ? relative(event.minutes) : ""}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
