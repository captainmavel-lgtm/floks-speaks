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

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01", // locked API version for stable GROQ behaviour
  useCdn: true, // CDN for public reads — faster, eventually consistent
});

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
