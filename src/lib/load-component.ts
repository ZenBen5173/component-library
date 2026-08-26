import type { ComponentType } from "react";

/**
 * Dynamically load a registry component by folder + filename.
 *
 * The static `../registry/` prefix lets the bundler build a context of every
 * file under it, which is what makes "drop a .tsx file in and it just works"
 * possible — no registration step, no generated index.
 */
export async function loadComponent(
  category: string,
  slug: string,
): Promise<ComponentType | null> {
  try {
    const mod = await import(`../registry/${category}/${slug}.tsx`);
    return (mod.default ?? null) as ComponentType | null;
  } catch {
    return null;
  }
}
