# Deploy

The app doesn't depend on one host. Two setups are described here:

- **Path A: Vercel (app) + Railway (Postgres).** The main path.
- **Path B: Railway for everything (app + Postgres).** One bill, one dashboard.

Both use the same code. The one visible difference: Vercel adds a country header to every
request and Railway doesn't, so on Railway the "Top countries" table shows "Unknown"
(see `[ebook ch8]` in `src/product/links/clicks.ts`).

Before you start, push the repo to your own GitHub account.

## Path A: Vercel + Railway Postgres

### 1. Database on Railway

1. On [railway.com](https://railway.com), create a new project and choose **Deploy PostgreSQL**.
2. Open the Postgres service, go to **Variables** and copy `DATABASE_PUBLIC_URL`.
   Use the public URL: Vercel runs outside Railway's private network.

### 2. App on Vercel

1. On [vercel.com](https://vercel.com), **Add New → Project** and import your repository.
   The framework preset is detected as Next.js.
2. Under **Build and Output Settings**, override the build command:

   ```
   pnpm db:migrate && pnpm build
   ```

   Every deploy applies new migrations before building, so the database and the code never
   get out of step.
3. Under **Environment Variables**, add everything from `.env.example`:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | the `DATABASE_PUBLIC_URL` from Railway |
   | `BETTER_AUTH_SECRET` | a new random value: `npx auth secret` (don't reuse your local one) |
   | `BETTER_AUTH_URL` | `https://your-project.vercel.app` (or your domain) |
   | `NEXT_PUBLIC_APP_URL` | the same URL |
   | `STRIPE_SECRET_KEY` | `sk_test_...` for now (live key at launch, see the checklist) |
   | `STRIPE_PRICE_PRO_MONTHLY` | `price_...` |
   | `STRIPE_WEBHOOK_SECRET` | add a placeholder like `whsec_later`, you'll get the real one in step 3 |
   | `RESEND_API_KEY`, `EMAIL_FROM` | from Resend. Without a key, emails only go to the logs |
   | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | optional |

   You don't know the `.vercel.app` URL before the first deploy? Deploy once, copy the URL,
   set both URL variables and redeploy. `NEXT_PUBLIC_` variables are baked in at build time,
   so a change to one always needs a redeploy.
4. Deploy. Then open `https://your-project.vercel.app/api/health`: it should say
   `{"ok":true,"db":"ok"}`.

### 3. Stripe webhook

1. In Stripe, go to **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://your-project.vercel.app/api/stripe/webhook`.
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the endpoint's **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` on Vercel
   and redeploy.
5. Save the Customer Portal settings once (Settings → Billing → Customer portal), otherwise
   "Manage billing" can't open it.

Test it: sign up, upgrade with `4242 4242 4242 4242`, and the plan on Settings should say Pro
within a few seconds. Stripe's webhook page shows every delivery and our response.

## Path B: everything on Railway

Coming with the Dockerfile in the next release: the app built from a `Dockerfile` with
Next's standalone output, migrations as a pre-deploy command, and `/api/health` as the
healthcheck.

## Production checklist

Before real customers:

- [ ] **Stripe live mode.** Switch the dashboard to live mode, create the Pro product and price
      there too (test and live are separate), and replace `STRIPE_SECRET_KEY` (`sk_live_...`)
      and `STRIPE_PRICE_PRO_MONTHLY`.
- [ ] **Live webhook endpoint.** Add the endpoint again in live mode, with the same four
      events, and use its signing secret for `STRIPE_WEBHOOK_SECRET`.
- [ ] **Customer Portal** saved in live mode as well.
- [ ] **Google OAuth** (if you use it): add `https://your-domain/api/auth/callback/google` to
      the authorized redirect URIs of your OAuth client.
- [ ] **Resend domain.** Verify your domain at https://resend.com/domains, set
      `RESEND_API_KEY`, and set `EMAIL_FROM` to an address on that domain.
      `onboarding@resend.dev` only delivers to your own Resend account's email.
- [ ] **URLs.** `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` set to the real domain, then redeploy.
- [ ] **Secrets.** A fresh `BETTER_AUTH_SECRET` for production, never the one from your laptop.
- [ ] **Uptime monitor** pointed at `/api/health` (it checks the database too).
