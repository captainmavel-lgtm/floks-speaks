# SEO and web assets

What was added, where it lives, and what still needs
a human to finish it.

## Files added

| File | Serves | What it does |
| --- | --- | --- |
| `src/lib/seo.ts` | n/a | Canonical and social-card composition, plus every JSON-LD builder |
| `src/components/json-ld.tsx` | n/a | Renders a structured-data block safely |
| `src/app/sitemap.ts` | `/sitemap.xml` | Static routes plus live collections and articles from Sanity |
| `src/app/robots.ts` | `/robots.txt` | Crawl rules, feed-safe, closed on non-production builds |
| `src/app/manifest.ts` | `/manifest.webmanifest` | Installable on a phone home screen |
| `src/app/icon.svg` | `/icon.svg` | Scalable favicon |
| `src/app/favicon.ico` | `/favicon.ico` | 16, 32 and 48px favicon |
| `src/app/apple-icon.png` | `/apple-icon.png` | 180px iOS home-screen icon |
| `public/icons/*` | `/icons/*` | 192, 512 and maskable icons for the manifest |
| `public/og/*.jpg` | `/og/*.jpg` | 1200x630 share cards |

## The one thing that was actually broken

Before this change the site served the stock Next.js
"N" favicon. Every browser tab, bookmark and history
entry for floksspeaks.org carried the framework's logo
rather than Felix's.

## The icon mark

The app icon is the wordmark's own speech bubble with
an F knocked out of it, Ivory on Midnight. It is not an
invented shape. The logo already builds the bubble as a
filled block with "speaks" reversed out, and the icon
keeps that construction, cropped to the one letter that
survives at 16 pixels.

The full wordmark is not used as an icon because it is
roughly 3:1. Set into a square at 16px, each letter
lands under two pixels wide.

Colours are the logo pair as it appears on the dark
site. No third colour is introduced. The Amber floor
glow is the podcast artwork's, and it is dropped at
favicon sizes where it would only soften the edge.

Source of truth is `public/brand/logo-ivory.svg` and
`logo-navy.svg`. Those are vector and already carry the
brand colours, which is why they beat both the PDF
master (black, needs recolouring) and any PNG export
(raster, falls apart above 600px).

## The share cards

Built from `public/podcast-cover-3000.jpg`, the real
finished artwork, cropped to a centred 1.91:1 band.
That ratio is what Open Graph and X both render without
letterboxing, and the crop keeps the wordmark, the
waveform and the floor light.

Using the real cover means a link preview matches what
listeners already see in Spotify and Apple Podcasts, so
it is recognised before it is read.

Cards are JPEG at quality 86, about 97KB each. PNG cost
roughly 700KB for no visible gain on photographic
artwork, and several scrapers give a card image a short
fetch budget.

Per-section cards carry an Amber eyebrow label. A blog
post or a collection uses its own cover image instead
when it has one, and falls back to the section card
when it does not.

## Structured data

One `@graph` block per page rather than several script
tags, so nodes reference each other by `@id` instead of
repeating the publisher and author every time.

Site-wide, from `layout.tsx`, on every page:

- `Organization`
- `Person` for Felix
- `WebSite` with a search action pointing at `/listen`

Per page:

| Route | Nodes |
| --- | --- |
| `/` | `PodcastSeries` with episodes, `BreadcrumbList` |
| `/listen` | `PodcastSeries` with episodes, `BreadcrumbList` |
| `/listen/collection/[slug]` | `CollectionPage` with an `ItemList`, `BreadcrumbList` |
| `/blog` | `Blog` listing its posts, `BreadcrumbList` |
| `/blog/[slug]` | `BlogPosting`, `BreadcrumbList` |
| `/about` | `ProfilePage` pointing at the Person node |
| `/contact` | `ContactPage` |

Recordings have no page of their own, so each
`PodcastEpisode` anchors to `/listen#slug`. That is a
real fragment on a real page, not an invented URL.

A guest contributor gets a plain `Person` node with
their name. Only Felix's own pieces reference the
`Person` node by `@id`, so the graph never claims a
guest piece is his.

## Two traps worth knowing about

**Next merges metadata shallowly.** The moment a page
writes its own `openGraph` or `alternates`, the whole
block from `layout.tsx` is replaced, images and feed
link included. This already bit once: `/about` rendered
no `rel=alternate` at all until the feed link was moved
into `pageMeta`. No page should write an `openGraph`
block by hand. Call `pageMeta` and it rebuilds the
whole block each time.

**`cacheComponents` is on.** A `revalidate` segment
export is rejected at build time. The sitemap uses
`"use cache"` with `cacheLife("hours")` instead.

## Still to do, needs a human

1. **Claim Google Search Console** for floksspeaks.org,
   then set `GOOGLE_SITE_VERIFICATION` in Netlify to the
   token and redeploy. The meta tag is wired and stays
   absent until the variable exists.

2. **Claim Bing Webmaster Tools**, then set
   `BING_SITE_VERIFICATION` the same way. Bing feeds
   DuckDuckGo, so this is worth doing.

3. **Submit the sitemap** at
   `https://floksspeaks.org/sitemap.xml` in both
   consoles once verified.

4. **Request indexing** for the home page and `/listen`
   in Search Console. Do not bulk-submit every URL. The
   sitemap handles the rest.

5. **Re-scrape the share cards.** Facebook and LinkedIn
   both cache aggressively and will hold an old preview
   for weeks. Facebook Sharing Debugger and LinkedIn
   Post Inspector each have a re-scrape button. WhatsApp
   reads Facebook's cache, so doing Facebook fixes
   WhatsApp too.

6. **Check the rich result** for the podcast at
   search.google.com/test/rich-results against the live
   URL. It cannot be checked from a local build because
   the Sanity dataset is not reachable there.

## Known limits

The sitemap's dynamic half could not be verified in
this environment. The sandbox cannot reach
`apicdn.sanity.io`, so the build logged the failure and
emitted the seven static routes, which is the fallback
behaving correctly. On Netlify the collections and
articles will be included. Worth opening
`/sitemap.xml` on the live site once to confirm the
count looks right.

Verification tokens are read from the build environment
rather than committed, which is correct, but it does
mean a token added in Netlify needs a redeploy before
it appears.

The AI crawlers, GPTBot and the rest, are deliberately
allowed in `robots.txt`. The reasoning is in the file.
Flip it if Felix ever wants the opposite.
