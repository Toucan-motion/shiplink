import { z } from "zod";

// Every environment variable the app needs, validated once on boot.
// If something is missing the app refuses to start and tells you which one.
//
// Anything starting with NEXT_PUBLIC_ is inlined into the browser bundle,
// so it is public by definition. Never put a secret behind that prefix.
// Everything else stays on the server: don't import this file from a client component.
const envSchema = z.object({
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
});

const parsed = envSchema.safeParse(process.env);

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
