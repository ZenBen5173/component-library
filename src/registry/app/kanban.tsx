"use client";

/**
 * @name Kanban Board
 * @description Drag-and-drop board — cards move between columns with pointer and keyboard, backed by dnd-kit.
 * @tags kanban, board, drag-drop, dnd-kit, app
 * @height 620
 * @deps @dnd-kit/core, @dnd-kit/sortable
 * @note Keyboard accessible, which most kanban implementations aren't — tab to a card, space to lift, arrows to move.
 * @source src/components/kibo-ui/kanban/index.tsx
 */
import { useState } from "react";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const COLUMNS = [
  { id: "todo", name: "Todo" },
  { id: "doing", name: "In progress" },
  { id: "review", name: "In review" },
  { id: "done", name: "Done" },
];

type Task = {
  id: string;
  name: string;
  column: string;
  owner: string;
  avatar: string;
  priority: "low" | "med" | "high";
};

const TASKS: Task[] = [
  { id: "1", name: "Migrate auth to edge runtime", column: "doing", owner: "AO", avatar: "https://i.pravatar.cc/64?img=47", priority: "high" },
  { id: "2", name: "Fix flaky deploy test", column: "todo", owner: "RM", avatar: "https://i.pravatar.cc/64?img=12", priority: "med" },
  { id: "3", name: "Design empty states", column: "review", owner: "LF", avatar: "https://i.pravatar.cc/64?img=32", priority: "low" },
  { id: "4", name: "Rate limit preview builds", column: "todo", owner: "TS", avatar: "https://i.pravatar.cc/64?img=15", priority: "med" },
  { id: "5", name: "Ship changelog page", column: "done", owner: "MT", avatar: "https://i.pravatar.cc/64?img=45", priority: "low" },
  { id: "6", name: "Audit bundle size", column: "doing", owner: "AO", avatar: "https://i.pravatar.cc/64?img=47", priority: "high" },
];

const TONE = { low: "outline", med: "secondary", high: "destructive" } as const;

export default function KanbanDemo() {
  const [tasks, setTasks] = useState<Task[]>(TASKS);

  return (
    <div className="min-h-[620px] bg-background p-8">
      <KanbanProvider
        columns={COLUMNS}
        data={tasks}
        onDataChange={setTasks}
        className="gap-3"
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{column.name}</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {tasks.filter((t) => t.column === column.id).length}
                </span>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(task: Task) => (
                <KanbanCard {...task} key={task.id}>
                  <p className="text-xs font-medium leading-snug">{task.name}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant={TONE[task.priority]} className="text-[10px]">
                      {task.priority}
                    </Badge>
                    <Avatar className="size-5">
                      <AvatarImage src={task.avatar} alt="" />
                      <AvatarFallback className="text-[9px]">
                        {task.owner}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
}
