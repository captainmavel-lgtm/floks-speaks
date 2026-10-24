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
  theme: string; // primary theme — the label shown on a recording card
  /**
   * Every theme this recording is tagged with. `theme` is just the first of
   * these. Filtering reads this, so a recording tagged Faith AND Healing
   * appears under both rather than only the one that happens to sort first.
   */
  themes?: string[];
  description: string;
  durationSec: number;
  publishedAt: string;
  /** Sanity-served cover image URL (via asset→url projection) */
  coverImageUrl: string | null;
  /** Phase 4: Cloudflare R2 audio URL. Null means the player cannot start. */
  audioUrl: string | null;
  /**
   * Per-episode links on other platforms. Projected by every recording query
   * but only rendered on the detail page.
   */
  externalLinks?: ExternalLinks | null;
};

export type ExternalLinks = {
  spotify?: string | null;
  apple?: string | null;
  amazonMusic?: string | null;
  iheart?: string | null;
  deezer?: string | null;
  audible?: string | null;
};

/**
 * A recording as the detail page needs it. Everything a card needs, plus the
 * fields that are too heavy to fetch for a grid: the transcript, the tags,
 * and the themes dereferenced far enough to carry their own accent colour.
 */
export type RecordingDetail = Recording & {
  themeMeta?: { name: string; accentColor?: string | null; slug?: string | null }[];
  tags?: string[] | null;
  /** Portable Text. Absent until Felix writes one; the page simply omits the section. */
  transcript?: unknown[] | null;
  seo?: {
    title?: string | null;
    description?: string | null;
  } | null;
};

/** An appearance, past or upcoming. `visible` is filtered in the query. */
export type SiteEvent = {
  _id: string;
  title: string;
  /** ISO datetime. The homepage splits past from upcoming around today. */
  /** "YYYY-MM-DD". Older rows may still hold a full ISO datetime. */
  date: string;
  /** "HH:MM" on a 24-hour clock, Ghana time. Plain text, never converted. */
  startTime?: string | null;
  endTime?: string | null;
  venue?: string | null;
  location?: string | null;
  description?: string | null;
  bookingUrl?: string | null;
};

export type Collection = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  /**
   * "theme" — a standing thread recordings tag themselves into.
   * "collection" — a curated, hand-ordered set like "The Wait".
   * Older documents created before this field existed have no value; treat
   * anything that is not "collection" as a theme.
   */
  kind?: "theme" | "collection" | "blog" | null;
  /** Studio override for the chip background. Null means use the fallback. */
  accentColor?: string | null;
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
      // The article itself, not the blog index. This pointed at
      // /blog#testimony-words-gave-courage, an anchor that was never rendered
      // on any page, so the link landed readers at the top of the listing and
      // left them to find the piece by eye.
      //
      // The slug is spelled out here rather than looked up, because this
      // milestone is about one specific article and no query would make that
      // relationship any clearer. It holds as long as the slug does, and the
      // slug is already documented to the client as permanent once published.
      href: "/blog/when-words-gave-someone-the-courage-to-continue",
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

/**
 * Chip background per theme. Every value is light enough to carry Midnight
 * (#111116) text at well past 4.5:1, which is why the chip label is always
 * dark rather than ivory. A theme can override this from the studio via
 * `accentColor`; this map is the fallback so a newly created theme still
 * looks deliberate before anyone picks a colour.
 */
export const THEME_COLORS: Record<string, string> = {
  Faith: "#F2A33A", // vibrant amber — the brand's own accent. 9.03:1 on Midnight
  Identity: "#B5A5CE", // muted lilac. 8.28:1
  Healing: "#4FC9B0", // aqua. 9.25:1
  Culture: "#E2566B", // rose. 5.18:1 — the tightest of the four, still past AA
};

/** Rotation used when a theme has neither an override nor a mapped colour. */
const THEME_COLOR_CYCLE = ["#F2A33A", "#B5A5CE", "#4FC9B0", "#E2566B"];

/**
 * Resolve a theme's chip colour: studio override first, then the named
 * fallback, then a stable pick from the cycle so the same name always lands
 * on the same colour across pages.
 */
export function themeAccent(name: string, override?: string | null): string {
  if (override) return override;
  if (THEME_COLORS[name]) return THEME_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return THEME_COLOR_CYCLE[hash % THEME_COLOR_CYCLE.length];
}

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

/* Events are typed in Ghana time and stored as plain text, so nothing here
   converts anything. See the comment on the event schema for why: a `datetime`
   field reads the editor's own computer clock, so 13:00 entered from Toronto
   became 17:00 UTC and the site showed 5pm. The number on the screen has to be
   the number that was typed. */

/** The day, tolerant of a legacy full-ISO value from when this was a datetime. */
function eventDay(date: string): string {
  return formatDate(date.slice(0, 10));
}

/** "13:00" → 13.0, for ordering and for spotting a finish past midnight. */
function minutesOf(hhmm: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * "6 Dec 2026", or "6 Dec 2026 · 13:00 GMT", or
 * "6 Dec 2026 · 13:00 – 16:00 GMT".
 *
 * Times print exactly as typed, on the 24-hour clock, because that is what was
 * asked for and because a 24-hour reading cannot be misread as the other half
 * of the day. GMT is stated once so a reader outside Ghana knows which clock
 * they are looking at rather than assuming their own.
 */
export function formatEventWhen(
  date: string,
  startTime?: string | null,
  endTime?: string | null,
): string {
  const day = eventDay(date);
  if (!day) return "";

  const start = startTime ? minutesOf(startTime) : null;
  if (start === null) return day;

  const end = endTime ? minutesOf(endTime) : null;
  if (end === null) return `${day} · ${startTime!.trim()} GMT`;

  return `${day} · ${startTime!.trim()} – ${endTime!.trim()} GMT`;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  /* Two shapes arrive here and they cannot be treated the same.
   *
   * A date-only string needs a time pinned to it, and specifically a UTC one:
   * "2026-10-04" parsed bare is UTC midnight, which in Accra reads as the 4th
   * but in Toronto reads as the 3rd, so a milestone would slide a day
   * backwards for half the audience.
   *
   * A Sanity `datetime` field returns a full ISO string that is already
   * unambiguous. Appending the time to that produced
   * "2026-10-04T18:00:00ZT00:00:00Z", an invalid date, and this function
   * returned "" for it — which is why every publishedAt on the site, on blog
   * articles, recordings, collections and the journal strip, was rendering
   * as nothing at all. It failed silently: an empty string looks like a
   * design choice, not a bug. */
  const value = /^\d{4}-\d{2}$/.test(iso)
    ? `${iso}-01T00:00:00Z`
    : /^\d{4}-\d{2}-\d{2}$/.test(iso)
      ? `${iso}T00:00:00Z`
      : iso;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
