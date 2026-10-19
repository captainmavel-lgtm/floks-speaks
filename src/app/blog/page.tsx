import type { Metadata } from "next";
import { getArticles } from "@/lib/sanity-queries";
import Journal from "@/components/journal";
import NewsletterForm from "@/components/newsletter-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing between the recordings. Testimonies, poetry, and the work behind the pieces.",
};

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <>
      <section className="border-b border-hairline-ink">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-10">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
            Blog
          </p>
          <h1 className="font-editorial text-h1">Writing between the recordings.</h1>
          <p className="mt-5 max-w-[52ch] text-lede leading-[1.7] text-midnight/78">
            Where a thought needs more than two minutes. Testimonies, poetry,
            and the work behind the pieces.
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
          <NewsletterForm inputId="nl" />
        </div>
      </section>
    </>
  );
}
