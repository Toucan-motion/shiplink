import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

// Any page that doesn't exist, and any link stats page that isn't yours.
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        This page doesn&apos;t exist, or it isn&apos;t yours to see.
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to ShipLink
      </Link>
    </main>
  );
}
