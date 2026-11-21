"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";

import { openBillingPortal, startCheckout } from "../actions";

// Both buttons leave our site for a page hosted by Stripe, so "pending" can
// last a second or two. The label says what's happening meanwhile.

export function UpgradeButton({ label }: { label: string }) {
  const [state, formAction, pending] = useActionState(startCheckout, undefined);

  return (
    <form action={formAction} className="flex flex-col items-start gap-3">
      <FormMessage error={state?.error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Opening checkout…" : label}
      </Button>
    </form>
  );
}

export function ManageBillingButton() {
  const [state, formAction, pending] = useActionState(openBillingPortal, undefined);

  return (
    <form action={formAction} className="flex flex-col items-start gap-3">
      <FormMessage error={state?.error} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Opening…" : "Manage billing"}
      </Button>
    </form>
  );
}
