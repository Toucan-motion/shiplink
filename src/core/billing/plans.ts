import { countActiveLinks } from "@/product/links/queries";

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

// DECISION: everyone is on Free until Stripe billing is wired up.
export async function getPlan(user: UserRef): Promise<PlanId> {
  void user;
  return "free";
}

export async function canUse(user: UserRef, feature: FeatureName): Promise<boolean> {
  const plan = PLANS[await getPlan(user)];
  return plan.features[feature];
}

export async function getUsage(user: UserRef, limit: LimitName) {
  const plan = PLANS[await getPlan(user)];
  const used = await usageCounters[limit](user.id);
  return { used, max: plan.limits[limit], planName: plan.name };
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
  const { used, max, planName } = await getUsage(user, limit);

  if (max !== null && used >= max) {
    throw new LimitReachedError(
      `You've used all ${max} ${limit} on the ${planName} plan. ` +
        `Delete one or upgrade to ${PLANS.pro.name} for unlimited ${limit}.`,
    );
  }
}
