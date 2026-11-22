import { z } from "zod";

// Every environment variable the app needs, validated once on boot.
// If something is missing, every page shows a setup screen listing what to add
// (see src/proxy.ts) and the server log says the same.
//
// Anything starting with NEXT_PUBLIC_ is inlined into the browser bundle,
// so it is public by definition. Never put a secret behind that prefix.
// Everything else stays on the server: don't import this file from a client component.
const envSchema = z.object({
  DATABASE_URL: z.url(),

  BETTER_AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
  BETTER_AUTH_URL: z.url(),
  // DECISION: optional. Without them the "Continue with Google" button is
  // hidden, so a fresh clone runs without a trip to the Google Cloud console.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // The prefixes catch the most common mix-up: pasting the publishable key
  // (pk_...) or a product id (prod_...) into the wrong variable.
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "must start with sk_ (the secret key, not pk_)"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "must start with whsec_"),
  STRIPE_PRICE_PRO_MONTHLY: z.string().startsWith("price_", "must start with price_ (not prod_)"),

  // DECISION: an escape hatch for demos and testing without an email provider.
  // "true" lets new accounts log in right away, without the confirmation link.
  // Never turn it on for a real product: anyone could sign up with someone
  // else's address.
  SKIP_EMAIL_VERIFICATION: z
    .enum(["true", "false"], "must be true or false")
    .default("false")
    .transform((value) => value === "true"),

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

type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(definedVars);

// One line per problem, e.g. "DATABASE_URL is missing". Empty when all is well.
export const envProblems: string[] = parsed.success
  ? []
  : parsed.error.issues.map((issue) => {
      const name = issue.path.join(".");
      const reason = issue.code === "invalid_type" ? "is missing" : issue.message;
      return `${name} ${reason}`;
    });

// DECISION: `next build` doesn't need the real values. Every page reads them
// per request, so a build on Vercel or in Docker works before you've set a
// single variable. These stand-ins exist only while the build runs and are
// never used to serve a request.
const BUILD_PLACEHOLDERS = {
  DATABASE_URL: "postgres://build:build@localhost:5432/build",
  BETTER_AUTH_SECRET: "build-placeholder-build-placeholder",
  BETTER_AUTH_URL: "http://localhost:3000",
  STRIPE_SECRET_KEY: "sk_build",
  STRIPE_WEBHOOK_SECRET: "whsec_build",
  STRIPE_PRICE_PRO_MONTHLY: "price_build",
  EMAIL_FROM: "build@localhost",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

// Thrown the moment any code reads a variable while the env is broken. The
// proxy normally shows the setup screen before that can happen.
function failOnUse(): Env {
  return new Proxy({} as Env, {
    get() {
      throw new Error(
        [
          "Invalid environment variables:",
          ...envProblems.map((problem) => `  - ${problem}`),
          "",
          "Copy .env.example to .env (or set them on your host) and fill in the values.",
        ].join("\n"),
      );
    },
  });
}

export const env: Env = parsed.success
  ? parsed.data
  : isBuild
    ? envSchema.parse(BUILD_PLACEHOLDERS)
    : failOnUse();
