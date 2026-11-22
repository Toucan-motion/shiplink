import Link from "next/link";

import { cn } from "@/lib/utils";

// The ShipLink mark: two chain links in a violet tile. Swap this file for
// your own logo.
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-700 shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_4px_14px_-4px_var(--primary)]",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
        <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
      </svg>
    </span>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>ShipLink</span>
    </Link>
  );
}
