import Link from "next/link";

import { FormMessage } from "@/components/form-message";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ResetPasswordForm } from "./reset-password-form";

// Better Auth checks the emailed link first, then sends the user here with
// either ?token=... (valid) or ?error=INVALID_TOKEN (expired or already used).
type Props = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const validToken = token ? token : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>You&apos;ll be logged out on every other device.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {validToken ? (
          <ResetPasswordForm token={validToken} />
        ) : (
          <>
            <FormMessage error="This reset link has expired or was already used." />
            <Link href="/forgot-password" className="text-center text-sm underline underline-offset-4">
              Send me a new link
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
