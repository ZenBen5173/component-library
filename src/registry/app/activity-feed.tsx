"use client";

/**
 * @name Activity Feed
 * @description Chronological event stream with relative timestamps that keep themselves current, plus a notification bell with an unread count.
 * @tags activity, feed, notifications, timeline, app
 * @height 680
 * @note Events carry a `type` string, not an icon component — real events arrive as JSON and a component cannot travel in JSON — and the caller maps types to icons, with a fallback so an unknown type cannot take the feed down. Times are ISO strings, rendered only after mount: computing them during render makes the server and client disagree about "2m ago" and breaks hydration. They refresh on an interval, so a row does not still claim "3m ago" an hour later.
 * @source src/components/ui/activity-feed.tsx
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
import { ActivityFeed, type ActivityEvent } from "@/components/ui/activity-feed";
import { Button } from "@/components/ui/button";

/** What an API would send: a string, not a component. */
const ICONS = {
  deploy: Rocket,
  commit: GitCommit,
  invite: UserPlus,
  security: ShieldCheck,
};

/**
 * Minute offsets, turned into ISO strings after mount.
 *
 * A feed demo wants recent times, but a date computed during render differs
 * between server and client and breaks hydration — and fixed dates go stale,
 * so the sample ends up claiming everything happened last week. Offsets stay
 * deterministic; the timestamps are built once the component is on the client.
 * Yours come from the server already formed.
 */
const SAMPLE: (Omit<ActivityEvent, "at"> & { minutesAgo: number })[] = [
  {
    id: 1,
    type: "deploy",
    who: "Ada Okafor",
    avatar: "https://i.pravatar.cc/64?img=47",
    what: "deployed",
    target: "acme-dashboard",
    minutesAgo: 3,
  },
  {
    id: 2,
    type: "commit",
    who: "Ravi Menon",
    avatar: "https://i.pravatar.cc/64?img=12",
    what: "pushed 4 commits to",
    target: "main",
    minutesAgo: 21,
  },
  {
    id: 3,
    type: "invite",
    who: "Lena Fischer",
    avatar: "https://i.pravatar.cc/64?img=32",
    what: "invited",
    target: "tomas@acme.com",
    minutesAgo: 96,
  },
  {
    id: 4,
    // Deliberately unmapped, to show the fallback rather than a crash.
    type: "audit",
    who: "Tomas Silva",
    avatar: "https://i.pravatar.cc/64?img=15",
    what: "rotated credentials for",
    target: "acme-api",
    minutesAgo: 340,
  },
];

export default function ActivityFeedDemo() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const now = Date.now();
    setEvents(
      SAMPLE.map(({ minutesAgo, ...rest }) => ({
        ...rest,
        at: new Date(now - minutesAgo * 60_000).toISOString(),
      })),
    );
  }, []);

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

        <ActivityFeed events={events} icons={ICONS} />
      </div>
    </div>
  );
}
