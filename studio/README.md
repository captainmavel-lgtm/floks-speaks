# Floks Speaks — Sanity Studio

Content model for the Floks Speaks site, built to the Build Bible v1.2,
Section 09 spec. This is a standalone Studio app living inside the same
repo as the Next.js site, but it is its own package — it is not part of
the Next.js build.

**Project:** Floks Speaks · ID `0j0cu34s` · dataset `production`

## Running it locally

```bash
cd studio
npm install
npm run dev
```

This opens the Studio at `http://localhost:3333`.

## Deploying the hosted Studio

```bash
cd studio
npx sanity deploy
```

This publishes to Sanity's hosted Studio URL (e.g.
`floks-speaks.sanity.studio`), which is what Felix uses to log in and
publish content during development — before the Studio is later moved to
`floksspeaks.org/studio` (Build Bible Appendix A, item A8).

## Schemas

| File | Document | Notes |
|---|---|---|
| `audioTrack.ts` | Recording | The core content type. RSS feed (Phase 5) depends on these fields exactly. |
| `blogPost.ts` | Journal Article | The editorial blog. |
| `collection.ts` | Collection / Theme | Doubles as both a theme (Faith, Love, Identity, Healing, Culture) and a curated listening collection (e.g. "The Wait"). |
| `event.ts` | Event | Upcoming events and appearances. |
| `homepage.ts` | Homepage | Singleton — curated homepage sections. |
| `siteSettings.ts` | Site Settings | Singleton — branding, nav, contact routing, podcast show metadata, newsletter, SEO defaults. |

## Do not

- Rename or remove a required field on `audioTrack` without re-reading Build
  Bible Section 09 and Section 05 (migration) — the RSS feed and the
  existing-episode migration both depend on these exact field names.
- Regenerate a recording's `guid` after it has been published.
- Change a recording's `slug` after it has been published.
