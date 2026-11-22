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
   | `ENABLE_EXPERIMENTAL_COREPACK` | `1` |

   The last one makes Vercel install the exact pnpm version from the `packageManager` field
   in `package.json`. Without it, Vercel guesses the version from the lock file and may pick
   an older pnpm that can't read it.

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

Railway builds the app from the `Dockerfile` in the repo, in the cloud. You don't need
Docker on your own machine.

How the image works, in short: `next.config.ts` sets `output: "standalone"`, so the build
produces a small self-contained server (`server.js`). The image contains only that, the
static files, and `migrate.cjs`: the migration runner bundled into one file, because the
image has no pnpm or drizzle-kit to run `pnpm db:migrate` with.

### 1. Database

1. On [railway.com](https://railway.com), create a new project and choose **Deploy PostgreSQL**.
   (If you did Path A, you can use the same project and database.)

### 2. App service

1. In the same project: **+ Create → GitHub Repo** and pick your repository. The build log
   should say `Using detected Dockerfile!`.
2. Open the new service, **Settings → Networking → Generate Domain**. When asked for the
   port, enter `3000`. Copy the domain, e.g. `https://shiplink-production.up.railway.app`.
3. **Variables** tab, add:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (a reference: the private URL, inside Railway's network) |
   | `BETTER_AUTH_SECRET` | a new random value: `npx auth secret` |
   | `BETTER_AUTH_URL` | the domain from step 2 |
   | `NEXT_PUBLIC_APP_URL` | the same domain |
   | `STRIPE_SECRET_KEY` | `sk_test_...` |
   | `STRIPE_PRICE_PRO_MONTHLY` | `price_...` |
   | `STRIPE_WEBHOOK_SECRET` | a placeholder like `whsec_later` until step 3 |
   | `RESEND_API_KEY`, `EMAIL_FROM` | from Resend |
   | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | optional |

   `${{Postgres.DATABASE_URL}}` assumes the database service is called `Postgres`. If yours
   has another name, use that.
4. **Settings → Deploy**:
   - **Pre-deploy command:** `node migrate.cjs`. It runs before every deploy; if a
     migration fails, the deploy stops and the old version keeps running.
   - **Healthcheck path:** `/api/health`. Railway switches traffic to a new deploy only once
     this answers 200, which also needs the database to be reachable.
5. Deploy (Railway redeploys on its own after you change variables). Open
   `https://your-domain/api/health`: it should say `{"ok":true,"db":"ok"}`.

If a variable is missing, the deploy log shows `Invalid environment variables:` with the list,
and the server stops right away (see `src/instrumentation.ts`).

### 3. Stripe webhook

Same as step 3 of Path A, with your Railway domain:
`https://your-domain/api/stripe/webhook`. Each endpoint has its own signing secret, so put
this one into `STRIPE_WEBHOOK_SECRET` on Railway. If you run both paths at once, they're two
separate endpoints in Stripe.

### What's different from Vercel

- **Country is "Unknown".** Railway doesn't add a visitor-country header, so stats show no
  countries. To get them, put a CDN that adds one (like Cloudflare's `cf-ipcountry`) in
  front and read that header in `src/product/links/clicks.ts`.
- **Always on.** The app is a normal long-running Node server, not serverless functions:
  no cold starts, and you pay for the time it runs.

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
- [ ] **Email verification on.** `SKIP_EMAIL_VERIFICATION` is unset or `false`.
- [ ] **Secrets.** A fresh `BETTER_AUTH_SECRET` for production, never the one from your laptop.
- [ ] **Uptime monitor** pointed at `/api/health` (it checks the database too).
