"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/core/auth/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.success) return <FormMessage success={state.success} />;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          required
        />
      </div>
      <FormMessage error={state?.error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
