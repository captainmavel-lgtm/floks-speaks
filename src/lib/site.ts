/* ============================================================================
   Single source of truth for anything that appears in more than one place.
   The prototype kept these in parts.js for the same reason: the shop URL
   appears three times and the socials twice, and they must not drift.
   ========================================================================= */

export type NavItem = { href: string; label: string };

/** Primary navigation. Privacy and Terms are deliberately excluded: they are
 *  utility pages and live in the footer only. */
export const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/listen", label: "Listen" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const UTILITY_NAV: NavItem[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export type Social = {
  id: "instagram" | "facebook" | "youtube" | "tiktok" | "whatsapp";
  href: string;
  label: string;
  /** brand colour on hover, dark surfaces */
  hoverDark: string;
  /** brand colour on hover, Ivory surfaces */
  hoverInk: string;
};

export const SOCIALS: Social[] = [
  {
    id: "instagram",
    href: "https://instagram.com/floks.speaks",
    label: "Instagram",
    hoverDark: "#F06A8A",
    hoverInk: "#C13584",
  },
  {
    id: "facebook",
    href: "https://www.facebook.com/share/1Et7Pn4N4y/",
    label: "Facebook",
    hoverDark: "#5B9BF8",
    hoverInk: "#1877F2",
  },
  {
    id: "youtube",
    href: "https://youtube.com/@floks.speaks",
    label: "YouTube",
    hoverDark: "#FF4D4D",
    hoverInk: "#CC0000",
  },
  {
    id: "tiktok",
    href: "https://www.tiktok.com/@floks.speaks",
    label: "TikTok",
    hoverDark: "#25F4EE",
    hoverInk: "#111116",
  },
  {
    id: "whatsapp",
    href: "https://whatsapp.com/channel/0029Vb8wv85IN9ijFZLL4k0i",
    label: "WhatsApp channel",
    hoverDark: "#4BE183",
    hoverInk: "#128C44",
  },
];

export type Platform = {
  id: "spotify" | "apple" | "amazon" | "iheart" | "deezer" | "audible";
  href: string;
  label: string;
};

export const PLATFORMS: Platform[] = [
  {
    id: "spotify",
    href: "https://open.spotify.com/show/033tXV5tgFoGqOBuW94TUR",
    label: "Spotify",
  },
  {
    id: "apple",
    href: "https://podcasts.apple.com/us/podcast/floks-speaks/id1896915800",
    label: "Apple Podcasts",
  },
  {
    id: "amazon",
    href: "https://music.amazon.com/podcasts/d85d7439-fbdd-43f5-830b-c95257f7b6e1/floks-speaks",
    label: "Amazon Music",
  },
  {
    id: "iheart",
    href: "https://iheart.com/podcast/269-floks-speaks-336444377",
    label: "iHeartRadio",
  },
  { id: "deezer", href: "https://deezer.com/us/show/1003217481", label: "Deezer" },
  {
    id: "audible",
    href: "https://audible.com/podcast/Floks-Speaks/B0H2JLTDRF",
    label: "Audible",
  },
];

/** One constant so the header, footer and homepage merchandise section cannot
 *  drift. The pre-filled message is deliberate: it gives Floks context before
 *  the conversation starts. */
export const SHOP_URL =
  "https://wa.me/233574845331?text=" +
  encodeURIComponent("Hello, I would like to order a Floks Speaks T-shirt.");

/** All enquiries route here with the enquiry type in the subject line,
 *  per Build Bible section 01 item 20. */
export const CONTACT_EMAIL = "floksspeaks@gmail.com";

/** Which routes render on the Ivory surface. Drives the body data-theme and the
 *  logo variant, so a page never has to remember to set both. */
export const LIGHT_ROUTES = new Set(["/blog", "/contact", "/privacy", "/terms"]);

export function themeFor(pathname: string): "light" | "dark" {
  return LIGHT_ROUTES.has(pathname) ? "light" : "dark";
}

/** Copyright year. Deliberately a constant, not new Date(): a current-year call
 *  in a prerendered component is frozen at build time, so the footer would show
 *  a stale year every January until someone redeployed. A notice does not need
 *  the live date. Update this on purpose. */
export const COPYRIGHT_YEAR = 2026;
