"use client";

/**
 * @name Pagination
 * @description Page numbers with a highlight that slides between them on a spring — the same shared-layout trick as the tabs.
 * @tags pagination, navigation, sliding-indicator, app
 * @height 460
 * @deps motion
 * @note Uses framer's `layoutId`, so the active pill travels between numbers rather than teleporting. The stock shadcn pagination was fully static.
 * @source src/components/smoothui/pagination/index.tsx
 */
import { useState } from "react";
import Pagination from "@/components/smoothui/pagination";

export default function PaginationDemo() {
  const [page, setPage] = useState(4);

  return (
    <div className="grid min-h-[460px] place-items-center gap-8 bg-background p-10">
      <Pagination page={page} totalPages={12} onPageChange={setPage} />
      <p className="text-xs text-muted-foreground">
        Page {page} of 12 — jump around to watch the pill travel.
      </p>
    </div>
  );
}
