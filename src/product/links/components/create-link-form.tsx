"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createLink } from "../actions";
import { CopyButton } from "./copy-button";

type Props = {
  canUseCustomSlug: boolean;
  // True at the plan limit. The page explains why, next to an Upgrade button.
  disabled: boolean;
};

export function CreateLinkForm({ canUseCustomSlug, disabled }: Props) {
  const [state, formAction, pending] = useActionState(createLink, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="destination">Destination URL</Label>
          <Input
            id="destination"
            name="destination"
            placeholder="https://example.com/long/page"
            defaultValue={state?.values?.destination}
            disabled={disabled}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">
            Custom slug{" "}
            {!canUseCustomSlug && <span className="text-xs text-muted-foreground">(Pro)</span>}
          </Label>
          <Input
            id="slug"
            name="slug"
            placeholder={canUseCustomSlug ? "my-launch" : "random"}
            defaultValue={state?.values?.slug}
            disabled={disabled || !canUseCustomSlug}
          />
        </div>
      </div>

      <FormMessage error={state?.error} />

      {/* Stays visible even if this link was the last one the plan allows. */}
      {state?.shortUrl && (
        <div className="flex items-center gap-3 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          <span>
            Your short link: <strong>{state.shortUrl}</strong>
          </span>
          <CopyButton text={state.shortUrl} />
        </div>
      )}

      <Button type="submit" className="self-start" disabled={disabled || pending}>
        {pending ? "Shortening…" : "Shorten link"}
      </Button>
    </form>
  );
}
