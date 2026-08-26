/**
 * @name Article
 * @description Long-form reading layout — headings, lists, quotes, code and captions, with the measure capped for readability.
 * @tags typography, prose, article, blog, case-study, website
 * @height 1400
 * @deps @tailwindcss/typography
 * @note The `prose` classes come from Tailwind's typography plugin, wired in globals.css. `prose-invert` handles dark mode. The measure is capped at ~68 characters — past that, the eye loses the line on the way back.
 */
export default function ArticleDemo() {
  return (
    <div className="min-h-[1400px] bg-background px-6 py-16">
      <article className="prose prose-neutral mx-auto dark:prose-invert prose-headings:tracking-tight prose-headings:font-semibold prose-a:underline-offset-4 prose-pre:border prose-pre:border-border">
        <p className="lead text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Case study · 2026
        </p>

        <h1>Rebuilding a deploy pipeline nobody trusted</h1>

        <p>
          Meridian shipped twice a week and dreaded both. Builds took fifteen
          minutes, failed for reasons nobody could reproduce, and the rollback
          plan was a person who knew which commit to revert. The brief was to
          make deploying boring.
        </p>

        <h2>Where the time actually went</h2>

        <p>
          The first surprise was that the pipeline wasn&rsquo;t slow — it was
          repetitive. Three of the fifteen minutes were work. The rest was the
          same dependency tree being resolved four times across four jobs that
          each started from nothing.
        </p>

        <blockquote>
          <p>
            The build wasn&rsquo;t waiting on the code. It was waiting on
            itself.
          </p>
        </blockquote>

        <h3>What changed</h3>

        <ul>
          <li>One install step, cached and shared across jobs</li>
          <li>Type checking moved off the critical path and run in parallel</li>
          <li>Preview URLs for every pull request, database branch included</li>
          <li>Rollback promoted a previous build rather than reverting source</li>
        </ul>

        <p>
          The last one mattered most. Reverting a commit means another build and
          another fifteen minutes of doubt. Promoting an artefact that already
          shipped takes nine seconds and cannot fail in a new way.
        </p>

        <h3>The configuration</h3>

        <pre>
          <code>{`build:
  cache: [node_modules, .next/cache]
  parallel:
    - typecheck
    - lint
  artifacts:
    retain: 30d   # enables instant rollback`}</code>
        </pre>

        <h2>Results</h2>

        <p>
          Build time fell from just over fifteen minutes to four. Failed deploys
          stopped being events. The team went from two releases a week to
          eleven, and nobody made a decision to do that — it just stopped being
          expensive.
        </p>

        <ol>
          <li>15m 20s → 4m 05s median build</li>
          <li>2 → 11 releases per week</li>
          <li>41 minutes → 9 seconds to roll back</li>
        </ol>

        <hr />

        <p>
          <em>
            Six months on, the pipeline has not been touched. That was the
            point.
          </em>
        </p>
      </article>
    </div>
  );
}
