import { CalendarHeaderSkeleton } from "@/components/calendar-header-skeleton";
import { MonthViewSkeleton } from "@/components/month-view-skeleton";

export function CalendarSkeleton() {
  return (
    <div className="container mx-auto">
      <div className="flex h-screen flex-col">
        <CalendarHeaderSkeleton />
        <div className="flex-1">
          <MonthViewSkeleton />
        </div>
      </div>
    </div>
  );
}
