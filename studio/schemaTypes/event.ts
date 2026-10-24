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
      title: "Starts",
      type: "datetime",
      description:
        "Date and start time. Times are shown on the site in Ghana time (GMT). This picker uses YOUR computer's clock, so if you are entering from outside Ghana, convert first: 6pm in Accra is 2pm in Toronto during daylight saving, 1pm otherwise. Leave the time at midnight to show the date only.",
      options: { timeStep: 15 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "Ends",
      type: "datetime",
      description:
        "Optional finish time. Shown as a range after the start, so 18:00 to 21:00 reads as 6:00 to 9:00 pm. Leave empty if the finish is not fixed.",
      options: { timeStep: 15 },
      validation: (Rule) =>
        Rule.custom((end, context) => {
          const start = (context.document as { date?: string } | undefined)?.date;
          if (!end || !start) return true;
          return Date.parse(end as string) > Date.parse(start)
            ? true
            : "The finish time has to be after the start time.";
        }),
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
        "Untick to hide this event from the site without deleting it. The Events section on the homepage appears only when at least one visible event exists, past or upcoming, and hides itself again when none do. A date in the past moves to the Previously list rather than disappearing.",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "date" },
  },
});
