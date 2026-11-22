import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";

// Any page that doesn't exist, and any link stats page that isn't yours.
export default function NotFound() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-6 py-24 text-center">
      <div className="pointer-events-none absolute top-1/3 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" aria-hidden />
      <LogoMark className="relative size-10" />
      <p className="relative text-sm font-medium text-primary">404</p>
      <h1 className="relative text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="relative max-w-sm text-muted-foreground">
        This page doesn&apos;t exist, or it isn&apos;t yours to see.
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline", size: "lg", className: "relative" })}>
        Back to ShipLink
      </Link>
    </main>
  );
}
