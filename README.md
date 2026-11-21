# ShipLink

A minimal SaaS starter in Next.js — demoed as a link shortener with click stats.

> Work in progress.

## Quick start

You need Node 24+, pnpm, a Postgres database (local install or a free one on Railway),
a Stripe account in test mode and the [Stripe CLI](https://docs.stripe.com/stripe-cli).

```bash
pnpm i
cp .env.example .env   # fill in the values, each one has a comment
pnpm db:migrate
pnpm dev
stripe listen --forward-to localhost:3000/api/stripe/webhook   # in a second terminal
```

- `GET /api/health` should return `{ "ok": true, "db": "ok" }`.
- With `RESEND_API_KEY` empty, emails (verification, password reset) are printed
  in the terminal running `pnpm dev`. Open the link from there.
- `pnpm db:seed` adds two demo users (`free@shiplink.test` and
  `pro@shiplink.test`, password `shiplink-demo`) with links and a month of
  fake clicks, so the stats page has something to show. Local use only.
- Upgrade with the test card `4242 4242 4242 4242` (any future date, any CVC).
  The Customer Portal needs to be saved once in test mode before "Manage billing"
  works: https://dashboard.stripe.com/test/settings/billing/portal
- `pnpm test` runs the tests for plan limits and the Stripe webhook.
