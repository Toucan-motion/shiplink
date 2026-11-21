"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "./auth";
import { authErrorMessage } from "./errors";
import { requireUser } from "./session";

// What a form gets back from an action: an error to show, or a success note.
export type FormState = { error?: string; success?: string } | undefined;

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
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return firstIssue(parsed.error);

  try {
    // callbackURL is where the link in the verification email lands.
    await auth.api.signUpEmail({ body: { ...parsed.data, callbackURL: "/dashboard" } });
  } catch (error) {
    return { error: authErrorMessage(error) };
  }

  // Same answer whether or not the email was already registered, so this form
  // can't be used to find out who has an account.
  return { success: `Check your inbox. We sent a confirmation link to ${parsed.data.email}.` };
}

const logInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = logInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return firstIssue(parsed.error);

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    return { error: authErrorMessage(error) };
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
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return firstIssue(parsed.error);

  try {
    // The emailed link goes through Better Auth, which checks the token and
    // then sends the user to /reset-password?token=...
    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email, redirectTo: "/reset-password" },
    });
  } catch (error) {
    return { error: authErrorMessage(error) };
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
