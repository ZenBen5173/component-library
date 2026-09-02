"use client";

/**
 * @name Sidebar
 * @description shadcn's sidebar as it ships — workspace switcher, grouped nav with nested sections, user row, and a rail that collapses to icons.
 * @tags sidebar, navigation, app, shell
 * @height 640
 * @note The stock component, unmodified, so there is a baseline to compare against. Sidebar 2.0 is this with a highlight that follows the pointer. Radix under the hood, like the rest of the library — the two Animate UI sidebars are not redistributable and do not ship.
 * @source src/components/ui/sidebar.tsx
 */
import { useState } from "react";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function SidebarDemo() {
  const [active, setActive] = useState("history");
  const [open, setOpen] = useState<string[]>(["playground"]);

  const toggle = (id: string) =>
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

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
                <SidebarMenu>
                  {NAV.map((item) => {
                    const hasChildren = item.children.length > 0;

                    // A leaf is a plain button. Wrapped in a Collapsible it
                    // would toggle an empty section instead of selecting.
                    if (!hasChildren) {
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={active === item.id}
                            onClick={() => setActive(item.id)}
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
                            <SidebarMenuButton tooltip={item.title}>
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
                                    className="cursor-pointer"
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
              The stock sidebar — hover states cut in and out.
            </span>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
