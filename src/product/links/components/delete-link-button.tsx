"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";

import { deleteLink } from "../actions";

// Trash icon, then a confirmation: a deleted short link stops working for
// everyone it was shared with, so one stray click shouldn't do that.
export function DeleteLinkButton({ id, slug }: { id: string; slug: string }) {
  const [open, setOpen] = useState(false);

  async function remove(formData: FormData) {
    await deleteLink(formData);
    setOpen(false);
    toast.success(`/${slug} deleted`);
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete /${slug}`}
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete /{slug}?</DialogTitle>
            <DialogDescription>
              The short link stops working right away, also for everyone you shared it with. The
              slug can&apos;t be used again.
            </DialogDescription>
          </DialogHeader>
          <form action={remove}>
            <input type="hidden" name="id" value={id} />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <ConfirmButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Deleting…" : "Delete link"}
    </Button>
  );
}
