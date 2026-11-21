import { and, count, desc, eq, gte, isNull, sql } from "drizzle-orm";

import { db } from "@/core/db";
import { click, link } from "@/core/db/schema";

// Reads for the link detail page.

// The page is owner only. Filtering by userId here means a guessed or leaked
// link id from someone else's account simply isn't found.
export async function findOwnedLink(linkId: string, userId: string) {
  const [row] = await db
    .select({ id: link.id, slug: link.slug, destination: link.destination, createdAt: link.createdAt })
    .from(link)
    .where(and(eq(link.id, linkId), eq(link.userId, userId), isNull(link.deletedAt)));
  return row ?? null;
}

export type DailyClicks = { date: string; clicks: number };
export type TopEntry = { name: string | null; clicks: number };

export type LinkStats = {
  total: number;
  days: DailyClicks[];
  topReferrers: TopEntry[];
  topCountries: TopEntry[];
};

const TOP_LIMIT = 5;

// DECISION: a "day" is a UTC day. It's the same for every visitor and every
// server, and one line of SQL. Showing days in each user's own timezone would
// need their timezone stored and passed into every query.
const utcDay = sql<string>`to_char(${click.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;

// Stats for one link over the last `historyDays` days, today included.
// Call findOwnedLink first: this function trusts the id it gets.
export async function getLinkStats(linkId: string, historyDays: number): Promise<LinkStats> {
  const dates = lastDays(historyDays);
  const since = new Date(`${dates[0]}T00:00:00Z`);
  const inWindow = and(eq(click.linkId, linkId), gte(click.createdAt, since));

  const [perDay, topReferrers, topCountries] = await Promise.all([
    db
      .select({ date: utcDay, clicks: count() })
      .from(click)
      .where(inWindow)
      .groupBy(utcDay),
    db
      .select({ name: click.referrerHost, clicks: count() })
      .from(click)
      .where(inWindow)
      .groupBy(click.referrerHost)
      .orderBy(desc(count()))
      .limit(TOP_LIMIT),
    db
      .select({ name: click.country, clicks: count() })
      .from(click)
      .where(inWindow)
      .groupBy(click.country)
      .orderBy(desc(count()))
      .limit(TOP_LIMIT),
  ]);

  // The database only returns days that had clicks. The chart needs every
  // day, so quiet days show up as zero instead of disappearing.
  const clicksByDate = new Map(perDay.map((row) => [row.date, row.clicks]));
  const days = dates.map((date) => ({ date, clicks: clicksByDate.get(date) ?? 0 }));

  return {
    total: days.reduce((sum, day) => sum + day.clicks, 0),
    days,
    topReferrers,
    topCountries,
  };
}

// ["2026-11-15", ..., "2026-11-21"] for n = 7, oldest first, in UTC.
function lastDays(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const day = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (n - 1 - i)),
    );
    return day.toISOString().slice(0, 10);
  });
}
