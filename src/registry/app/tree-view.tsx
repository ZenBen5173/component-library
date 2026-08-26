"use client";

/**
 * @name Tree View
 * @description Expandable file tree with connector lines, icons and selection — for file browsers and nav hierarchies.
 * @tags tree, file-browser, hierarchy, navigation, app
 * @height 620
 * @note `showLines` draws the connector rails; without them deep nesting gets hard to follow past about three levels.
 * @source src/components/kibo-ui/tree/index.tsx
 */
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "@/components/kibo-ui/tree";

function Node({
  id,
  label,
  level = 0,
  isLast = false,
  children,
}: {
  id: string;
  label: string;
  level?: number;
  isLast?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <TreeNode nodeId={id} level={level} isLast={isLast}>
      <TreeNodeTrigger>
        <TreeExpander hasChildren={Boolean(children)} />
        <TreeIcon hasChildren={Boolean(children)} />
        <TreeLabel>{label}</TreeLabel>
      </TreeNodeTrigger>
      {children && <TreeNodeContent hasChildren>{children}</TreeNodeContent>}
    </TreeNode>
  );
}

export default function TreeViewDemo() {
  return (
    <div className="min-h-[620px] bg-background p-10">
      <div className="mx-auto max-w-sm rounded-xl border border-border p-3">
        <TreeProvider defaultExpandedIds={["src", "components"]} showLines selectable>
          <TreeView>
            <Node id="src" label="src">
              <Node id="app" label="app" level={1} />
              <Node id="components" label="components" level={1}>
                <Node id="ui" label="ui" level={2} />
                <Node id="gallery" label="gallery" level={2} />
                <Node id="button" label="button.tsx" level={2} isLast />
              </Node>
              <Node id="lib" label="lib" level={1} />
              <Node id="registry" label="registry" level={1} isLast />
            </Node>
            <Node id="public" label="public" />
            <Node id="pkg" label="package.json" isLast />
          </TreeView>
        </TreeProvider>
      </div>
    </div>
  );
}
