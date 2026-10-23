import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import SocialList from "@/components/social-list";
import JsonLd from "@/components/json-ld";
import { ID, abs, breadcrumbLd, graph, pageMeta } from "@/lib/seo";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
} from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Bookings, collaborations, press, or a thought on something you heard. Share your enquiry and we'll get back to you as soon as possible.",
  path: "/contact",
  image: "/og/og-contact.jpg",
});

export default function ContactPage() {
  return (
    <section>
      <JsonLd
        data={graph(
          {
            "@type": "ContactPage",
            "@id": `${abs("/contact")}#contact`,
            url: abs("/contact"),
            name: "Contact Floks Speaks",
            inLanguage: "en-GH",
            mainEntity: { "@id": ID.org },
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        )}
      />
      <div className="mx-auto flex w-full max-w-site flex-wrap items-start gap-[clamp(32px,6vw,72px)] px-(--spacing-gut) py-16">
        {/* LEFT */}
        <div className="min-w-0 max-w-[460px] flex-[1_1_340px]">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
            Get in touch
          </p>
          <h1 className="font-editorial text-h1">Say the word.</h1>
          <p className="mb-8 mt-5 text-lede leading-[1.7] text-midnight/78">
            Bookings, collaborations, press, or a thought on something you
            heard. It all reaches the same inbox.
          </p>

          <div className="mb-7 flex items-start gap-3.5 rounded-xl border border-hairline-ink bg-[#e9e2d6] p-[22px]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#865009"
              strokeWidth="1.6"
              aria-hidden="true"
              className="mt-0.5 h-[22px] w-[22px] shrink-0"
            >
              <path d="M3 6.5h18v11H3z" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <div>
              <p className="m-0 mb-1 font-semibold">
                Share your enquiry and we&apos;ll get back to you as soon as possible.
              </p>
              <p className="m-0 text-[0.9375rem] leading-[1.6] text-midnight/68">
                Including the ones that turn into a no. Bookings move fastest
                when the date and venue come with the message.
              </p>
            </div>
          </div>

          {/* Direct lines sit above the socials and below the form promise:
              a reader who does not want a form should find the address and the
              number before they are offered a feed to follow. Both are real
              links, so a phone dials and a desktop opens a mail client. */}
          <div className="mb-7 border-t border-hairline-ink pt-[26px]">
            <p className="mb-3.5 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
              Direct lines
            </p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li className="flex items-center gap-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#865009"
                  strokeWidth="1.6"
                  aria-hidden="true"
                  className="h-[18px] w-[18px] shrink-0"
                >
                  <path d="M3 6.5h18v11H3z" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[1.0625rem] text-midnight/85 underline decoration-amber-ink/35 underline-offset-4 transition-colors hover:text-amber-ink hover:decoration-amber-ink"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#865009"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-[18px] w-[18px] shrink-0"
                >
                  <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 5 5.1 1.5 1.5 0 0 1 6.5 3.5Z" />
                </svg>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="text-[1.0625rem] tabular-nums text-midnight/85 underline decoration-amber-ink/35 underline-offset-4 transition-colors hover:text-amber-ink hover:decoration-amber-ink"
                >
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </li>
            </ul>
          </div>

          {/* surface="ink" because this row sits on the Ivory page. The footer
              passes "dark" on the very same page. That is the whole reason the
              prop is required. */}
          <div className="border-t border-hairline-ink pt-[26px]">
            <p className="mb-3.5 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
              Or find him here
            </p>
            <SocialList surface="ink" />
          </div>
        </div>

        {/* FORM */}
        <div className="min-w-0 flex-[1_1_440px]">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
