import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/core/auth/session";

// Login, signup and password pages. Someone who is already logged in has no
// business here, so we send them straight to the dashboard.
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        ShipLink
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
