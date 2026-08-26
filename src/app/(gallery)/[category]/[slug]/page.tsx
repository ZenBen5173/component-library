import Link from "next/link";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/gallery/code-block";
import { CopyButton } from "@/components/gallery/copy-button";
import { PreviewFrame } from "@/components/gallery/preview-frame";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getEntry, getLinkedSources, getSource } from "@/lib/registry";

export const dynamic = "force-dynamic";

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const entry = await getEntry(category, slug);
  if (!entry) notFound();

  const source = await getSource(entry);
  const linked = await getLinkedSources(entry);

  return (
    <div className="mx-auto max-w-6xl px-10 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList className="text-[11px]">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Library</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${entry.category}`} className="capitalize">
                {entry.category}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{entry.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            {entry.name}
          </h1>
          {entry.description && (
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-g-dim">
              {entry.description}
            </p>
          )}
        </div>
        <CopyButton
          value={source}
          label="Copy source"
          className="shrink-0 bg-g-surface"
        />
      </div>

      {(entry.tags.length > 0 || entry.deps.length > 0) && (
        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-g-line px-2.5 py-0.5 text-[10px] font-medium text-g-dim"
            >
              {tag}
            </span>
          ))}
          {entry.deps.map((dep) => (
            <span
              key={dep}
              className="rounded-full border border-g-brand/40 bg-g-brand/5 px-2.5 py-0.5 font-mono text-[10px] text-g-brand"
            >
              {dep}
            </span>
          ))}
        </div>
      )}

      {entry.note && (
        <div className="mt-6 rounded-xl border border-g-line bg-g-surface p-4">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-g-brand">
            Note
          </p>
          <p className="text-[13px] leading-relaxed text-g-dim">{entry.note}</p>
        </div>
      )}

      <Tabs defaultValue="preview" className="mt-8">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          {linked.length > 0 && (
            <TabsTrigger value="sources">
              Source ({linked.length})
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="preview">
            <PreviewFrame
              src={`/preview/${entry.category}/${entry.slug}`}
              height={entry.height}
            />
          </TabsContent>

          <TabsContent value="code">
            <CodeBlock code={source} filename={entry.file} />
          </TabsContent>

          {linked.length > 0 && (
            <TabsContent value="sources">
              <div className="space-y-3">
                {linked.map(({ file, code }) => (
                  <details key={file} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-g-line bg-g-surface px-3 py-2.5 font-mono text-[11px] text-g-dim transition-colors hover:text-g-ink">
                      <span className="truncate">{file}</span>
                      <span className="ml-3 shrink-0 text-[10px] uppercase tracking-widest">
                        {code.split("\n").length} lines
                      </span>
                    </summary>
                    <div className="mt-2">
                      <CodeBlock code={code} filename={file} />
                    </div>
                  </details>
                ))}
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
