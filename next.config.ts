import type { NextConfig } from "next";

/* Netlify sets CONTEXT on every build: "production" for the production
   branch, "deploy-preview" for a pull request, "branch-deploy" otherwise.
   Anything that is not production must not be indexable, which Build Bible
   phase 7 requires. Undefined CONTEXT means a local build, which is also not
   production, so the default is the safe one: noindex unless proven live. */
const IS_PRODUCTION = process.env.CONTEXT === "production";

const nextConfig: NextConfig = {
  async headers() {
    if (IS_PRODUCTION) return [];
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
