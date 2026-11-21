import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/core/auth/session";

// Public pages: landing and pricing. The header changes once you're logged in.
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-6">
          <Link href="/" className="font-semibold tracking-tight">
            ShipLink
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {session ? (
              <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={buttonVariants({ size: "sm", variant: "ghost" })}>
                  Log in
                </Link>
                <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl gap-4 px-6 py-6 text-sm text-muted-foreground">
          <span>ShipLink — short links with click stats</span>
          <Link href="/pricing" className="ml-auto hover:text-foreground">
            Pricing
          </Link>
        </div>
      </footer>
    </div>
  );
}
