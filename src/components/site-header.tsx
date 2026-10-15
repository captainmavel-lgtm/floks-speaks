"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SHOP_URL, themeFor } from "@/lib/site";
import { PlayIcon } from "@/components/icons";

/* ============================================================================
   SITE HEADER

   Sticky, and it sets the page theme. Two things carried over from the
   prototype that are easy to lose in a rewrite:

   1. The logo is two colour-baked files, not one with fill="currentColor".
      An SVG loaded through <img> is an isolated document, so currentColor
      resolves to black and vanishes on the dark header. That was the v25
      defect. Pick the file by surface.

   2. The nav CTA must outrank the nav link colour. .nav a sets a dimmed
      ivory, which the Listen Now label inherited, rendering it at roughly
      1.6:1 on its own amber fill. Unreadable in every build up to v23.
      Here the button carries its own text colour explicitly.
   ========================================================================= */

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const theme = themeFor(pathname);
  const isLight = theme === "light";
  const [open, setOpen] = useState(false);

  /* the body owns the theme so page-level CSS can key off it */
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  /* close the mobile panel on route change */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b",
        isLight
          ? "bg-ivory/90 border-hairline-ink backdrop-blur"
          : "bg-midnight/90 border-hairline backdrop-blur",
      ].join(" ")}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-site flex-wrap items-center gap-4 px-(--spacing-gut) py-4"
      >
        <Link href="/" className="brand mr-auto shrink-0">
          <Image
            src={isLight ? "/brand/logo-navy.svg" : "/brand/logo-ivory.svg"}
            alt="Floks Speaks, Jesus Reigns"
            width={132}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((v) => !v)}
          className={[
            "inline-flex items-center gap-2.5 rounded-full border px-5 text-[0.875rem] font-medium md:hidden",
            isLight
              ? "border-edge-ink text-midnight"
              : "border-edge-dark text-ivory",
          ].join(" ")}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            {open ? "×" : "☰"}
          </span>
          Menu
        </button>

        <div
          id="nav-links"
          /* opaque when open, never translucent: a blurred panel over the hero
             left the links unreadable at the 900px breakpoint */
          className={[
            open ? "flex" : "hidden",
            "w-full flex-col items-start gap-4 pb-2 md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:pb-0",
            open && (isLight ? "bg-ivory" : "bg-midnight"),
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {NAV.map((n) => {
            const current = n.href === pathname;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={current ? "page" : undefined}
                className={[
                  "text-[1.0625rem] no-underline md:text-[0.9375rem]",
                  /* current page is marked with an underline as well as colour,
                     never colour alone */
                  current ? "border-b-2 pb-0.5 font-medium" : "border-b-2 border-transparent pb-0.5",
                  isLight
                    ? current
                      ? "border-amber-deep text-midnight"
                      : "text-midnight/68 hover:text-midnight"
                    : current
                      ? "border-amber text-ivory"
                      : "text-ivory/72 hover:text-ivory",
                ].join(" ")}
              >
                {n.label}
              </Link>
            );
          })}

          <span
            aria-hidden="true"
            className={[
              "hidden h-5 w-px md:block",
              isLight ? "bg-hairline-ink" : "bg-hairline",
            ].join(" ")}
          />

          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener"
            aria-label="Shop, opens WhatsApp in a new tab"
            className={[
              "text-[1.0625rem] no-underline md:text-[0.9375rem]",
              isLight ? "text-midnight/68 hover:text-midnight" : "text-ivory/72 hover:text-ivory",
            ].join(" ")}
          >
            Shop
          </a>

          {pathname !== "/listen" && (
            <Link
              href="/listen"
              /* text-midnight is explicit so it cannot inherit the dimmed nav
                 link colour. See note 2 at the top of this file. */
              className={[
                "inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-full",
                "bg-amber px-5 text-[0.875rem] font-semibold text-midnight no-underline",
                "transition-[background,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#F7BD6E]",
                /* on Ivory the amber fill is only 1.79:1 against the page, so the
                   control needs a boundary of its own */
                isLight && "border border-amber-deep",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <PlayIcon className="h-[15px] w-[13px] fill-midnight" />
              Listen Now
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
