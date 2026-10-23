import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getRecordingBySlug, getRecordings } from "@/lib/sanity-queries";
import { formatDate, formatDuration, themeAccent } from "@/lib/content";
import type { Recording } from "@/lib/content";
import EpisodePlayButton from "@/components/episode-play-button";
import ShareButtons from "@/components/share-buttons";
import JsonLd from "@/components/json-ld";
import { breadcrumbLd, episodeLd, graph, pageMeta } from "@/lib/seo";
import { PLATFORMS } from "@/lib/site";

export const instant = false;

/* ============================================================================
   RECORDING DETAIL — /listen/<slug>

   Until this page existed every recording was reachable only by pressing play
   inside a grid. Eight pieces shared one URL, so none of them could be linked
   to, shared, or indexed on their own, and the episode JSON-LD was pointing
   all eight at /listen with a fragment.

   The page is audio-first by design. Felix does not have transcripts yet, so
   the transcript band renders only when one exists — no empty state, no
   "transcript coming soon". Each page enriches itself as he writes them,
   without a deploy.

   SURFACE. Midnight throughout, matching /listen, except the transcript band,
   which is Ivory: long reading on a dark panel is the kind of thing that
   looks considered in a screenshot and is punishing at length. That dark page
   / ivory band pattern is the one the About page already uses. Every child
   that carries colour declares its own surface rather than inheriting one.
   ========================================================================= */

/* ---------- metadata ---------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recording = await getRecordingBySlug(slug);
  /* A slug with no published recording 404s below. Telling crawlers not to
     index the miss keeps a mistyped share link out of the index. */
  if (!recording) return { title: "Not found", robots: { index: false } };

  return pageMeta({
    title: recording.seo?.title || recording.title,
    description: recording.seo?.description || recording.description,
    path: `/listen/${slug}`,
    /* The piece's own cover art. It is required in the Studio, so the
       fallback is belt and braces rather than an expected path. */
    image: recording.coverImageUrl || "/og/og-listen.jpg",
    imageAlt: `${recording.title} — Floks Speaks`,
    type: "article",
    publishedTime: recording.publishedAt,
    authors: ["Felix Lokko"],
    section: recording.theme,
  });
}

/* ---------- static params ---------- */

/* Deliberately absent, matching /blog/[slug].
 *
 * Prerendering the published slugs looked right, but under Cache Components
 * a generateStaticParams that returns an empty list fails the build — and the
 * only honest thing to return when Sanity cannot be reached at build time is
 * an empty list. That turns a few seconds of CMS downtime into a failed
 * deploy of a site that is otherwise fine.
 *
 * Without it these render on demand and are cached by the 60s revalidate on
 * getRecordingBySlug, which is where the real saving was anyway. */

/* ---------- transcript rendering ---------- */

/* Deliberately not shared with the blog's renderer. A transcript is verse,
   not prose: lines break where Felix breaks them, so the leading is tighter
   and the measure narrower than an article's. */
const transcriptComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-[1.15em] whitespace-pre-line text-[1.0625rem] leading-[1.9] text-midnight/82 last:mb-0">
        {children}
      </p>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="font-editorial mt-9 mb-3 text-[1.375rem] leading-[1.3] text-midnight">
        {children}
      </h2>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-6 border-l-[3px] border-amber-deep pl-6 italic text-midnight/72">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-midnight">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => <em>{children}</em>,
  },
};

/* ---------- page ---------- */

export default async function RecordingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [recording, allRecordings] = await Promise.all([
    getRecordingBySlug(slug),
    getRecordings(),
  ]);
  if (!recording) notFound();

  /* The theme's own colour when Sanity has one, otherwise the stable
     fallback themeAccent picks, so a chip never renders colourless. */
  const accent = themeAccent(
    recording.theme,
    recording.themeMeta?.[0]?.accentColor,
  );

  /* Other pieces under the same theme, this one excluded. Playing from here
     continues through them rather than stopping, so the page is a way into
     the catalogue and not a cul-de-sac. */
  const related: Recording[] = allRecordings
    .filter((r) => r.slug !== recording.slug && r.themes?.includes(recording.theme))
    .slice(0, 3);

  /* The queue starts with this piece and runs on through its theme. */
  const queue: Recording[] = [recording, ...related];

  const links = recording.externalLinks ?? null;
  const platformLinks = links
    ? PLATFORMS.map((p) => {
        const key = (
          {
            Spotify: "spotify",
            "Apple Podcasts": "apple",
            "Amazon Music": "amazonMusic",
            iHeartRadio: "iheart",
            Deezer: "deezer",
            Audible: "audible",
          } as Record<string, keyof typeof links>
        )[p.label];
        const href = key ? links[key] : null;
        return href ? { label: p.label, href } : null;
      }).filter((x): x is { label: string; href: string } => x !== null)
    : [];

  const hasTranscript =
    Array.isArray(recording.transcript) && recording.transcript.length > 0;

  return (
    <>
      <JsonLd
        data={graph(
          episodeLd(recording),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Listen", path: "/listen" },
            { name: recording.title, path: `/listen/${slug}` },
          ]),
        )}
      />

      {/* ---------- MASTHEAD ---------- */}
      <section className="border-b border-hairline">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-12 sm:py-16">
          <Link
            href="/listen"
            className="mb-8 inline-flex min-h-[44px] items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-amber no-underline hover:text-[#F7BD6E]"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
              className="h-3.5 w-3.5"
            >
              <path d="M10 3 5 8l5 5" />
            </svg>
            All recordings
          </Link>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
            {/* Cover art. Capped on phones so it cannot push the title and the
                play button below the fold, which is the one thing this page
                exists to put in front of the reader. */}
            {recording.coverImageUrl && (
              <Image
                src={recording.coverImageUrl}
                alt={`${recording.title} cover art`}
                width={400}
                height={400}
                sizes="(max-width: 640px) 60vw, 280px"
                priority
                className="aspect-square w-[min(60vw,240px)] shrink-0 self-start rounded-2xl border border-hairline object-cover sm:w-[280px]"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span
                  className="rounded-full border px-3 py-[6px] text-[0.6875rem] font-semibold uppercase tracking-[0.14em]"
                  style={{ borderColor: `${accent}66`, color: accent }}
                >
                  {recording.theme}
                </span>
                <span className="text-[0.8125rem] text-ivory/60">
                  {formatDate(recording.publishedAt)} &middot;{" "}
                  {formatDuration(recording.durationSec)}
                </span>
              </div>

              <h1 className="font-display text-h1 font-bold leading-[1.08] tracking-[-0.02em]">
                {recording.title}
              </h1>

              <p className="mt-5 max-w-[56ch] text-lede leading-[1.7] text-ivory/80">
                {recording.description}
              </p>

              <div className="mt-8">
                <EpisodePlayButton
                  recording={recording}
                  variant="pill"
                  label="Play this piece"
                  queue={queue}
                />
              </div>

              {platformLinks.length > 0 && (
                <div className="mt-8 border-t border-hairline pt-6">
                  <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-amber">
                    Also on
                  </p>
                  <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
                    {platformLinks.map((p) => (
                      <li key={p.label}>
                        <a
                          href={p.href}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex min-h-[44px] items-center text-[0.9375rem] text-ivory/72 no-underline transition-colors hover:text-amber"
                        >
                          {p.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- TRANSCRIPT ----------
          Only when one exists. No placeholder: a section announcing its own
          emptiness is worse than no section, and these fill in over time. */}
      {hasTranscript && (
        <section className="bg-ivory text-midnight">
          <div className="mx-auto w-full max-w-read px-(--spacing-gut) py-14">
            <p className="mb-6 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
              The words
            </p>
            <PortableText
              value={recording.transcript as never}
              components={transcriptComponents}
            />
          </div>
        </section>
      )}

      {/* ---------- SHARE ---------- */}
      <section className="border-t border-hairline">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-12">
          <p className="mb-4 text-[0.75rem] uppercase tracking-[0.08em] text-ivory/55">
            Share this piece
          </p>
          {/* surface is explicit: this row sits on Midnight. */}
          <ShareButtons
            title={recording.title}
            slug={recording.slug}
            path="listen"
            surface="dark"
          />
        </div>
      </section>

      {/* ---------- MORE IN THIS THEME ---------- */}
      {related.length > 0 && (
        <section className="border-t border-hairline">
          <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
            <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-amber">
              More in {recording.theme}
            </p>
            <h2 className="font-editorial mb-8 text-h2-ed">
              Keep listening.
            </h2>
            <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li
                  key={r._id}
                  className="rounded-2xl border border-hairline p-4 transition-colors hover:border-amber/40"
                >
                  <Link
                    href={`/listen/${r.slug}`}
                    className="flex items-center gap-4 no-underline"
                  >
                    {r.coverImageUrl && (
                      <Image
                        src={r.coverImageUrl}
                        alt=""
                        width={72}
                        height={72}
                        sizes="72px"
                        className="h-[72px] w-[72px] shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block text-[1rem] font-semibold leading-snug text-ivory">
                        {r.title}
                      </span>
                      <span className="mt-1 block text-[0.8125rem] text-ivory/60">
                        {formatDuration(r.durationSec)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
