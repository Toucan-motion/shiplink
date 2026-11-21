import { eq } from "drizzle-orm";

import { db } from "@/core/db";
import { stripeEvent, subscription, user } from "@/core/db/schema";

// Every read and write of the billing tables. The webhook and the plan checks
// go through these, so they can be swapped for fakes in tests.

export type SubscriptionRow = typeof subscription.$inferSelect;

export async function getSubscription(userId: string): Promise<SubscriptionRow | null> {
  const [row] = await db.select().from(subscription).where(eq(subscription.userId, userId));
  return row ?? null;
}

export async function getSubscriptionByCustomerId(
  stripeCustomerId: string,
): Promise<SubscriptionRow | null> {
  const [row] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.stripeCustomerId, stripeCustomerId));
  return row ?? null;
}

// Remembers which Stripe customer belongs to a user, before they've paid.
// If two requests race, the first one wins and the second one's customer is
// simply never used.
export async function saveCustomerId(userId: string, stripeCustomerId: string) {
  await db
    .insert(subscription)
    .values({ userId, stripeCustomerId })
    .onConflictDoNothing({ target: subscription.userId });
}

export type SubscriptionUpdate = {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  priceId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

export async function saveSubscription(update: SubscriptionUpdate) {
  await db
    .insert(subscription)
    .values(update)
    .onConflictDoUpdate({ target: subscription.userId, set: update });
}

export async function userExists(userId: string): Promise<boolean> {
  const [row] = await db.select({ id: user.id }).from(user).where(eq(user.id, userId));
  return row !== undefined;
}

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: stripeEvent.id })
    .from(stripeEvent)
    .where(eq(stripeEvent.id, eventId));
  return row !== undefined;
}

export async function markEventProcessed(eventId: string, type: string) {
  await db.insert(stripeEvent).values({ id: eventId, type }).onConflictDoNothing();
}
