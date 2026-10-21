import type { Metadata } from "next";
import { getArticles } from "@/lib/sanity-queries";
import Journal from "@/components/journal";

export const instant = false;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing between the recordings. Testimonies, poetry, trusting God, the craft, and the thinking behind each piece.",
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
          <p className="mt-5 max-w-[56ch] text-lede leading-[1.7] text-midnight/78">
            Where a thought needs more than two minutes. Testimonies and
            poetry, trusting God, the craft itself, and what sits behind
            each piece.
          </p>
        </div>
      </section>

      <Journal articles={articles} />
    </>
  );
}
