"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  type Recording,
  formatDuration,
} from "@/lib/content";
import EpisodePlayButton from "@/components/episode-play-button";

/* ============================================================================
   LIBRARY — Phase 5

   Search and theme filter work together, as in the prototype: the count is a
   live region so a screen reader hears the result change, and the empty state
   offers the themes as a way out rather than leaving a dead end.

   Themes are now derived from the recordings themselves (via Sanity), so the
   component no longer imports a static THEMES array.
   ========================================================================= */

export default function Library({
  recordings,
  initialTheme = "All",
}: {
  recordings: Recording[];
  initialTheme?: string;
}) {
  /* Every theme a recording carries, not just its first. A piece tagged Faith
     AND Healing belongs under both chips; reading only `theme` dropped the
     second tag and made that theme look empty. */
  const themesOf = (r: Recording): string[] =>
    r.themes?.length ? r.themes : r.theme ? [r.theme] : [];

  const themes = useMemo(() => {
    const set = new Set<string>();
    recordings.forEach((r) => themesOf(r).forEach((t) => t && set.add(t)));
    return Array.from(set).sort();
  }, [recordings]);

  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string>(initialTheme);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recordings.filter((r) => {
      const okTheme = theme === "All" || themesOf(r).includes(theme);
      const okText =
        !q ||
        `${r.title} ${r.description} ${themesOf(r).join(" ")}`
          .toLowerCase()
          .includes(q);
      return okTheme && okText;
    });
  }, [recordings, query, theme]);

  const count =
    shown.length === recordings.length
      ? `Showing all ${shown.length} recordings`
      : `Showing ${shown.length} ${shown.length === 1 ? "recording" : "recordings"}` +
        (theme !== "All" ? ` in ${theme}` : "") +
        (query.trim() ? ` matching "${query.trim()}"` : "");

  return (
    <section>
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-7">
          <label
            htmlFor="q"
            className="mb-3 block text-[0.75rem] uppercase tracking-[0.08em] text-ivory/60"
          >
            Search the library
          </label>
          <div className="relative max-w-[540px]">
            <svg
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-ivory/50"
            >
              <circle cx="7.6" cy="7.6" r="5.4" />
              <path d="m11.6 11.6 4.2 4.2" />
            </svg>
            <input
              id="q"
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, theme, or a line you remember"
              className="min-h-[52px] w-full rounded-full border border-edge-dark bg-[#1a1b21] py-3.5 pl-[50px] pr-5 text-ivory placeholder:text-placeholder-dark"
            />
          </div>
          <p className="mt-2.5 text-[0.8125rem] text-ivory/66">
            Searches titles, descriptions and themes, together with the theme
            filter below.
          </p>
        </form>

        <div
          role="group"
          aria-label="Filter by theme"
          className="flex flex-wrap gap-2.5 border-b border-hairline pb-9"
        >
          {["All", ...themes].map((t) => {
            const on = theme === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTheme(t)}
                className={[
                  "min-h-[44px] rounded-full border px-5 text-[0.875rem] transition-[border-color,background,color] duration-200",
                  on
                    ? "border-amber bg-amber/[0.14] font-semibold text-amber"
                    : "border-edge-dark text-ivory hover:border-ivory/60",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>

        <p role="status" aria-live="polite" className="mt-7 mb-7 text-[0.8125rem] text-ivory/66">
          {count}
        </p>

        {shown.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((r) => (
              <article
                key={r._id}
                className="overflow-hidden rounded-2xl border border-hairline bg-charcoal"
              >
                {r.coverImageUrl && (
                <Image
                  src={r.coverImageUrl}
                  alt=""
                  width={440}
                  height={440}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="aspect-square w-full border-b border-hairline object-cover"
                />
                )}
                <div className="p-5">
                  <p className="mb-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-lilac">
                    {r.theme}
                  </p>
                  <h3 className="font-display mb-2.5 text-[1.125rem] font-semibold">
                    {r.title}
                  </h3>
                  <p className="mb-3.5 text-[0.8125rem] leading-[1.5] text-ivory/66">
                    {r.description}
                  </p>
                  <div className="flex items-center gap-3">
                    {/* The queue is what the reader can see: the current
                        filter and search result, in displayed order. Narrow
                        to Healing and "next" stays inside Healing. */}
                    <EpisodePlayButton recording={r} variant="icon" queue={shown} />
                    <span className="text-[0.8125rem] text-ivory/66">
                      {formatDuration(r.durationSec)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-edge-dark p-10 text-center">
            <p className="mb-5 text-ivory/72">
              Nothing matched that. Try a single word, or browse a theme instead.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {themes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setTheme(t);
                  }}
                  className="min-h-[44px] rounded-full border border-edge-dark px-5 text-[0.875rem] text-ivory hover:border-ivory/60"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
