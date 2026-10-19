/* ============================================================================
   SANITY QUERIES — Phase 5

   GROQ queries and async fetch functions that replace the placeholder arrays
   in content.ts. Every function returns data shaped to match the types that
   components already use, so downstream pages need minimal changes.

   Caching strategy: unstable_cache with revalidation tags so Felix can
   publish in Sanity Studio and the site picks up changes within 60 seconds
   without a full rebuild.
   ========================================================================= */

import { unstable_cache } from "next/cache";
import { client, urlFor } from "./sanity";
import type { Recording, Collection, Article } from "./content";

// ---------------------------------------------------------------------------
// GROQ fragments — reused across queries
// ---------------------------------------------------------------------------

/** Project the fields that map onto our Recording type */
const RECORDING_PROJECTION = `{
  "_id": _id,
  "slug": slug.current,
  title,
  "theme": categories[0]->name,
  "themes": categories[]->name,
  "description": summary,
  "durationSec": duration,
  "publishedAt": publishedAt,
  "coverImageUrl": coverImage.asset->url,
  "coverImage": coverImage,
  audioUrl,
  "externalLinks": externalLinks
}`;

/** Project the fields that map onto our Collection type */
const COLLECTION_PROJECTION = `{
  "_id": _id,
  "slug": slug.current,
  "title": name,
  description,
  kind,
  accentColor,
  "coverImage": coverImage,
  "coverImageUrl": coverImage.asset->url,
  "recordings": recordings[]->{ "_id": _id, "slug": slug.current, "coverImageUrl": coverImage.asset->url },
  "taggedRecordings": *[
    _type == "audioTrack" && status == "published" && references(^._id)
  ] | order(publishedAt desc) {
    "_id": _id,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url
  }
}`;

/** Project the fields that map onto our Article type */
const ARTICLE_PROJECTION = `{
  "_id": _id,
  "slug": slug.current,
  "category": category->name,
  title,
  excerpt,
  "coverImageUrl": featuredImage.asset->url,
  "coverImage": featuredImage,
  publishedAt,
  "readMins": round(length(pt::text(body)) / 1000),
  body,
  author,
  authorBio,
  "authorPhotoUrl": authorPhoto.asset->url
}`;

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

/**
 * All published recordings, newest first.
 */
export const getRecordings = unstable_cache(
  async () => {
    const query = `*[_type == "audioTrack" && status == "published"] | order(publishedAt desc) ${RECORDING_PROJECTION}`;
    return client.fetch<Recording[]>(query);
  },
  ["recordings"],
  { revalidate: 60, tags: ["recordings"] },
);

/**
 * Single recording by slug.
 */
export const getRecordingBySlug = unstable_cache(
  async (slug: string) => {
    const query = `*[_type == "audioTrack" && slug.current == $slug && status == "published"][0] ${RECORDING_PROJECTION}`;
    return client.fetch<Recording | null>(query, { slug });
  },
  ["recording-by-slug"],
  { revalidate: 60, tags: ["recordings"] },
);

/**
 * All collections (themes and curated playlists).
 */
export const getCollections = unstable_cache(
  async () => {
    const query = `*[_type == "collection"] | order(name asc) ${COLLECTION_PROJECTION}`;
    return client.fetch<Collection[]>(query);
  },
  ["collections"],
  { revalidate: 60, tags: ["collections"] },
);

/**
 * Collection names that serve as themes (used for filter chips).
 * Returns just an array of name strings.
 */
export const getThemes = unstable_cache(
  async () => {
    const query = `*[_type == "collection"] | order(name asc) { "name": name }`;
    const result = await client.fetch<{ name: string }[]>(query);
    return result.map((c) => c.name);
  },
  ["themes"],
  { revalidate: 60, tags: ["collections"] },
);

/**
 * One collection by slug, with its tracks fully projected so the page can
 * play them. Curated order is preserved for a curated set; a theme falls
 * back to its tagged recordings, newest first.
 */
export const getCollectionBySlug = unstable_cache(
  async (slug: string) => {
    const query = `*[_type == "collection" && slug.current == $slug][0]{
      "_id": _id,
      "slug": slug.current,
      "title": name,
      description,
      kind,
      accentColor,
      "coverImageUrl": coverImage.asset->url,
      "tracks": recordings[]->${RECORDING_PROJECTION},
      "taggedTracks": *[
        _type == "audioTrack" && status == "published" && references(^._id)
      ] | order(publishedAt desc) ${RECORDING_PROJECTION}
    }`;
    return client.fetch<{
      _id: string;
      slug: string;
      title: string;
      description?: string;
      kind?: "theme" | "collection" | null;
      accentColor?: string | null;
      coverImageUrl: string | null;
      tracks: Recording[] | null;
      taggedTracks: Recording[] | null;
    } | null>(query, { slug });
  },
  ["collection-by-slug"],
  { revalidate: 60, tags: ["collections", "recordings"] },
);

/**
 * Homepage singleton — featured track and curated collections.
 */
export const getHomepage = unstable_cache(
  async () => {
    const query = `*[_type == "homepage"][0]{
      heroHeadline,
      "featuredTrack": featuredTrack->${RECORDING_PROJECTION},
      "curatedCollections": curatedCollections[]->${COLLECTION_PROJECTION},
      eventHighlight
    }`;
    return client.fetch<{
      heroHeadline?: string;
      featuredTrack?: Recording;
      curatedCollections?: Collection[];
      eventHighlight?: any;
    } | null>(query);
  },
  ["homepage"],
  { revalidate: 60, tags: ["homepage"] },
);

/**
 * Published blog posts, newest first.
 */
export const getArticles = unstable_cache(
  async () => {
    const query = `*[_type == "blogPost" && status == "published"] | order(publishedAt desc) ${ARTICLE_PROJECTION}`;
    return client.fetch<Article[]>(query);
  },
  ["articles"],
  { revalidate: 60, tags: ["articles"] },
);

/**
 * Single blog post by slug.
 */
export const getArticleBySlug = unstable_cache(
  async (slug: string) => {
    const query = `*[_type == "blogPost" && slug.current == $slug && status == "published"][0] ${ARTICLE_PROJECTION}`;
    return client.fetch<Article | null>(query, { slug });
  },
  ["article-by-slug"],
  { revalidate: 60, tags: ["articles"] },
);

/**
 * Upcoming events (date >= today, visible == true), sorted chronologically.
 */
export const getEvents = unstable_cache(
  async () => {
    const query = `*[_type == "event" && visible == true && date >= now()] | order(date asc) {
      _id,
      title,
      date,
      venue,
      location,
      description,
      bookingUrl
    }`;
    return client.fetch(query);
  },
  ["events"],
  { revalidate: 60, tags: ["events"] },
);

/**
 * Site settings singleton.
 */
export const getSiteSettings = unstable_cache(
  async () => {
    const query = `*[_type == "siteSettings"][0]`;
    return client.fetch(query);
  },
  ["site-settings"],
  { revalidate: 300, tags: ["site-settings"] },
);

/* ---------------------------------------------------------------------------
   PODCAST FEED — Build Bible Phase 5

   The feed needs fields the site itself never renders: the GUID that podcast
   apps use to tell episodes apart, the byte length the RSS enclosure requires,
   and the MIME type. They are deliberately not in RECORDING_PROJECTION, which
   exists to match the on-screen Recording type.

   Ordered oldest first here and reversed at render. Ordering by publishedAt
   descending straight from GROQ would be equivalent, but the migration is
   checked against an archive that reads oldest first, and keeping one order
   end to end means the diff in docs/phase5 can be read without mentally
   flipping it.
   ------------------------------------------------------------------------ */

export type FeedRecording = {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  guid: string;
  audioUrl: string;
  duration: number;
  fileSize: number;
  mimeType: string | null;
  explicit: boolean | null;
  coverImageUrl: string | null;
};

export const getFeedRecordings = unstable_cache(
  async () => {
    const query = `*[_type == "audioTrack" && status == "published"] | order(publishedAt asc) {
      "_id": _id,
      "slug": slug.current,
      title,
      summary,
      publishedAt,
      guid,
      audioUrl,
      duration,
      fileSize,
      mimeType,
      explicit,
      "coverImageUrl": coverImage.asset->url
    }`;
    return client.fetch<FeedRecording[]>(query);
  },
  ["feed-recordings"],
  { revalidate: 60, tags: ["recordings"] },
);
