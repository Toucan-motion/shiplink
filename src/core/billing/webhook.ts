import type Stripe from "stripe";

import { isPaidStatus } from "./plans";
import { stripe } from "./stripe";
import {
  getSubscription,
  getSubscriptionByCustomerId,
  isEventProcessed,
  markEventProcessed,
  saveSubscription,
  userExists,
} from "./subscriptions";

export type WebhookResult = "processed" | "duplicate" | "ignored";

// Handles one verified Stripe event. The route in app/api/stripe/webhook only
// checks the signature and calls this.
export async function handleStripeEvent(event: Stripe.Event): Promise<WebhookResult> {
  const target = subscriptionToSync(event);
  if (!target) return "ignored";

  // [ebook ch5] Stripe webhook: why we store event ids.
  // Stripe promises "at least once" delivery, not "exactly once": the same
  // event can arrive twice, e.g. when our 200 got lost on the way back. We
  // record every handled event id and skip ids we've seen. The id is saved
  // only AFTER the work succeeds, so if we crash halfway, Stripe's retry
  // still gets processed.
  if (await isEventProcessed(event.id)) return "duplicate";

  await syncSubscription(target.subscriptionId, target.userId);
  await markEventProcessed(event.id, event.type);
  return "processed";
}

// Which subscription an event is about, or null for events we don't handle.
function subscriptionToSync(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription" || !session.subscription) return null;
      return {
        subscriptionId: idOf(session.subscription),
        // We set this to our user id when creating the session.
        userId: session.client_reference_id,
      };
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return { subscriptionId: event.data.object.id, userId: null };
    default:
      return null;
  }
}

// Copies the current state of a subscription from Stripe into our database.
//
// We always fetch it fresh instead of trusting the event's payload: events can
// arrive out of order (an old "updated" after a newer "deleted"), but a fresh
// fetch is always the latest truth. That also makes every event safe to
// process twice: the result is the same row.
export async function syncSubscription(subscriptionId: string, userIdHint: string | null = null) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const stripeCustomerId = idOf(sub.customer);

  const userId =
    sub.metadata.userId ??
    userIdHint ??
    (await getSubscriptionByCustomerId(stripeCustomerId))?.userId;

  // The user deleted their account (which also deleted the Stripe customer),
  // and Stripe is still telling us about it. Nothing left to update.
  if (!userId || !(await userExists(userId))) {
    console.warn(`Stripe subscription ${sub.id} has no matching user, skipping`);
    return;
  }

  // A late event about an OLD subscription (say, the one they canceled before
  // subscribing again) must not overwrite the one that's paid for right now.
  const current = await getSubscription(userId);
  if (
    current?.stripeSubscriptionId &&
    current.stripeSubscriptionId !== sub.id &&
    isPaidStatus(current.status)
  ) {
    return;
  }

  // In current Stripe API versions the billing period lives on each item,
  // not on the subscription. We sell one price, so there's one item.
  const item = sub.items.data[0];

  await saveSubscription({
    userId,
    stripeCustomerId,
    stripeSubscriptionId: sub.id,
    status: sub.status,
    priceId: item?.price.id ?? null,
    currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
    // Canceling in the Customer Portal can set either of these, depending on
    // how the portal is configured. Both mean "ends at some date".
    cancelAtPeriodEnd: sub.cancel_at_period_end || sub.cancel_at !== null,
  });
}

// Stripe fields like `customer` are an id, or the full object if expanded.
function idOf(value: string | { id: string }): string {
  return typeof value === "string" ? value : value.id;
}
