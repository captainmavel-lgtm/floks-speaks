import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import {
  type Recording,
  formatDuration,
  formatDate,
} from "@/lib/content";
import {
  getRecordings,
  getCollections,
  getThemes,
  getHomepage,
} from "@/lib/sanity-queries";
import EpisodePlayButton from "@/components/episode-play-button";
import Library from "@/components/library";

export const instant = false;

export const metadata: Metadata = {
  title: "Listen",
  description:
    "Every Floks Speaks recording in one place. A new piece most weeks. Filter by theme, or search for the line you half remember.",
};

/* A theme card on the home page links here as /listen?theme=Faith. Reading the
   query makes this subtree dynamic, so it is isolated here behind Suspense: the
   masthead, featured piece and collections stay static and stream first, while
   the library arrives already narrowed with no client round trip. */
async function ThemedLibrary({
  searchParams,
  recordings,
  themes,
}: {
  searchParams: Promise<{ theme?: string }>;
  recordings: Recording[];
  themes: string[];
}) {
  const requested = (await searchParams).theme;
  const initialTheme: string = themes.includes(requested ?? "")
    ? requested!
    : "All";
  return <Library recordings={recordings} initialTheme={initialTheme} />;
}

export default async function ListenPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const [recordings, collections, themes, homepage] = await Promise.all([
    getRecordings(),
    getCollections(),
    getThemes(),
    getHomepage(),
  ]);

  // Featured from homepage singleton, or first recording
  const featured = homepage?.featuredTrack ?? recordings[0];

  return (
    <>
      {/* MASTHEAD */}
      <section className="lib-hero relative flex items-end overflow-hidden border-b border-hairline">
        <div className="absolute inset-0">
          <Image
            src="/images/hall-listen.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="lib-hero-img object-cover"
          />
          <div className="lib-scrim absolute inset-0" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-site px-(--spacing-gut) py-(--lib-pad)">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber">
            The Library
          </p>
          <h1 className="font-display text-h1 font-bold leading-[1.06]">
            Every word, in one place.
          </h1>
          <p className="mt-5 max-w-[46ch] text-lede leading-[1.7] text-ivory/86">
            A new piece most weeks. Filter by theme, or search for the line you
            half remember.
          </p>
        </div>
      </section>

      {/* FEATURED */}
      {featured && (
      <section className="border-b border-hairline">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
          <p className="mb-6 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ivory/66">
            Start here
          </p>
          <div className="flex flex-wrap gap-8 rounded-2xl border border-hairline bg-charcoal p-5 shadow-[0_12px_32px_rgba(0,0,0,.4)] sm:p-8">
            <div className="min-w-[180px] flex-[0_1_220px]">
              {featured.coverImageUrl && (
              <Image
                src={featured.coverImageUrl}
                alt={`${featured.title}, episode artwork`}
                width={440}
                height={440}
                sizes="(max-width: 640px) 100vw, 220px"
                className="aspect-square w-full rounded-xl border border-hairline object-cover"
              />
              )}
            </div>
            <div className="min-w-0 flex-[1_1_380px]">
              <span className="inline-block rounded-full border border-lilac/[0.42] px-3.5 py-[7px] text-[0.6875rem] uppercase tracking-[0.14em] text-lilac">
                {featured.theme}
              </span>
              <h2 className="font-editorial mt-[18px] mb-3.5 text-h2-ed">
                {featured.title}
              </h2>
              <p className="mb-6 text-lede leading-[1.7] text-ivory/86">
                {featured.description}
              </p>
              <div className="flex flex-wrap items-center gap-[18px]">
                <EpisodePlayButton recording={featured} variant="pill" />
                <span className="text-[0.8125rem] text-ivory/66">
                  {formatDuration(featured.durationSec)} &middot;{" "}
                  {formatDate(featured.publishedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* SEARCH, FILTERS AND THE GRID */}
      <Suspense fallback={<Library recordings={recordings} />}>
        <ThemedLibrary
          searchParams={searchParams}
          recordings={recordings}
          themes={themes}
        />
      </Suspense>

      {/* COLLECTIONS */}
      <section className="border-t border-hairline">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber">
            Collections
          </p>
          <h2 className="font-display mb-8 text-h2 font-semibold">
            Pieces that belong together, in the order they are meant to be heard.
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {collections.map((c) => {
              const covers = (c.recordings ?? []).slice(0, 4);
              return (
                <article
                  key={c._id}
                  className="rounded-2xl border border-hairline bg-charcoal p-6"
                >
                  <h3 className="font-display text-[1.375rem] font-semibold">
                    {c.title}
                  </h3>
                  <p className="mt-2.5 text-ivory/72">{c.description}</p>
                  {covers.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {covers.map((r) => (
                        r.coverImageUrl && (
                        <Image
                          key={r._id}
                          src={r.coverImageUrl}
                          alt=""
                          width={72}
                          height={72}
                          className="h-[52px] w-[52px] rounded-lg border border-hairline object-cover"
                        />
                        )
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-amber">
                    {(c.recordings ?? []).length} recordings
                  </p>
                </article>
              );
            })}
            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-edge-dark p-6">
              <p className="m-0 mb-1.5 font-display text-[1.0625rem] font-semibold">
                More collections to come.
              </p>
              <p className="m-0 text-[0.8125rem] leading-[1.6] text-ivory/66">
                Floks groups pieces as the library grows.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
