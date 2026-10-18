import { defineField, defineType } from "sanity";
import { AudioUploadInput } from "../components/AudioUploadInput";

/**
 * Audio Track — Build Bible Section 09.
 *
 * The RSS feed (Phase 5) and the migration of existing episodes both depend
 * on these fields existing with these exact meanings. Do not rename or
 * remove a field without updating the feed generator and re-reading Section
 * 09 and Section 05 (migration) first.
 */
export const audioTrack = defineType({
  name: "audioTrack",
  title: "Recording",
  type: "document",
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "audio", title: "Audio" },
    { name: "details", title: "Details" },
    { name: "links", title: "External links" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "basics",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basics",
      description:
        "Generated from the title. Do not change this after the recording is published — it becomes part of the permanent web address.",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      group: "basics",
      description:
        "Used on recording cards, the detail page, and the podcast feed description.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      group: "basics",
      description: "Square, minimum 1400 × 1400px.",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Themes",
      type: "array",
      group: "basics",
      of: [{ type: "reference", to: [{ type: "collection" }] }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "basics",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Optional. Feeds search.",
    }),

    // --- Audio ---
    defineField({
      name: "audioUrl",
      title: "Audio file",
      type: "url",
      group: "audio",
      description:
        "Upload an MP3 file. It will be stored on Cloudflare R2 and the URL, duration, and file size will be filled in automatically.",
      components: {
        input: AudioUploadInput,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Duration (seconds)",
      type: "number",
      group: "audio",
      description: "Captured automatically on upload.",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "mimeType",
      title: "MIME type",
      type: "string",
      group: "audio",
      initialValue: "audio/mpeg",
      readOnly: true,
    }),
    defineField({
      name: "fileSize",
      title: "File size (bytes)",
      type: "number",
      group: "audio",
      description:
        "Captured automatically on upload. Required for the RSS enclosure length attribute.",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "transcript",
      title: "Transcript",
      type: "array",
      group: "audio",
      of: [{ type: "block" }],
      description: "Transcript or written poem. Recommended for every recording.",
    }),

    // --- Details ---
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      group: "details",
      description:
        "Migrated episodes: must carry the ORIGINAL publication date, not today's date.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "guid",
      title: "GUID",
      type: "string",
      group: "details",
      description:
        "Permanent episode identifier. Migrated episodes: paste the original GUID from the existing RSS feed, exactly. Once this recording is live, DO NOT change it — podcast apps use it to tell episodes apart, and editing it makes every app treat the episode as brand new.",
      validation: (Rule) => Rule.required(),
      // Deliberately editable. This was previously locked as soon as the field
      // held any value, which sealed in placeholder GUIDs typed before the
      // real one had been looked up, with no way to correct them from the
      // studio. The rule it is meant to enforce — never change this after the
      // episode is published — is a judgement the editor has to make anyway,
      // so it lives in the description rather than in a lock that fires early.
    }),
    defineField({
      name: "explicit",
      title: "Explicit content",
      type: "boolean",
      group: "details",
      initialValue: false,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Scheduled", value: "scheduled" },
          { title: "Published", value: "published" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (Rule) => Rule.required(),
    }),

    // --- External links ---
    defineField({
      name: "externalLinks",
      title: "Platform links",
      type: "object",
      group: "links",
      description: "Optional. Per-episode links on other platforms.",
      fields: [
        defineField({ name: "spotify", title: "Spotify", type: "url" }),
        defineField({ name: "apple", title: "Apple Podcasts", type: "url" }),
        defineField({ name: "amazonMusic", title: "Amazon Music", type: "url" }),
        defineField({ name: "iheart", title: "iHeartRadio", type: "url" }),
        defineField({ name: "deezer", title: "Deezer", type: "url" }),
        defineField({ name: "audible", title: "Audible", type: "url" }),
      ],
    }),

    // --- SEO ---
    defineField({
      name: "seo",
      title: "SEO overrides",
      type: "object",
      group: "seo",
      fields: [
        defineField({ name: "title", title: "Title override", type: "string" }),
        defineField({
          name: "description",
          title: "Description override",
          type: "text",
          rows: 2,
        }),
        defineField({ name: "shareImage", title: "Share image override", type: "image" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "status",
      media: "coverImage",
    },
  },
});
