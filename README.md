# ShipLink

A minimal, production-ready SaaS starter in Next.js, demoed as a link shortener with click stats.

Clone it, run it, then replace the link shortener with your own product. Auth, billing, email,
plan limits and deployment are already done.

**Live demo:** https://shiplink-five.vercel.app. Sign up with any email (no confirmation needed
in the demo) and upgrade with the Stripe test card `4242 4242 4242 4242`, any future date, any
CVC. No real money moves.

## What's inside

| Module | What it does | Where |
| --- | --- | --- |
| Next.js (App Router) + TypeScript | One codebase for pages and API, `strict` mode | `src/app` |
| Auth | Email + password, email verification, password reset, optional Google login ([Better Auth](https://better-auth.com)) | `src/core/auth` |
| Billing | Stripe Checkout, Customer Portal, webhook with idempotency | `src/core/billing` |
| Plans and limits | Every limit in one file: `assertWithinLimit` / `canUse` | `src/core/billing/plans.ts` |
| Database | Postgres + Drizzle ORM, SQL migrations committed to the repo | `src/core/db` |
| Email | Resend + React Email, printed to the terminal when there's no API key | `src/core/email` |
| Env validation | Builds without any variables; until they're all set, every page shows a setup screen saying which are missing | `src/core/env.ts`, `src/proxy.ts` |
| UI | Tailwind CSS + shadcn/ui | `src/components/ui` |
| Demo product | Link shortener: redirects, click tracking, analytics, QR codes | `src/product/links` |
| Tests | Vitest, only where a bug costs money: plan limits and the Stripe webhook | `src/core/billing/*.test.ts` |
| Deploy | Vercel, or Railway with a small Docker image (standalone output) | `Dockerfile`, `docs/DEPLOY.md` |

`src/core` is the "don't touch" layer. `src/product` is where your product goes.

## Quick start

You need:

- Node 24+ and pnpm (`npm i -g pnpm`)
- Postgres: a local install, or a free database on [Railway](https://railway.com)
- A [Stripe](https://dashboard.stripe.com/register) account (test mode is enough) and the
  [Stripe CLI](https://docs.stripe.com/stripe-cli)

```bash
pnpm i
cp .env.example .env      # fill in the values, every one has a comment saying where to get it
pnpm db:migrate
pnpm dev
```

In a second terminal, forward Stripe webhooks to your machine. Put the `whsec_...` secret it
prints into `STRIPE_WEBHOOK_SECRET` in `.env`:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted
```

Open http://localhost:3000.

- `GET /api/health` should return `{ "ok": true, "db": "ok" }`.
- With `RESEND_API_KEY` empty, emails (verification, password reset) are printed in the
  terminal running `pnpm dev`. Open the link from there.
- No email provider at all, e.g. for a demo? `SKIP_EMAIL_VERIFICATION=true` lets new accounts
  log in without confirming their email. Never in a real product.
- Upgrade with the test card `4242 4242 4242 4242`, any future date, any CVC.
- "Manage billing" needs the Customer Portal saved once in Stripe test mode:
  https://dashboard.stripe.com/test/settings/billing/portal
- `pnpm db:seed` adds two demo users (`free@shiplink.test` and `pro@shiplink.test`, password
  `shiplink-demo`) with links and a month of fake clicks. Local use only.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server on port 3000 |
| `pnpm build` / `pnpm start` | Production build / run it |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |
| `pnpm test` | Tests for plan limits and the Stripe webhook |
| `pnpm db:generate` | Write a new SQL migration after changing `src/core/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Browse the database in Drizzle Studio |
| `pnpm db:seed` | Demo users, links and clicks |

## Add your own product

1. **Create `src/product/<name>/`** with your server actions, queries and components. Use
   `src/product/links` as the example: every action validates input with Zod, gets the user,
   checks ownership and limits, then does the work.
2. **Add your tables** to `src/core/db/schema.ts`, then run `pnpm db:generate` and
   `pnpm db:migrate`. Delete the `link` and `click` tables (and `src/product/links`) when you no
   longer need the demo.
3. **Add your limits to `src/core/billing/plans.ts`.** Add the name to `LimitName` or
   `FeatureName`, a value to each plan, and call `assertWithinLimit(user, "yourLimit")` or
   `canUse(user, "yourFeature")` from your actions. No other file should know the numbers.

## Deploy

Two ways, both described step by step in [docs/DEPLOY.md](docs/DEPLOY.md):

- **Vercel** for the app + **Railway** for Postgres
- **Railway** for both

The production checklist (live Stripe keys, webhook endpoint, OAuth redirect URIs, email domain)
is in the same file.

## The ebook

This repo is the companion code for the ebook *How to build and ship a SaaS in 2026*. Chapters
point to places in the code marked with `[ebook chN]` comments; the full list is in
[docs/EBOOK_MARKERS.md](docs/EBOOK_MARKERS.md).

## License

[MIT](LICENSE)
