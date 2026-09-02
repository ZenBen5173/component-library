"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * The tick springs in rather than appearing, and the box gives under a press.
 *
 * Radix mounts the indicator only while checked, so the entrance is free — the
 * shipped version spent it on `transition-none`.
 *
 * The animation is CSS, not a JS spring, on purpose. A spring that starts the
 * tick at 40% leaves it stuck there if frames never run — a background tab, a
 * paused compositor, a screenshot pass — and a permanently shrunken tick is
 * worse than a static one. A keyframe always resolves to its end state, and
 * honours `prefers-reduced-motion` without being asked.
 */
function Checkbox({
  className,
  /**
   * Whether the tick draws itself in. On for a control someone just clicked;
   * off for one that merely displays a value — in a virtualised table those
   * mount and unmount as you scroll, and every tick on screen would replay
   * its entrance on every pass.
   */
  animateIn = true,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & { animateIn?: boolean }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-[box-shadow,transform,background-color,border-color] duration-200 active:scale-90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary dark:data-[state=indeterminate]:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn(
          "grid place-content-center text-current",
          animateIn && "animate-in fade-in-0 zoom-in-50 duration-200 ease-out",
        )}
      >
        {props.checked === "indeterminate" ? (
          // A dash, not a tick: "some of these" is not "all of these".
          <span className="block h-0.5 w-2 rounded-full bg-current" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
