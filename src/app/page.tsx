import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "@/components/icons";
import EpisodePlayButton from "@/components/episode-play-button";
import {
  THEME_IMAGES,
  formatDuration,
  formatDate,
} from "@/lib/content";
import { getRecordings, getHomepage } from "@/lib/sanity-queries";

export const instant = false;
import { SHOP_URL } from "@/lib/site";

/* ============================================================================
   HOME — Phase 5: wired to Sanity CMS

   Featured track and curated collections come from the Homepage singleton.
   Recordings come from the audioTrack documents.
   ========================================================================= */

export default async function Home() {
  const [recordings, homepage] = await Promise.all([
    getRecordings(),
    getHomepage(),
  ]);

  // Featured track from the homepage singleton, or fall back to first recording
  const featured = homepage?.featuredTrack ?? recordings[0];

  // Latest three by publish date (recordings already sorted newest-first)
  const latest = recordings.slice(0, 3);

  // Theme names from the curated collections on the homepage, or fallback to static list
  const themeNames: string[] =
    homepage?.curatedCollections?.map((c: { title: string }) => c.title) ??
    Object.keys(THEME_IMAGES);

  return (
    <>
    <section className="hero relative flex items-center overflow-hidden border-b border-hairline">
      <div className="absolute inset-0">
        <Image
          src="/images/floks-home-hero.webp"
          alt="Felix Lokko on stage in an amber shirt, microphone in one hand and the other raised, under warm stage light"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="hero-img object-cover"
        />
        <div className="hero-scrim absolute inset-0" />
      </div>

      <span className="hero-spine" aria-hidden="true">
        Jesus Reigns
      </span>

      <div className="relative z-10 mx-auto w-full max-w-site px-(--spacing-gut) py-(--hero-pad)">
        <div className="hero-copy relative">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber">
            Christ-centred spoken word
          </p>

          <h1 className="font-display text-hero font-bold leading-[1.04] tracking-[-0.032em]">
            Words That Speak.
            <br />
            <span className="text-amber">Truth That Transforms.</span>
          </h1>

          <p className="mt-6 mb-7 max-w-[44ch] text-lede leading-[1.7] text-ivory/86">
            Experience spoken word rooted in faith, rhythm, and everyday life.
            Powerful expressions that reveal Jesus and inspire transformation.
          </p>

          <div className="flex flex-wrap gap-3.5">
            <Link
              href="/listen"
              className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-amber px-[30px] text-[0.9375rem] font-semibold text-midnight no-underline transition-[background,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#F7BD6E]"
            >
              <PlayIcon className="h-[15px] w-[13px] fill-midnight" />
              Explore Spoken Word
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-edge-ghost-dark px-[30px] text-[0.9375rem] font-semibold text-ivory no-underline transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-ivory"
            >
              Meet Felix
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* 02 FEATURED */}
    {featured && (
    <section id="listen" className="border-b border-hairline">
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
        <p className="mb-6 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ivory/66">
          Start here
        </p>
        <div className="flex flex-wrap items-center gap-10">
          <div className="min-w-[240px] flex-[0_1_360px]">
            {featured.coverImageUrl && (
            <Image
              src={featured.coverImageUrl}
              alt={`${featured.title}, episode artwork`}
              width={720}
              height={720}
              sizes="(max-width: 780px) 100vw, 360px"
              className="w-full rounded-2xl border border-hairline object-cover shadow-[0_12px_32px_rgba(0,0,0,.4)]"
            />
            )}
          </div>
          <div className="min-w-0 flex-[1_1_420px]">
            <span className="inline-block rounded-full border border-lilac/[0.42] px-3.5 py-[7px] text-[0.6875rem] uppercase tracking-[0.14em] text-lilac">
              {featured.theme}
            </span>
            <h2 className="font-editorial my-[18px] text-h2-ed">
              {featured.title}
            </h2>
            <p className="mb-6 text-lede leading-[1.7] text-ivory/86">
              {featured.description}
            </p>
            <div className="flex flex-wrap items-center gap-5">
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

    {/* 03 LATEST */}
    {latest.length > 0 && (
    <section className="border-b border-hairline">
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
        <div className="mb-9 flex flex-wrap items-baseline justify-between gap-[18px]">
          <h2 className="font-display text-h2 font-semibold">Latest releases</h2>
          <Link href="/listen" className="text-[0.875rem] text-amber">
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((r) => (
            <article
              key={r._id}
              className="rounded-2xl border border-hairline bg-charcoal p-4 shadow-[0_2px_8px_rgba(0,0,0,.28)] transition-colors duration-200 hover:border-amber/55"
            >
              {r.coverImageUrl && (
              <Image
                src={r.coverImageUrl}
                alt=""
                width={640}
                height={640}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                className="mb-4 aspect-square w-full rounded-xl object-cover"
              />
              )}
              <p className="mb-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-lilac">
                {r.theme}
              </p>
              <h3 className="font-display mb-3 text-[1.125rem] font-semibold leading-[1.3]">
                <Link href="/listen" className="text-ivory no-underline">
                  {r.title}
                </Link>
              </h3>
              <div className="flex items-center gap-3">
                <EpisodePlayButton recording={r} variant="icon" />
                <span className="text-[0.8125rem] text-ivory/66">
                  {formatDuration(r.durationSec)} &middot;{" "}
                  {formatDate(r.publishedAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
    )}

    {/* 04 MEET THE VOICE */}
    <section
      id="about"
      className="border-b border-hairline bg-linear-to-b from-midnight to-[#16161d]"
    >
      <div className="mx-auto flex w-full max-w-site flex-wrap items-center gap-10 px-(--spacing-gut) py-16">
        <div className="min-w-[260px] flex-[0_1_420px]">
          <Image
            src="/images/portrait-felix.jpg"
            alt="Felix Lokko, photographed in a mudcloth-print jacket"
            width={840}
            height={1050}
            sizes="(max-width: 780px) 100vw, 420px"
            className="aspect-4/5 w-full rounded-2xl border border-hairline object-cover"
            style={{ objectPosition: "50% 26%" }}
          />
        </div>
        <div className="min-w-0 flex-[1_1_420px]">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber">
            Meet the Voice
          </p>
          <h2 className="font-display mb-7 text-h2 font-semibold">
            Felix Lokko
          </h2>
          <blockquote className="font-editorial mb-7 text-[clamp(1.4rem,2.4vw,1.8rem)] italic leading-[1.4]">
            Words that people can not only hear, but feel and carry with them.
          </blockquote>
          <p className="mb-7 text-lede leading-[1.7] text-ivory/86">
            For Felix, spoken word is more than poetry. It is a gift from the
            Holy Spirit, and a vessel to draw hearts to Christ. The name carries
            that. <strong className="font-semibold text-ivory">F</strong> for
            Felix, <strong className="font-semibold text-ivory">Lok</strong> for
            Lokko, <strong className="font-semibold text-ivory">S</strong> for
            the Holy Spirit. Since September 2021 he has ministered in churches,
            youth camps, schools and campuses across Ghana. He turns faith,
            experience and conviction into words people carry with them.
          </p>
          <Link
            href="/about"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-edge-ghost-dark px-[30px] text-[0.9375rem] font-semibold text-ivory no-underline transition-colors duration-200 hover:border-ivory"
          >
            Read the full story
          </Link>
        </div>
      </div>
    </section>

    {/* 05 THEMES */}
    <section className="border-b border-hairline">
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
        <h2 className="font-display text-h2 font-semibold">Explore by theme</h2>
        <p className="mb-12 mt-4 max-w-[54ch] text-[1.0625rem] text-ivory/66">
          Four threads running through the work. Each one opens the pieces that
          belong to it.
        </p>
        <div className="grid max-w-[1040px] gap-6 sm:grid-cols-2">
          {themeNames.map((t) => (
            <Link
              key={t}
              href={`/listen?theme=${t}`}
              aria-label={`Explore ${t} pieces`}
              className="theme-card"
            >
              {THEME_IMAGES[t] && (
              <Image
                src={`/images/${THEME_IMAGES[t]}`}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 520px"
                className="theme-card__img"
              />
              )}
              <span className="theme-card__scrim" aria-hidden="true" />
              <div className="theme-card__label">
                <h3 className="theme-card__title">{t}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* 06 JOURNAL */}
    <section id="journal" className="bg-ivory text-midnight">
      <div className="mx-auto flex w-full max-w-site flex-wrap items-center justify-between gap-[18px] px-(--spacing-gut) py-[clamp(48px,6vw,80px)]">
        <div className="min-w-0 flex-[1_1_420px]">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
            From the journal
          </p>
          <h2 className="font-editorial mb-3 text-h2-ed">
            The first piece is being written.
          </h2>
          <p className="m-0 max-w-[54ch] text-[1.0625rem] text-midnight/70">
            Notes on craft, faith, and the things that end up becoming poems.
            Subscribe below and the first one comes to you.
          </p>
        </div>
        <Link
          href="/blog"
          className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-edge-ink px-[30px] text-[0.9375rem] font-semibold text-midnight no-underline transition-colors duration-200 hover:border-midnight"
        >
          Visit the journal
        </Link>
      </div>
    </section>

    {/* 07 EVENTS */}
    <section className="border-b border-hairline">
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
        <h2 className="font-display mb-7 text-h2 font-semibold">
          Events &amp; appearances
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-dashed border-edge-dark p-8">
          <div>
            <p className="font-display m-0 mb-1.5 text-[1.1875rem] font-semibold">
              No dates in the diary right now.
            </p>
            <p className="m-0 text-[0.9375rem] text-ivory/70">
              Available for church services, conferences, schools and festivals.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-amber px-[30px] text-[0.9375rem] font-semibold text-midnight no-underline"
          >
            Book Floks
          </Link>
        </div>
      </div>
    </section>

    {/* 08 WEAR THE MESSAGE */}
    <section
      aria-labelledby="merch-h"
      className="border-b border-hairline bg-midnight bg-[radial-gradient(60%_80%_at_12%_50%,rgba(242,163,58,.10),transparent_70%)]"
    >
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-16">
        <div className="grid items-center gap-[clamp(28px,5vw,60px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div>
            <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber">
              Wear the message
            </p>
            <h2 id="merch-h" className="font-editorial mb-5 text-h2-ed">
              Jesus Reigns, <em className="italic text-amber">worn out loud.</em>
            </h2>
            <p className="mb-7 text-lede leading-[1.7] text-ivory/86">
              Two shirts so far. The Floks Speaks lockup, and Ebi Jesus Wey Dey
              Rule with Revelation 17:14 set beneath it. Both carry a band of
              Ghanaian print at the sleeve. Orders go through WhatsApp for now,
              so you can ask about sizes before you buy.
            </p>
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-amber px-[30px] text-[0.9375rem] font-semibold text-midnight no-underline"
            >
              Shop the Collection
            </a>
          </div>
          <div className="grid grid-cols-2 gap-[clamp(10px,1.6vw,16px)]">
            {[
              [
                "merch-floks.jpg",
                "Felix wearing the Floks Speaks branded shirt with Ghanaian print sleeve band",
              ],
              [
                "merch-ebi-pair.jpg",
                "Two people wearing the Ebi Jesus Wey Dey Rule shirt in front of a JESUS sign",
              ],
              [
                "merch-ebi-shades.jpg",
                "Young man in shades wearing the Ebi Jesus Wey Dey Rule shirt",
              ],
              [
                "merch-ebi-street.jpg",
                "Felix in a yellow shirt with his portrait printed on it",
              ],
            ].map(([file, alt]) => (
              <Image
                key={file}
                src={`/images/${file}`}
                alt={alt}
                width={600}
                height={750}
                loading="lazy"
                sizes="(max-width: 1024px) 50vw, 300px"
                className="aspect-4/5 w-full rounded-[14px] border border-hairline object-cover shadow-[0_12px_30px_rgba(0,0,0,.4)]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* 09 NEWSLETTER */}
    <section id="contact" className="border-b border-hairline bg-charcoal">
      <div className="mx-auto flex w-full max-w-site flex-wrap items-center gap-10 px-(--spacing-gut) py-14">
        <div className="min-w-0 flex-[1_1_380px]">
          <h2 className="font-editorial mb-3 text-h2-ed">
            New words, now and then.
          </h2>
          <p className="m-0 max-w-[54ch] text-[1.0625rem] text-ivory/66">
            A short note when a new piece goes up. Nothing else. Your address
            goes to nobody.
          </p>
        </div>
        <form className="min-w-0 flex-[1_1_400px]">
          <label
            htmlFor="em"
            className="mb-3 block text-[0.8125rem] uppercase tracking-[0.08em] text-ivory/60"
          >
            Email address
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="em"
              type="email"
              required
              placeholder="you@example.com"
              className="min-h-[52px] min-w-0 flex-[1_1_220px] rounded-full border border-edge-dark bg-[#1a1b21] px-5 text-ivory placeholder:text-placeholder-dark"
            />
            <button
              type="submit"
              disabled
              title="Connected in Phase 6"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-amber px-[30px] text-[0.9375rem] font-semibold text-midnight disabled:opacity-60"
            >
              Subscribe
            </button>
          </div>
          <p className="mt-3.5 text-[0.8125rem] leading-[1.6] text-ivory/66">
            Double opt-in. You will get a confirmation email first. Unsubscribe
            any time.
          </p>
        </form>
      </div>
    </section>
    </>
  );
}
