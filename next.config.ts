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
  experimental: {
    serverActions: {
      // Profilbild-Upload (max. 2 MB) + Formular-Overhead
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
