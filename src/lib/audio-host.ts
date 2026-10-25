/* ============================================================================
   AUDIO HOST

   Where episode audio is served from, in one place.

   Sanity stores whatever hostname the uploader wrote at the time, and the
   eight migrated episodes carry Cloudflare's r2.dev development hostname.
   That host is rate limited, has no caching, and Cloudflare documents it as
   unsuitable for production — which is exactly what a podcast attracts, both
   through the feed and through the player on the site.

   Rewriting on read rather than rewriting the documents means the hostname
   can move again without touching content, and Sanity stays the record of
   what was actually uploaded.

   Two environment variables matter and they do different jobs:

     AUDIO_HOST                 what visitors and podcast apps are sent to.
                                Read here, applied to everything on the way
                                out of the CMS.

     NEXT_PUBLIC_AUDIO_CDN_URL  what gets written into Sanity when Felix
                                uploads a new episode. Used by the upload
                                route, not here.

   Set both when the custom domain is live. If only the second is set, old
   episodes keep serving from r2.dev; if only the first, new uploads keep
   recording the wrong host in the CMS even though visitors are routed
   correctly.
   ========================================================================= */

export const R2_DEV_HOST = "pub-045841bc9a9d4e4fb0a6245f95a01bf3.r2.dev";

export const AUDIO_HOST = process.env.AUDIO_HOST ?? R2_DEV_HOST;

/**
 * Point a stored audio URL at the host we actually want to serve from.
 *
 * Only the r2.dev hostname is rewritten. Anything else is left exactly as
 * stored, so a URL deliberately pointing somewhere else is never hijacked.
 * Unparseable input comes back untouched rather than empty: callers decide
 * what a bad URL means, and silently blanking one would turn a visible
 * mistake into a missing episode.
 */
export function publicAudioUrl(stored: string): string {
  if (!stored) return stored;
  try {
    const u = new URL(stored);
    if (u.hostname === R2_DEV_HOST) u.hostname = AUDIO_HOST;
    return u.toString();
  } catch {
    return stored;
  }
}
