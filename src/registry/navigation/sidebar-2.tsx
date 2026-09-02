"use client";

/**
 * @name Sidebar 2.0
 * @description The stock sidebar with one change: the hover highlight glides from item to item instead of cutting in and out.
 * @tags sidebar, navigation, app, shell, hover, sliding-indicator, must-have
 * @height 640
 * @deps motion
 * @note Sidebar is the baseline; this is that with the hover made continuous. One indicator sits over the menu and animates its own box to whichever row the pointer is on — measured, not re-parented. A `layoutId` rendered inside the hovered row is the obvious way and it does not hold up: it has to unmount in one row and mount in another, and between a top-level row and one nested in a collapsible it stops animating between them. The component's own instant hover fill has to be switched off or you see both at once. The group clears on pointer leave so the highlight does not sit on whichever row you exited through.
 * @source src/components/ui/sidebar.tsx
 */
import { useRef, useState } from "react";
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
 * One highlight for the whole menu, positioned by measurement.
 *
 * The obvious approach is a `layoutId` rendered inside whichever row is
 * hovered, but that unmounts the element in one row and mounts it in another,
 * and across subtrees — a top-level row and one nested inside a collapsible —
 * it does not reliably animate between the two. This never unmounts. It sits
 * over the menu and animates its own box to wherever the pointer is, so every
 * row glides to every other row, however far apart or however nested.
 */
function Glide({ box }: { box: { top: number; left: number; width: number; height: number } | null }) {
  const { state } = useSidebar();
  // Nothing to slide along at icon width.
  if (state === "collapsed") return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-0 rounded-md bg-sidebar-accent"
      initial={false}
      animate={
        box
          ? { opacity: 1, top: box.top, left: box.left, width: box.width, height: box.height }
          : { opacity: 0 }
      }
      transition={SPRING.default}
    />
  );
}

export default function Sidebar2Demo() {
  const [active, setActive] = useState("history");
  const [open, setOpen] = useState<string[]>(["playground"]);
  const menuRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<
    { top: number; left: number; width: number; height: number } | null
  >(null);

  /**
   * One handler for the whole menu rather than one per row: it finds the row
   * under the pointer, so nested items and any rows added later are covered
   * without wiring each one up.
   */
  const track = (e: React.PointerEvent) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-slot='sidebar-menu-button'],[data-slot='collapsible-trigger'],[data-slot='sidebar-menu-sub-button']",
    );
    const host = menuRef.current;
    if (!row || !host || !host.contains(row)) return;
    const r = row.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    setBox({ top: r.top - h.top, left: r.left - h.left, width: r.width, height: r.height });
  };

  const toggle = (id: string) =>
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // Suppresses the component's built-in hover fill. Left in, it paints
  // instantly underneath the gliding one and you see both.
  const noInstantHover = "relative hover:bg-transparent";

  return (
    <div className="h-[640px] w-full bg-background">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground">
                    A
                  </span>
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold">
                      Acme Inc
                    </span>
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
                {/* The indicator is positioned against this box, so it has
                    to be the positioned ancestor of every row. Clearing on
                    leave stops it sitting lit on whichever row you left by. */}
                <div
                  ref={menuRef}
                  className="relative"
                  onPointerOver={track}
                  onPointerLeave={() => setBox(null)}
                >
                <Glide box={box} />
                <SidebarMenu>
                  {NAV.map((item) => {
                    const hasChildren = item.children.length > 0;

                    if (!hasChildren) {
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={active === item.id}
                            onClick={() => setActive(item.id)}
                            className={noInstantHover}
                          >
                            <item.icon />
                            <span>{item.title}</span>
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
                            <SidebarMenuButton
                              tooltip={item.title}
                                className={noInstantHover}
                            >
                                <item.icon />
                              <span>{item.title}</span>
                              <ChevronRight
                                className={cn(
                                  "ml-auto size-4 transition-transform duration-200",
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
                                    isActive={active === child.id}
                                    onClick={() => setActive(child.id)}
                                    className={cn(noInstantHover, "cursor-pointer")}
                                  >
                                    <span>{child.title}</span>
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
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8 rounded-md">
                    <AvatarImage src="https://i.pravatar.cc/64?img=47" alt="" />
                    <AvatarFallback className="rounded-md text-xs">
                      SC
                    </AvatarFallback>
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

        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">
              Run the pointer down the menu — the highlight travels with it.
            </span>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
