import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "@/components/icons";

/* ============================================================================
   HOME

   The hero is ported from the Phase 1 prototype. The numbers in it are not
   arbitrary and are documented in Design Handoff v31 section 9:

   - the photograph is 2000x1126 (16:9); Felix's core mass is x 63-77%
   - his raised hand reaches the very top edge and the shirt runs to 96%
     height, so the frame is tight vertically and the anchor is held high
     (58% 12%) to let any crop fall off the lower body instead
   - the left 52% has a mean luminance of 28/255, already dark enough to
     carry text, so the scrim is light
   - a stage lamp at ~53% across and ~61% down lands behind the amber line on
     some window shapes; the local backing on .hero-copy is what fixes it,
     measured at 3.98:1 worst case
   ========================================================================= */

export default function Home() {
  return (
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
  );
}
