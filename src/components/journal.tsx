"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type Article,
  type ArticleCategory,
  ARTICLE_CATEGORIES,
  formatDate,
} from "@/lib/content";

/* ============================================================================
   JOURNAL

   Articles expand in place rather than opening their own route. That is a
   deliberate Phase 2 decision: the Journal has one published article, and a
   dedicated route per article would mean a page whose only content is one
   essay with no siblings to navigate to. When Sanity lands in Phase 3 and the
   Journal has a run of articles, the open state here becomes the route and
   this component keeps the same filter UI.

   Two geometry rules earn their comments:
     auto-fill, not auto-fit. With one article auto-fit collapses the empty
     tracks and the single card stretches the full 1280px, putting the excerpt
     at roughly 140 characters a line. auto-fill keeps the empty tracks, so one
     card is card width.

     An open card takes the whole row and caps its body at 68ch, because at
     full grid width an essay is unreadable.
   ========================================================================= */

export default function Journal({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ArticleCategory | "All">("All");
  const [open, setOpen] = useState<string | null>(null);
  const didHash = useRef(false);

  /* Arriving from the About timeline link, /blog#testimony-words-gave-courage,
     must land the reader in the open article, not on a closed card they then
     have to find and click. Runs once: a later hash change from the reader's
     own navigation should not fight their open state. */
  useEffect(() => {
    if (didHash.current) return;
    didHash.current = true;
    const slug = window.location.hash.slice(1);
    if (!slug) return;
    if (!articles.some((a) => a.slug === slug)) return;
    setOpen(slug);
    // after paint, so scroll-margin-top applies to the expanded card
    requestAnimationFrame(() => {
      document.getElementById(slug)?.scrollIntoView({ block: "start" });
    });
  }, [articles]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const okCat = category === "All" || a.category === category;
      const okText =
        !q ||
        `${a.title} ${a.excerpt} ${a.category} ${a.body.join(" ")}`
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
        (query.trim() ? ` matching “${query.trim()}”` : "");

  return (
    <section>
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-7">
          <label
            htmlFor="jq"
            className="mb-3 block text-[0.75rem] uppercase tracking-[0.08em] text-midnight/60"
          >
            Search the journal
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
          {(["All", ...ARTICLE_CATEGORIES] as const).map((c) => {
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
              const isOpen = open === a.slug;
              return (
                <article
                  key={a._id}
                  id={a.slug}
                  className={[
                    "scroll-mt-[104px] rounded-2xl border border-hairline-ink bg-white/45 p-6",
                    isOpen ? "col-span-full" : "",
                  ].join(" ")}
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
                    {a.title}
                  </h2>

                  {!isOpen && (
                    <p className="mb-5 leading-[1.65] text-midnight/78">
                      {a.excerpt}
                    </p>
                  )}

                  {/* The region the disclosure button controls. Rendered either
                      way so the aria-controls reference always resolves. */}
                  <div id={`${a.slug}-body`} hidden={!isOpen}>
                    {isOpen && (
                      <div className="mb-6 max-w-[68ch]">
                        {a.body.map((p, i) => (
                          <p
                            key={i}
                            className="mb-[1.1em] text-lede leading-[1.75] text-midnight/82 last:mb-0"
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${a.slug}-body`}
                    onClick={() => {
                      const next = isOpen ? null : a.slug;
                      setOpen(next);
                      /* Collapsing a long article leaves the reader far below
                         where the card now ends, so return them to it. */
                      if (!next) {
                        requestAnimationFrame(() => {
                          document
                            .getElementById(a.slug)
                            ?.scrollIntoView({ block: "start" });
                        });
                      }
                    }}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-edge-ink px-5 text-[0.875rem] font-semibold text-midnight transition-colors duration-200 hover:border-midnight/70"
                  >
                    {isOpen ? "Close" : "Read the full article"}
                  </button>
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
              {ARTICLE_CATEGORIES.map((c) => (
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
