"use client";

/**
 * @name Sidebar 2.0
 * @description shadcn's sidebar with a highlight that slides between items instead of cutting, nested sections that open in place, a workspace switcher and a user row.
 * @tags sidebar, navigation, app, shell, sliding-indicator, must-have
 * @height 640
 * @note Built on shadcn's own sidebar, so it is Radix like the rest of the library and ships publicly — the two Animate UI sidebars cannot. The highlight is one shared `layoutId` across every item, parents and children alike, which is what lets it travel between a top-level row and a nested one rather than reappearing. It is hidden while the rail is collapsed to icons, where a sliding bar has nowhere to slide.
 * @deps motion
 * @source src/components/ui/sidebar.tsx
 */
import { useState } from "react";
import { motion } from "motion/react";
import {
  ChevronRight,
  ChevronsUpDown,
  BookOpen,
  Bot,
  Frame,
  Settings2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

const NAV = [
  {
    id: "playground",
    title: "Playground",
    icon: Frame,
    children: [
      { id: "history", title: "History" },
      { id: "starred", title: "Starred" },
      { id: "playground-settings", title: "Settings" },
    ],
  },
  {
    id: "models",
    title: "Models",
    icon: Bot,
    children: [
      { id: "genesis", title: "Genesis" },
      { id: "explorer", title: "Explorer" },
    ],
  },
  {
    id: "docs",
    title: "Documentation",
    icon: BookOpen,
    children: [
      { id: "intro", title: "Introduction" },
      { id: "tutorials", title: "Tutorials" },
    ],
  },
  { id: "settings", title: "Settings", icon: Settings2, children: [] },
];

/**
 * One highlight for the whole rail.
 *
 * Rendered only inside whichever item is active, sharing a layoutId with every
 * other item — that is what makes it travel to its new position rather than
 * vanish and reappear somewhere else.
 */
function Highlight({ id }: { id: string }) {
  const { state } = useSidebar();
  // At icon width there is nothing for it to slide along.
  if (state === "collapsed") return null;
  return (
    <motion.span
      layoutId={`${id}-highlight`}
      transition={SPRING.default}
      className="absolute inset-0 rounded-md bg-sidebar-accent"
    />
  );
}

function Rail() {
  const [active, setActive] = useState("history");
  const [open, setOpen] = useState<string[]>(["playground"]);

  const toggle = (id: string) =>
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground">
                A
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">Acme Inc</span>
                <span className="truncate text-xs text-muted-foreground">
                  Enterprise
                </span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const hasChildren = item.children.length > 0;

                // A leaf is a plain button. Wrapping it in a Collapsible made
                // clicking it toggle an empty section instead of selecting it,
                // and CollapsibleTrigger's asChild also overwrites the
                // button's data-slot, so it stops looking like a menu button
                // to anything querying the DOM.
                if (!hasChildren) {
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => setActive(item.id)}
                        className="relative"
                      >
                        {active === item.id && <Highlight id="rail" />}
                        <item.icon className="relative" />
                        <span className="relative">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                const isOpen = open.includes(item.id);
                return (
                  <Collapsible
                    key={item.id}
                    open={isOpen}
                    onOpenChange={() => toggle(item.id)}
                    asChild
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} className="relative">
                          {active === item.id && <Highlight id="rail" />}
                          <item.icon className="relative" />
                          <span className="relative">{item.title}</span>
                          <ChevronRight
                            className={cn(
                              "relative ml-auto size-4 transition-transform duration-200",
                              isOpen && "rotate-90",
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.id}>
                              <SidebarMenuSubButton
                                onClick={() => setActive(child.id)}
                                className="relative cursor-pointer"
                              >
                                {active === child.id && <Highlight id="rail" />}
                                <span className="relative">{child.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8 rounded-md">
                <AvatarImage src="https://i.pravatar.cc/64?img=47" alt="" />
                <AvatarFallback className="rounded-md text-xs">SC</AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">shadcn</span>
                <span className="truncate text-xs text-muted-foreground">
                  m@example.com
                </span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Sidebar2Demo() {
  return (
    <div className="h-[640px] w-full bg-background">
      <SidebarProvider>
        <Rail />
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">
              Click through the sections — the highlight travels.
            </span>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
