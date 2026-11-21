import type Stripe from "stripe";

import { stripe } from "@/core/billing/stripe";
import { handleStripeEvent } from "@/core/billing/webhook";
import { env } from "@/core/env";

// Stripe calls this URL when something happens to a payment or subscription.
// Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
export async function POST(request: Request) {
  // The signature is computed over the exact bytes Stripe sent, so we need the
  // raw body as text. Parsing it as JSON first would change it and break the check.
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    // Proves the request really comes from Stripe. Without this, anyone could
    // POST a fake "subscription active" event and get Pro for free.
    event = stripe.webhooks.constructEvent(body, signature ?? "", env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event);
    return Response.json({ received: true, result });
  } catch (error) {
    // A 500 makes Stripe retry the event later, with backoff, for up to 3 days.
    console.error(`Stripe webhook ${event.type} (${event.id}) failed`, error);
    return new Response("Webhook handler failed", { status: 500 });
  }
}
