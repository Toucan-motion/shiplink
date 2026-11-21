import { z } from "zod";

// Every environment variable the app needs, validated once on boot.
// If something is missing the app refuses to start and tells you which one.
//
// Anything starting with NEXT_PUBLIC_ is inlined into the browser bundle,
// so it is public by definition. Never put a secret behind that prefix.
// Everything else stays on the server: don't import this file from a client component.
const envSchema = z.object({
  DATABASE_URL: z.url(),

  BETTER_AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  // The prefixes catch the most common mix-up: pasting the publishable key
  // (pk_...) or a product id (prod_...) into the wrong variable.
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "must start with sk_ (the secret key, not pk_)"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "must start with whsec_"),
  STRIPE_PRICE_PRO_MONTHLY: z.string().startsWith("price_", "must start with price_ (not prod_)"),

  // DECISION: optional everywhere. Without a key, emails are printed to the
  // console instead of sent (see core/email/send.ts), so local setup needs no account.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string(),

  NEXT_PUBLIC_APP_URL: z.url(),
});

// A line like `GOOGLE_CLIENT_ID=` in .env gives an empty string. Treat it as missing.
const definedVars = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== ""),
);

const parsed = envSchema.safeParse(definedVars);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => {
    const name = issue.path.join(".");
    const reason = issue.code === "invalid_type" ? "is missing" : issue.message;
    return `  - ${name} ${reason}`;
  });

  throw new Error(
    [
      "Invalid environment variables:",
      ...problems,
      "",
      "Copy .env.example to .env and fill in the values.",
    ].join("\n"),
  );
}

export const env = parsed.data;
