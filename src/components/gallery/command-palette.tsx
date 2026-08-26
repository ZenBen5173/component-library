"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

/**
 * Jump to any component from anywhere.
 *
 * Built on the library's own cmdk wrapper rather than a bespoke one. Note that
 * cmdk owns the DOM inside CommandList — wrapping rows to animate them tears
 * its keyboard navigation apart, so entrance motion lives on the dialog only.
 */
export type PaletteEntry = {
  slug: string;
  category: string;
  categoryLabel: string;
  name: string;
  tags: string[];
};

export function CommandPalette({ entries }: { entries: PaletteEntry[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const groups = entries.reduce<Record<string, PaletteEntry[]>>((acc, e) => {
    (acc[e.categoryLabel] ??= []).push(e);
    return acc;
  }, {});

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Find a component"
      description="Search the library by name or tag."
      className="sm:max-w-xl"
    >
      <CommandInput placeholder="Search components…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>Nothing matches that.</CommandEmpty>
        {Object.entries(groups).map(([label, items]) => (
          <CommandGroup key={label} heading={label}>
            {items.map((entry) => (
              <CommandItem
                key={`${entry.category}/${entry.slug}`}
                // Tags are in the value so searching "portfolio" finds them,
                // while only the name is rendered.
                value={`${entry.name} ${entry.tags.join(" ")} ${entry.category}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/${entry.category}/${entry.slug}`);
                }}
              >
                <span className="flex-1 truncate">{entry.name}</span>
                {entry.tags[0] && (
                  <span className="ml-2 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {entry.tags[0]}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
