import { defineField, defineType } from "sanity";

/** Blog Post — Build Bible Section 09. */
export const blogPost = defineType({
  name: "blogPost",
  title: "Journal Article",
  type: "document",
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "body", title: "Body" },
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
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "basics",
      description: "Used on listing cards and as the meta description.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "image",
      group: "basics",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "basics",
      to: [{ type: "collection" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      group: "basics",
      initialValue: "Floks Speaks",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "relatedAudio",
      title: "Related recording",
      type: "reference",
      group: "basics",
      to: [{ type: "audioTrack" }],
      description: "Optional. Links this article to a recording.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      group: "basics",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "basics",
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
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "body",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
      validation: (Rule) => Rule.required(),
    }),
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
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "status", media: "featuredImage" },
  },
});
