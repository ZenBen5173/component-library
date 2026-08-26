import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";

/**
 * Server-rendered syntax highlighting. Shiki runs at request time only —
 * nothing ships to the client except the highlighted markup.
 */
export async function CodeBlock({
  code,
  filename,
  lang = "tsx",
}: {
  code: string;
  filename?: string;
  lang?: string;
}) {
  const html = await codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-g-line bg-g-surface">
      <div className="flex items-center justify-between gap-3 border-b border-g-line px-3 py-2">
        <span className="truncate font-mono text-[11px] text-g-dim">
          {filename}
        </span>
        <CopyButton value={code} />
      </div>
      <div
        className="scrollbar-thin max-h-[70vh] overflow-auto p-4 text-[12.5px] leading-relaxed [&_pre]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
