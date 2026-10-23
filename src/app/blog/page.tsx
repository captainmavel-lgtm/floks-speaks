import type { Metadata } from "next";
import { getArticles } from "@/lib/sanity-queries";
import Journal from "@/components/journal";
import JsonLd from "@/components/json-ld";
import {
  ID,
  SITE_URL,
  abs,
  breadcrumbLd,
  graph,
  pageMeta,
} from "@/lib/seo";

export const instant = false;

export const metadata: Metadata = pageMeta({
  title: "Blog",
  description:
    "Writing between the recordings. Testimonies, poetry, trusting God, the craft, and the thinking behind each piece.",
  path: "/blog",
  image: "/og/og-blog.jpg",
});

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <>
      {/* A Blog node listing its posts, so a crawler reads this as an index
          rather than one more page of prose. Each post's full BlogPosting
          lives on the article itself; these are pointers to them. */}
      <JsonLd
        data={graph(
          {
            "@type": "Blog",
            "@id": `${SITE_URL}/blog#blog`,
            name: "The Floks Speaks blog",
            description:
              "Writing between the recordings. Testimonies, poetry, trusting God, the craft, and the thinking behind each piece.",
            url: abs("/blog"),
            inLanguage: "en-GH",
            publisher: { "@id": ID.org },
            author: { "@id": ID.person },
            blogPost: articles.map((a) => ({
              "@type": "BlogPosting",
              "@id": `${abs(`/blog/${a.slug}`)}#article`,
              headline: a.title,
              url: abs(`/blog/${a.slug}`),
              datePublished: a.publishedAt,
            })),
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        )}
      />
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
