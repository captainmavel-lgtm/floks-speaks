import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import PlatformStrip from "@/components/platform-strip";
import PlayerSlot from "@/components/player-slot";
import AudioPlayer from "@/components/audio-player";
import JsonLd from "@/components/json-ld";
import { AudioPlayerProvider } from "@/context/audio-player";
import {
  ARTIST_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  graph,
  organizationLd,
  personLd,
  webSiteLd,
} from "@/lib/seo";

/* Fonts are self-hosted from the repo rather than fetched from Google at build
   time. Three reasons, in order of weight:
     1. the build has no network dependency, so CI is reproducible and cannot
        fail because fonts.googleapis.com is slow or blocked
     2. no request to Google at any point, at build or at runtime
     3. these are the variable cuts, so one file per family covers every weight
        we use. All four latin subsets together are 164KB, against several
        static weights per family otherwise.
   Sources are the @fontsource-variable packages, pinned in package.json, copied
   into src/app/fonts so the build does not reach into node_modules.
   display:swap keeps text visible during load, which matters on the Ghanaian
   mobile connections this site is built for. */
const sora = localFont({
  src: "./fonts/sora-latin-wght-normal.woff2",
  variable: "--font-sora",
  display: "swap",
  weight: "100 800",
});

const playfair = localFont({
  src: [
    { path: "./fonts/playfair-display-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/playfair-display-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
  weight: "400 900",
});

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

/* Every field a page does not set falls through to here. Note that Next merges
   metadata between segments SHALLOWLY — a page that writes its own openGraph
   block replaces this one entirely, images included — which is why pages build
   theirs through pageMeta() in lib/seo rather than by hand. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Christ-centred spoken word from Felix Lokko`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: ARTIST_NAME, url: `${SITE_URL}/about` }],
  creator: ARTIST_NAME,
  publisher: SITE_NAME,
  category: "Religion & Spirituality",
  alternates: {
    canonical: "/",
    /* The podcast feed, declared so a reader that lands on any page can
       discover it without being told where it lives. */
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  openGraph: {
    title: `${SITE_NAME} · Christ-centred spoken word from Felix Lokko`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_GH",
    images: [
      {
        url: "/og/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Floks Speaks — Jesus Reigns",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · Christ-centred spoken word from Felix Lokko`,
    description: SITE_DESCRIPTION,
    images: ["/og/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      /* Without these three, Google is free to truncate the snippet, shrink
         the thumbnail to nothing, and cut video previews. They are the
         permissive values, not restrictions. */
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  /* Added to Netlify once each property is claimed. Left undefined until then
     so an empty string is never emitted as a verification token. */
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    /* The header sits on Midnight, so a translucent bar continues the page
       rather than cutting a white strip across the top of it. */
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#111116",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${playfair.variable} ${inter.variable}`}
    >
      {/* data-theme is set per page by the route segment; dark is the default */}
      <body data-theme="dark">
        {/* The three nodes that describe the site itself rather than any one
            page. They sit in the layout so every URL a crawler reaches carries
            them, and every page-level node can reference them by @id instead
            of repeating the publisher and the author on each one. */}
        <JsonLd data={graph(organizationLd(), personLd(), webSiteLd())} />
        <AudioPlayerProvider>
          <SiteHeader />
          <main id="top">{children}</main>
          <PlatformStrip />
          <SiteFooter />
          <PlayerSlot />
          <AudioPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
