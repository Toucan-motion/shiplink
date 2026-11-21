import { z } from "zod";

// Paths the app itself uses. A link with one of these slugs would either be
// unreachable or hide one of our pages, so nobody can claim them.
export const RESERVED_SLUGS = [
  "dashboard",
  "login",
  "signup",
  "pricing",
  "api",
  "settings",
  "s",
  "_next",
  "favicon.ico",
  "robots.txt",
];

const RANDOM_SLUG_LENGTH = 6;

// Lowercase letters and digits only, so a slug read out loud or typed from a
// screenshot can't be mistyped by case.
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

// 36^6 ≈ 2 billion combinations: collisions are rare, and createLink retries if one happens.
export function generateSlug(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_SLUG_LENGTH));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

// DECISION: custom slugs are 3–32 characters of a-z, 0-9 and dashes, stored lowercase.
export const customSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]{3,32}$/, "Use 3–32 letters, numbers or dashes for the custom slug.")
  .refine((slug) => !RESERVED_SLUGS.includes(slug), "That slug is reserved. Pick another one.");
