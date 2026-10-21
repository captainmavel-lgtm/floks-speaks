import { defineField, defineType } from "sanity";

/**
 * Site Settings — Build Bible Section 09. Singleton document.
 *
 * Carries podcast show-level metadata (title, author, owner email, language,
 * category, artwork, explicit flag) needed by the RSS feed in Phase 5, so
 * Felix can correct the show description without a developer. Omitting
 * show-level fields from the feed is a common cause of directory submission
 * rejections — see the Build Bible callout in Section 09.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "branding", title: "Branding", default: true },
    { name: "nav", title: "Navigation & social" },
    { name: "contact", title: "Contact routing" },
    { name: "podcast", title: "Podcast show metadata" },
    { name: "seo", title: "SEO defaults" },
  ],
  fields: [
    // --- Branding ---
    defineField({
      name: "logoLight",
      title: "Logo (light variant)",
      type: "image",
      group: "branding",
    }),
    defineField({
      name: "logoDark",
      title: "Logo (dark variant)",
      type: "image",
      group: "branding",
    }),

    // --- Navigation & social ---
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "object",
      group: "nav",
      fields: [
        defineField({ name: "instagram", title: "Instagram", type: "url" }),
        defineField({ name: "tiktok", title: "TikTok", type: "url" }),
        defineField({ name: "youtube", title: "YouTube", type: "url" }),
        defineField({ name: "facebook", title: "Facebook", type: "url" }),
      ],
    }),
    defineField({
      name: "platformLinks",
      title: "Podcast platform links",
      type: "object",
      group: "nav",
      fields: [
        defineField({ name: "spotify", title: "Spotify", type: "url" }),
        defineField({ name: "apple", title: "Apple Podcasts", type: "url" }),
        defineField({ name: "amazonMusic", title: "Amazon Music", type: "url" }),
        defineField({ name: "iheart", title: "iHeartRadio", type: "url" }),
        defineField({ name: "deezer", title: "Deezer", type: "url" }),
        defineField({ name: "audible", title: "Audible", type: "url" }),
      ],
    }),

    // --- Contact routing ---
    defineField({
      name: "contactAddresses",
      title: "Contact addresses by enquiry type",
      type: "object",
      group: "contact",
      description:
        "All four enquiry types route to one address at launch (floksspeaks@gmail.com), per the Build Bible. The enquiry type is carried in the email subject line, so this can be split later without a rebuild.",
      fields: [
        defineField({ name: "booking", title: "Booking", type: "string" }),
        defineField({ name: "collaboration", title: "Collaboration", type: "string" }),
        defineField({ name: "media", title: "Media / Press", type: "string" }),
        defineField({ name: "general", title: "General", type: "string" }),
      ],
    }),
    defineField({
      name: "responseTimeHours",
      title: "Stated response time (hours)",
      type: "number",
      group: "contact",
      initialValue: 48,
    }),

    // --- Podcast show metadata ---
    defineField({
      name: "podcastShowTitle",
      title: "Show title",
      type: "string",
      group: "podcast",
      initialValue: "Floks Speaks",
    }),
    defineField({
      name: "podcastAuthor",
      title: "Author",
      type: "string",
      group: "podcast",
      initialValue: "Felix Lokko",
    }),
    defineField({
      name: "podcastOwnerEmail",
      title: "Owner email",
      type: "string",
      group: "podcast",
      initialValue: "floksspeaks@gmail.com",
    }),
    defineField({
      name: "podcastDescription",
      title: "Show description",
      type: "text",
      rows: 4,
      group: "podcast",
    }),
    defineField({
      name: "podcastLanguage",
      title: "Language",
      type: "string",
      group: "podcast",
      initialValue: "en",
    }),
    defineField({
      name: "podcastCategory",
      title: "Category",
      type: "string",
      group: "podcast",
      description: "Apple Podcasts category taxonomy, e.g. \"Religion & Spirituality\".",
    }),
    defineField({
      name: "podcastArtwork",
      title: "Show artwork",
      type: "image",
      group: "podcast",
      description:
        "Existing artwork is retained per the locked decision in the Build Bible — do not replace unless asked. Minimum 1400 × 1400px, 3000 × 3000px preferred.",
    }),
    defineField({
      name: "podcastExplicit",
      title: "Explicit flag (show-level)",
      type: "boolean",
      group: "podcast",
      initialValue: false,
    }),

    // --- SEO defaults ---
    defineField({
      name: "defaultSeoTitle",
      title: "Default SEO title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "defaultSeoDescription",
      title: "Default SEO description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
