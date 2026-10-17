"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PortableText } from "@portabletext/react";
import {
  type Article,
  formatDate,
} from "@/lib/content";

/* ============================================================================
   JOURNAL — Phase 5

   Articles expand in place rather than opening their own route. That is a
   deliberate Phase 2 decision: the Journal has one published article, and a
   dedicated route per article would mean a page whose only content is one
   essay with no siblings to navigate to. When the Journal has a run of
   articles, the open state here becomes the route and this component keeps
   the same filter UI.

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

/** Custom portable text components for the journal article body */
const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="mb-[1.1em] text-lede leading-[1.75] text-midnight/82 last:mb-0">
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <h3 className="font-editorial mt-6 mb-3 text-[1.25rem] leading-[1.3] text-midnight">
        {children}
      </h3>
    ),
    h3: ({ children }: any) => (
      <h4 className="font-display mt-5 mb-2 text-[1.0625rem] font-semibold text-midnight">
        {children}
      </h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-5 border-l-[3px] border-amber-deep pl-5 italic text-midnight/72">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold text-midnight">{children}</strong>
    ),
    em: ({ children }: any) => <em>{children}</em>,
    link: ({ value, children }: any) => (
      <a
        href={value?.href}
        className="underline decoration-amber-deep/40 underline-offset-2 hover:decoration-amber-deep"
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel={value?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
  },
};

export default function Journal({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [open, setOpen] = useState<string | null>(null);
  const didHash = useRef(false);

  // Derive unique category names from the actual articles
  const categories = useMemo(() => {
    const set = new Set(articles.map((a) => a.category).filter(Boolean));
    return Array.from(set).sort();
  }, [articles]);

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
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
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
                        <PortableText value={a.body} components={ptComponents} />
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
