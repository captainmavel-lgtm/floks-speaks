import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/* ============================================================================
   WEB APP MANIFEST

   Served at /manifest.webmanifest.

   This is what lets a listener add Floks Speaks to a phone home screen and
   have it open without browser chrome, which matters more here than on most
   sites: the audience is largely on Ghanaian mobile, the player keeps a queue
   with lock-screen controls, and a standalone window is the difference
   between that feeling like an app and feeling like a tab.

   Two icon entries, and the distinction is not cosmetic:
     purpose "any"      — drawn as given.
     purpose "maskable" — Android crops it to whatever shape the launcher
                          uses, so its artwork is scaled into the middle 80%.
   Supplying only "any" gets the icon letterboxed inside a white circle on
   most Android launchers.

   background_color is what fills the screen during the launch splash, so it
   is Midnight to match the first paint rather than flashing white first.
   ========================================================================= */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} · Christ-centred spoken word`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#111116",
    theme_color: "#111116",
    lang: "en-GH",
    dir: "ltr",
    categories: ["music", "entertainment", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    /* Long-press the home-screen icon and these are the jumps offered. The
       two that matter are the library and the newest writing. */
    shortcuts: [
      {
        name: "Listen",
        short_name: "Listen",
        description: "Every recording, filtered by theme",
        url: "/listen",
      },
      {
        name: "Blog",
        short_name: "Blog",
        description: "Writing between the recordings",
        url: "/blog",
      },
    ],
  };
}
