import Stripe from "stripe";

import { stripe } from "./stripe";
import { getSubscription, saveCustomerId } from "./subscriptions";

type BillingUser = { id: string; email: string; name: string };

// Each user gets exactly one Stripe customer, created the first time they
// click Upgrade and reused after that. Reusing it keeps all their invoices
// and cards in one place in Stripe, also if they cancel and come back.
export async function getOrCreateStripeCustomer(user: BillingUser): Promise<string> {
  const existing = await getSubscription(user.id);
  if (existing) return existing.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  await saveCustomerId(user.id, customer.id);

  // Read it back: if two clicks raced, the customer saved first is the one we use.
  const saved = await getSubscription(user.id);
  return saved?.stripeCustomerId ?? customer.id;
}

// Called right before an account is deleted.
// DECISION: we delete the Stripe customer, which cancels any subscription
// immediately (no refund for the rest of the month). Otherwise a deleted
// user would keep being charged for an account that no longer exists.
export async function deleteStripeCustomer(userId: string) {
  const existing = await getSubscription(userId);
  if (!existing) return;

  try {
    await stripe.customers.del(existing.stripeCustomerId);
  } catch (error) {
    // Already gone in Stripe (or never existed, like the seed's demo data):
    // nothing to cancel. Any other error stops the deletion, so we never
    // delete an account that's still being charged.
    if (error instanceof Stripe.errors.StripeInvalidRequestError && error.code === "resource_missing") {
      return;
    }
    throw error;
  }
}
