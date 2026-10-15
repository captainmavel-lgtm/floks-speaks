# Verification scripts

Run against a production build on port 3100:

    npm run build
    npx next start -p 3100 &
    npm run verify && npm run verify:content && npm run audit:contrast && npm run audit:overimage

| script | what it holds |
| --- | --- |
| `verify` | shell: theme per route, footer pinned to Midnight on Ivory pages, five social links, no overflow, no broken images, no JS errors, no 4xx, client nav keeps the layout mounted, reduced motion honoured |
| `verify:content` | ported content: the eight journey steps and their markers, the About to Journal deep link arriving open and clear of the sticky header, the lone Journal card keeping card width, Contact validation reaching assistive technology, latest releases derived from `publishedAt`, no sideways scroll at 360px |
| `audit:contrast` | WCAG 1.4.3 and 1.4.11 over the rendered DOM. Resolves backgrounds through transparency and reads colours through a canvas, because Tailwind v4 emits `oklab()` and a regex over `rgb()` silently skips most of the site |
| `audit:contrast:selftest` | proves the audit is measuring rather than skipping: counts resolved elements, then plants one element known to fail and checks it is caught. Run this whenever the audit reports clean after a change |
| `audit:overimage` | text on photographs, which CSS cannot answer. Screenshots with the text hidden and samples the real pixels inside each glyph rectangle, reporting the worst pixel rather than the average |

Two failures these caught that a token-file check would have passed: the
Listen masthead shipped with no CSS at all, so its scrim was empty and the
heading sat on bare photograph; and an earlier clean result was the audit
skipping every `oklab()` colour, not the site being clean. Hence the self-test.
