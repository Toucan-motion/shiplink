import type { NextConfig } from "next";

// Importing env here validates every variable the moment `next dev` or
// `next build` starts, so a missing value fails loudly instead of at runtime.
import "./src/core/env";

// DECISION: Cache Components (on in the create-next-app template) is turned off.
// It forces a <Suspense> boundary around anything that reads cookies or headers,
// which is most of a logged-in SaaS. Plain dynamic rendering is easier to follow.
const nextConfig: NextConfig = {
  // Writes a self-contained server to .next/standalone with only the files it
  // needs, so the Docker image (Dockerfile, for Railway) stays small.
  // Vercel ignores this setting and deploys the app its own way.
  output: "standalone",
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
