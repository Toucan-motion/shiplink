import { redirect } from "next/navigation";

import { getSession } from "@/core/auth/session";
import { getPlan } from "@/core/billing/plans";

import { MobileNav } from "./_components/mobile-nav";
import { SidebarContent } from "./_components/sidebar-content";

// Everything in (app) is for logged-in users only. This is the main gate;
// pages call requireUser() as well (see core/auth/session.ts for why).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const planId = await getPlan(session.user);
  const sidebar = <SidebarContent user={session.user} planId={planId} />;

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        {sidebar}
      </aside>
      <MobileNav>{sidebar}</MobileNav>

      <main className="relative min-w-0 flex-1">
        {/* A soft violet light at the top of every app page. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgb(139_92_246/0.10),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:px-10 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
