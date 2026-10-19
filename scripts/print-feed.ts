/* Render the feed to stdout from the committed snapshot, for eyeballing a
   diff or pasting into a validator without a running server.
     node --experimental-strip-types scripts/print-feed.ts            */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildFeed } from "../src/lib/podcast-feed.ts";
const root = join(import.meta.dirname, "..");
const snap = JSON.parse(readFileSync(join(root, "docs/phase5/sanity-catalogue-snapshot.json"), "utf8"));
console.log(buildFeed(snap.episodes, null, new Date("2026-10-19T17:30:00Z")));
