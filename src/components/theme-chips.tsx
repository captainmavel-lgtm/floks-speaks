import Link from "next/link";
import { themeAccent } from "@/lib/content";

/* ============================================================================
   THEME CHIPS

   The standing threads (Faith, Identity, Culture, Healing) rendered as small
   coloured chips rather than the tall photo cards they used to be. Three
   reasons the photo cards went:

   1. Four 3:4 banners cost roughly a full screen of height on the home page
      for four words of information.
   2. The chip is the same object on the home page and on Listen, so a reader
      learns the shape once.
   3. Colour carries the identity, so a new theme needs no new photograph —
      only a name.

   Each chip is a link into the library, already narrowed to that theme.
   ========================================================================= */

export type ThemeChip = {
  name: string;
  accentColor?: string | null;
  count?: number;
};

export default function ThemeChips({
  themes,
  showCounts = false,
}: {
  themes: ThemeChip[];
  showCounts?: boolean;
}) {
  if (themes.length === 0) return null;

  return (
    <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
      {themes.map((t) => {
        const accent = themeAccent(t.name, t.accentColor);
        return (
          <li key={t.name}>
            <Link
              href={`/listen?theme=${encodeURIComponent(t.name)}`}
              aria-label={
                showCounts && typeof t.count === "number"
                  ? `${t.name} — ${t.count} ${t.count === 1 ? "recording" : "recordings"}`
                  : `Explore ${t.name} pieces`
              }
              className="theme-chip"
              style={{ background: accent }}
            >
              <span className="theme-chip__name">{t.name}</span>
              {showCounts && typeof t.count === "number" && (
                <span className="theme-chip__count" aria-hidden="true">
                  {t.count}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
