"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

// Copies a short URL. The icon turns into a check for a moment and a toast
// confirms it, so people know it worked without looking anywhere else.
export function CopyButton({ text, withLabel = false }: { text: string; withLabel?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      toast.error("Couldn't copy. Select the link and copy it by hand.");
      return;
    }
    setCopied(true);
    toast.success("Link copied", { description: text });
    setTimeout(() => setCopied(false), 1500);
  }

  const Icon = copied ? Check : Copy;

  if (withLabel) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        <Icon className={copied ? "text-success" : undefined} />
        {copied ? "Copied" : "Copy"}
      </Button>
    );
  }

  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={copy} aria-label={`Copy ${text}`}>
      <Icon className={copied ? "text-success" : undefined} />
    </Button>
  );
}
