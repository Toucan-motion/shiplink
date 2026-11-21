import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside of Next, so we load .env files the same way Next does.
loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is missing. Copy .env.example to .env and fill it in.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/core/db/schema.ts",
  out: "./src/core/db/migrations",
  dbCredentials: { url },
});
