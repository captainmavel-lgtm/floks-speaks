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
        "For a curated collection like \"The Wait\", list the recordings in the order they should play.",
    }),
  ],
  preview: {
    select: { title: "name", media: "coverImage" },
  },
});
