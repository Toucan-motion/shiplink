import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Tests cover only the code where a bug costs money: plan limits and the
// Stripe webhook. They use fakes for the database and Stripe, so they run
// without Postgres, network or a .env file.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
  },
});
