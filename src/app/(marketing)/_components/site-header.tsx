"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

// Top bar of the public pages. On phones the links fold into a menu button.
export function SiteHeader({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  const actions = loggedIn ? (
    <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
      Dashboard
    </Link>
  ) : (
    <>
      <Link href="/login" className={buttonVariants({ size: "lg", variant: "ghost" })}>
        Log in
      </Link>
      <Link href="/signup" className={buttonVariants({ size: "lg" })}>
        Get started
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-5">
        <Logo />
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          {SECTIONS.map((section) => (
            <Link key={section.href} href={section.href} className="transition-colors hover:text-foreground">
              {section.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">{actions}</div>
        <button
          type="button"
          className="ml-auto grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Phone menu: a panel under the bar, closed again by any tap on a link. */}
      <div
        className={cn("border-t border-white/[0.06] px-5 pb-5 md:hidden", !open && "hidden")}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <nav className="flex flex-col py-2">
          {SECTIONS.map((section) => (
            <Link key={section.href} href={section.href} className="py-2.5 text-muted-foreground hover:text-foreground">
              {section.label}
            </Link>
          ))}
        </nav>
        <div className="grid grid-cols-2 gap-2 [&>a]:w-full">{actions}</div>
      </div>
    </header>
  );
}
