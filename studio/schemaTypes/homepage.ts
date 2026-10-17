import { defineField, defineType } from "sanity";

/** Homepage — Build Bible Section 09. Singleton document. */
export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
      initialValue: "Some Words Are Meant to Be Felt.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "featuredTrack",
      title: "Featured recording",
      type: "reference",
      to: [{ type: "audioTrack" }],
    }),
    defineField({
      name: "curatedCollections",
      title: "Explore by Theme — featured collections",
      type: "array",
      of: [{ type: "reference", to: [{ type: "collection" }] }],
    }),
    defineField({
      name: "eventHighlight",
      title: "Highlighted event",
      type: "reference",
      to: [{ type: "event" }],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage" };
    },
  },
});
