import { LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { logOut } from "@/core/auth/actions";
import { PLANS, type PlanId } from "@/core/billing/plans";
import { cn } from "@/lib/utils";

import { NavLinks } from "./nav-links";

type Props = {
  user: { name: string; email: string };
  planId: PlanId;
};

// Everything in the sidebar. Rendered twice by the layout: as the fixed
// sidebar on desktop and inside the slide-out menu on phones.
export function SidebarContent({ user, planId }: Props) {
  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo href="/dashboard" className="px-2 pt-1" />

      <NavLinks />

      <div className="mt-auto flex flex-col gap-4">
        {planId === "free" && (
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-b from-primary/15 to-primary/[0.03] p-4">
            <div className="absolute -top-10 -right-10 size-28 rounded-full bg-primary/30 blur-2xl" aria-hidden />
            <Sparkles className="size-4 text-primary" aria-hidden />
            <p className="mt-2 text-sm font-medium">Upgrade to {PLANS.pro.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Unlimited links, custom slugs and {PLANS.pro.statsHistoryDays} days of stats.
            </p>
            <Link href="/pricing" className={cn(buttonVariants({ size: "sm" }), "mt-3 w-full")}>
              See plans
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] p-2.5">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500/80 to-fuchsia-500/60 text-xs font-semibold"
            aria-hidden
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name || user.email}</p>
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Badge variant={planId === "pro" ? "default" : "secondary"} className="shrink-0">
            {PLANS[planId].name}
          </Badge>
        </div>

        <form action={logOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
