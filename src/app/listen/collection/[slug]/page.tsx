import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatDuration, formatDate, themeAccent } from "@/lib/content";
import { getCollectionBySlug } from "@/lib/sanity-queries";
import EpisodePlayButton from "@/components/episode-play-button";

export const instant = false;

/* ============================================================================
   COLLECTION DETAIL

   The page a collection card opens. Until this existed the cards on /listen
   were inert — they showed a title, a description and four thumbnails with
   nowhere to go.

   A curated collection ("The Wait") lists its tracks in the order the editor
   dragged them into, numbered, because the order is the point. A theme has
   no hand-ordered list, so it falls back to the recordings tagged with it,
   newest first, and drops the numbering — a number would imply a sequence
   nobody chose.
   ========================================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Not found" };
  return {
    title: collection.title,
    description:
      collection.description ??
      `${collection.title} — a collection of spoken word from Floks Speaks.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const curated = (collection.tracks ?? []).filter(Boolean);
  const isCurated = curated.length > 0;
  const tracks = isCurated ? curated : (collection.taggedTracks ?? []);
  const accent = themeAccent(collection.title, collection.accentColor);

  const totalSeconds = tracks.reduce((sum, t) => sum + (t.durationSec || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  return (
    <>
      {/* HEADER */}
      <section className="border-b border-hairline">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-12">
          <Link
            href="/listen"
            className="mb-8 inline-flex items-center gap-2 text-[0.8125rem] text-ivory/66 hover:text-ivory"
          >
            <span aria-hidden="true">&larr;</span> Back to the library
          </Link>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
            {collection.coverImageUrl && (
              <Image
                src={collection.coverImageUrl}
                alt=""
                width={240}
                height={240}
                className="h-[160px] w-[160px] shrink-0 rounded-2xl border border-hairline object-cover sm:h-[200px] sm:w-[200px]"
              />
            )}
            <div className="min-w-0">
              <p
                className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em]"
                style={{ color: accent }}
              >
                {isCurated ? "Collection" : "Theme"}
              </p>
              <h1 className="font-display text-h1 font-semibold">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="mt-4 max-w-[62ch] text-[1.0625rem] leading-[1.7] text-ivory/72">
                  {collection.description}
                </p>
              )}
              <p className="mt-5 text-[0.8125rem] text-ivory/60">
                {tracks.length} {tracks.length === 1 ? "recording" : "recordings"}
                {totalMinutes > 0 && ` · about ${totalMinutes} minutes`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRACK LIST */}
      <section>
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-12">
          {tracks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-edge-dark p-10 text-center">
              <p className="m-0 text-ivory/72">
                Nothing in here yet. The pieces are on their way.
              </p>
            </div>
          ) : (
            <ol className="m-0 list-none p-0">
              {tracks.map((r, i) => (
                <li
                  key={r._id}
                  className="flex items-center gap-4 border-b border-hairline py-4 first:border-t"
                >
                  {isCurated && (
                    <span
                      aria-hidden="true"
                      className="w-7 shrink-0 text-right font-display text-[0.9375rem] font-semibold text-ivory/40"
                    >
                      {i + 1}
                    </span>
                  )}
                  <EpisodePlayButton recording={r} variant="icon" />
                  {r.coverImageUrl && (
                    <Image
                      src={r.coverImageUrl}
                      alt=""
                      width={96}
                      height={96}
                      className="hidden h-[52px] w-[52px] shrink-0 rounded-lg border border-hairline object-cover sm:block"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[1.0625rem] font-semibold">
                      {r.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-[1.5] text-ivory/60">
                      {r.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-[0.8125rem] tabular-nums text-ivory/60">
                    {formatDuration(r.durationSec)}
                  </span>
                  <span className="hidden shrink-0 text-[0.8125rem] text-ivory/44 lg:block">
                    {formatDate(r.publishedAt)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}
