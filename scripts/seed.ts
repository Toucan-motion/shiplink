// Fills the database with two demo users, a few links and a month of fake
// clicks, so the stats page has something to show. Run with `pnpm db:seed`.
//
// Safe to run again: it deletes the demo users first (their links and clicks
// go with them) and recreates everything from scratch.
//
// For local development only. Never point this at production.

import { loadEnvConfig } from "@next/env";

const DEMO_PASSWORD = "shiplink-demo";

const DEMO_USERS = [
  {
    name: "Free Demo",
    email: "free@shiplink.test",
    links: [
      { slug: "launch-post", destination: "https://example.com/blog/we-launched", clicks: 140 },
      { slug: "newsletter", destination: "https://example.com/newsletter", clicks: 45 },
      { slug: "slides", destination: "https://example.com/talks/2026/slides.pdf", clicks: 15 },
    ],
  },
  {
    // TODO(billing): give this user an active Pro subscription once billing
    // exists. Until then the app treats them as Free like everyone else.
    name: "Pro Demo",
    email: "pro@shiplink.test",
    links: [
      { slug: "pricing", destination: "https://example.com/pricing", clicks: 120 },
      { slug: "changelog", destination: "https://example.com/changelog", clicks: 50 },
      { slug: "podcast-42", destination: "https://example.com/podcast/42", clicks: 25 },
      { slug: "careers", destination: "https://example.com/careers", clicks: 10 },
    ],
  },
];

const HISTORY_DAYS = 30;

// Weighted pools, so the "top" tables have a clear winner. null is a click
// with no referrer / no country header, shown as "Unknown".
const REFERRERS = [
  ["twitter.com", 30],
  ["news.ycombinator.com", 20],
  ["www.google.com", 15],
  ["www.linkedin.com", 10],
  ["www.reddit.com", 8],
  [null, 17],
] as const;

const COUNTRIES = [
  ["US", 35],
  ["DE", 15],
  ["PL", 12],
  ["GB", 10],
  ["IN", 8],
  ["FR", 5],
  [null, 15],
] as const;

async function main() {
  // Load .env before anything reads process.env, the same way `next dev` does.
  loadEnvConfig(process.cwd());

  const { inArray } = await import("drizzle-orm");
  const { hashPassword } = await import("better-auth/crypto");
  const { db } = await import("@/core/db");
  const { account, click, link, user } = await import("@/core/db/schema");

  const random = seededRandom(42);
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await db.transaction(async (tx) => {
    const emails = DEMO_USERS.map((demo) => demo.email);
    await tx.delete(user).where(inArray(user.email, emails));

    for (const demo of DEMO_USERS) {
      const userId = crypto.randomUUID();
      const now = new Date();

      await tx.insert(user).values({
        id: userId,
        name: demo.name,
        email: demo.email,
        // Skip the "check your inbox" step for demo accounts.
        emailVerified: true,
        createdAt: daysAgo(now, HISTORY_DAYS + demo.links.length),
        updatedAt: now,
      });

      // This is what Better Auth stores for an email + password account.
      await tx.insert(account).values({
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });

      for (const [index, demoLink] of demo.links.entries()) {
        const [created] = await tx
          .insert(link)
          .values({
            userId,
            slug: demoLink.slug,
            destination: demoLink.destination,
            // A day apart, so the dashboard lists them in a stable order.
            createdAt: daysAgo(now, HISTORY_DAYS + index),
          })
          .returning({ id: link.id });

        const clicks = Array.from({ length: demoLink.clicks }, () => ({
          linkId: created.id,
          createdAt: randomRecentTime(now, random),
          referrerHost: pick(REFERRERS, random),
          country: pick(COUNTRIES, random),
          device: random() < 0.55 ? ("mobile" as const) : ("desktop" as const),
        }));
        await tx.insert(click).values(clicks);
      }

      const total = demo.links.reduce((sum, demoLink) => sum + demoLink.clicks, 0);
      console.log(`  ${demo.email}: ${demo.links.length} links, ${total} clicks`);
    }
  });

  console.log(`\nSeeded. Log in with either email above and the password "${DEMO_PASSWORD}".`);
  process.exit(0);
}

function daysAgo(now: Date, days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// A moment in the last HISTORY_DAYS days, more often recent than old, so the
// chart shows a link that's picking up.
function randomRecentTime(now: Date, random: () => number) {
  const ageInDays = HISTORY_DAYS * random() ** 1.5;
  return new Date(now.getTime() - ageInDays * 24 * 60 * 60 * 1000);
}

function pick<T>(pool: readonly (readonly [T, number])[], random: () => number): T {
  const totalWeight = pool.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * totalWeight;
  for (const [value, weight] of pool) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return pool[pool.length - 1][0];
}

// A tiny deterministic random generator (mulberry32). Same seed, same data,
// so screenshots look the same every time you reseed (apart from the dates).
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
