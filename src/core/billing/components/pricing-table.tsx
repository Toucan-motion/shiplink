import { Check } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PLANS, type PlanId } from "../plans";
import { UpgradeButton } from "./billing-buttons";

const TAGLINES: Record<PlanId, string> = {
  free: "For trying it out and personal links.",
  pro: "For people who share links for a living.",
};

// What each plan includes, written out from PLANS, so the pricing page can
// never disagree with the limits the app actually enforces.
function planHighlights(planId: PlanId): string[] {
  const plan = PLANS[planId];
  return [
    plan.limits.links === null ? "Unlimited links" : `Up to ${plan.limits.links} active links`,
    plan.features.customSlug ? "Custom slugs" : "Random 6-character slugs",
    `${plan.statsHistoryDays} days of click history`,
    "Referrers, countries and devices",
    "QR code for every link",
  ];
}

type Props = {
  // null when nobody is logged in.
  currentPlan: PlanId | null;
};

export function PricingTable({ currentPlan }: Props) {
  const planIds = Object.keys(PLANS) as PlanId[];

  return (
    <div className="grid w-full gap-5 md:grid-cols-2">
      {planIds.map((planId) => {
        const plan = PLANS[planId];
        // The paid plan is the one we point people to.
        const featured = planId === "pro";
        return (
          <div
            key={planId}
            className={cn(
              "relative flex flex-col gap-6 rounded-2xl border p-7",
              featured
                ? "border-primary/40 bg-gradient-to-b from-primary/[0.12] via-card to-card shadow-[0_30px_80px_-40px_var(--primary)]"
                : "border-white/[0.08] bg-card",
            )}
          >
            {featured && (
              <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-[0_6px_20px_-6px_var(--primary)]">
                Everything unlocked
              </span>
            )}
            <div className="flex flex-col gap-2">
              <p className="font-medium">{plan.name}</p>
              <p className="text-sm text-muted-foreground">{TAGLINES[planId]}</p>
            </div>
            <p className="flex items-baseline gap-1.5">
              <span className="text-5xl font-semibold tracking-tight">${plan.priceMonthly}</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              {planHighlights(planId).map((line) => (
                <li key={line} className="flex items-center gap-2.5">
                  <span className={cn("grid size-5 place-items-center rounded-full", featured ? "bg-primary/20 text-violet-300" : "bg-white/[0.06] text-muted-foreground")}>
                    <Check className="size-3" aria-hidden />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-2 [&_button]:w-full [&_button]:h-10 [&_form]:w-full">
              <PlanAction planId={planId} currentPlan={currentPlan} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlanAction({ planId, currentPlan }: { planId: PlanId; currentPlan: PlanId | null }) {
  if (currentPlan === null) {
    return (
      <Link
        href="/signup"
        className={cn(buttonVariants({ variant: planId === "free" ? "outline" : "default" }), "h-10 w-full")}
      >
        {planId === "free" ? "Start for free" : `Start with ${PLANS[planId].name}`}
      </Link>
    );
  }

  if (planId === currentPlan) {
    return (
      <p className="flex h-10 items-center justify-center rounded-lg border border-white/[0.08] text-sm text-muted-foreground">
        Your current plan
      </p>
    );
  }

  // A paid plan is managed (and canceled) in the Stripe portal, from Settings.
  if (currentPlan === "pro") return null;

  return <UpgradeButton label={`Upgrade to ${PLANS[planId].name}`} />;
}
