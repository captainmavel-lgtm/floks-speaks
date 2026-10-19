import { defineField, defineType } from "sanity";

/**
 * Collection — Build Bible Section 09.
 *
 * Doubles as both a "theme" (Faith, Love, Identity, Healing, Culture — the
 * locked list in Appendix A, item A4) and a curated listening collection
 * (e.g. "The Wait"). A recording's `categories` field references these.
 */
export const collection = defineType({
  name: "collection",
  title: "Collection / Theme",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "kind",
      title: "What is this?",
      type: "string",
      description:
        "A THEME is one of the standing threads for recordings (Faith, Identity, Culture, Healing). Recordings join it by tagging it in their own Themes field, and it shows on the Listen page as a small coloured chip. A COLLECTION is a curated set like \"The Wait\" — you choose the recordings and their running order below. A BLOG CATEGORY is for written pieces only; it appears on the Blog page and never on Listen.",
      options: {
        list: [
          { title: "Theme (recordings)", value: "theme" },
          { title: "Curated collection", value: "collection" },
          { title: "Blog category", value: "blog" },
        ],
        layout: "radio",
      },
      initialValue: "theme",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "accentColor",
      title: "Chip colour",
      type: "string",
      description:
        "Themes only. The background colour of the chip on the home and Listen pages. Leave blank to use the default for this theme.",
      options: {
        list: [
          { title: "Amber", value: "#f2a33a" },
          { title: "Lilac", value: "#b5a5ce" },
          { title: "Clay", value: "#dd9470" },
          { title: "Sage", value: "#a3c4a8" },
          { title: "Sky", value: "#9bb8d3" },
          { title: "Rose", value: "#d9a0a8" },
        ],
      },
      hidden: ({ parent }) => parent?.kind !== "theme",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "recordings",
      title: "Recordings (ordered)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "audioTrack" }] }],
      description:
        "For a curated collection like \"The Wait\", list the recordings in the order they should play. Leave this empty for a theme — a theme's members come from the recordings that tag it.",
      hidden: ({ parent }) => parent?.kind !== "collection",
    }),
  ],
  preview: {
    select: { title: "name", kind: "kind", media: "coverImage" },
    prepare: ({ title, kind, media }) => ({
      title,
      subtitle:
        kind === "collection"
          ? "Curated collection"
          : kind === "blog"
            ? "Blog category"
            : "Theme",
      media,
    }),
  },
});
