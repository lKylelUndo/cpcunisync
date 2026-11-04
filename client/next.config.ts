import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // All pages here render privileged content client-side behind AuthGuard
  // (localStorage bearer token), so no segment can pass implicit
  // instant-navigation validation. Only segments that explicitly export
  // `instant` are validated; dev-only warnings, no production impact.
  experimental: {
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
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
