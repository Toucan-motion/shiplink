import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { getSession } from "@/core/auth/session";

// Login, signup and password pages. Someone who is already logged in has no
// business here, so we send them straight to the dashboard.
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-4 py-16">
      {/* Faint grid and a violet glow behind the form. */}
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_40%,black,transparent)]" aria-hidden />
      <div className="pointer-events-none absolute top-1/4 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" aria-hidden />

      <Logo className="relative text-lg" />
      {/* The forms are plain shadcn Cards; these selectors give them the
          roomier look of this page without touching each form. */}
      <div className="page-enter relative w-full max-w-sm [&_[data-slot=card]]:rounded-2xl [&_[data-slot=card]]:bg-card/80 [&_[data-slot=card]]:p-2 [&_[data-slot=card]]:shadow-[0_24px_80px_-24px_rgb(0_0_0/0.8)] [&_[data-slot=card]]:backdrop-blur-xl [&_[data-slot=card-title]]:text-xl [&_button]:h-10 [&_input]:h-10">
        {children}
      </div>
      <p className="relative text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ← Back to ShipLink
        </Link>
      </p>
    </main>
  );
}
