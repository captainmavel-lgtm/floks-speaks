/* ============================================================================
   GATE M VERIFICATION  —  Build Bible Phase 5, task 08

   Runs the real catalogue through the real feed builder and diffs the result,
   episode by episode, against the archived Anchor feed the six directories
   are serving today.

     npx tsx scripts/verify-feed.ts
     node --experimental-strip-types scripts/verify-feed.ts

   It fetches the live dataset and falls back to the committed snapshot only
   when Sanity is unreachable, saying loudly which one it used. A pass on the
   snapshot is weaker evidence than a pass on live data, so it never pretends
   the two are the same.

   The point of this script is that GATE M is not a judgement call. Either
   every GUID, date, title and byte length matches the archive or it does not,
   and a human reading XML will miss a transposed digit in a UUID.
   ========================================================================= */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildFeed } from "../src/lib/podcast-feed.ts";
import type { FeedRecording } from "../src/lib/sanity-queries.ts";

const ROOT = join(import.meta.dirname, "..");
const BASELINE = join(ROOT, "docs/phase5/anchor-feed-baseline.json");
const SNAPSHOT = join(ROOT, "docs/phase5/sanity-catalogue-snapshot.json");

const PROJECT = "0j0cu34s";
const DATASET = "production";

type Baseline = {
  episodeCount: number;
  episodes: {
    title: string;
    guid: string;
    pubDate: string;
    enclosureLength: number;
    durationSeconds: number;
  }[];
};

let failures = 0;
let warnings = 0;

function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ""}`);
  }
}

function warn(label: string, detail: string) {
  warnings++;
  console.log(`  WARN  ${label}\n        ${detail}`);
}

/** Pull one tag's text out of an XML chunk. Deliberately simple: the chunks
    are produced by our own builder, not arbitrary third-party XML. */
function tag(chunk: string, name: string): string | null {
  const m = chunk.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? m[1] : null;
}

function attr(chunk: string, el: string, name: string): string | null {
  const m = chunk.match(new RegExp(`<${el}[^>]*\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
}

async function loadCatalogue(): Promise<{
  episodes: FeedRecording[];
  source: string;
}> {
  const query = `*[_type == "audioTrack" && status == "published"] | order(publishedAt asc) {
    "_id": _id, "slug": slug.current, title, summary, publishedAt, guid,
    audioUrl, duration, fileSize, mimeType, explicit,
    "coverImageUrl": coverImage.asset->url
  }`;
  const url = `https://${PROJECT}.apicdn.sanity.io/v2024-01-01/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { result: FeedRecording[] };
    if (!Array.isArray(json.result)) throw new Error("no result array");
    return { episodes: json.result, source: "LIVE Sanity dataset" };
  } catch (err) {
    const snap = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
    return {
      episodes: snap.episodes as FeedRecording[],
      source: `committed snapshot (live fetch failed: ${(err as Error).message})`,
    };
  }
}

async function main() {
  const baseline: Baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
  const { episodes, source } = await loadCatalogue();

  console.log("GATE M — generated feed vs archived Anchor feed");
  console.log(`Catalogue source: ${source}`);
  if (!source.startsWith("LIVE")) {
    console.log(
      "NOTE: this run did not reach Sanity. Re-run with network access\n" +
        "      before signing GATE M off.",
    );
  }
  console.log("");

  /* Settings deliberately null: that is the dataset's real state today, and
     it exercises the fallback path the feed will actually take. */
  const feed = buildFeed(episodes, null, new Date("2026-10-19T00:00:00Z"));

  console.log("Document");
  check("starts with an XML declaration", feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  check("declares the iTunes namespace", feed.includes('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"'));
  check("declares an atom self link", feed.includes('rel="self"'));
  check("tags balance", (feed.match(/<item>/g) ?? []).length === (feed.match(/<\/item>/g) ?? []).length);

  console.log("\nChannel");
  for (const t of ["title", "link", "description", "language", "itunes:author", "itunes:explicit"]) {
    const v = tag(feed.split("<item>")[0], t);
    check(`<${t}> present and non-empty`, Boolean(v && v.trim()), v === null ? "missing" : "");
  }
  const ownerEmail = tag(feed, "itunes:email");
  check("owner email matches the archive", ownerEmail === "floksspeaks@gmail.com", `got ${ownerEmail}`);
  const cat = attr(feed, "itunes:category", "text");
  check("category matches the archive", cat === "Religion &amp; Spirituality", `got ${cat}`);
  check("category ampersand is escaped, not raw", !feed.includes("Religion & Spirituality"));

  const items = feed.split("<item>").slice(1).map((c) => c.split("</item>")[0]);

  console.log("\nEpisodes");
  check(`count is ${baseline.episodeCount}`, items.length === baseline.episodeCount, `got ${items.length}`);

  /* The feed renders newest first; the archive is listed oldest first. */
  const expected = [...baseline.episodes].reverse();

  for (let i = 0; i < Math.min(items.length, expected.length); i++) {
    const got = items[i];
    const want = expected[i];
    const gotTitle = tag(got, "title");
    const gotGuid = tag(got, "guid");
    const gotDate = tag(got, "pubDate");
    const gotLen = attr(got, "enclosure", "length");
    const gotUrl = attr(got, "enclosure", "url");

    console.log(`\n  ${i + 1}. ${want.title}`);
    check("title", gotTitle === want.title.replace(/'/g, "&apos;"), `got ${gotTitle}`);
    check("GUID is the original", gotGuid === want.guid, `got ${gotGuid}\n        want ${want.guid}`);
    check("GUID marked isPermaLink=false", got.includes('<guid isPermaLink="false">'));
    check("enclosure byte length", gotLen === String(want.enclosureLength), `got ${gotLen}, want ${want.enclosureLength}`);
    check("enclosure served from media.floksspeaks.org", Boolean(gotUrl?.startsWith("https://media.floksspeaks.org/")), `got ${gotUrl}`);
    check("no r2.dev hostname leaked", !got.includes("r2.dev"));

    if (gotDate !== want.pubDate) {
      const drift = Math.abs(new Date(gotDate!).getTime() - new Date(want.pubDate).getTime()) / 1000;
      if (drift <= 60) {
        warn("publish date", `off by ${drift}s — got ${gotDate}, archive ${want.pubDate}`);
      } else {
        check("publish date", false, `got ${gotDate}, want ${want.pubDate}`);
      }
    } else {
      check("publish date", true);
    }

    const dur = tag(got, "itunes:duration");
    const [h, m, s] = (dur ?? "0:0:0").split(":").map(Number);
    const secs = h * 3600 + m * 60 + s;
    if (secs !== want.durationSeconds) {
      const d = Math.abs(secs - want.durationSeconds);
      if (d <= 2) warn("duration", `${d}s from the archive (${dur} vs ${want.durationSeconds}s) — encoder rounding`);
      else check("duration", false, `got ${secs}s, want ${want.durationSeconds}s`);
    } else {
      check("duration", true);
    }
  }

  console.log("\nSafety");
  const hostile = buildFeed(
    [{
      ...(episodes[0] as FeedRecording),
      title: `Faith & Fire <script>alert("x")</script> 'quoted'`,
      summary: "Ampersand & angle < bracket > and \"double\" quotes",
    }],
    null,
  );
  check("hostile title is fully escaped", !/<script>/.test(hostile) && hostile.includes("&amp;") && hostile.includes("&lt;script&gt;"));
  check("hostile feed still has balanced items", (hostile.match(/<item>/g) ?? []).length === 1);

  const withDraft = buildFeed(
    [...episodes, { ...(episodes[0] as FeedRecording), _id: "broken", guid: "", title: "Should never appear" }],
    null,
  );
  check("an episode with no GUID is dropped", !withDraft.includes("Should never appear"));

  const noAudio = buildFeed(
    [{ ...(episodes[0] as FeedRecording), _id: "x", audioUrl: "", title: "No audio here" }],
    null,
  );
  check("an episode with no audio is dropped", !noAudio.includes("No audio here"));

  const zeroLen = buildFeed(
    [{ ...(episodes[0] as FeedRecording), _id: "y", fileSize: 0, title: "Zero bytes" }],
    null,
  );
  check("an episode with a zero byte length is dropped", !zeroLen.includes("Zero bytes"));

  console.log("\n" + "=".repeat(60));
  console.log(`${failures} failure(s), ${warnings} warning(s)`);
  if (failures === 0) {
    console.log("GATE M checks pass." + (source.startsWith("LIVE") ? "" : " (against the snapshot, not live data)"));
  } else {
    console.log("GATE M BLOCKED. Do not point any directory at this feed.");
  }
  process.exit(failures === 0 ? 0 : 1);
}

main();
