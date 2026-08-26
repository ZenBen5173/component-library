"use client";

/**
 * @name Date Picker
 * @description Full month calendar in a popover, plus a compact inline strip for picking a day near today.
 * @tags date, calendar, picker, form, app
 * @height 620
 * @deps react-day-picker, date-fns
 * @note Two shapes for two jobs — the popover when any date is possible, the strip when it's almost always this week. The strip avoids opening an overlay at all.
 * @source src/components/ui/calendar.tsx
 * @source src/components/kibo-ui/mini-calendar/index.tsx
 */
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@/components/kibo-ui/mini-calendar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [quick, setQuick] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-[620px] bg-background p-10">
      <div className="mx-auto grid max-w-sm gap-12">
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Popover calendar
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <CalendarIcon className="size-4" />
                {date ? date.toLocaleDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Inline strip
          </p>
          <MiniCalendar value={quick} onValueChange={setQuick} days={5}>
            <MiniCalendarNavigation direction="prev" />
            <MiniCalendarDays>
              {(day) => <MiniCalendarDay date={day} key={day.toISOString()} />}
            </MiniCalendarDays>
            <MiniCalendarNavigation direction="next" />
          </MiniCalendar>
          <p className="mt-3 text-xs text-muted-foreground">
            {quick ? quick.toDateString() : "Nothing selected"}
          </p>
        </div>
      </div>
    </div>
  );
}
