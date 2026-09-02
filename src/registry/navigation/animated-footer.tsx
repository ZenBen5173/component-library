"use client";

/**
 * @name Animated Footer
 * @description Footer whose side images are sampled into interactive ASCII art, with parallax and oversized wordmark.
 * @tags portfolio, footer, ascii, canvas, parallax
 * @height 720
 * @note Its registry entry ships the component and nothing else — the hand photographs its defaults point at are in the upstream repo but not in the install, so a fresh add renders an empty field. They are vendored into `public/animated-footer/` here. A subject with a clear silhouette is the point: random photography samples into meaningless noise. It is also `h-full`, so give it a parent with a real height — dropped straight into a page body it collapses to zero and renders invisibly. Source images must be CORS-enabled — the canvas reads their pixels. Same-origin files in /public are the safest choice.
 * @source src/components/ui/animated-footer.tsx
 */
import { AnimatedFooter } from "@/components/ui/animated-footer";

export default function AnimatedFooterDemo() {
  return (
    // The footer is h-full, so it needs a parent with a real height or it
    // collapses to nothing — it rendered fine and measured zero pixels tall.
    <div className="h-[720px] w-full bg-background">
      {/* The component's own defaults — hands, which is what the ASCII
          sampling is built around. Passing them explicitly so it is obvious
          where they come from. */}
      <AnimatedFooter
        headingLines={["STUDIO", "NORTH"]}
        leftImage="/animated-footer/hand-left.jpg"
        rightImage="/animated-footer/hand-right.jpg"
      />
    </div>
  );
}
