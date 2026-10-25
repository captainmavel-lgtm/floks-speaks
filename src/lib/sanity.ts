/* ============================================================================
   SANITY CLIENT — Phase 5

   Single client instance shared across server components. The CDN client is
   used for all public reads; a non-CDN variant can be added later if the
   admin upload page (Phase 6) needs to write documents.

   Image URL builder wraps @sanity/image-url so components get a plain string
   instead of dealing with Sanity image references directly.
   ========================================================================= */

import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { publicAudioUrl } from "./audio-host.ts";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "0j0cu34s";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01", // locked API version for stable GROQ behaviour
  useCdn: true, // CDN for public reads — faster, eventually consistent
});

/**
 * Fetch from Sanity, then point every audio URL at the host we serve from.
 *
 * This wraps the fetch rather than being applied per query because recordings
 * come back in several shapes: a bare array, a single document, and nested
 * under a collection's tracks or the homepage's featured track. Rewriting at
 * each call site means one new query, or one new nesting, silently keeps the
 * old host. Walking the response catches all of them, including shapes added
 * later, and the walk is over a handful of documents.
 *
 * Only the `audioUrl` key is touched. Everything else is returned untouched.
 */
export async function cmsFetch<T>(
  query: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const data = await client.fetch<T>(query, params ?? {});
  return rewriteAudioHosts(data) as T;
}

function rewriteAudioHosts(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(rewriteAudioHosts);
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] =
        k === "audioUrl" && typeof v === "string"
          ? publicAudioUrl(v)
          : rewriteAudioHosts(v);
    }
    return out;
  }
  return node;
}

const builder = createImageUrlBuilder(client);

/**
 * Turn a Sanity image reference into a URL string.
 *
 * Usage:
 *   urlFor(doc.coverImage).width(720).height(720).url()
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
