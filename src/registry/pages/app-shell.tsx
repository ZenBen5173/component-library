"use client";

/**
 * @name App Shell
 * @description A task tracker as a real app — the same tasks seen four ways (list, board, table, calendar) inside a rail, sticky bar and expanding capture field.
 * @tags layout, shell, app, dashboard, sidebar, must-have
 * @height screen
 * @note Every part of this is redistributable — the sidebar, tabs and theme toggle were swapped off Animate UI and skiper so the page could ship. Composed from the library rather than hand-written: Data Table for the table view, Kanban for the board, Tree View for nested lists, animated Lucide icons driven by row hover, Number Flow and Sparkline for the stat strip. The full drag-and-resize calendar is a server component so it cannot nest in a client shell — but that wrapper only awaits static mocks, so the Calendar tab drives its providers directly and gets the full month/week/day/agenda calendar with drag and resize. Deliberately light on cards: the stat strip and task list are flush rules rather than boxes.
 * @source src/components/ui/sidebar.tsx
 * @source src/components/ui/living-charts.tsx
 * @source src/components/ui/water-ripples.tsx
 * @source src/components/gustflow-table/DataTable.tsx
 * @source src/components/kibo-ui/kanban/index.tsx
 * @source src/components/kibo-ui/tree/index.tsx
 * @source src/components/smoothui/breadcrumb/index.tsx
 * @source src/components/ui/chart-motion.tsx
 */
import { useEffect, useId, useRef, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import {
  TreeExpander,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "@/components/kibo-ui/tree";
import Breadcrumb from "@/components/smoothui/breadcrumb";
import {
  BreathingBars,
  SheenRing,
  SweepSparkline,
} from "@/components/ui/living-charts";
import { WaterRipples } from "@/components/ui/water-ripples";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DataTable } from "@/components/gustflow-table/DataTable";
import type { ColumnDef } from "@/components/gustflow-table/types";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import { CalendarProvider } from "@/components/calendar-context";
import { CalendarHeader } from "@/components/calendar-header";
import { CalendarBody } from "@/components/calendar-body";
import { DndProvider } from "@/components/dnd-context";
import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from "@/components/mocks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArchiveIcon } from "@/components/ui/archive";
import { BellIcon } from "@/components/ui/bell";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { ClockIcon } from "@/components/ui/clock";
import { CheckCheckIcon } from "@/components/ui/check-check";
import { CircleCheckIcon } from "@/components/ui/circle-check";
import { PlusIcon } from "@/components/ui/plus";
import { SearchIcon } from "@/components/ui/search";
import { SettingsIcon } from "@/components/ui/settings";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin } from "lucide-react";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { cn } from "@/lib/utils";
import { DURATION, EASE, SPRING } from "@/lib/motion";

/* ── data ─────────────────────────────────────────────────────────────── */

const LISTS = [
  {
    id: "course",
    label: "Course",
    tint: "bg-sky-500",
    children: [
      { id: "bis", label: "BIS3213" },
      { id: "mkt", label: "Marketing" },
      { id: "analytics", label: "Data Analytics" },
    ],
  },
  {
    id: "club",
    label: "Club",
    tint: "bg-violet-500",
    children: [
      { id: "muba", label: "MUBA" },
      { id: "aws", label: "AWS × Sunway" },
    ],
  },
  {
    id: "personal",
    label: "Personal",
    tint: "bg-emerald-500",
    children: [
      { id: "errands", label: "Errands" },
      { id: "health", label: "Health" },
    ],
  },
];

/**
 * `line` is deliberately the same colour as the figure. Drawn in a neutral
 * grey the sparkline reads as decoration; tied to its number it reads as that
 * number's history.
 */
/** The same four figures, read as one workload split rather than four tiles. */
const BREAKDOWN = [
  { label: "Overdue", value: 1, tint: "var(--color-red-500)" },
  { label: "Due today", value: 3, tint: "var(--color-amber-500)" },
  { label: "This week", value: 6, tint: "var(--color-indigo-500)" },
  { label: "Done", value: 12, tint: "var(--color-emerald-500)" },
];

/** Space freed by collapsing the tiles pays for context they never had. */
const COMPLETED = [3, 5, 4, 7, 6, 9, 8];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const BY_LIST = [
  { label: "Course", value: 9, trend: [2, 3, 3, 5, 4, 6, 7], tone: "text-sky-400" },
  { label: "Club", value: 7, trend: [4, 3, 5, 4, 6, 5, 7], tone: "text-violet-400" },
  { label: "Personal", value: 4, trend: [1, 2, 1, 3, 2, 3, 4], tone: "text-emerald-400" },
];

const PEOPLE = [
  { id: "1", name: "Ada Okafor", image: "https://i.pravatar.cc/64?img=47" },
  { id: "2", name: "Ravi Menon", image: "https://i.pravatar.cc/64?img=12" },
  { id: "3", name: "Mei Lin", image: "https://i.pravatar.cc/64?img=32" },
];

type Row = {
  title: string;
  meta: string;
  tag: string;
  where?: string;
  done: boolean;
  people?: typeof PEOPLE;
};

const SECTIONS: { label: string; tone: string; items: Row[] }[] = [
  {
    label: "Overdue",
    tone: "text-red-500",
    items: [
      {
        title: "MUBA Opening Ceremony",
        meta: "Wed 26 Aug · 8:00–10:00pm",
        tag: "club",
        where: "Virtual",
        done: false,
        people: PEOPLE,
      },
    ],
  },
  {
    label: "This week",
    tone: "text-muted-foreground",
    items: [
      {
        title: "Submit BIS assignment",
        meta: "Fri 28 Aug · 5:00pm · in 2 days",
        tag: "course",
        done: false,
      },
      {
        title: "Draft hackathon pitch",
        meta: "Sat 29 Aug · 9:00pm",
        tag: "club",
        done: false,
        people: PEOPLE.slice(0, 2),
      },
    ],
  },
  {
    label: "Done",
    tone: "text-muted-foreground",
    items: [
      {
        title: "Meeting for AWS × Sunway initiative",
        meta: "Wed 26 Aug · 2:00–2:30pm",
        tag: "club",
        done: true,
      },
    ],
  },
];

const UP_NEXT = [
  { time: "8:00pm", title: "MUBA Opening Ceremony", where: "Virtual", tint: "bg-violet-500", icon: ClockIcon, who: PEOPLE[0], now: true },
  { time: "Fri 5:00pm", title: "Submit BIS assignment", where: "BIS3213", tint: "bg-sky-500", icon: CalendarDaysIcon, who: PEOPLE[1], now: false },
  { time: "Sun 9:00am", title: "AI Video Hackathon KL", where: "AWS KL Office", tint: "bg-violet-500", icon: CalendarDaysIcon, who: PEOPLE[2], now: false },
];

const VIEWS_TABS = [
  { value: "list", label: "List" },
  { value: "board", label: "Board" },
  { value: "table", label: "Table" },
  { value: "calendar", label: "Calendar" },
];

const TAG_TINT: Record<string, string> = {
  club: "bg-violet-500/15 text-violet-400",
  course: "bg-sky-500/15 text-sky-400",
};

type BoardTask = {
  id: string;
  name: string;
  column: string;
  list: string;
  due: string;
};

const BOARD_COLUMNS = [
  { id: "todo", name: "To do" },
  { id: "doing", name: "In progress" },
  { id: "done", name: "Done" },
];

const BOARD_TASKS: BoardTask[] = [
  { id: "1", name: "MUBA Opening Ceremony", column: "todo", list: "club", due: "Today" },
  { id: "2", name: "Submit BIS assignment", column: "todo", list: "course", due: "Fri" },
  { id: "3", name: "Draft hackathon pitch", column: "doing", list: "club", due: "Sat" },
  { id: "4", name: "Marketing case reading", column: "doing", list: "course", due: "Mon" },
  { id: "5", name: "AWS × Sunway meeting", column: "done", list: "club", due: "Wed" },
  { id: "6", name: "Renew library books", column: "done", list: "personal", due: "Tue" },
];

const TABLE_COLUMNS: ColumnDef[] = [
  { key: "task", label: "Task", type: "title", sortable: true, filterable: true, width: 260 },
  {
    key: "list",
    label: "List",
    type: "badge",
    sortable: true,
    filterable: true,
    width: 130,
    options: [
      { value: "course", label: "Course" },
      { value: "club", label: "Club" },
      { value: "personal", label: "Personal" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "status",
    sortable: true,
    filterable: true,
    width: 140,
    options: [
      { value: "completed", label: "Done" },
      { value: "pending", label: "In progress" },
      { value: "failed", label: "Blocked" },
    ],
  },
  { key: "owner", label: "Assignee", type: "person", sortable: true, filterable: true, width: 160 },
  { key: "priority", label: "Priority", type: "priority", sortable: true, filterable: true, width: 120 },
  { key: "effort", label: "Effort (h)", type: "number", sortable: true, aggregate: "sum", width: 120 },
  { key: "due", label: "Due", type: "date", sortable: true, width: 150 },
];

const TABLE_DATA = [
  { id: "1", task: "MUBA Opening Ceremony", list: "club", status: "pending", owner: "Ada Okafor", priority: "high", effort: 2, due: "2026-08-26" },
  { id: "2", task: "Submit BIS assignment", list: "course", status: "pending", owner: "Ravi Menon", priority: "high", effort: 6, due: "2026-08-28" },
  { id: "3", task: "Draft hackathon pitch", list: "club", status: "pending", owner: "Mei Lin", priority: "med", effort: 4, due: "2026-08-29" },
  { id: "4", task: "Marketing case reading", list: "course", status: "pending", owner: "Ada Okafor", priority: "low", effort: 3, due: "2026-08-31" },
  { id: "5", task: "AWS × Sunway meeting", list: "club", status: "completed", owner: "Ravi Menon", priority: "med", effort: 1, due: "2026-08-26" },
  { id: "6", task: "Renew library books", list: "personal", status: "completed", owner: "Mei Lin", priority: "low", effort: 1, due: "2026-08-25" },
  { id: "7", task: "Analytics quiz prep", list: "course", status: "failed", owner: "Ada Okafor", priority: "high", effort: 5, due: "2026-09-02" },
  { id: "8", task: "Book health checkup", list: "personal", status: "pending", owner: "Mei Lin", priority: "low", effort: 1, due: "2026-09-04" },
];


/* ── animated icons ───────────────────────────────────────────────────── */

type IconHandle = { startAnimation: () => void; stopAnimation: () => void };
type AnimatedIcon = React.ForwardRefExoticComponent<
  { size?: number; className?: string } & React.RefAttributes<IconHandle>
>;

/**
 * The animated icons play on their own hover, but in a nav the hover target is
 * the whole row — so the row drives the icon through its handle instead.
 */
function useIconHover() {
  const ref = useRef<IconHandle>(null);
  return {
    ref,
    onMouseEnter: () => ref.current?.startAnimation(),
    onMouseLeave: () => ref.current?.stopAnimation(),
  };
}

function NavItem({
  icon: Icon,
  label,
  badge,
  active,
}: {
  icon: AnimatedIcon;
  label: string;
  badge?: string;
  active?: boolean;
}) {
  const { ref, onMouseEnter, onMouseLeave } = useIconHover();
  return (
    <SidebarMenuItem
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative"
    >
      {active && (
        <motion.span
          className="absolute inset-y-1 left-0 z-10 w-0.5 rounded-full bg-primary"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
        />
      )}
      <SidebarMenuButton isActive={active} tooltip={label}>
        <Icon ref={ref} size={16} />
        <span>{label}</span>
      </SidebarMenuButton>
      {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}

function IconButton({
  icon: Icon,
  label,
  className,
}: {
  icon: AnimatedIcon;
  label: string;
  className?: string;
}) {
  const { ref, onMouseEnter, onMouseLeave } = useIconHover();
  return (
    <button
      aria-label={label}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Icon ref={ref} size={16} />
    </button>
  );
}

/**
 * A sparkline with a light running along it, rather than a line drawn once on
 * mount and then held. Same trick as the metal rim: a short bright dash chases
 * the full path forever, so a fixed figure still reads as live.
 */
function LivingSparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  // Mask ids must be unique per instance or every sparkline shares the first
  // one's sweep and they all pulse in lockstep.
  const id = useId().replace(/:/g, "");
  const w = 68;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / Math.max(data.length - 1, 1);
  const d = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("overflow-visible", className)} aria-hidden>
      <defs>
        {/* Masked, not dashed. A dash has hard ends and reads as a block
            sliding along; this fades up and away as it travels. */}
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-w} y={0} width={w * 3} height={h}>
          <motion.rect
            y={0}
            width={w * 0.55}
            height={h}
            fill={`url(#${id}-g)`}
            initial={{ x: -w * 0.55 }}
            animate={{ x: w }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
          />
        </mask>
      </defs>

      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
      />
      <g mask={`url(#${id}-m)`}>
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/**
 * The page sits on water.
 *
 * WaterRipples paints its own backdrop, so this is the page background rather
 * than a layer over one — which is also the only way it can refract anything:
 * it bends the texture it draws, and the content above stays crisp.
 */
function AmbientField() {
  return (
    <WaterRipples
      className="absolute inset-0 z-0"
      refraction={1}
      speed={0.5}
      specular={0.35}
    />
  );
}

/* ── capture field ────────────────────────────────────────────────────── */

/**
 * Borrows the search modal's shape: a quiet single line that expands into a
 * panel once it has focus. Here the panel shows what the sentence parsed to,
 * so the natural-language input is verifiable before it commits.
 */
function QuickCapture() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const { ref, onMouseEnter, onMouseLeave } = useIconHover();

  // Read after mount — the server has no window, and reading during render
  // would make the two disagree.
  useEffect(() => setReduced(prefersReducedMotion()), []);
  // The rim runs continuously — gated on focus it was invisible at rest, which
  // is most of the time. It is a live WebGL surface, so it stays off entirely
  // under reduced motion.
  const live = !reduced;

  const parsed = [
    { label: "Fri 28 Aug", tint: "bg-sky-500/15 text-sky-400" },
    { label: "5:00pm", tint: "bg-sky-500/15 text-sky-400" },
    { label: "course", tint: "bg-violet-500/15 text-violet-400" },
  ];

  return (
    <motion.div
      layout
      transition={SPRING.default}
      // A light running the border, the same idea as the New task button
      // wears — a rotating conic gradient showing through 1px of padding.
      className="relative overflow-hidden rounded-lg p-px"
    >
      <span className="absolute inset-0 rounded-lg bg-border/70" />
      {live && (
        // Sweeps along the rim. A rotating cone looked wrong here: the field
        // is wide and short, so the bright wedge crossed it as two streaks at
        // top and bottom rather than travelling round an edge.
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-lg"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--primary) 45%, var(--color-violet-400) 55%, transparent 100%)",
            backgroundSize: "45% 100%",
            backgroundRepeat: "no-repeat",
          }}
          animate={{ backgroundPositionX: ["-45%", "145%"] }}
          transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
        />
      )}

      <div className="relative z-10 overflow-hidden rounded-md bg-card/75 backdrop-blur-md">
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <PlusIcon ref={ref} size={16} className="shrink-0 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="essay due fri 5pm"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ↵
        </kbd>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE.expressive }}
            className="border-t border-border"
          >
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Reads as
              </span>
              {parsed.map((p, i) => (
                <motion.span
                  key={p.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: DURATION.fast,
                    ease: EASE.expressive,
                    delay: i * 0.04,
                  }}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[11px] font-medium",
                    p.tint,
                  )}
                >
                  {p.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── views ────────────────────────────────────────────────────────────── */

function TaskRow({ title, meta, tag, where, done, people }: Row) {
  return (
    <div className="group relative flex items-center gap-3 px-3 py-2 transition-colors hover:bg-background/70 hover:backdrop-blur-md">
      {/* Accent that grows from the left edge on hover. */}
      <span className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-primary transition-transform duration-200 group-hover:scale-y-100" />
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-sm border transition-all duration-200",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border group-hover:scale-110 group-hover:border-primary group-hover:bg-primary/10",
        )}
      >
        {done && (
          <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
            <path
              d="M2.5 6.2 4.7 8.4 9.5 3.6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm transition-transform duration-200 group-hover:translate-x-0.5",
          done && "text-muted-foreground line-through",
        )}
      >
        {title}
      </span>

      <span className="hidden shrink-0 items-center gap-2 text-xs text-muted-foreground md:flex">
        {where && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" />
            {where}
          </span>
        )}
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", TAG_TINT[tag])}>
          {tag}
        </span>
        <span className="w-44 text-right tabular-nums">{meta}</span>
      </span>

      {/* Fixed slot, so rows stay on a grid whether or not anyone is assigned. */}
      <span className="flex w-16 shrink-0 justify-end">
        {people && (
          <span className="flex -space-x-2">
            {people.map((p) => (
              <Avatar key={p.id} className="size-5 ring-2 ring-card">
                <AvatarImage src={p.image} alt={p.name} />
                <AvatarFallback className="text-[9px]">
                  {p.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            ))}
          </span>
        )}
      </span>
    </div>
  );
}

function ListView() {
  return (
    // No card of its own: the tab panel already provides one, and the two
    // nested borders read as a card inside a card.
    <div className="-m-3 overflow-hidden rounded-lg">
      {SECTIONS.map((section, si) => (
        <div key={section.label}>
          {/* Header band, the same device the data table uses to separate
              chrome from rows — cheaper than boxing every section. */}
          <div
            className={cn(
              "flex items-center gap-2 bg-muted/70 px-4 py-1.5 backdrop-blur-md",
              si > 0 && "border-t border-border",
            )}
          >
            <span
              className={cn(
                "font-display text-[11px] font-semibold uppercase tracking-widest",
                section.tone,
              )}
            >
              {section.label}
            </span>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {section.items.length}
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {section.items.map((item) => (
              <TaskRow key={item.title} {...item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BoardView() {
  const [tasks, setTasks] = useState<BoardTask[]>(BOARD_TASKS);
  return (
    <KanbanProvider
      columns={BOARD_COLUMNS}
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
            {(task: BoardTask) => (
              <KanbanCard {...task} key={task.id}>
                <p className="text-xs font-medium leading-snug">{task.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      TAG_TINT[task.list] ?? "bg-emerald-500/15 text-emerald-400",
                    )}
                  >
                    {task.list}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {task.due}
                  </span>
                </div>
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
}

/**
 * The real calendar — month, week, day, year and agenda, with drag to move and
 * resize. Its exported `Calendar` is an async server component, which cannot
 * nest inside a client shell; but that wrapper only awaits two functions that
 * return static mocks, so the providers underneath take the same data directly.
 */
function CalendarView() {
  return (
    <CalendarProvider
      events={CALENDAR_ITEMS_MOCK}
      users={USERS_MOCK}
      view="month"
    >
      <DndProvider>
        <div className="w-full overflow-hidden rounded-lg border border-border">
          <CalendarHeader />
          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  );
}

/* ── shell ────────────────────────────────────────────────────────────── */

export default function AppShell() {
  const scroller = useRef<HTMLDivElement>(null);
  const [view, setView] = useState("list");

  return (
    <div className="relative h-dvh w-full bg-background text-foreground">
      {/* Sits at the root, behind the rail as well as the content — a layer
          inside the scroller had nothing under the sidebar to show through,
          so its backdrop-blur was blurring flat colour. */}
      <AmbientField />
      <SidebarProvider>
        {/* Column inside the provider: the bar spans the whole width, the rail
            and content sit under it. SidebarTrigger needs the provider's
            context, so the bar cannot live outside it. */}
        <div className="flex h-dvh w-full flex-col">
          <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
            <div className="flex w-[calc(var(--sidebar-width)-1rem)] shrink-0 items-center gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary font-display text-[11px] font-bold text-primary-foreground">
                m
              </span>
              <span className="truncate font-display text-sm font-semibold">
                myTask
              </span>
            </div>

            <SidebarTrigger />
            <Breadcrumb items={[{ label: "Tasks", href: "#" }, { label: "Today" }]} />

            {/* A real search field rather than an icon — it is the fastest
                route to anything here, so it should look like a destination. */}
            <button className="group mx-auto hidden h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 text-left transition-colors hover:border-foreground/30 md:flex">
              <SearchIcon size={14} className="shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-xs text-muted-foreground">
                Search tasks…
              </span>
              <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <IconButton icon={BellIcon} label="Notifications" />
              {/* The library's own toggle — the circle wipe from Theme Toggle
                  Expand, which this entry can use because it is not published. */}
              <ThemeToggle />
              <Avatar className="ml-1 size-7">
                <AvatarImage src={PEOPLE[0].image} alt={PEOPLE[0].name} />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsible="icon"
          // Starts below the bar instead of pinning to the viewport top, and
          // lets the water through: the rail is glass, the bar above stays
          // solid so the chrome still reads as a fixed frame.
          className="top-14 h-[calc(100svh-3.5rem)] [&_[data-slot=sidebar-inner]]:border-r [&_[data-slot=sidebar-inner]]:border-border/60 [&_[data-slot=sidebar-inner]]:bg-sidebar/55 [&_[data-slot=sidebar-inner]]:backdrop-blur-xl"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Views</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem icon={ArchiveIcon} label="Inbox" badge="2" />
                  <NavItem icon={CheckCheckIcon} label="Today" badge="3" active />
                  <NavItem icon={CalendarDaysIcon} label="Upcoming" />
                  <NavItem icon={CircleCheckIcon} label="Done" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Lists nest, so this is a tree. Hidden at icon width, where a
                tree has nothing useful to say. */}
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel>Lists</SidebarGroupLabel>
              <SidebarGroupContent>
                <TreeProvider
                  defaultExpandedIds={["course"]}
                  showLines
                  showIcons={false}
                  indent={14}
                >
                  <TreeView>
                    {LISTS.map((list, li) => (
                      <TreeNode
                        key={list.id}
                        nodeId={list.id}
                        level={0}
                        isLast={li === LISTS.length - 1}
                      >
                        <TreeNodeTrigger className="py-1.5 pr-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
                          <TreeExpander hasChildren />
                          <span
                            className={cn(
                              "mr-2 size-2 shrink-0 rounded-full",
                              list.tint,
                            )}
                          />
                          <TreeLabel className="text-[13px]">
                            {list.label}
                          </TreeLabel>
                        </TreeNodeTrigger>
                        <TreeNodeContent hasChildren>
                          {list.children.map((child, ci) => (
                            <TreeNode
                              key={child.id}
                              nodeId={child.id}
                              level={1}
                              isLast={ci === list.children.length - 1}
                            >
                              <TreeNodeTrigger className="py-1.5 pr-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground">
                                <TreeExpander hasChildren={false} />
                                <TreeLabel className="text-[13px]">
                                  {child.label}
                                </TreeLabel>
                              </TreeNodeTrigger>
                            </TreeNode>
                          ))}
                        </TreeNodeContent>
                      </TreeNode>
                    ))}
                  </TreeView>
                </TreeProvider>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <NavItem icon={SettingsIcon} label="Settings" />
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-transparent">
          <div ref={scroller} className="relative flex-1 overflow-y-auto">

            <div className="relative mx-auto max-w-6xl px-6 py-7">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.base, ease: EASE.expressive }}
                className="flex flex-wrap items-end justify-between gap-4"
              >
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight">
                    Today
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Wednesday 26 August · 3 due, 1 overdue
                  </p>
                </div>
                {/* The metal rim the capture field used to wear. The shader
                    shows through the padding and nowhere else. */}
                <div
                  className="relative shrink-0 overflow-hidden rounded-lg"
                  style={{ padding: 2 }}
                >
                  {/* Cool grey rather than chrome: the base has to stay
                      near-neutral for the shader's colour shift to read as
                      metal, so this shifts it toward indigo instead of
                      tinting it outright, and the highlight carries the
                      palette. */}
                  <LiquidMetal
                    colorBack="#4c4f6b"
                    colorTint="#a5b4fc"
                    speed={0.4}
                    repetition={4}
                    distortion={0.15}
                    className="absolute inset-0 z-0 rounded-lg"
                  />
                  {/* Glass, like the capture field and the rows — a solid
                      bright fill was the only opaque thing on the page and it
                      fought the rim for attention. The metal is the accent
                      here; the button just holds it. */}
                  <button className="relative z-10 flex items-center gap-1.5 rounded-md bg-card/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:bg-card">
                    <PlusIcon size={14} className="text-muted-foreground" />
                    New task
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: DURATION.base,
                  ease: EASE.expressive,
                  delay: 0.05,
                }}
                className="mt-5"
              >
                <QuickCapture />
              </motion.div>

              {/* One donut instead of four tiles: these are parts of a whole,
                  and reading them as a split says more than four numbers in a
                  row. The space that frees pays for two charts beside it. */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: DURATION.base,
                  ease: EASE.expressive,
                  delay: 0.1,
                }}
                className="mt-5 grid gap-4 lg:grid-cols-3"
              >
                <div className="rounded-lg border border-border bg-card/70 p-4 backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Workload
                  </p>
                  <SheenRing
                    className="mt-3"
                    size={118}
                    stroke={13}
                    segments={BREAKDOWN}
                    centre={
                      <p className="font-display text-2xl font-semibold tabular-nums">
                        22
                      </p>
                    }
                    caption="tasks"
                  />
                </div>

                <div className="rounded-lg border border-border bg-card/70 p-4 backdrop-blur-md">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Completed
                    </p>
                    <p className="text-xs font-medium text-emerald-500">+18%</p>
                  </div>
                  <BreathingBars
                    className="mt-3"
                    data={COMPLETED}
                    labels={DAYS}
                    tint="var(--color-emerald-500)"
                  />
                </div>

                <div className="rounded-lg border border-border bg-card/70 p-4 backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    By list
                  </p>
                  <ul className="mt-4 space-y-3.5">
                    {BY_LIST.map((row) => (
                      <li key={row.label} className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-xs text-muted-foreground">
                          {row.label}
                        </span>
                        <SweepSparkline
                          data={row.trend}
                          className={cn("h-6 flex-1", row.tone)}
                          tooltip={
                            <>
                              <span className="font-medium">{row.label}</span>
                              <span className="ml-2 tabular-nums text-muted-foreground">
                                {row.value} open
                              </span>
                            </>
                          }
                        />
                        <span className="w-5 shrink-0 text-right text-sm tabular-nums">
                          {row.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: DURATION.base,
                  ease: EASE.expressive,
                  delay: 0.15,
                }}
                className="mt-6"
              >
                {/* The same tasks, four ways — a tracker is not one list. */}
                <Tabs value={view} onValueChange={setView}>
                  <TabsList>
                    {VIEWS_TABS.map((t) => (
                      <TabsTrigger
                        key={t.value}
                        value={t.value}
                        className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        {/* Slides between triggers rather than cutting. One
                            layoutId shared by every tab is the whole trick. */}
                        {view === t.value && (
                          <motion.span
                            layoutId="view-indicator"
                            transition={SPRING.default}
                            className="absolute inset-0 rounded-md bg-background shadow-sm"
                          />
                        )}
                        <span className="relative">{t.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {/* The views get a surface of their own. Floating a data
                      table or a calendar directly on the water made every row
                      compete with whatever was moving underneath it. */}
                  <div className="mt-4 rounded-lg border border-border bg-card/70 p-3 backdrop-blur-md">
                    <TabsContent value="list">
                      <ListView />
                    </TabsContent>
                    <TabsContent value="board">
                      <BoardView />
                    </TabsContent>
                    <TabsContent value="table">
                      <DataTable
                        columns={TABLE_COLUMNS}
                        data={TABLE_DATA}
                        titleKey="task"
                        searchable
                        exportable="tasks"
                      />
                    </TabsContent>
                    <TabsContent value="calendar">
                      <CalendarView />
                    </TabsContent>
                  </div>
                </Tabs>
              </motion.div>

              {/* Activity Feed's rail, which reads better than a bare dot
                  column: a bordered marker holding an icon, the connector
                  running between markers, and the row carrying who it is for. */}
              <section className="mt-10">
                <h2 className="font-display text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Up next
                </h2>
                <ol className="mt-4">
                  {UP_NEXT.map((item, i) => (
                    <li key={item.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="relative grid size-6 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground">
                          {item.now && (
                            <motion.span
                              className="absolute inset-0 rounded-full bg-primary/25"
                              animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
                              transition={{
                                duration: 2.4,
                                ease: "easeOut",
                                repeat: Infinity,
                              }}
                            />
                          )}
                          {/* These icons size from a prop, not a class — a
                              className of size-3 does nothing and they render
                              at their 28px default, bursting the marker. */}
                          <item.icon size={12} className="relative" />
                        </span>
                        {i < UP_NEXT.length - 1 && (
                          <span className="my-1 w-px flex-1 bg-border" />
                        )}
                      </div>

                      <div className="flex flex-1 items-start gap-3 pb-7">
                        <Avatar className="size-6">
                          <AvatarImage src={item.who.image} alt="" />
                          <AvatarFallback className="text-[9px]">
                            {item.who.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">
                            {item.title}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span
                              className={cn("size-1.5 rounded-full", item.tint)}
                            />
                            {item.where}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {item.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
