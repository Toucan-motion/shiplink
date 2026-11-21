"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/core/auth/actions";
import { requireUser } from "@/core/auth/session";
import { env } from "@/core/env";

import { getOrCreateStripeCustomer } from "./customer";
import { getPlan } from "./plans";
import { stripe } from "./stripe";
import { getSubscription } from "./subscriptions";

// Upgrade button: sends the user to a Stripe-hosted payment page.
// We never see card details. When they pay, Stripe calls our webhook
// (core/billing/webhook.ts), and that's what actually turns on Pro.
export async function startCheckout(): Promise<FormState> {
  const user = await requireUser();

  // Already paying: a second subscription would charge them twice.
  if ((await getPlan(user)) === "pro") redirect("/settings");

  let checkoutUrl: string | null = null;
  try {
    const customerId = await getOrCreateStripeCustomer(user);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: env.STRIPE_PRICE_PRO_MONTHLY, quantity: 1 }],
      // Both carry our user id back to the webhook, so it knows whose
      // subscription this is without guessing from the email.
      client_reference_id: user.id,
      subscription_data: { metadata: { userId: user.id } },
      success_url: `${env.NEXT_PUBLIC_APP_URL}/settings?checkout=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
    });
    checkoutUrl = session.url;
  } catch (error) {
    console.error("Could not create Stripe Checkout session", error);
  }

  if (!checkoutUrl) {
    return { error: "We couldn't open the payment page. Please try again in a minute." };
  }
  // Outside the try: redirect() works by throwing, and catch would swallow it.
  redirect(checkoutUrl);
}

// "Manage billing": Stripe's Customer Portal, where users cancel, change their
// card and download invoices. We don't build any of that UI ourselves.
export async function openBillingPortal(): Promise<FormState> {
  const user = await requireUser();

  const sub = await getSubscription(user.id);
  if (!sub) return { error: "There's no billing account yet. Upgrade first." };

  let portalUrl: string | null = null;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
    });
    portalUrl = session.url;
  } catch (error) {
    console.error("Could not create Stripe Customer Portal session", error);
  }

  if (!portalUrl) {
    return { error: "We couldn't open the billing page. Please try again in a minute." };
  }
  redirect(portalUrl);
}
