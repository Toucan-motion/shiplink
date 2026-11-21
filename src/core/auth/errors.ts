import { APIError } from "better-auth/api";

// Better Auth answers with codes like INVALID_EMAIL_OR_PASSWORD.
// Users get a sentence that tells them what to do next.
const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD:
    "That email and password don't match. Try again or reset your password.",
  EMAIL_NOT_VERIFIED: "Please confirm your email first. We've just sent you a new link.",
  INVALID_TOKEN: "This link has expired or was already used. Please request a new one.",
  PASSWORD_TOO_SHORT: "Your password needs at least 8 characters.",
  PASSWORD_TOO_LONG: "That password is too long. Please keep it under 128 characters.",
};

export function authErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    const code = error.body?.code;
    if (code && messages[code]) return messages[code];
  }

  console.error("Unexpected auth error", error);
  return "Something went wrong on our side. Please try again in a moment.";
}
