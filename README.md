# ShipLink

A minimal SaaS starter in Next.js — demoed as a link shortener with click stats.

> Work in progress.

## Quick start

You need Node 24+, pnpm and a Postgres database (local install or a free one on Railway).

```bash
pnpm i
cp .env.example .env   # fill in DATABASE_URL, BETTER_AUTH_SECRET, Google keys
pnpm db:migrate
pnpm dev
```

- `GET /api/health` should return `{ "ok": true, "db": "ok" }`.
- With `RESEND_API_KEY` empty, emails (verification, password reset) are printed
  in the terminal running `pnpm dev`. Open the link from there.
- `pnpm db:seed` adds two demo users (`free@shiplink.test` and
  `pro@shiplink.test`, password `shiplink-demo`) with links and a month of
  fake clicks, so the stats page has something to show. Local use only.
