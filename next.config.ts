import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  images: {
    // Buchcover kommen von Open Library (leitet teilweise auf archive.org weiter)
    remotePatterns: [
      new URL("https://covers.openlibrary.org/b/**"),
      new URL("https://archive.org/**"),
      new URL("https://*.archive.org/**"),
    ],
  },
  experimental: {
    serverActions: {
      // Profilbild-Upload (max. 2 MB) + Formular-Overhead
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
