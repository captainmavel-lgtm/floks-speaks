import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/* ============================================================================
   ROBOTS

   Served at /robots.txt.

   The site is small and entirely public, so the rule is "crawl everything"
   with two carve-outs:

     /api/   — the audio upload and CORS routes. Nothing to index, and the
               upload route should not be advertised in a crawl at all.
     /_next/ — build output. Crawlers ignore it anyway, but a crawl budget
               spent on hashed chunks is a crawl budget not spent on
               recordings.

   The feed is NOT disallowed. Several podcast directories check robots.txt
   before fetching /feed.xml, and a block here would quietly stop the
   migration that is already in flight.

   GPTBot and the other AI crawlers are deliberately left allowed. Felix's
   whole purpose is for the words to travel, and an assistant that can quote
   a piece and name its source is doing the same job as a search result.
   Flip this if he ever asks for the opposite.
   ========================================================================= */

/* Netlify sets CONTEXT on every build. next.config.ts already keys the
   X-Robots-Tag noindex header on it for Build Bible phase 7; robots.txt has to
   agree, or a deploy preview serves a header saying "do not index" alongside a
   robots.txt saying "crawl everything" and pointing at the production sitemap.
   Undefined CONTEXT is a local build, which is also not production, so the
   default is the closed one. */
const IS_PRODUCTION = process.env.CONTEXT === "production";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
