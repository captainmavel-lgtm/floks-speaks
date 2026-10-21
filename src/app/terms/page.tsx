import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Terms",
  description:
    "Using this site, and using the work. Performing a piece needs no permission. Publishing or selling one does.",
};

const UPDATED = "14 October 2026";

export default function TermsPage() {
  return (
    <section>
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-16">
        <div className="doc">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
            Terms
          </p>
          <h1 className="font-editorial mb-[18px] text-h1">Using this site.</h1>
          <p className="mb-8 text-[0.875rem] text-midnight/60">
            Last updated {UPDATED}
          </p>

          <h2>Who this is</h2>
          <p>
            Floks Speaks is the spoken word work of Felix Lokko, based in Accra,
            Ghana. Using this site means accepting what is set out here.
          </p>

          <h2>The words belong to Felix</h2>
          <p>
            The recordings, the written pieces, the artwork and the Floks Speaks
            name and logo are his. Listening is free and sharing a link is
            welcome. What is not permitted without asking first:
          </p>
          <ul>
            <li>
              Re-uploading the recordings to another platform as your own, or
              under another name.
            </li>
            <li>
              Using the audio in a video, advert, compilation or other work that
              you publish.
            </li>
            <li>Selling the recordings or anything made from them.</li>
            <li>Printing the words or the artwork on goods.</li>
          </ul>
          <p>
            <strong>Performing a piece needs no permission.</strong> At a church
            service, a youth meeting, a school, a camp or any gathering of that
            kind, go ahead and perform it. Credit Floks Speaks when you do. This
            is the use the work exists for, and nobody needs to write and ask
            first.
          </p>
          <p>
            Quoting a line in a sermon, a post or an article, with credit, needs
            no permission either.
          </p>
          <p>
            What still needs asking is anything published or sold: putting the
            audio in a video, releasing a recording of your own performance, or
            any of the four things listed above.
          </p>

          <h2>Music in the recordings</h2>
          <p>
            Some recordings carry background music, beats or instrumentals that
            Floks Speaks did not create. Where that is so, the rights in that
            music belong to whoever made it, and nothing on this page grants you
            any rights over it.
          </p>
          <p>
            In practice this matters when you want to reuse the audio rather
            than perform the words. Performing a piece live in your own voice
            raises no question about the music. Re-publishing a recording might,
            so ask first and we will tell you what the recording contains.
          </p>

          <h2>Booking enquiries</h2>
          <p>
            Sending the form starts a conversation. It is not a booking and it
            does not commit either side to anything. Dates, fees and
            arrangements are agreed separately, in writing, after that
            conversation.
          </p>

          <h2>Merchandise</h2>
          <p>
            Shirt orders are arranged through WhatsApp. Price, sizes, payment
            and delivery are agreed in that conversation. Nothing on this page
            overrides what is agreed there.
          </p>

          <h2>Other websites</h2>
          <p>
            This site links out to podcast platforms, social media and WhatsApp.
            Those are run by other companies under their own terms. We are not
            responsible for what happens on them.
          </p>

          <h2>What we do not promise</h2>
          <p>
            The site is offered as it is. We work to keep it available and
            accurate, but we cannot promise it will never be offline, that every
            link will always work, or that the content is free of mistakes.
            Nothing here is professional advice of any kind.
          </p>

          <h2>Changes</h2>
          <p>
            These terms may change as the work grows. The date at the top shows
            when they last did.
          </p>

          <h2>Questions</h2>
          <p>
            Anything unclear, or a use you want to check, goes through the{" "}
            <Link href="/contact">contact form</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
