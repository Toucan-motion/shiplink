import { Sparkles } from "lucide-react";

import { FormMessage } from "@/components/form-message";
import { Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { ManageBillingButton, UpgradeButton } from "@/core/billing/components/billing-buttons";
import { getPlan, PLANS } from "@/core/billing/plans";
import { getSubscription } from "@/core/billing/subscriptions";

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "long" });

type Props = {
  user: { id: string };
  // Set when Stripe Checkout sends the user back here after paying.
  justPaid: boolean;
};

export async function PlanCard({ user, justPaid }: Props) {
  const [planId, sub] = await Promise.all([getPlan(user), getSubscription(user.id)]);
  const plan = PLANS[planId];
  const periodEnd = sub?.currentPeriodEnd ? dateFormat.format(sub.currentPeriodEnd) : null;

  return (
    <Panel title="Plan" description="Billing runs through Stripe. Cards, invoices and canceling live in the billing portal.">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-white/[0.02] p-4">
          <span className="grid size-10 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-medium">
              {plan.name} plan
              <Badge variant={planId === "pro" ? "default" : "secondary"}>
                ${plan.priceMonthly}/month
              </Badge>
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {planId === "pro" && periodEnd
                ? sub?.cancelAtPeriodEnd
                  ? `Canceled. You keep ${plan.name} until ${periodEnd}, then move to ${PLANS.free.name}.`
                  : `Renews on ${periodEnd}.`
                : `${plan.limits.links ?? "Unlimited"} links, ${plan.statsHistoryDays} days of stats.`}
            </p>
          </div>
        </div>

        {/* The webhook usually lands within a second or two of the redirect,
            but not always before it. Say so instead of showing a stale "Free". */}
        {justPaid && planId === "free" && (
          <FormMessage success="Payment received. Your Pro plan turns on in a few seconds, refresh the page in a moment." />
        )}

        {planId === "free" && (sub?.status === "past_due" || sub?.status === "unpaid") && (
          <FormMessage error="Your last payment didn't go through. Update your card under Manage billing to get Pro back." />
        )}

        <div className="flex flex-wrap items-start gap-3">
          {planId === "free" && !justPaid && (
            <UpgradeButton label={`Upgrade to ${PLANS.pro.name} — $${PLANS.pro.priceMonthly}/month`} />
          )}
          {/* Anyone with a Stripe customer can open the portal: Pro users to
              cancel or change their card, past customers for old invoices. */}
          {sub && <ManageBillingButton />}
        </div>
      </div>
    </Panel>
  );
}
