import { Check } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { PLANS, type PlanId } from "../plans";
import { UpgradeButton } from "./billing-buttons";

// What each plan includes, written out from PLANS, so the pricing page can
// never disagree with the limits the app actually enforces.
function planHighlights(planId: PlanId): string[] {
  const plan = PLANS[planId];
  return [
    plan.limits.links === null ? "Unlimited links" : `Up to ${plan.limits.links} active links`,
    plan.features.customSlug ? "Custom slugs (yoursite/launch)" : "Random 6-character slugs",
    `${plan.statsHistoryDays} days of click history`,
  ];
}

type Props = {
  // null when nobody is logged in.
  currentPlan: PlanId | null;
};

export function PricingTable({ currentPlan }: Props) {
  const planIds = Object.keys(PLANS) as PlanId[];

  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      {planIds.map((planId) => {
        const plan = PLANS[planId];
        return (
          <Card key={planId}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-semibold text-foreground">${plan.priceMonthly}</span>
                {" "}/ month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {planHighlights(planId).map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <Check className="size-4 text-muted-foreground" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <PlanAction planId={planId} currentPlan={currentPlan} />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function PlanAction({ planId, currentPlan }: { planId: PlanId; currentPlan: PlanId | null }) {
  if (currentPlan === null) {
    return (
      <Link href="/signup" className={buttonVariants({ variant: planId === "free" ? "outline" : "default" })}>
        {planId === "free" ? "Start for free" : "Sign up to upgrade"}
      </Link>
    );
  }

  if (planId === currentPlan) {
    return <p className="text-sm text-muted-foreground">Your current plan</p>;
  }

  // A paid plan is managed (and canceled) in the Stripe portal, from Settings.
  if (currentPlan === "pro") return null;

  return <UpgradeButton label={`Upgrade to ${PLANS[planId].name}`} />;
}
