/* ============================================================================
   /feed.xml  —  Build Bible Phase 5 (GATE M)

   Thin by design. Everything that decides what the XML says lives in
   src/lib/podcast-feed.ts as a pure function, so the catalogue can be run
   through it offline and diffed against the archived Anchor feed without a
   network or a running server. See scripts/verify-feed.ts.

   This file is only responsible for fetching and for the response headers.
   ========================================================================= */

import { getFeedRecordings, getSiteSettings } from "@/lib/sanity-queries";
import { buildFeed } from "@/lib/podcast-feed";

/* No route segment config here. This project sets cacheComponents in
   next.config.ts, which rejects `export const dynamic` outright, and under it
   a route handler is already uncached by default — which is what the feed
   needs: a recording published in Sanity reaches directories without a
   redeploy. Freshness is bounded by the 60 second revalidate on
   getFeedRecordings and the Cache-Control set below. */

export async function GET() {
  const [recordings, settings] = await Promise.all([
    getFeedRecordings(),
    getSiteSettings(),
  ]);

  return new Response(buildFeed(recordings, settings), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      /* Short enough that a new episode is never meaningfully late —
         directories poll on the order of hours — and long enough that a
         burst of apps refreshing does not all land on Sanity at once. */
      "Cache-Control":
        "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
