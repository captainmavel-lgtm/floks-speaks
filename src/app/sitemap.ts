import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { getArticles, getCollections, getRecordings } from "@/lib/sanity-queries";
import { SITE_URL } from "@/lib/seo";

/* ============================================================================
   SITEMAP

   Served at /sitemap.xml and pointed at from robots.txt.

   The static pages are listed by hand because there are seven of them and a
   hand-written list cannot accidentally expose a route. Everything else is
   read from Sanity, so a collection Felix adds on a Tuesday is in the sitemap
   the next time the route revalidates rather than the next time someone
   remembers to edit a file.

   Two deliberate choices worth keeping:

   1. The Sanity read is wrapped. A sitemap is not worth failing a deploy for.
      If the dataset is unreachable the static routes still ship, and the
      dynamic ones return on the next build. Shipping nothing would be worse:
      an empty or 500-ing sitemap tells Search Console the site has no pages.

   2. lastModified is the content's own publish date where we have one, not
      new Date(). A build timestamp on every URL tells a crawler the whole
      site changed on every deploy, which trains it to ignore the field.
   ========================================================================= */

type Entry = MetadataRoute.Sitemap[number];

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: Entry["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/listen", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

/** Newest publish date in a set, for a listing page's lastModified. */
function newest(dates: Array<string | undefined | null>): Date | undefined {
  const times = dates
    .filter(Boolean)
    .map((d) => new Date(d as string).getTime())
    .filter((t) => Number.isFinite(t));
  return times.length ? new Date(Math.max(...times)) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* cacheComponents is on, so a `revalidate` segment export is rejected and
     the lifetime is declared here instead. Hourly: the underlying Sanity
     reads already refresh on their own 60s window, and a sitemap that is at
     most an hour behind is well inside how often a crawler returns. */
  "use cache";
  cacheLife("hours");

  let recordings: Awaited<ReturnType<typeof getRecordings>> = [];
  let collections: Awaited<ReturnType<typeof getCollections>> = [];
  let articles: Awaited<ReturnType<typeof getArticles>> = [];

  try {
    [recordings, collections, articles] = await Promise.all([
      getRecordings(),
      getCollections(),
      getArticles(),
    ]);
  } catch (err) {
    console.error("[sitemap] Sanity unreachable, emitting static routes", err);
  }

  const lastRecording = newest(recordings.map((r) => r.publishedAt));
  const lastArticle = newest(articles.map((a) => a.publishedAt));
  const lastAny = newest([
    lastRecording?.toISOString(),
    lastArticle?.toISOString(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified:
      r.path === "/"
        ? lastAny
        : r.path === "/listen"
          ? lastRecording
          : r.path === "/blog"
            ? lastArticle
            : undefined,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    /* The home and listen pages are where the artwork lives, so they carry an
       image sitemap entry. Google indexes podcast cover art from this. */
    ...(r.path === "/" || r.path === "/listen"
      ? { images: [`${SITE_URL}/podcast-cover-3000.jpg`] }
      : {}),
  }));

  /* Blog categories are stored in the same document type as themes and
     curated sets, separated by `kind`. They have no page of their own under
     /listen, so listing them would put a 404 in the sitemap. */
  const collectionEntries: MetadataRoute.Sitemap = collections
    .filter((c) => c.kind !== "blog" && Boolean(c.slug))
    .map((c) => ({
      url: `${SITE_URL}/listen/collection/${c.slug}`,
      lastModified: lastRecording,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      ...(c.coverImageUrl ? { images: [c.coverImageUrl] } : {}),
    }));

  const articleEntries: MetadataRoute.Sitemap = articles
    .filter((a) => Boolean(a.slug))
    .map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: a.publishedAt ? new Date(a.publishedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      ...(a.coverImageUrl ? { images: [a.coverImageUrl] } : {}),
    }));

  return [...staticEntries, ...collectionEntries, ...articleEntries];
}
