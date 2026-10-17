import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import PlatformStrip from "@/components/platform-strip";
import PlayerSlot from "@/components/player-slot";
import AudioPlayer from "@/components/audio-player";
import { AudioPlayerProvider } from "@/context/audio-player";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://floksspeaks.org"),
  title: {
    default: "Floks Speaks",
    template: "%s · Floks Speaks",
  },
  description:
    "Christ-centred spoken word from Felix Lokko, in Accra. Faith, identity and the ordinary weight of being human.",
  openGraph: {
    siteName: "Floks Speaks",
    type: "website",
    locale: "en_GH",
  },
};

export const viewport: Viewport = {
  themeColor: "#111116",
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
