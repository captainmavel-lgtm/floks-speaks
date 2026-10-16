/* ============================================================================
   CONTENT

   Everything here is placeholder-shaped for Sanity. Each type carries the
   field names the corresponding Sanity document will arrive with, so Phase 3
   swaps the arrays for a fetch and nothing downstream changes.

   Field notes:
     slug        the Sanity slug.current
     durationSec integer seconds, formatted at render, never a stored string
     publishedAt ISO date
     body        array of paragraphs, maps one to one onto portable text blocks
   ========================================================================= */

export type Theme = "Faith" | "Identity" | "Culture" | "Healing";

export const THEMES: Theme[] = ["Faith", "Identity", "Culture", "Healing"];

/* Background art for the home theme cards. Presentation metadata, kept here so
   the content layer stays the single source: Phase 3 can move these onto a
   Sanity "theme" document and nothing in the component changes. Keys match the
   Theme union above; values are files in /public/images. */
export const THEME_IMAGES: Record<Theme, string> = {
  Faith: "stage-beams.jpg",
  Identity: "portrait-felix.jpg",
  Culture: "perf-point.jpg",
  Healing: "wide-warm.jpg",
};

export type Recording = {
  _id: string;
  slug: string;
  title: string;
  theme: Theme;
  description: string;
  durationSec: number;
  publishedAt: string;
  coverAsset: string;
  /** Phase 4 fills this from Cloudflare R2. Null means the player cannot start. */
  audioUrl: string | null;
};

export const RECORDINGS: Recording[] = [
  {
    _id: "my-real-gee",
    slug: "my-real-gee",
    title: "My Real Gee",
    theme: "Faith",
    description: "Jesus as friend and companion through every season.",
    durationSec: 131,
    publishedAt: "2026-06-05",
    coverAsset: "cover-my-real-gee.jpg",
    audioUrl: null,
  },
  {
    _id: "ebi-jesus",
    slug: "ebi-jesus",
    title: "Ebi Jesus Wey Dey Rule",
    theme: "Faith",
    description: "Christ's authority above every circumstance.",
    durationSec: 124,
    publishedAt: "2026-06-12",
    coverAsset: "cover-ebi-jesus.jpg",
    audioUrl: null,
  },
  {
    _id: "education",
    slug: "education",
    title: "Education",
    theme: "Culture",
    description: "Learning as the ground of growth.",
    durationSec: 112,
    publishedAt: "2026-06-19",
    coverAsset: "cover-education.jpg",
    audioUrl: null,
  },
  {
    _id: "jesus-call",
    slug: "jesus-call",
    title: "Jesus' Call",
    theme: "Faith",
    description: "The invitation to a transformed life.",
    durationSec: 138,
    publishedAt: "2026-06-26",
    coverAsset: "cover-jesus-call.jpg",
    audioUrl: null,
  },
  {
    _id: "mekae",
    slug: "mekae",
    title: "Mekae (I Remember)",
    theme: "Identity",
    description: "The hustle young people endure before breakthrough.",
    durationSec: 182,
    publishedAt: "2026-07-03",
    coverAsset: "cover-mekae.jpg",
    audioUrl: null,
  },
  {
    _id: "i-wish-i-were",
    slug: "i-wish-i-were",
    title: "I Wish I Were",
    theme: "Identity",
    description: "Using the gifts you have, however small they seem.",
    durationSec: 167,
    publishedAt: "2026-07-10",
    coverAsset: "cover-i-wish-i-were.jpg",
    audioUrl: null,
  },
  {
    _id: "master-what-you-do",
    slug: "master-what-you-do",
    title: "Master What You Do",
    theme: "Culture",
    description: "A call to excellence, refining the craft to serve.",
    durationSec: 129,
    publishedAt: "2026-07-17",
    coverAsset: "cover-master-what-you-do.jpg",
    audioUrl: null,
  },
  {
    _id: "away-for-a-while",
    slug: "away-for-a-while",
    title: "Away For A While",
    theme: "Healing",
    description: "Distance as the route to renewal.",
    durationSec: 153,
    publishedAt: "2026-07-24",
    coverAsset: "cover-away-for-a-while.jpg",
    audioUrl: null,
  },
];

/** The piece the Listen page leads with. */
export const FEATURED_SLUG = "ebi-jesus";

export type Collection = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  recordingSlugs: string[];
};

export const COLLECTIONS: Collection[] = [
  {
    _id: "the-wait",
    slug: "the-wait",
    title: "The Wait",
    description:
      "The eight pieces that became the first listening launch, in order.",
    recordingSlugs: RECORDINGS.map((r) => r.slug),
  },
];

/* -------------------------------------------------------------------------
   JOURNAL
   ------------------------------------------------------------------------- */

export type ArticleCategory =
  | "Testimonies"
  | "Craft"
  | "Faith"
  | "Culture"
  | "Behind the piece";

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  "Testimonies",
  "Craft",
  "Faith",
  "Culture",
  "Behind the piece",
];

export type Article = {
  _id: string;
  slug: string;
  category: ArticleCategory;
  title: string;
  excerpt: string;
  /** Pending. A quiet editorial still, a journal, books or a study desk,
   *  never a photograph of the person described in the testimony. */
  coverAsset: string | null;
  publishedAt: string;
  readMins: number;
  body: string[];
};

export const ARTICLES: Article[] = [
  {
    _id: "testimony-words-gave-courage",
    slug: "testimony-words-gave-courage",
    category: "Testimonies",
    title: "When Words Gave Someone the Courage to Continue",
    excerpt:
      "How a spoken-word piece encouraged a young man facing difficulties with his sight to rediscover hope and pursue his education.",
    coverAsset: null,
    publishedAt: "2023-06-01",
    readMins: 4,
    body: [
      "Sometimes, God uses the simplest things to make the greatest difference in someone’s life. A conversation, a song, a message, or even a few words spoken at the right moment can restore hope where it has almost disappeared.",
      "In June 2023, I received a testimony that changed how I saw my spoken-word ministry.",
      "A young man who was struggling with his sight had become discouraged about his education. The challenges he faced had affected his hope for the future, and he had reached a point where he was ready to give up on his academics.",
      "Then he encountered some of my spoken-word pieces.",
      "He later shared how one of those pieces encouraged him to keep going. The words rekindled his hope and gave him the courage to persevere despite his circumstances.",
      "Today, he is pursuing a Bachelor of Science in Administration at the University of Ghana Business School.",
      "When I heard his testimony, I was deeply moved. It reminded me that spoken word is more than rhymes, rhythm, or performance. God can use words to reach someone in a difficult season and encourage them to take another step forward.",
      "That experience challenged me to become more intentional about Floks Speaks. I began to see even more clearly that every piece I create carries an opportunity to speak hope, strengthen faith, and point people towards Christ.",
      "I may never know every person who listens or every life that is encouraged by a message. But this testimony remains a reminder that the words we speak can travel further than we imagine.",
      "And if God can use a spoken-word piece to help one person find the courage to continue, then every opportunity to share His message is worth taking.",
      "This is why I keep speaking. This is why Floks Speaks exists.",
      "…Jesus Reigns.",
    ],
  },
];

/* -------------------------------------------------------------------------
   ABOUT: the journey timeline
   ------------------------------------------------------------------------- */

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
    body: "A young man struggling with his sight had given up on his academics until he encountered Felix's spoken-word pieces. One piece rekindled his hope and inspired him to persevere. Today he is pursuing a Bachelor of Science in Administration at the University of Ghana Business School. The testimony revealed the life-changing power of spoken word and challenged Felix to pursue this ministry with greater intentionality.",
    link: {
      href: "/blog#testimony-words-gave-courage",
      label: "Read the Full Testimony",
    },
  },
  {
    date: "2023-10",
    label: "October 2023",
    heading: "Taking the Gospel to Schools",
    body: "God opened doors to minister across several senior high school campuses in Ghana, particularly in the Western Region. The students' response and admiration for the style created openings to share the gospel, talk with them about Christ, and lead many towards Him.",
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
    body: "A childhood dream came to life with T-shirts bearing God's Word and proclaiming Christ. Recognising that people are naturally drawn to the messages on what others wear, this became another avenue for evangelism. The “Ebi Jesus Wey Dey Rule” T-shirt became an anthem of faith, worn by individuals and evangelism groups alike. More than clothing, a wearable declaration of Christ, sharing the gospel both consciously and unconsciously.",
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

/* -------------------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------------------- */

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

export function recordingBySlug(slug: string) {
  return RECORDINGS.find((r) => r.slug === slug);
}

export function articleBySlug(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
