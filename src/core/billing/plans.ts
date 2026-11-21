import { cache } from "react";

import { countActiveLinks } from "@/product/links/queries";

import { getSubscription } from "./subscriptions";

// Every plan limit lives in this file. Product code never compares numbers or
// plan names itself: it asks assertWithinLimit(user, "links") or
// canUse(user, "customSlug"). Changing a limit means changing one line here.

export type PlanId = "free" | "pro";

// Things you can have a limited number of.
type LimitName = "links";

// Things a plan either has or doesn't.
type FeatureName = "customSlug";

type Plan = {
  name: string;
  priceMonthly: number;
  // null means unlimited.
  limits: Record<LimitName, number | null>;
  features: Record<FeatureName, boolean>;
  statsHistoryDays: number;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    name: "Free",
    priceMonthly: 0,
    limits: { links: 10 },
    features: { customSlug: false },
    statsHistoryDays: 7,
  },
  pro: {
    name: "Pro",
    priceMonthly: 9,
    limits: { links: null },
    features: { customSlug: true },
    statsHistoryDays: 90,
  },
};

// How to count current usage for each limit. When your product adds a new
// limit, add its name to LimitName and a counter here.
const usageCounters: Record<LimitName, (userId: string) => Promise<number>> = {
  links: countActiveLinks,
};

type UserRef = { id: string };

// Stripe statuses that mean "this person has paid". Everything else
// (past_due, canceled, unpaid, incomplete, ...) or no subscription at all is Free.
const PAID_STATUSES = ["active", "trialing"];

export function isPaidStatus(status: string | null | undefined): boolean {
  return status != null && PAID_STATUSES.includes(status);
}

// The plan is derived from the subscription every time, never stored as a
// flag, so it can't drift away from what Stripe says.
// `cache` makes it one database query per request, however many checks run.
export const getPlan = cache(async (user: UserRef): Promise<PlanId> => {
  const sub = await getSubscription(user.id);
  return isPaidStatus(sub?.status) ? "pro" : "free";
});

export async function canUse(user: UserRef, feature: FeatureName): Promise<boolean> {
  const plan = PLANS[await getPlan(user)];
  return plan.features[feature];
}

export async function getUsage(user: UserRef, limit: LimitName) {
  const plan = PLANS[await getPlan(user)];
  const used = await usageCounters[limit](user.id);
  const max = plan.limits[limit];
  const atLimit = max !== null && used >= max;

  return {
    used,
    max,
    planName: plan.name,
    atLimit,
    // What to tell the user at the limit. Worded once, used by the dashboard
    // and by assertWithinLimit.
    limitMessage: atLimit
      ? `You've used all ${max} ${limit} on the ${plan.name} plan. ` +
        `Delete one or upgrade to ${PLANS.pro.name} for unlimited ${limit}.`
      : null,
  };
}

export async function getStatsHistoryDays(user: UserRef): Promise<number> {
  const plan = PLANS[await getPlan(user)];
  return plan.statsHistoryDays;
}

// Thrown when a user hits a limit. The message is shown to the user as is.
export class LimitReachedError extends Error {}

// Downgrade behavior, a product decision: when Pro ends, links above the Free
// limit keep working (nobody's shared links break), but creating new ones is
// blocked until the user deletes enough to get back under the limit.
// That falls out of the check below: it only runs when something is created.
export async function assertWithinLimit(user: UserRef, limit: LimitName): Promise<void> {
  const { limitMessage } = await getUsage(user, limit);
  if (limitMessage) throw new LimitReachedError(limitMessage);
}
