import type { Metadata } from "next";
import { getArticles } from "@/lib/sanity-queries";
import Journal from "@/components/journal";

export const instant = false;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing between the recordings. Notes on craft, faith, and the things that end up becoming poems.",
};

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <>
      <section className="border-b border-hairline-ink">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-16">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
            The Journal
          </p>
          <h1 className="font-editorial text-h1">Writing between the recordings.</h1>
          <p className="mt-5 max-w-[52ch] text-lede leading-[1.7] text-midnight/78">
            Where a thought needs more than two minutes. Notes on craft, faith,
            and the things that end up becoming poems.
          </p>
        </div>
      </section>

      <Journal articles={articles} />

      {/* NEWSLETTER */}
      <section className="on-dark bg-midnight text-ivory">
        <div className="mx-auto flex w-full max-w-site flex-wrap items-center gap-10 px-(--spacing-gut) py-14">
          <div className="min-w-0 flex-[1_1_360px]">
            <h2 className="font-editorial mb-3 text-h2-ed">New words, now and then.</h2>
            <p className="m-0 text-ivory/70">
              A short note when a new piece goes up. Nothing else. Your address
              goes to nobody.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}

function NewsletterForm() {
  return (
    <form className="min-w-0 flex-[1_1_380px]">
      <label
        htmlFor="nl"
        className="mb-3 block text-[0.8125rem] uppercase tracking-[0.08em] text-ivory/60"
      >
        Email address
      </label>
      <div className="flex flex-wrap gap-3">
        <input
          id="nl"
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
        Double opt-in. You confirm by email first. Unsubscribe any time.
      </p>
    </form>
  );
}
