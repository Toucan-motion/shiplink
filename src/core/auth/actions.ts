"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { env } from "@/core/env";

import { auth } from "./auth";
import { authErrorMessage } from "./errors";
import { requireUser } from "./session";

// What a form gets back from an action: an error to show, or a success note.
// `values` is what the user typed, sent back with an error (see typedValues).
export type FormState =
  | { error?: string; success?: string; values?: Record<string, string> }
  | undefined;

// React empties a form once its action has run. When the action fails, we send
// the typed values back so the form can show them again next to the error,
// instead of making people retype everything. Never include passwords.
function typedValues(formData: FormData, ...names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((name) => [name, String(formData.get(name) ?? "")]));
}

const email = z.email("Enter a valid email address.");
const newPassword = z
  .string()
  .min(8, "Your password needs at least 8 characters.")
  .max(128, "That password is too long. Please keep it under 128 characters.");

function firstIssue(error: z.ZodError): FormState {
  return { error: error.issues[0]?.message ?? "Please check the form and try again." };
}

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name."),
  email,
  password: newPassword,
});

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = typedValues(formData, "name", "email");
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ...firstIssue(parsed.error), values };

  try {
    // callbackURL is where the link in the verification email lands.
    await auth.api.signUpEmail({
      body: { ...parsed.data, callbackURL: "/dashboard" },
      headers: await headers(),
    });
  } catch (error) {
    return { error: authErrorMessage(error), values };
  }

  // No verification (SKIP_EMAIL_VERIFICATION=true): Better Auth has already
  // logged the new user in, so go straight to the app.
  if (env.SKIP_EMAIL_VERIFICATION) redirect("/dashboard");

  // Same answer whether or not the email was already registered, so this form
  // can't be used to find out who has an account.
  return { success: `Check your inbox. We sent a confirmation link to ${parsed.data.email}.` };
}

const logInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = typedValues(formData, "email");
  const parsed = logInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ...firstIssue(parsed.error), values };

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    return { error: authErrorMessage(error), values };
  }

  // redirect() works by throwing, so it has to stay outside the try/catch.
  redirect("/dashboard");
}

export async function logInWithGoogle() {
  const { url } = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/login?error=google",
    },
  });

  if (!url) throw new Error("Google sign-in did not return a redirect URL");
  redirect(url);
}

export async function logOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

const forgotPasswordSchema = z.object({ email });

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = typedValues(formData, "email");
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ...firstIssue(parsed.error), values };

  try {
    // The emailed link goes through Better Auth, which checks the token and
    // then sends the user to /reset-password?token=...
    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email, redirectTo: "/reset-password" },
    });
  } catch (error) {
    return { error: authErrorMessage(error), values };
  }

  return {
    success: `If there's an account for ${parsed.data.email}, a reset link is on its way.`,
  };
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, "This reset link is incomplete. Please request a new one."),
  password: newPassword,
});

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return firstIssue(parsed.error);

  try {
    await auth.api.resetPassword({
      body: { token: parsed.data.token, newPassword: parsed.data.password },
    });
  } catch (error) {
    return { error: authErrorMessage(error) };
  }

  redirect("/login?reset=success");
}

export async function requestAccountDeletion(): Promise<FormState> {
  const user = await requireUser();

  try {
    // Nothing is deleted yet: Better Auth emails a confirmation link first.
    await auth.api.deleteUser({ body: { callbackURL: "/" }, headers: await headers() });
  } catch (error) {
    return { error: authErrorMessage(error) };
  }

  return { success: `We sent a confirmation link to ${user.email}. Click it to delete your account.` };
}
