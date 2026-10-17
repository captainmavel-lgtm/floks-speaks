import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

/**
 * Floks Speaks — Sanity Studio
 *
 * Project: Floks Speaks (0j0cu34s), dataset: production.
 * Built per the Build Bible v1.2, Section 09 (Content Model: Sanity Schema
 * Specification) and Section 10, Phase 3.
 *
 * Studio is deployed separately from the Next.js site (it is its own React
 * app). During development it runs on Sanity's hosted Studio URL via
 * `npx sanity deploy`. Moving it to floksspeaks.org/studio is a later task,
 * once the production domain's routing is wired up — see Build Bible
 * Appendix A, item A8.
 */
export default defineConfig({
  name: "default",
  title: "Floks Speaks",

  projectId: "0j0cu34s",
  dataset: "production",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
