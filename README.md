# ShipLink

A minimal SaaS starter in Next.js — demoed as a link shortener with click stats.

> Work in progress.

## Quick start

```bash
pnpm i
cp .env.example .env   # then fill in DATABASE_URL
pnpm db:migrate
pnpm dev
```

`GET /api/health` should return `{ "ok": true, "db": "ok" }`.
