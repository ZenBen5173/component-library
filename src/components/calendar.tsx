import React from "react";
import { CalendarBody } from "@/components/calendar-body";
import { CalendarProvider } from "@/components/calendar-context";
import { DndProvider } from "@/components/dnd-context";
import { CalendarHeader } from "@/components/calendar-header";
import { getEvents, getUsers } from "@/components/requests";

async function getCalendarData() {
  return {
    events: await getEvents(),
    users: await getUsers(),
  };
}

export async function Calendar() {
  const { events, users } = await getCalendarData();

  return (
    <CalendarProvider events={events} users={users} view="month">
      <DndProvider>
        <div className="w-full border rounded-xl">
          <CalendarHeader />
          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  );
}
