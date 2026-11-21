"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { requestAccountDeletion } from "@/core/auth/actions";

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(requestAccountDeletion, undefined);

  if (state?.success) return <FormMessage success={state.success} />;

  return (
    <form action={formAction} className="flex flex-col items-start gap-3">
      <FormMessage error={state?.error} />
      <Button type="submit" variant="destructive" disabled={pending}>
        {pending ? "Sending…" : "Delete my account"}
      </Button>
    </form>
  );
}
