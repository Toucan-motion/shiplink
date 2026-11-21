import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { stripe } from "./stripe";
import type { SubscriptionRow, SubscriptionUpdate } from "./subscriptions";
import { handleStripeEvent } from "./webhook";

// Fakes: Stripe returns whatever `stripeHas` holds, and the database is a Map.
vi.mock("./stripe", () => ({
  stripe: { subscriptions: { retrieve: vi.fn() } },
}));
vi.mock("@/product/links/queries", () => ({ countActiveLinks: vi.fn() }));
vi.mock("./subscriptions", () => ({
  getSubscription: vi.fn(async (userId: string) => db.subscriptions.get(userId) ?? null),
  getSubscriptionByCustomerId: vi.fn(
    async (customerId: string) =>
      [...db.subscriptions.values()].find((row) => row.stripeCustomerId === customerId) ?? null,
  ),
  saveSubscription: vi.fn(async (update: SubscriptionUpdate) => {
    db.subscriptions.set(update.userId, { ...update } as SubscriptionRow);
  }),
  userExists: vi.fn(async (userId: string) => db.users.has(userId)),
  isEventProcessed: vi.fn(async (eventId: string) => db.events.has(eventId)),
  markEventProcessed: vi.fn(async (eventId: string) => {
    db.events.add(eventId);
  }),
}));

const db = {
  users: new Set<string>(),
  subscriptions: new Map<string, SubscriptionRow>(),
  events: new Set<string>(),
};

const USER_ID = "user_1";
const PERIOD_END = 1_800_000_000; // seconds, as Stripe sends it

// What Stripe currently says about a subscription.
function stripeHas(id: string, status: Stripe.Subscription.Status, cancelAtPeriodEnd = false) {
  vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue({
    id,
    customer: "cus_1",
    status,
    metadata: { userId: USER_ID },
    cancel_at_period_end: cancelAtPeriodEnd,
    cancel_at: null,
    items: { data: [{ price: { id: "price_pro" }, current_period_end: PERIOD_END }] },
  } as unknown as Stripe.Response<Stripe.Subscription>);
}

function subscriptionEvent(eventId: string, type: string, subscriptionId: string) {
  return { id: eventId, type, data: { object: { id: subscriptionId } } } as unknown as Stripe.Event;
}

function checkoutCompleted(eventId: string, subscriptionId: string) {
  return {
    id: eventId,
    type: "checkout.session.completed",
    data: {
      object: { mode: "subscription", subscription: subscriptionId, client_reference_id: USER_ID },
    },
  } as unknown as Stripe.Event;
}

const savedStatus = () => db.subscriptions.get(USER_ID)?.status;

beforeEach(() => {
  vi.clearAllMocks();
  db.users = new Set([USER_ID]);
  db.subscriptions.clear();
  db.events.clear();
});

describe("handleStripeEvent", () => {
  it("turns on Pro when checkout completes", async () => {
    stripeHas("sub_1", "active");

    expect(await handleStripeEvent(checkoutCompleted("evt_1", "sub_1"))).toBe("processed");
    expect(db.subscriptions.get(USER_ID)).toMatchObject({
      stripeSubscriptionId: "sub_1",
      stripeCustomerId: "cus_1",
      status: "active",
      priceId: "price_pro",
      currentPeriodEnd: new Date(PERIOD_END * 1000),
      cancelAtPeriodEnd: false,
    });
  });

  it("does nothing when the same event is delivered twice", async () => {
    stripeHas("sub_1", "active");
    const event = checkoutCompleted("evt_1", "sub_1");

    await handleStripeEvent(event);
    expect(await handleStripeEvent(event)).toBe("duplicate");
    expect(stripe.subscriptions.retrieve).toHaveBeenCalledTimes(1);
  });

  it("records a cancellation at period end without ending Pro early", async () => {
    stripeHas("sub_1", "active", true);

    await handleStripeEvent(subscriptionEvent("evt_2", "customer.subscription.updated", "sub_1"));
    expect(db.subscriptions.get(USER_ID)).toMatchObject({ status: "active", cancelAtPeriodEnd: true });
  });

  it("goes back to Free when the subscription ends", async () => {
    stripeHas("sub_1", "canceled");

    await handleStripeEvent(subscriptionEvent("evt_3", "customer.subscription.deleted", "sub_1"));
    expect(savedStatus()).toBe("canceled");
  });

  it("uses Stripe's current state, not the event's, so order doesn't matter", async () => {
    // An old "updated" event arrives after the subscription was already
    // canceled. Stripe says canceled now, so canceled is what we keep.
    stripeHas("sub_1", "canceled");

    await handleStripeEvent(subscriptionEvent("evt_old", "customer.subscription.updated", "sub_1"));
    expect(savedStatus()).toBe("canceled");
  });

  it("ignores a late event about an old subscription while a new one is active", async () => {
    stripeHas("sub_new", "active");
    await handleStripeEvent(checkoutCompleted("evt_4", "sub_new"));

    stripeHas("sub_old", "canceled");
    await handleStripeEvent(subscriptionEvent("evt_5", "customer.subscription.deleted", "sub_old"));

    expect(db.subscriptions.get(USER_ID)).toMatchObject({ stripeSubscriptionId: "sub_new", status: "active" });
  });

  it("skips subscriptions of deleted users instead of failing forever", async () => {
    db.users.clear();
    stripeHas("sub_1", "canceled");

    const event = subscriptionEvent("evt_6", "customer.subscription.deleted", "sub_1");
    expect(await handleStripeEvent(event)).toBe("processed");
    expect(db.subscriptions.size).toBe(0);
  });

  it("ignores event types it doesn't handle", async () => {
    const event = { id: "evt_7", type: "invoice.paid", data: { object: {} } } as unknown as Stripe.Event;

    expect(await handleStripeEvent(event)).toBe("ignored");
    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });
});
