import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Floks Speaks keeps, why, and what you can ask for. No advertising or tracking cookies.",
};

/* The date is a constant, not new Date(): a "last updated" that moves on its
   own is worse than no date at all. Change it when the text changes. */
const UPDATED = "14 October 2026";

export default function PrivacyPage() {
  return (
    <section>
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-16">
        <div className="doc">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
            Privacy
          </p>
          <h1 className="font-editorial mb-[18px] text-h1">
            What we keep, and why.
          </h1>
          <p className="mb-8 text-[0.875rem] text-midnight/60">
            Last updated {UPDATED}
          </p>

          <h2>The short version</h2>
          <p>
            Floks Speaks is a place to listen. You can read the pages and play
            the recordings without telling us anything about yourself. We only
            hold personal details when you hand them over, which happens in two
            places: the enquiry form and the newsletter.
          </p>
          <p>
            We do not sell anything about you to anyone, and we do not share
            your details with other organisations for their own marketing.
          </p>

          <h2>What you give us</h2>
          <dl>
            <dt>The enquiry form</dt>
            <dd>
              Your name, email address, the enquiry type you pick, your message,
              and for bookings the optional event date and venue. This reaches
              Floks by email so he can reply. It is used to answer you and
              nothing else.
            </dd>
            <dt>The newsletter</dt>
            <dd>
              Your email address. We ask you to confirm by clicking a link in a
              first email, so nobody can sign you up without your knowledge.
              Every newsletter carries an unsubscribe link, and unsubscribing
              removes you from the list.
            </dd>
            <dt>Ordering a shirt</dt>
            <dd>
              Orders go through WhatsApp, which means the conversation happens
              inside WhatsApp and is covered by their terms, not ours. We keep
              whatever you tell us there for as long as it takes to fulfil the
              order and answer questions about it.
            </dd>
          </dl>

          <h2>What is collected automatically</h2>
          <p>
            Like any website, the server records ordinary technical details when
            a page loads: the address of the device requesting it, the browser
            type, and which page was asked for. This is how web hosting works
            and it is used to keep the site running and to spot abuse.
          </p>
          <p>The site sets no advertising or tracking cookies.</p>

          <h2>Who else handles it</h2>
          <p>
            Running a website means using other companies for specific jobs.
            Each sees only what it needs:
          </p>
          <ul>
            <li>
              <strong>The form service</strong> receives enquiry submissions and
              passes them on by email, and filters spam.
            </li>
            <li>
              <strong>The newsletter service</strong> stores subscriber email
              addresses and sends the messages.
            </li>
            <li>
              <strong>The hosting provider</strong> serves the pages and keeps
              the server logs described above.
            </li>
            <li>
              <strong>The podcast platforms</strong> are separate services. When
              you follow a link to Spotify, Apple Podcasts, Amazon Music,
              iHeartRadio, Deezer or Audible, you are on their website under
              their privacy policy, not this one. The same is true of the social
              media links.
            </li>
          </ul>
          <p>
            The specific companies are named in the published version of this
            page.
          </p>

          <h2>How long it is kept</h2>
          <p>
            Enquiry emails are kept while the conversation is useful, and
            reviewed periodically. Newsletter subscriptions last until you
            unsubscribe. Server logs are kept for a short period by the hosting
            provider and then discarded.
          </p>

          <h2>What you can ask for</h2>
          <p>
            You can ask what we hold about you, ask for it to be corrected, or
            ask for it to be deleted. You can unsubscribe from the newsletter at
            any time without asking anyone. Depending on where you live you may
            have further rights under local law, including the right to complain
            to a data protection regulator.
          </p>
          <p>
            To make any of these requests, use the{" "}
            <Link href="/contact">contact form</Link> and choose General.
          </p>

          <h2>Children</h2>
          <p>
            This site is written for a general audience and is not aimed at
            young children. We do not knowingly collect details from them. If
            you believe a child has sent us their details, tell us and we will
            remove them.
          </p>

          <h2>Changes</h2>
          <p>If this page changes, the date at the top changes with it.</p>

          <h2>Getting in touch</h2>
          <p>
            Questions about any of this go through the{" "}
            <Link href="/contact">contact form</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
