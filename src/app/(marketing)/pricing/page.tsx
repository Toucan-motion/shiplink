import type { Metadata } from "next";

import { getSession } from "@/core/auth/session";
import { PricingTable } from "@/core/billing/components/pricing-table";
import { getPlan } from "@/core/billing/plans";

import { Faq } from "../_components/faq";

export const metadata: Metadata = {
  title: "Pricing — ShipLink",
};

export default async function PricingPage() {
  // Public page, but if you're logged in the buttons know your plan.
  const session = await getSession();
  const currentPlan = session ? await getPlan(session.user) : null;

  return (
    <main className="relative">
      <div className="pointer-events-none absolute top-0 left-1/2 h-80 w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]" aria-hidden />
      <div className="page-enter relative mx-auto flex w-full max-w-4xl flex-col items-center gap-12 px-5 pt-20 pb-8">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pick the plan that fits</h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Start free. Upgrade when you need more. Cancel any time, and you keep Pro until the end of
            the month you paid for.
          </p>
        </div>
        <PricingTable currentPlan={currentPlan} />
      </div>
      <Faq />
    </main>
  );
}
