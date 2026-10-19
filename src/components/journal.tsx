"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type Article,
  formatDate,
} from "@/lib/content";

/* ============================================================================
   JOURNAL — Phase 5

   Each card links to the article's own route at /blog/<slug>. Articles used
   to expand in place instead, from a time before that route existed — which
   left every piece unlinkable and unshareable, and stranded the share
   buttons on a page nothing pointed at. The filter UI is unchanged.

   Categories are now derived from the articles themselves (via Sanity),
   so the component no longer imports a static ARTICLE_CATEGORIES array.

   Article body is now Sanity portable text (any[]) rendered with
   @portabletext/react.
   ========================================================================= */

/** Extract plain text from portable text blocks for search filtering */
function ptToText(blocks: any[]): string {
  if (!blocks) return "";
  return blocks
    .filter((b) => b._type === "block")
    .map((b) =>
      (b.children ?? [])
        .map((c: any) => c.text ?? "")
        .join("")
    )
    .join(" ");
}

export default function Journal({ articles }: { articles: Article[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const didHash = useRef(false);

  // Derive unique category names from the actual articles
  const categories = useMemo(() => {
    const set = new Set(articles.map((a) => a.category).filter(Boolean));
    return Array.from(set).sort();
  }, [articles]);

  /* Older links point at /blog#<slug> — the About timeline still does. Now
     that each article has its own page, send those straight to it rather
     than scrolling to a card. */
  useEffect(() => {
    if (didHash.current) return;
    didHash.current = true;
    const slug = window.location.hash.slice(1);
    if (!slug) return;
    if (!articles.some((a) => a.slug === slug)) return;
    router.replace(`/blog/${slug}`);
  }, [articles, router]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const okCat = category === "All" || a.category === category;
      const okText =
        !q ||
        `${a.title} ${a.excerpt} ${a.category} ${ptToText(a.body)}`
          .toLowerCase()
          .includes(q);
      return okCat && okText;
    });
  }, [articles, query, category]);

  const count =
    shown.length === articles.length
      ? `Showing all ${shown.length} ${articles.length === 1 ? "article" : "articles"}`
      : `Showing ${shown.length} ${shown.length === 1 ? "article" : "articles"}` +
        (category !== "All" ? ` in ${category}` : "") +
        (query.trim() ? ` matching "${query.trim()}"` : "");

  return (
    <section>
      {/* py-14 here sat directly under the masthead's own padding, so the
          two stacked into a long blank band before the first filter chip. */}
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-10">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-7">
          <label
            htmlFor="jq"
            className="mb-3 block text-[0.75rem] uppercase tracking-[0.08em] text-midnight/60"
          >
            Search the blog
          </label>
          <div className="relative max-w-[540px]">
            <svg
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-midnight/55"
            >
              <circle cx="7.6" cy="7.6" r="5.4" />
              <path d="m11.6 11.6 4.2 4.2" />
            </svg>
            <input
              id="jq"
              type="search"
              name="jq"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="A title, a theme, or a line you remember"
              className="min-h-[52px] w-full rounded-full border border-edge-ink bg-white/40 py-3.5 pl-[50px] pr-5 text-midnight placeholder:text-placeholder-ink"
            />
          </div>
        </form>

        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap gap-2.5 border-b border-hairline-ink pb-9"
        >
          {["All", ...categories].map((c) => {
            const on = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCategory(c)}
                className={[
                  "min-h-[44px] rounded-full border px-5 text-[0.875rem] transition-[border-color,background,color] duration-200",
                  on
                    ? "border-amber-deep bg-amber-deep/[0.12] font-semibold text-amber-ink"
                    : "border-edge-ink text-midnight hover:border-midnight/70",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>

        <p
          role="status"
          aria-live="polite"
          className="mt-7 mb-7 text-[0.8125rem] text-midnight/70"
        >
          {count}
        </p>

        {shown.length > 0 ? (
          <div className="journal-grid">
            {shown.map((a) => {
              return (
                <article
                  key={a._id}
                  id={a.slug}
                  className="scroll-mt-[104px] rounded-2xl border border-hairline-ink bg-white/45 p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-lilac-deep px-3 py-[6px] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-lilac-ink">
                      {a.category}
                    </span>
                    <span className="text-[0.8125rem] text-midnight/66">
                      {formatDate(a.publishedAt)} &middot; {a.readMins} min read
                    </span>
                  </div>

                  <h2 className="font-editorial mt-4 mb-3 text-[1.5rem] leading-[1.22]">
                    <Link
                      href={`/blog/${a.slug}`}
                      className="text-midnight no-underline hover:underline"
                    >
                      {a.title}
                    </Link>
                  </h2>

                  <p className="mb-5 leading-[1.65] text-midnight/78">
                    {a.excerpt}
                  </p>

                  <Link
                    href={`/blog/${a.slug}`}
                    aria-label={`Read ${a.title}`}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-edge-ink px-5 text-[0.875rem] font-semibold text-midnight no-underline transition-colors duration-200 hover:border-midnight/70"
                  >
                    Read the full article
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-edge-ink p-10 text-center">
            <p className="mb-5 text-midnight/78">
              Nothing matched that. Try a single word, or browse a category
              instead.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory(c);
                  }}
                  className="min-h-[44px] rounded-full border border-edge-ink px-5 text-[0.875rem] text-midnight hover:border-midnight/70"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
