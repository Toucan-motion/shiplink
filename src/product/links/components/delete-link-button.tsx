"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

import { deleteLink } from "../actions";

export function DeleteLinkButton({ id }: { id: string }) {
  return (
    <form action={deleteLink}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending}>
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
