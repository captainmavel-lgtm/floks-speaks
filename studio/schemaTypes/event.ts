import { defineField, defineType } from "sanity";

/** Event — Build Bible Section 09. */
export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "venue", title: "Venue", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({ name: "bookingUrl", title: "Booking URL", type: "url" }),
    defineField({
      name: "visible",
      title: "Show on site",
      type: "boolean",
      description:
        "The Events section on the homepage hides automatically when there are no visible, upcoming events.",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "date" },
  },
});
