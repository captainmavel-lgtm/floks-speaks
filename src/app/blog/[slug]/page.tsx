import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getArticleBySlug, getArticles } from "@/lib/sanity-queries";
import { formatDate } from "@/lib/content";
import ShareButtons from "@/components/share-buttons";

export const instant = false;

/* ---------- metadata ---------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Not found" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

/* ---------- portable text rendering ---------- */

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="mb-[1.2em] text-[1.125rem] leading-[1.82] text-midnight/82 last:mb-0">
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <h2 className="font-editorial mt-10 mb-4 text-[1.5rem] leading-[1.3] text-midnight">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-display mt-8 mb-3 text-[1.1875rem] font-semibold text-midnight">
        {children}
      </h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-6 border-l-[3px] border-amber-deep pl-6 italic text-midnight/72">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold text-midnight">{children}</strong>
    ),
    em: ({ children }: any) => <em>{children}</em>,
    link: ({ value, children }: any) => (
      <a
        href={value?.href}
        className="underline decoration-amber-deep/40 underline-offset-2 hover:decoration-amber-deep"
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel={value?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
  },
};

/* ---------- page ---------- */

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <>
      {/* HEADER */}
      <section className="border-b border-hairline-ink">
        <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-16">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-amber-ink no-underline hover:text-amber-deep"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
              className="h-3.5 w-3.5"
            >
              <path d="M10 3 5 8l5 5" />
            </svg>
            Back to blog
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-lilac-deep px-3 py-[6px] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-lilac-ink">
              {article.category}
            </span>
            <span className="text-[0.8125rem] text-midnight/60">
              {formatDate(article.publishedAt)} &middot; {article.readMins} min
              read
            </span>
          </div>

          <h1 className="font-editorial mt-5 text-h1">{article.title}</h1>
          <p className="mt-4 max-w-[60ch] text-lede leading-[1.7] text-midnight/78">
            {article.excerpt}
          </p>

          {/* Author byline */}
          <div className="mt-6 flex items-center gap-3.5">
            {article.authorPhotoUrl && (
              <Image
                src={article.authorPhotoUrl}
                alt={article.author ?? "Author"}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border border-hairline-ink object-cover"
              />
            )}
            <div>
              <p className="m-0 text-[0.9375rem] font-semibold text-midnight">
                {article.author ?? "Floks Speaks"}
              </p>
              {article.authorBio && (
                <p className="m-0 text-[0.8125rem] text-midnight/60">
                  {article.authorBio}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* COVER IMAGE */}
      {article.coverImageUrl && (
        <section className="border-b border-hairline-ink">
          <div className="mx-auto w-full max-w-site px-(--spacing-gut)">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              width={1200}
              height={630}
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
              className="w-full rounded-b-2xl object-cover"
              style={{ maxHeight: "480px" }}
            />
          </div>
        </section>
      )}

      {/* BODY */}
      <section>
        <div className="mx-auto w-full max-w-read px-(--spacing-gut) py-14">
          <PortableText value={article.body} components={ptComponents} />

          {/* SHARE */}
          <div className="mt-12 border-t border-hairline-ink pt-8">
            <p className="mb-4 text-[0.75rem] uppercase tracking-[0.08em] text-midnight/55">
              Share this article
            </p>
            <ShareButtons
              title={article.title}
              slug={article.slug}
            />
          </div>
        </div>
      </section>

      {/* BACK TO BLOG */}
      <section className="border-t border-hairline-ink">
        <div className="mx-auto flex w-full max-w-site items-center justify-center px-(--spacing-gut) py-12">
          <Link
            href="/blog"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-edge-ink px-[30px] text-[0.9375rem] font-semibold text-midnight no-underline transition-colors duration-200 hover:border-midnight"
          >
            More from the blog
          </Link>
        </div>
      </section>
    </>
  );
}
