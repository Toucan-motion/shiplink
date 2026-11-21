import Link from "next/link";

import { FormMessage } from "@/components/form-message";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { GoogleButton } from "../google-button";
import { LoginForm } from "./login-form";

type Props = {
  // Set by other flows that send people back here: a failed Google login,
  // or a finished password reset.
  searchParams: Promise<{ error?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, reset } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Welcome back.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error === "google" && (
          <FormMessage error="Logging in with Google didn't work. Please try again." />
        )}
        {reset === "success" && (
          <FormMessage success="Password changed. Log in with your new password." />
        )}
        <LoginForm />
        <GoogleButton />
        <p className="text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link href="/signup" className="text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
