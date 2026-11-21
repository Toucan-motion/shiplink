import { beforeEach, describe, expect, it, vi } from "vitest";

import { countActiveLinks } from "@/product/links/queries";

import {
  assertWithinLimit,
  canUse,
  getPlan,
  getStatsHistoryDays,
  isPaidStatus,
  LimitReachedError,
  PLANS,
} from "./plans";
import { getSubscription, type SubscriptionRow } from "./subscriptions";

// Replace the database reads with fakes we control per test.
vi.mock("./subscriptions", () => ({ getSubscription: vi.fn() }));
vi.mock("@/product/links/queries", () => ({ countActiveLinks: vi.fn() }));

const user = { id: "user_1" };

// The limits come from PLANS too, so changing a number in plans.ts doesn't
// break these tests: they check the rules, not the numbers.
const FREE_LINK_LIMIT = PLANS.free.limits.links ?? Infinity;

function hasSubscription(status: string | null) {
  vi.mocked(getSubscription).mockResolvedValue({ status } as SubscriptionRow);
}

function hasLinks(count: number) {
  vi.mocked(countActiveLinks).mockResolvedValue(count);
}

beforeEach(() => {
  vi.mocked(getSubscription).mockResolvedValue(null);
  hasLinks(0);
});

describe("getPlan", () => {
  it("is Free without a subscription", async () => {
    expect(await getPlan(user)).toBe("free");
  });

  it("is Pro for active and trialing subscriptions", async () => {
    hasSubscription("active");
    expect(await getPlan(user)).toBe("pro");
    hasSubscription("trialing");
    expect(await getPlan(user)).toBe("pro");
  });

  it("falls back to Free when payment failed or the subscription ended", () => {
    for (const status of ["past_due", "unpaid", "canceled", "incomplete", null]) {
      expect(isPaidStatus(status)).toBe(false);
    }
  });
});

describe("assertWithinLimit", () => {
  it("lets a Free user create links up to the limit", async () => {
    hasLinks(FREE_LINK_LIMIT - 1);
    await expect(assertWithinLimit(user, "links")).resolves.toBeUndefined();
  });

  it("blocks the next link once a Free user is at the limit, with a readable message", async () => {
    hasLinks(FREE_LINK_LIMIT);
    const attempt = assertWithinLimit(user, "links");
    await expect(attempt).rejects.toBeInstanceOf(LimitReachedError);
    await expect(attempt).rejects.toThrow(`You've used all ${FREE_LINK_LIMIT} links`);
  });

  it("never blocks a Pro user", async () => {
    hasSubscription("active");
    hasLinks(FREE_LINK_LIMIT * 100);
    await expect(assertWithinLimit(user, "links")).resolves.toBeUndefined();
  });

  it("blocks a downgraded user who is over the Free limit", async () => {
    // Pro ended while they had more links than Free allows: the links keep
    // working, but creating another one is blocked.
    hasSubscription("canceled");
    hasLinks(FREE_LINK_LIMIT + 5);
    await expect(assertWithinLimit(user, "links")).rejects.toBeInstanceOf(LimitReachedError);
  });
});

describe("features and stats history", () => {
  it("gives custom slugs and the longer history only to Pro", async () => {
    expect(await canUse(user, "customSlug")).toBe(false);
    expect(await getStatsHistoryDays(user)).toBe(PLANS.free.statsHistoryDays);

    hasSubscription("active");
    expect(await canUse(user, "customSlug")).toBe(true);
    expect(await getStatsHistoryDays(user)).toBe(PLANS.pro.statsHistoryDays);
  });
});
