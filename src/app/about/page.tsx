import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JOURNEY } from "@/lib/content";
import JsonLd from "@/components/json-ld";
import { ID, breadcrumbLd, graph, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "Felix Lokko is a Ghanaian Christ-centred spoken word artist. The name, the calling, and how the words found their voice.",
  path: "/about",
  image: "/og/og-about.jpg",
});

export default function AboutPage() {
  return (
    <>
      {/* ProfilePage tells Google this page is ABOUT the Person node the
          layout already declares, which is what lets a search for his name
          surface this page rather than a third-party write-up. */}
      <JsonLd
        data={graph(
          {
            "@type": "ProfilePage",
            "@id": `${ID.person}-profile`,
            mainEntity: { "@id": ID.person },
            inLanguage: "en-GH",
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        )}
      />
      {/* 01 WHO IS FLOKS */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_22%,rgba(242,163,58,.16),transparent_70%)]"
        />
        <div className="relative mx-auto flex w-full max-w-site flex-wrap items-center gap-10 px-(--spacing-gut) py-16">
          <div className="min-w-0 flex-[1_1_440px]">
            <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber">
              Who is Floks?
            </p>
            <h1 className="font-display mb-7 text-h1 font-bold">Felix Lokko</h1>
            <p className="mb-5 text-lede leading-[1.7] text-ivory/86">
              The name Floks Speaks carries a personal and spiritual meaning.{" "}
              <strong className="font-semibold text-ivory">F</strong> comes from
              Felix, <strong className="font-semibold text-ivory">Lok</strong>{" "}
              from Lokko, and{" "}
              <strong className="font-semibold text-ivory">S</strong> represents
              the Holy Spirit. Together it reflects a desire to partner with the
              Holy Spirit, and to let Him speak through the words.
            </p>
            <p className="text-lede leading-[1.7] text-ivory/86">
              A Ghanaian Christ centred spoken word artist who uses rhyme,
              rhythm, rap and African cultural expression to proclaim Jesus
              Christ. Since officially beginning in September 2021 he has
              ministered across churches, youth camps, schools, weddings and
              other gatherings.
            </p>
          </div>
          <div className="min-w-[260px] flex-[0_1_380px]">
            <Image
              src="/images/portrait-felix.jpg"
              alt="Felix Lokko, photographed in a mudcloth-print jacket"
              width={760}
              height={950}
              priority
              sizes="(max-width: 780px) 100vw, 380px"
              className="aspect-4/5 w-full rounded-2xl border border-hairline object-cover"
              style={{ objectPosition: "50% 24%" }}
            />
          </div>
        </div>
      </section>

      {/* 02 THE JOURNEY
          Ivory band inside a dark page, so it pins its own surface and uses
          the Ink accent tokens throughout. Driven by JOURNEY in content.ts,
          which is shaped for the Sanity journey document. */}
      <section className="bg-ivory text-midnight">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-16">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
            The Journey
          </p>
          <h2 className="font-editorial mb-12 text-h2-ed">
            How the words found their voice.
          </h2>
          <ol className="road">
            {JOURNEY.map((m) => (
              <li
                key={m.date}
                className={`step${m.major ? " is-major" : ""}`}
                data-date={m.date}
              >
                {m.kind && <p className="kind">{m.kind}</p>}
                <p className="yr">{m.label}</p>
                <h3>{m.heading}</h3>
                <p className="body">{m.body}</p>
                {m.link && (
                  <Link
                    href={m.link.href}
                    className="mt-2.5 inline-block border-b border-amber-deep/45 pb-0.5 text-[0.875rem] text-amber-ink"
                  >
                    {m.link.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 03 WHY SPOKEN WORD */}
      <section className="border-b border-hairline">
        <div className="mx-auto flex w-full max-w-site flex-wrap items-center gap-10 px-(--spacing-gut) py-16">
          <div className="min-w-[260px] flex-[0_1_400px]">
            {/* The camp photograph is near square (1200x1157). A 3:4 slot would
                have cropped a third of the width away, so the frame is matched
                to the picture instead. */}
            <Image
              src="/images/perf-stage-camp.jpg"
              alt="Floks Speaks ministering with a microphone on stage at a camp gathering, the speakers' portraits on the screen behind him"
              width={1200}
              height={1157}
              sizes="(max-width: 780px) 100vw, 400px"
              className="aspect-square w-full rounded-2xl border border-hairline object-cover"
              style={{ objectPosition: "50% 42%" }}
            />
          </div>
          <div className="min-w-0 flex-[1_1_440px]">
            <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber">
              Why Spoken Word?
            </p>
            <blockquote className="font-editorial mb-7 text-[clamp(1.4rem,2.6vw,1.9rem)] italic leading-[1.4]">
              Spoken word is more than poetry. It is a gift from the Holy Spirit,
              a vessel to draw hearts to Christ.
            </blockquote>
            <p className="mb-5 text-lede leading-[1.7] text-ivory/86">
              Through rhythm, culture and truth, faith and experience and
              conviction become words that people can not only hear, but feel
              and carry with them. The approach blends crafted rhymes, rhythmic
              delivery, relatable language, rap, music and real audience
              interaction.
            </p>
            <p className="text-lede leading-[1.7] text-ivory/86">
              With a heart for young people and a message for every generation,
              the aim is to make biblical truth accessible, compelling and
              relevant to ordinary life. The ambition reaches past performance.
              Floks Speaks is becoming a movement of spoken word artists,
              singers, instrumentalists and dancers united by one mission.
              African culture is not decoration in that work. It is the artistic
              identity.
            </p>
          </div>
        </div>
      </section>

      {/* 04 THE MESSAGE */}
      <section className="bg-ivory text-midnight">
        <div className="mx-auto w-full max-w-read px-(--spacing-gut) py-16">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
            The Message Behind the Voice
          </p>
          <h2 className="font-editorial mb-8 text-h2-ed">Jesus Reigns.</h2>
          <blockquote className="font-editorial mb-8 text-[clamp(1.25rem,2.2vw,1.6rem)] italic leading-[1.5] text-midnight/86">
            Therefore God also has highly exalted Him and given Him the name
            which is above every name, that at the name of Jesus every knee
            should bow &hellip; and that every tongue should confess that Jesus
            Christ is Lord, to the glory of God the Father.
            <cite className="font-ui mt-3.5 block text-[0.875rem] uppercase not-italic tracking-[0.08em] text-amber-ink">
              Philippians 2:9 to 11, NKJV
            </cite>
          </blockquote>
          <p className="mb-6 text-[1.1875rem] leading-[1.78] text-midnight/86">
            That passage is the foundation. The desire is simple. That everyone
            who encounters this work would come to know Jesus, grow in love for
            Him, and stay steadfast in the walk.
          </p>
          <p className="text-[1.1875rem] leading-[1.78] text-midnight/86">
            One word, one rhyme, one ministration, and one heart at a time.
          </p>
        </div>
      </section>

      {/* 05 EVENTS
          Empty state, not a placeholder row. Phase 3 replaces it with the
          published events from the CMS. */}
      <section className="border-b border-hairline">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-16">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber">
            Events &amp; Appearances
          </p>
          <h2 className="font-display mb-9 text-h2 font-semibold">
            Where to hear him next.
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-dashed border-edge-dark p-8">
            <div>
              <p className="font-display mb-1.5 text-[1.1875rem] font-semibold">
                No dates in the diary right now.
              </p>
              <p className="text-[0.9375rem] leading-[1.6] text-ivory/70">
                Available for church services, conferences, schools and
                festivals.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-amber px-[30px] text-[0.9375rem] font-semibold text-midnight"
            >
              Book Floks
            </Link>
          </div>
        </div>
      </section>

      {/* 06 BOOKINGS */}
      <section>
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-16">
          <div className="relative overflow-hidden rounded-2xl border border-amber/40 bg-charcoal px-[clamp(24px,4vw,48px)] py-[clamp(36px,5vw,60px)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(65%_85%_at_86%_28%,rgba(242,163,58,.18),transparent_72%)]"
            />
            <div className="relative flex flex-wrap items-center gap-10">
              <div className="min-w-0 flex-[1_1_400px]">
                <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber">
                  Bookings
                </p>
                <h2 className="font-display mb-[18px] text-h2 font-semibold">
                  Invite Floks to your gathering.
                </h2>
                <p className="text-lede leading-[1.7] text-ivory/86">
                  Churches, youth camps, schools, weddings, conferences and
                  festivals. Tell him the occasion, the date and the place, and
                  he will come back to you.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-amber px-[30px] text-[0.9375rem] font-semibold text-midnight"
              >
                Start a booking enquiry
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
