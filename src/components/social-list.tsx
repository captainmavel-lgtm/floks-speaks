import { SOCIALS } from "@/lib/site";
import { SocialIcon } from "@/components/icons";

/* ============================================================================
   SOCIAL LIST

   `surface` is a required prop, deliberately. The v30 defect was that these
   icons took their colour from the page theme (body.ivory) rather than from
   the panel they actually sit on, so on four pages they rendered ink-dark
   glyphs onto the dark footer and disappeared.

   Making the caller state the surface means the footer says "dark" even on an
   Ivory page, and the Contact page's own row says "ink". Neither can be wrong
   by inheritance, which is the whole point.

   Glyph contrast: 7.54:1 on both surfaces. Ring values come from the boundary
   tokens, not the decorative hairlines.
   ========================================================================= */

type Props = {
  surface: "dark" | "ink";
  className?: string;
};

export default function SocialList({ surface, className = "" }: Props) {
  const isDark = surface === "dark";

  return (
    <ul className={`m-0 flex list-none flex-wrap gap-2.5 p-0 ${className}`}>
      {SOCIALS.map((s) => (
        <li key={s.id}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener"
            aria-label={s.label}
            title={s.label}
            data-surface={surface}
            className={[
              "group inline-flex min-h-[46px] w-[46px] items-center justify-center rounded-full",
              "border transition-[border-color,background,transform] duration-200",
              "hover:-translate-y-0.5",
              isDark
                ? "border-edge-dark bg-ivory/[0.04] hover:border-amber hover:bg-amber/[0.14]"
                : "border-edge-ink bg-midnight/[0.03] hover:border-amber-ink hover:bg-amber-ink/[0.08]",
            ].join(" ")}
            style={
              {
                "--hover-fill": isDark ? s.hoverDark : s.hoverInk,
              } as React.CSSProperties
            }
          >
            <SocialIcon
              id={s.id}
              className={[
                "h-[19px] w-[19px] transition-colors duration-200",
                isDark ? "fill-ivory/80" : "fill-midnight/[0.74]",
                "group-hover:fill-(--hover-fill)",
              ].join(" ")}
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
