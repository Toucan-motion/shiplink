"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpgradeButton } from "@/core/billing/components/billing-buttons";

import { CreateLinkForm } from "./create-link-form";

type Props = {
  canUseCustomSlug: boolean;
  host: string;
  // Set when the plan's link limit is reached: the dialog explains that and
  // offers an upgrade instead of a form that could only say no.
  limitMessage: string | null;
  upgradeLabel: string;
};

// "New link" button and the dialog it opens.
export function CreateLinkDialog({ canUseCustomSlug, host, limitMessage, upgradeLabel }: Props) {
  const [open, setOpen] = useState(false);
  // Changing the key mounts a fresh, empty form for "Create another".
  const [formKey, setFormKey] = useState(0);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <Plus />
        New link
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-5 p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Create a short link</DialogTitle>
            <DialogDescription>Paste any URL. The short link works the moment you create it.</DialogDescription>
          </DialogHeader>

          {limitMessage ? (
            <div className="flex flex-col items-start gap-4 rounded-xl border border-primary/20 bg-primary/[0.06] p-4 text-sm">
              <p>{limitMessage}</p>
              <UpgradeButton label={upgradeLabel} />
            </div>
          ) : (
            <CreateLinkForm
              key={formKey}
              canUseCustomSlug={canUseCustomSlug}
              host={host}
              onCreateAnother={() => setFormKey((key) => key + 1)}
              onDone={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
