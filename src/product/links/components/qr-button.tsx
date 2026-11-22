"use client";

import { Download, QrCode } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Shows the QR code of a short link, with SVG and PNG downloads.
// The image comes from app/(app)/dashboard/links/[id]/qr/route.ts.
export function QrButton({
  linkId,
  slug,
  shortUrl,
  withLabel = false,
}: {
  linkId: string;
  slug: string;
  shortUrl: string;
  withLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const src = `/dashboard/links/${linkId}/qr`;

  return (
    <>
      {withLabel ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <QrCode />
          QR code
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`QR code for /${slug}`}
          onClick={() => setOpen(true)}
        >
          <QrCode />
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR code for /{slug}</DialogTitle>
            <DialogDescription className="break-all">{shortUrl}</DialogDescription>
          </DialogHeader>
          <div className="mx-auto rounded-2xl bg-white p-3 shadow-[0_20px_60px_-20px_var(--primary)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- a dynamic SVG from our own route, next/image adds nothing here */}
            <img src={src} alt={`QR code that opens ${shortUrl}`} width={220} height={220} className="size-56" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a href={src} download={`shiplink-${slug}.svg`} className={cn(buttonVariants({ variant: "outline" }))}>
              <Download />
              SVG
            </a>
            <a href={`${src}?format=png`} download className={cn(buttonVariants())}>
              <Download />
              PNG
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
