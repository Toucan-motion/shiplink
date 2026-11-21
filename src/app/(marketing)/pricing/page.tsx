import type { Metadata } from "next";

import { getSession } from "@/core/auth/session";
import { PricingTable } from "@/core/billing/components/pricing-table";
import { getPlan } from "@/core/billing/plans";

export const metadata: Metadata = {
  title: "Pricing — ShipLink",
};

export default async function PricingPage() {
  // Public page, but if you're logged in the buttons know your plan.
  const session = await getSession();
  const currentPlan = session ? await getPlan(session.user) : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-10 px-6 py-24">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="text-lg text-muted-foreground">Start free. Upgrade when you need more.</p>
      </div>
      <PricingTable currentPlan={currentPlan} />
    </main>
  );
}
