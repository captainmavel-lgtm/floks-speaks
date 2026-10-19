/* ============================================================================
   PODCAST RSS FEED BUILDER  —  Build Bible Phase 5 (GATE M)

   This file is the show. Six directories — Spotify, Apple, Audible, Amazon
   Music, iHeart, Deezer — will poll the feed this builds and render whatever
   it says to every existing subscriber. A mistake here is not a visual bug on
   a page someone might not visit; it is a wrong episode, a duplicate show, or
   a silent stop in a feed people already subscribe to.

   Three rules this file exists to keep:

   1. GUIDs are identity. A podcast app decides "have I seen this episode?"
      by GUID alone, never by title or URL. The GUIDs here came from the
      Anchor feed and are stored in Sanity unchanged. Emit a new GUID for an
      existing episode and every app re-downloads and re-notifies it as new.
      docs/phase5/anchor-feed-baseline.json is the record of the originals.

   2. Only published recordings. A draft reaching this feed is published to
      every subscriber the moment a directory polls, and cannot be recalled.

   3. The enclosure must carry a correct byte length. Some apps use it to
      allocate the download and will fail or truncate on a wrong one.

   The channel-level fields come from the siteSettings singleton so Felix can
   correct a show description without a developer. That document does not
   exist in the dataset yet, so every field falls back to the value the
   directories are already serving, taken from the archived Anchor feed. The
   feed is therefore correct before the singleton is created and improves
   when it is, rather than being blocked on it.

   buildFeed is deliberately pure: data in, XML string out, no fetching. That
   is what lets scripts/verify-feed.ts run the real catalogue through it and
   diff the result against the archive without a network or a running server.
   ========================================================================= */

import type { FeedRecording } from "./sanity-queries";

const SITE = "https://floksspeaks.org";

/* Audio is stored in R2 and Sanity records whichever hostname the uploader
   wrote at the time. Rewriting here rather than rewriting the documents keeps
   Sanity as the record of what was uploaded, and lets the hostname move again
   without touching content.

   The default is the r2.dev hostname because it is the one that is verified
   working. media.floksspeaks.org was tried first and served
   ERR_SSL_VERSION_OR_CIPHER_MISMATCH: the DNS record resolves but Cloudflare
   has not issued a certificate for it, so the custom domain is not finished
   connecting on the bucket. An enclosure pointing there would fail for every
   listener and, worse, be cached as a failure by some apps.

   r2.dev is Cloudflare's development URL. It is rate limited and documented
   as unsuitable for production traffic, which is exactly what a podcast
   enclosure attracts, so this is a deliberate stopgap and not the end state.
   Once the custom domain serves audio over HTTPS, set AUDIO_HOST to
   media.floksspeaks.org in Netlify and redeploy. Nothing else changes, and
   changing it is safe at any time: apps identify an episode by GUID, never
   by its audio URL.

   Verify before flipping it, with a browser or:
     curl -I https://media.floksspeaks.org/episodes/education.mp3
   A working host answers 200 with Content-Type: audio/mpeg. */
const AUDIO_HOST = process.env.AUDIO_HOST ?? "pub-045841bc9a9d4e4fb0a6245f95a01bf3.r2.dev";
const R2_DEV_HOST = "pub-045841bc9a9d4e4fb0a6245f95a01bf3.r2.dev";

/* Fallbacks are the values the Anchor feed is serving today, not invented
   defaults. If siteSettings is absent or a field is blank, the directories
   see no change at cutover. */
const FALLBACK = {
  title: "Floks Speaks",
  description:
    "Christian spoken word where faith meets raw expression. Jesus Reigns.",
  language: "en",
  author: "Felix Lokko",
  ownerName: "Felix Lokko",
  ownerEmail: "floksspeaks@gmail.com",
  category: "Religion & Spirituality",
  subcategory: "Christianity",
  explicit: false,
  copyright: "Felix Lokko",
  image: `${SITE}/podcast-cover-3000.jpg`,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Escape text for XML.
 *
 * Every value below is author-controlled free text. An unescaped ampersand
 * in a title is enough to make the whole document unparseable, at which
 * point a directory sees a broken feed rather than a bad episode. The
 * apostrophe is escaped as &apos; so the output is safe inside attributes
 * too, since the same helper is used for both.
 */
function xml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RFC 2822 date, which is what RSS pubDate requires.
 *
 * toUTCString() returns "Fri, 01 May 2026 04:32:00 GMT", the exact shape
 * the archived Anchor feed uses. Date.toISOString() would parse for some
 * readers and be rejected by others, so it is not an option here.
 */
function rfc2822(iso: string): string {
  return new Date(iso).toUTCString();
}

/** HH:MM:SS, the least ambiguous of the forms Apple accepts. */
function hhmmss(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** Point an enclosure at the production media host. */
function audioUrl(stored: string): string {
  if (!stored) return "";
  try {
    const u = new URL(stored);
    if (u.hostname === R2_DEV_HOST) u.hostname = AUDIO_HOST;
    return u.toString();
  } catch {
    // Not a parseable URL. Emitting it raw would produce an enclosure no
    // app can fetch, so the caller drops the episode instead.
    return "";
  }
}

/**
 * An episode is only safe to publish if an app can actually play it.
 *
 * These four fields are all required by the Sanity schema, so a document
 * missing one should not exist. This is the backstop for the case where one
 * does: dropping the episode loses it from the feed until it is fixed,
 * which is recoverable. Emitting an enclosure with a zero length or an
 * empty URL is not — apps cache the failure.
 */
function isPlayable(r: FeedRecording): boolean {
  return Boolean(
    r.guid && audioUrl(r.audioUrl) && r.fileSize > 0 && r.duration > 0,
  );
}

/* ------------------------------------------------------------------ */
/*  Route                                                              */
/* ------------------------------------------------------------------ */

export function buildFeed(
  recordings: FeedRecording[],
  settings: unknown,
  now: Date = new Date(),
): string {
  const s = (settings ?? {}) as Record<string, unknown>;
  const pick = (key: string, fallback: string) => {
    const v = s[key];
    return typeof v === "string" && v.trim() ? v.trim() : fallback;
  };

  const showTitle = pick("podcastShowTitle", FALLBACK.title);
  const showDesc = pick("podcastDescription", FALLBACK.description);
  const language = pick("podcastLanguage", FALLBACK.language);
  const author = pick("podcastAuthor", FALLBACK.author);
  const ownerEmail = pick("podcastOwnerEmail", FALLBACK.ownerEmail);
  const category = pick("podcastCategory", FALLBACK.category);
  const explicit =
    typeof s.podcastExplicit === "boolean"
      ? s.podcastExplicit
      : FALLBACK.explicit;

  /* Newest first. Directories read top-down and some surface the first item
     as the latest episode regardless of pubDate. */
  const items = recordings.filter(isPlayable).reverse();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xml(showTitle)}</title>
    <link>${xml(SITE)}</link>
    <description>${xml(showDesc)}</description>
    <language>${xml(language)}</language>
    <copyright>${xml(FALLBACK.copyright)}</copyright>
    <lastBuildDate>${xml(now.toUTCString())}</lastBuildDate>
    <atom:link href="${xml(SITE)}/feed.xml" rel="self" type="application/rss+xml"/>
    <itunes:author>${xml(author)}</itunes:author>
    <itunes:summary>${xml(showDesc)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>${explicit ? "true" : "false"}</itunes:explicit>
    <itunes:image href="${xml(FALLBACK.image)}"/>
    <itunes:owner>
      <itunes:name>${xml(FALLBACK.ownerName)}</itunes:name>
      <itunes:email>${xml(ownerEmail)}</itunes:email>
    </itunes:owner>
    <itunes:category text="${xml(category)}">
      <itunes:category text="${xml(FALLBACK.subcategory)}"/>
    </itunes:category>
${items.map(item).join("\n")}
  </channel>
</rss>
`;

  return body;
}

function item(r: FeedRecording): string {
  const url = audioUrl(r.audioUrl);
  const page = `${SITE}/listen`;
  return `    <item>
      <title>${xml(r.title)}</title>
      <link>${xml(page)}</link>
      <description>${xml(r.summary)}</description>
      <itunes:summary>${xml(r.summary)}</itunes:summary>
      <pubDate>${xml(rfc2822(r.publishedAt))}</pubDate>
      <guid isPermaLink="false">${xml(r.guid)}</guid>
      <enclosure url="${xml(url)}" length="${r.fileSize}" type="${xml(r.mimeType ?? "audio/mpeg")}"/>
      <itunes:duration>${hhmmss(r.duration)}</itunes:duration>
      <itunes:explicit>${r.explicit ? "true" : "false"}</itunes:explicit>${
        r.coverImageUrl
          ? `\n      <itunes:image href="${xml(r.coverImageUrl)}"/>`
          : ""
      }
    </item>`;
}
