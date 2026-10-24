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
    /* Date and time are stored separately, and the time as plain text.
     *
     * This was a `datetime`, which looks like the right type and is a trap:
     * the Studio's picker reads the EDITOR's computer clock and stores the UTC
     * instant. Setting 13:00 from Toronto stored 17:00 UTC, and the site,
     * rendering Ghana time, showed 5pm. Correct, and useless — the number on
     * the screen was not the number that was typed.
     *
     * A plain string cannot be converted by anything, so what is typed is what
     * is shown. Everything here happens in Ghana, which is GMT all year with
     * no daylight saving, so there is no second timezone to reconcile. */
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      options: { dateFormat: "D MMMM YYYY" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startTime",
      title: "Start time",
      type: "string",
      description:
        "24-hour clock, Ghana time, e.g. 13:00 for 1pm. Shown on the site exactly as typed. Leave empty if the time is not settled and only the date will show.",
      validation: (Rule) =>
        Rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: "time",
          invert: false,
        }).error("Use HH:MM on a 24-hour clock, for example 09:30 or 18:00."),
    }),
    defineField({
      name: "endTime",
      title: "Finish time",
      type: "string",
      description:
        "Optional, same format. Shown as a range after the start. A finish earlier than the start is read as running past midnight.",
      validation: (Rule) =>
        Rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: "time",
          invert: false,
        }).error("Use HH:MM on a 24-hour clock, for example 21:00."),
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
