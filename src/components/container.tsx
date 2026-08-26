import { cn } from "@/lib/utils";

/**
 * Layout wrapper that vengenceui components import as `@/components/container`
 * but do not ship. A centred, padded max-width column.
 */
export default function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}
    >
      {children}
    </div>
  );
}
