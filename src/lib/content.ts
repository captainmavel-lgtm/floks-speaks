/* ============================================================================
   CONTENT — Phase 5

   Types, helpers, and static data that is shared between server and client
   components. Sanity fetch functions live in sanity-queries.ts and are only
   called from server components; they return data shaped to these types.

   The Recording and Article types now match the Sanity projection shape so
   no mapping is needed downstream.

   Static data that has NO Sanity schema (journey milestones) stays here.
   ========================================================================= */

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export type Recording = {
  _id: string;
  slug: string;
  title: string;
  theme: string; // was Theme union; now the collection name from Sanity
  description: string;
  durationSec: number;
  publishedAt: string;
  /** Sanity-served cover image URL (via asset→url projection) */
  coverImageUrl: string | null;
  /** Phase 4: Cloudflare R2 audio URL. Null means the player cannot start. */
  audioUrl: string | null;
};

export type Collection = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  /**
   * Explicitly curated, hand-ordered track list. Populated for a curated
   * collection like "The Wait"; empty for a plain theme.
   */
  recordings: { _id: string; slug: string; coverImageUrl: string | null }[];
  /**
   * Recordings that point AT this collection via audioTrack.categories —
   * the reverse of `recordings`. This is how a theme gets its members:
   * the editor tags the recording, not the theme. Newest first.
   */
  taggedRecordings?: { _id: string; slug: string; coverImageUrl: string | null }[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Article = {
  _id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: string;
  readMins: number;
  /** Portable text blocks from Sanity */
  body: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Author name — defaults to "Floks Speaks" */
  author?: string;
  /** Short bio for guest contributors */
  authorBio?: string;
  /** Headshot URL for guest contributors */
  authorPhotoUrl?: string | null;
};

// ---------------------------------------------------------------------------
// STATIC DATA — Journey milestones (no Sanity schema yet)
// ---------------------------------------------------------------------------

export type Milestone = {
  /** ISO, drives ordering and maps to a CMS date field */
  date: string;
  label: string;
  heading: string;
  /** a short tag above the heading, e.g. Testimony */
  kind?: string;
  body: string;
  /** draws the eye to the entries that matter most to a visitor */
  major?: boolean;
  link?: { href: string; label: string };
};

export const JOURNEY: Milestone[] = [
  {
    date: "2021-09",
    label: "September 2021",
    heading: "The Question That Started It All",
    major: true,
    body: "During a month of evangelism, while reflecting on his love for rhymes in a trotro (commercial bus), the Holy Spirit asked: “If you were to win a soul with words that rhyme, how would it sound?” That question birthed the Floks Speaks journey and its style: simple, memorable words that point people to Christ.",
  },
  {
    date: "2022-08",
    label: "August 2022",
    heading: "A Calling to the Younger Generation",
    body: "His first major youth camp ministration stirred a deep burden for young people. Witnessing their hunger for God, and their response to the message, confirmed a calling to reach the younger generation through spoken word and draw them to Christ.",
  },
  {
    date: "2023-06",
    label: "June 2023",
    heading: "A Testimony That Changed Everything",
    kind: "Testimony",
    major: true,
    body: "A young man struggling with his sight had given up on his academics until he encountered Felix’s spoken-word pieces. One piece rekindled his hope and inspired him to persevere. Today he is pursuing a Bachelor of Science in Administration at the University of Ghana Business School. The testimony revealed the life-changing power of spoken word and challenged Felix to pursue this ministry with greater intentionality.",
    link: {
      href: "/blog#testimony-words-gave-courage",
      label: "Read the Full Testimony",
    },
  },
  {
    date: "2023-10",
    label: "October 2023",
    heading: "Taking the Gospel to Schools",
    body: "God opened doors to minister across several senior high school campuses in Ghana, particularly in the Western Region. The students’ response and admiration for the style created openings to share the gospel, talk with them about Christ, and lead many towards Him.",
  },
  {
    date: "2024-01",
    label: "January 2024",
    heading: "Reaching a Larger Generation",
    body: "Felix had the honour of ministering to freshers and continuing students at Takoradi Technical University (TTU), one of his largest young-adult gatherings yet, a reflection of growing capacity and confidence to reach larger audiences while staying led by the Holy Spirit and centred on Christ.",
  },
  {
    date: "2025-03",
    label: "March 2025",
    heading: "Wearing the Message",
    body: "A childhood dream came to life with T-shirts bearing God’s Word and proclaiming Christ. Recognising that people are naturally drawn to the messages on what others wear, this became another avenue for evangelism. The “Ebi Jesus Wey Dey Rule” T-shirt became an anthem of faith, worn by individuals and evangelism groups alike. More than clothing, a wearable declaration of Christ, sharing the gospel both consciously and unconsciously.",
  },
  {
    date: "2026-05",
    label: "May 2026",
    heading: "The podcast launches",
    kind: "The recordings begin",
    major: true,
    body: "Floks Speaks becomes a weekly podcast, published to six platforms. This is the ongoing release schedule, and it has not stopped since.",
  },
  {
    date: "2026-10-04",
    label: "4 October 2026",
    heading: "The Wait listening launch",
    kind: "A one-off live event",
    major: true,
    body: "A single evening in Accra where the first eight pieces were played in order, in a room, with the people who had been following. Those eight are now the collection called The Wait.",
  },
];

// ---------------------------------------------------------------------------
// THEME IMAGES — kept as fallback / Phase 1 image mapping
//
// Theme cards on the home page use baked-in art from /public/images.
// When CMS collections have their own coverImage, pages should prefer
// that; these are the fallback for the static banner art.
// ---------------------------------------------------------------------------

export const THEME_IMAGES: Record<string, string> = {
  Faith: "theme-faith.webp",
  Identity: "theme-identity.webp",
  Culture: "theme-culture.webp",
  Healing: "theme-healing.webp",
};

// ---------------------------------------------------------------------------
// HELPERS — used by both server and client components
// ---------------------------------------------------------------------------

/** Seconds to m:ss. Durations are stored as integers and formatted here, so a
 *  CMS editor never has to type a time string correctly. */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Spoken form for screen readers, so a seek control does not announce "2:11"
 *  as "two eleven". */
export function spokenDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return (
    (m ? `${m} ${m === 1 ? "minute" : "minutes"} ` : "") +
    `${r} ${r === 1 ? "second" : "seconds"}`
  );
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso.length === 7 ? `${iso}-01` : iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
