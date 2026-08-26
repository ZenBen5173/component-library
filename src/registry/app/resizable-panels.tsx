"use client";

/**
 * @name Resizable Panels
 * @description Drag-to-resize split panes, nested and persistable — the shell for editors, inspectors and previews.
 * @tags resizable, split-pane, layout, editor, app
 * @height 620
 * @deps react-resizable-panels

 * @note react-resizable-panels v4 renamed `direction` to `orientation` — most tutorials still show the old prop. Give the group an `autoSaveId` in a real app and sizes persist across reloads.
 * @source src/components/ui/resizable.tsx
 */
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

function Pane({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export default function ResizablePanelsDemo() {
  return (
    <div className="min-h-[620px] bg-background p-10">
      <ResizablePanelGroup
        orientation="horizontal"
        className="mx-auto min-h-[440px] max-w-3xl rounded-xl border border-border"
      >
        <ResizablePanel defaultSize={24} minSize={15}>
          <Pane title="Explorer" body="File tree, search, source control." />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={52}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={70}>
              <Pane title="Editor" body="The main working surface." />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={15}>
              <Pane title="Terminal" body="Build output and logs." />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={24} minSize={15}>
          <Pane title="Inspector" body="Properties for the current selection." />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
