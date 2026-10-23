/* ============================================================================
   SEO — canonicals, social cards and structured data

   Two jobs, kept in one file so they cannot drift apart.

   1. pageMeta() composes a page's Metadata. Next merges metadata between
      segments SHALLOWLY: the moment a page writes its own `openGraph`, every
      openGraph field set in layout.tsx is dropped, images included. That is
      the single easiest way to ship a page whose share card is blank, so no
      page writes an openGraph block by hand — they call pageMeta and it
      rebuilds the whole block each time.

   2. The JSON-LD builders. Google reads these, not the prose, when it decides
      whether this is a podcast, who Felix is, and which article a result
      points at. Every @id below is a stable URL fragment so the graph nodes
      reference each other rather than repeating themselves.

   Everything is absolute. Relative URLs resolve against metadataBase in the
   head, but a crawler reading JSON-LD gets no such help.
   ========================================================================= */

import type { Metadata } from "next";
import { CONTACT_EMAIL, PLATFORMS, SOCIALS } from "./site";

export const SITE_URL = "https://floksspeaks.org";
export const SITE_NAME = "Floks Speaks";
export const ARTIST_NAME = "Felix Lokko";

/** Shown wherever nothing more specific exists: the home page, the manifest,
 *  the Organization node. Kept under ~160 characters so a search result does
 *  not truncate mid-sentence. */
export const SITE_DESCRIPTION =
  "Christ-centred spoken word from Felix Lokko, in Accra. Faith, identity and the ordinary weight of being human.";

/** Terms a listener actually types. Search engines stopped weighting the
 *  keywords meta long ago, but several social and podcast scrapers still read
 *  it, and it costs nothing. */
export const SITE_KEYWORDS = [
  "Floks Speaks",
  "Felix Lokko",
  "Christian spoken word",
  "Ghanaian spoken word artist",
  "Christ-centred poetry",
  "gospel poetry Ghana",
  "spoken word podcast",
  "Accra spoken word",
  "Jesus Reigns",
  "African Christian poetry",
  "faith and identity poetry",
];

export function abs(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/* ------------------------------------------------------------------------ */
/*  Page metadata                                                            */
/* ------------------------------------------------------------------------ */

export type PageMetaInput = {
  title: string;
  description: string;
  /** Route path, e.g. "/listen". Drives both the canonical and og:url. */
  path: string;
  /** Absolute or site-relative image. Falls back to the default card. */
  image?: string | null;
  imageAlt?: string;
  /** "article" turns on the article:* properties below. */
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  /** Set true on anything that should stay out of the index. */
  noIndex?: boolean;
  /** Opt out of the layout's "%s · Floks Speaks" title template. Only the
   *  home page needs this: run through the template it would come out as
   *  "Floks Speaks · … · Floks Speaks". */
  absoluteTitle?: boolean;
};

export function pageMeta({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  section,
  noIndex,
  absoluteTitle,
}: PageMetaInput): Metadata {
  const url = abs(path);
  const img = abs(image || "/og/og-default.jpg");

  /* A Sanity-hosted cover is whatever shape the editor uploaded, so no
     width/height is claimed for it. Declaring 1200x630 for an image that is
     actually square makes LinkedIn letterbox it. The generated cards are the
     only ones whose dimensions are known. */
  const isOwnCard = img.includes("/og/og-");

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      /* The feed link has to be repeated here. `alternates` is one of the
         nested keys Next merges shallowly, so a page setting a canonical
         drops the layout's whole alternates block, feed discovery included.
         Verified: before this line, /about rendered no rel=alternate at all. */
      types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_GH",
      type,
      images: [
        {
          url: img,
          ...(isOwnCard ? { width: 1200, height: 630 } : {}),
          alt: imageAlt || `${title} — ${SITE_NAME}`,
        },
      ],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime: modifiedTime ?? publishedTime,
            authors: authors ?? [ARTIST_NAME],
            section,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [img],
    },
  };
}

/* ------------------------------------------------------------------------ */
/*  Structured data                                                          */
/* ------------------------------------------------------------------------ */

/** Stable node ids. A crawler that meets Felix on the about page and again on
 *  an article should understand it is the same person, which it only does if
 *  both carry the same @id. */
export const ID = {
  org: `${SITE_URL}/#organization`,
  person: `${SITE_URL}/#felix-lokko`,
  website: `${SITE_URL}/#website`,
  podcast: `${SITE_URL}/#podcast`,
};

const PROFILE_URLS = [
  ...SOCIALS.map((s) => s.href),
  ...PLATFORMS.map((p) => p.href),
];

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": ID.org,
    name: SITE_NAME,
    alternateName: "Floks Speaks · Jesus Reigns",
    url: SITE_URL,
    email: CONTACT_EMAIL,
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: abs("/icons/icon-512.png"),
      width: 512,
      height: 512,
    },
    image: abs("/og/og-default.jpg"),
    founder: { "@id": ID.person },
    foundingDate: "2021-09",
    areaServed: "Worldwide",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Accra",
      addressCountry: "GH",
    },
    sameAs: PROFILE_URLS,
  };
}

export function personLd() {
  return {
    "@type": "Person",
    "@id": ID.person,
    name: ARTIST_NAME,
    alternateName: "Floks",
    url: abs("/about"),
    image: abs("/images/portrait-felix.jpg"),
    jobTitle: "Spoken Word Artist",
    description:
      "A Ghanaian Christ-centred spoken word artist who uses rhyme, rhythm, rap and African cultural expression to proclaim Jesus Christ.",
    nationality: { "@type": "Country", name: "Ghana" },
    homeLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Accra",
        addressCountry: "GH",
      },
    },
    knowsAbout: [
      "Spoken word poetry",
      "Christian ministry",
      "Ghanaian culture",
      "Performance poetry",
    ],
    worksFor: { "@id": ID.org },
    sameAs: PROFILE_URLS,
  };
}

export function webSiteLd() {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en-GH",
    publisher: { "@id": ID.org },
    /* The library's own filter reads ?q=, so this points a Google sitelinks
       search box at the real search rather than inventing an endpoint. */
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/listen?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type EpisodeLdInput = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  durationSec: number;
  coverImageUrl: string | null;
  audioUrl: string | null;
};

/** ISO 8601 duration, which is what schema.org wants — "PT4M12S". */
export function isoDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `PT${m}M${rem}S`;
}

export function podcastSeriesLd(episodes: EpisodeLdInput[] = []) {
  return {
    "@type": "PodcastSeries",
    "@id": ID.podcast,
    name: SITE_NAME,
    url: abs("/listen"),
    description:
      "Christian spoken word where faith meets raw expression. Jesus Reigns.",
    webFeed: abs("/feed.xml"),
    image: abs("/podcast-cover-3000.jpg"),
    inLanguage: "en",
    genre: ["Religion & Spirituality", "Christianity", "Performing Arts"],
    author: { "@id": ID.person },
    creator: { "@id": ID.person },
    publisher: { "@id": ID.org },
    sameAs: PLATFORMS.map((p) => p.href),
    ...(episodes.length
      ? {
          numberOfEpisodes: episodes.length,
          hasPart: episodes.map((e) => episodeLd(e)),
        }
      : {}),
  };
}

export function episodeLd(e: EpisodeLdInput) {
  return {
    "@type": "PodcastEpisode",
    "@id": `${SITE_URL}/listen#${e.slug}`,
    name: e.title,
    description: e.description,
    url: abs("/listen"),
    datePublished: e.publishedAt,
    timeRequired: isoDuration(e.durationSec),
    ...(e.coverImageUrl ? { image: e.coverImageUrl } : {}),
    partOfSeries: { "@id": ID.podcast },
    author: { "@id": ID.person },
    ...(e.audioUrl
      ? {
          associatedMedia: {
            "@type": "MediaObject",
            contentUrl: e.audioUrl,
            encodingFormat: "audio/mpeg",
          },
        }
      : {}),
  };
}

export type ArticleLdInput = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  coverImageUrl: string | null;
  category?: string;
  author?: string;
  readMins?: number;
};

export function blogPostingLd(a: ArticleLdInput) {
  const url = abs(`/blog/${a.slug}`);
  /* A guest contributor is a plain name with no node of their own. Only
     Felix's own pieces point at the Person node, so the graph never claims a
     guest is him. */
  const byFelix = !a.author || a.author === ARTIST_NAME || a.author === SITE_NAME;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: a.title,
    description: a.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: a.publishedAt,
    dateModified: a.publishedAt,
    image: a.coverImageUrl ? [a.coverImageUrl] : [abs("/og/og-blog.jpg")],
    ...(a.category ? { articleSection: a.category } : {}),
    ...(a.readMins ? { timeRequired: `PT${Math.max(1, a.readMins)}M` } : {}),
    inLanguage: "en-GH",
    author: byFelix
      ? { "@id": ID.person }
      : { "@type": "Person", name: a.author },
    publisher: { "@id": ID.org },
    isPartOf: { "@id": ID.website },
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: abs(t.path),
    })),
  };
}

export function collectionPageLd(input: {
  name: string;
  description: string;
  path: string;
  items: { name: string; url?: string }[];
}) {
  return {
    "@type": "CollectionPage",
    "@id": `${abs(input.path)}#collection`,
    name: input.name,
    description: input.description,
    url: abs(input.path),
    isPartOf: { "@id": ID.website },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.items.length,
      itemListElement: input.items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        ...(it.url ? { url: abs(it.url) } : {}),
      })),
    },
  };
}

/** Wrap one or more nodes into a single @graph document. One script tag per
 *  page beats several: the nodes can then reference each other by @id and a
 *  crawler resolves them in one pass. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
