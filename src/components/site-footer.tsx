import Link from "next/link";
import Image from "next/image";
import {
  NAV,
  UTILITY_NAV,
  SHOP_URL,
  COPYRIGHT_YEAR,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
} from "@/lib/site";
import SocialList from "@/components/social-list";

/* ============================================================================
   SITE FOOTER

   This component is Midnight on EVERY page, including the four Ivory ones.
   That is load-bearing, and it has broken twice:

   v16  the footer set only a border and padding, so on light pages it
        inherited the Ivory background while its text stayed Warm Ivory.
        Ivory on Ivory, invisible, through every review round.
   v30  the footer pinned its own background, but its social icons did not.
        Rules scoped to .ivory followed the cascade in from <body> and
        painted ink-dark glyphs onto the dark panel. Invisible again.

   The rule for Phase 2: pinning the component's own surface is NOT enough.
   Every child that carries colour pins its own too. SocialList takes an
   explicit `surface` prop rather than reading the page theme, which is what
   makes the v30 defect structurally impossible here.
   ========================================================================= */

export default function SiteFooter() {
  return (
    <footer
      className="bg-midnight text-ivory border-t border-hairline"
      style={{
        paddingBlock: `48px calc(48px + var(--player-h))`,
      }}
    >
      <div className="mx-auto w-full max-w-site px-(--spacing-gut)">
        <div className="mb-9 flex flex-wrap gap-10">
          <div className="min-w-0 flex-[1_1_280px]">
            <Image
              src="/brand/logo-ivory.svg"
              alt="Floks Speaks"
              width={132}
              height={32}
              className="mb-4 h-8 w-auto"
            />
            <p className="font-editorial text-[1.0625rem] italic text-amber mb-2">
              Words that cut through the noise.
            </p>
            <p className="text-[0.9375rem] leading-[1.7] text-ivory/70">
              Christian spoken word from Accra, Ghana. New pieces most weeks.
            </p>
          </div>

          <nav className="flex-[0_1_180px]" aria-label="Footer">
            <p className="mb-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ivory/66">
              Explore
            </p>
            <div className="flex flex-col gap-2.5">
              {NAV.filter((n) => n.href !== "/").map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-[0.9375rem] text-ivory/72 no-underline hover:text-ivory"
                >
                  {n.label}
                </Link>
              ))}
              <a
                href={SHOP_URL}
                target="_blank"
                rel="noopener"
                aria-label="Shop T-shirts, opens WhatsApp in a new tab"
                className="text-[0.9375rem] text-ivory/72 no-underline hover:text-ivory"
              >
                Shop T-shirts
              </a>
            </div>
          </nav>

          {/* Reach him sits before Follow: an address and a number are a way
              to start a conversation, a feed is a way to keep one going. Both
              pin their own colour onto Midnight rather than inheriting it,
              which is the rule the header comment sets out. The email is left
              to wrap on a narrow screen rather than overflow the column. */}
          <div className="min-w-0 flex-[1_1_220px]">
            <p className="mb-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ivory/66">
              Reach him
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="break-words text-[0.9375rem] text-ivory/72 no-underline transition-colors hover:text-amber"
              >
                {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="text-[0.9375rem] tabular-nums text-ivory/72 no-underline transition-colors hover:text-amber"
              >
                {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="flex-[1_1_240px]">
            <p className="mb-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ivory/66">
              Follow
            </p>
            {/* surface is explicit, never inherited. See the header comment. */}
            <SocialList surface="dark" />
            <p className="mt-3.5 text-[0.875rem] text-ivory/66">
              New pieces and behind the scenes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[18px] border-t border-hairline pt-[26px]">
          <p className="m-0 text-[0.875rem] text-ivory/66">
            &copy; {COPYRIGHT_YEAR} Floks Speaks. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-[22px]">
            {UTILITY_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-[0.9375rem] text-ivory/72 no-underline hover:text-ivory"
              >
                {n.label}
              </Link>
            ))}
            <p className="credit-line">
              Designed and developed by{" "}
              <a
                href="https://mavelogxdigital.com"
                target="_blank"
                rel="noopener noreferrer"
                className="credit-brand"
              >
                MavelogxDigital
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
