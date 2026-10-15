# Floks Speaks

The website for **Floks Speaks**, the Christ-centred spoken word work of Felix
Lokko, Accra, Ghana. Built by [MavelogxDigital](https://mavelogxdigital.com).

Production domain: `floksspeaks.org` (phase 7).

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 App Router, TypeScript |
| Styling | Tailwind v4, CSS-first `@theme` in `src/app/globals.css` — there is no `tailwind.config.js` |
| Fonts | Sora, Playfair Display, Inter — self-hosted via `next/font/local` from `@fontsource-variable`, so a build needs no network and CI is reproducible |
| Content | Typed placeholders in `src/lib/content.ts`, shaped for Sanity. Phase 3 swaps the arrays for a fetch and nothing downstream changes |
| Hosting | Netlify |

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

## Verifying it

Four suites, documented in [`scripts/README.md`](scripts/README.md). Run them
against a production build:

```bash
npm run build
npx next start -p 3100 &
npm run verify && npm run verify:content
npm run audit:contrast && npm run audit:overimage
```

`npm run audit:contrast:selftest` proves the contrast audit is measuring
rather than skipping. Run it whenever the audit reports clean after a change
to how colours are written — a clean result from a silently skipping audit
looks exactly like a clean result from a correct one.

## Things that will bite you

**Theme inheritance is this project's most expensive recurring defect.** Three
separate releases shipped a shared component whose colours came from the page
theme rather than from the panel it actually sits on, so footer icons rendered
ink-dark onto the dark footer and disappeared. Any component that appears on
both the Midnight and Ivory surfaces **pins its own surface** and takes the
surface as a required prop. `SocialList` is the worked example: `surface` has
no default, deliberately, so the defect cannot be reintroduced by forgetting.

**Hairline tokens are decorative; control boundaries are not.** `--color-hairline`
and `--color-hairline-ink` are for dividers. A border that is the only thing
marking a control needs 3:1 (WCAG 1.4.11) and takes `--color-edge-dark` or
`--color-edge-ink`.

**Amber and Lilac are dark-surface colours.** On Ivory they measure around
1.9:1. Use `--color-amber-ink` / `--color-lilac-ink` for text, and the `-deep`
variants for large text and strokes.

**`new Date()` in a prerendered component freezes at build time.** The footer
year is the `COPYRIGHT_YEAR` constant in `src/lib/site.ts` for that reason.

## Environment

Nothing secret is readable from the browser. Set in the Netlify UI, not here:

| Variable | Phase | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | 7 | Contact form target. Unset, the form validates and tells the reader sending is not connected, rather than faking a success |

`CONTEXT` is set by Netlify. Any value other than `production` serves
`X-Robots-Tag: noindex`, so staging and deploy previews cannot be indexed.

## Phase status

Governed by the Floks Speaks Build Bible v1.2, twelve phases each with a
written sign-off gate.

- Phases 0 and 1 — complete, **except** the three gate items below
- Phase 2 — in progress: all seven routes ported and verified; player and
  Listen theme anchors outstanding

Open gate items, carried deliberately:

1. Felix's design sign-off **in writing**. A verbal OK does not close phase 1
2. Legal check on Terms and Privacy. The reviewer must be told the Journal
   publishes an identifiable third party's health and education details
3. The testimony permission screenshot from Felix

Both legal pages carry a visible draft notice until item 2 lands. Removing it
is a deliberate act at the end of that review, not a tidy-up.

## Ownership

Developed in `captainmavel-lgtm` and transferring to Felix Lokko's account at
project close.
