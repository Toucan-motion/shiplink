"use client";

import { Toaster as Sonner, toast } from "sonner";

// Small notifications in the corner ("Link copied", "Link deleted").
// Rendered once in the root layout; call toast() from any client component.
function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "!bg-popover !text-popover-foreground !border-border !rounded-xl !shadow-[0_16px_40px_-12px_rgb(0_0_0/0.6)]",
          description: "!text-muted-foreground",
        },
      }}
    />
  );
}

export { Toaster, toast };
