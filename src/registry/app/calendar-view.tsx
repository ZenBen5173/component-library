/**
 * @name Calendar View
 * @description Full event calendar — month, week, day, year and agenda views, with drag-to-move, resize and event editing.
 * @tags calendar, schedule, events, drag-drop, app
 * @height 900
 * @deps motion, date-fns, re-resizable
 * @note Replaced Kibo's static month grid. This one is a server component that loads its own mock events, so this entry has no "use client" — switch views from the header, drag an event to move it, drag its edge to resize.
 * @source src/components/calendar.tsx
 * @source src/components/calendar-context.tsx
 * @source src/components/calendar-body.tsx
 */
import { Calendar } from "@/components/calendar";

export default function CalendarViewDemo() {
  return (
    <div className="min-h-[900px] bg-background p-6">
      <Calendar />
    </div>
  );
}
