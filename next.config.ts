import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Static export: the site has no server. The same `out/` deploys anywhere
 * and loads instantly. Images are pre-optimised at build (see scripts/)
 * rather than through the default loader, which needs a server.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
