import { FormMessage } from "@/components/form-message";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>You&apos;re on the {plan.name} plan.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4 text-sm">
        {/* The webhook usually lands within a second or two of the redirect,
            but not always before it. Say so instead of showing a stale "Free". */}
        {justPaid && planId === "free" && (
          <FormMessage success="Payment received. Your Pro plan turns on in a few seconds, refresh the page in a moment." />
        )}

        {planId === "pro" && periodEnd && (
          <p className="text-muted-foreground">
            {sub?.cancelAtPeriodEnd
              ? `Canceled. You keep ${plan.name} until ${periodEnd}, then move to ${PLANS.free.name}.`
              : `Renews on ${periodEnd}.`}
          </p>
        )}

        {planId === "free" && (sub?.status === "past_due" || sub?.status === "unpaid") && (
          <FormMessage error="Your last payment didn't go through. Update your card under Manage billing to get Pro back." />
        )}

        {planId === "free" && !justPaid && (
          <UpgradeButton label={`Upgrade to ${PLANS.pro.name} — $${PLANS.pro.priceMonthly}/month`} />
        )}

        {/* Anyone with a Stripe customer can open the portal: Pro users to
            cancel or change their card, past customers for old invoices. */}
        {sub && <ManageBillingButton />}
      </CardContent>
    </Card>
  );
}
