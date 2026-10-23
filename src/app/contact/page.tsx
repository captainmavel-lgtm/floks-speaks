import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import SocialList from "@/components/social-list";
import JsonLd from "@/components/json-ld";
import { ID, abs, breadcrumbLd, graph, pageMeta } from "@/lib/seo";

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
