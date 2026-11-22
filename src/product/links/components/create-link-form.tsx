"use client";

import { CircleCheck, Lock } from "lucide-react";
import { useActionState } from "react";

import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createLink, type CreateLinkState } from "../actions";
import { CopyButton } from "./copy-button";

type Props = {
  canUseCustomSlug: boolean;
  // "shiplink.app" shown in front of the slug field, so people see the result.
  host: string;
  // Called by "Create another" and "Done" after a link was made.
  onCreateAnother: () => void;
  onDone: () => void;
};

export function CreateLinkForm({ canUseCustomSlug, host, onCreateAnother, onDone }: Props) {
  // A thin wrapper around the server action, only to show a toast on success.
  const [state, formAction, pending] = useActionState(
    async (previous: CreateLinkState, formData: FormData) => {
      const result = await createLink(previous, formData);
      if (result?.shortUrl) toast.success("Short link created", { description: result.shortUrl });
      return result;
    },
    undefined,
  );

  if (state?.shortUrl) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-success/20 bg-success/[0.06] px-4 py-6 text-center">
          <CircleCheck className="size-6 text-success" aria-hidden />
          <p className="text-sm text-muted-foreground">Your short link is live</p>
          <div className="flex max-w-full items-center gap-1 rounded-lg border border-border bg-background/60 py-1 pr-1 pl-3">
            <span className="truncate font-medium">{state.shortUrl}</span>
            <CopyButton text={state.shortUrl} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onCreateAnother}>
            Create another
          </Button>
          <Button onClick={onDone}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="destination">Destination URL</Label>
        <Input
          id="destination"
          name="destination"
          placeholder="https://example.com/a/very/long/page"
          defaultValue={state?.values?.destination}
          autoFocus
          required
          className="h-10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug" className="flex items-center gap-1.5">
          Custom slug
          {!canUseCustomSlug && (
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <Lock className="size-3" aria-hidden /> Pro
            </span>
          )}
        </Label>
        <div className="flex h-10 items-center overflow-hidden rounded-lg border border-input bg-input/30 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <span className="border-r border-input px-3 text-sm text-muted-foreground">{host}/</span>
          <input
            id="slug"
            name="slug"
            placeholder={canUseCustomSlug ? "my-launch" : "random"}
            defaultValue={state?.values?.slug}
            disabled={!canUseCustomSlug}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {canUseCustomSlug
            ? "3–32 characters: letters, numbers and dashes. Leave empty for a random one."
            : "On your plan every link gets a random 6-character slug."}
        </p>
      </div>

      <FormMessage error={state?.error} />

      <Button type="submit" size="lg" className="h-10" disabled={pending}>
        {pending ? "Shortening…" : "Create short link"}
      </Button>
    </form>
  );
}
