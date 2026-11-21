import Stripe from "stripe";

import { env } from "@/core/env";

// The one Stripe client for the whole app. Server only: it holds the secret key.
// (No `import "server-only"` here because the Better Auth CLI loads this file
// through auth.ts, and that import refuses to run outside Next.)
//
// No apiVersion is passed, so the SDK uses the API version it was built for and
// its TypeScript types match what Stripe actually sends back.
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
