import { and, count, desc, eq, gte, isNull } from "drizzle-orm";

import { db } from "@/core/db";
import { click, link } from "@/core/db/schema";

import { fillDays, lastDays, startOfWindow, utcDay } from "./days";

// Reads for the stats page of one link.

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
export type DeviceCounts = { mobile: number; desktop: number };

export type LinkStats = {
  total: number;
  days: DailyClicks[];
  topReferrers: TopEntry[];
  topCountries: TopEntry[];
  devices: DeviceCounts;
};

const TOP_LIMIT = 5;

// Stats for one link over the last `historyDays` days, today included.
// Call findOwnedLink first: this function trusts the id it gets.
export async function getLinkStats(linkId: string, historyDays: number): Promise<LinkStats> {
  const dates = lastDays(historyDays);
  const inWindow = and(eq(click.linkId, linkId), gte(click.createdAt, startOfWindow(dates)));

  const [perDay, topReferrers, topCountries, perDevice] = await Promise.all([
    db.select({ date: utcDay, clicks: count() }).from(click).where(inWindow).groupBy(utcDay),
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
    db.select({ device: click.device, clicks: count() }).from(click).where(inWindow).groupBy(click.device),
  ]);

  const days = fillDays(dates, perDay);

  return {
    total: days.reduce((sum, day) => sum + day.clicks, 0),
    days,
    topReferrers,
    topCountries,
    devices: toDeviceCounts(perDevice),
  };
}

export function toDeviceCounts(rows: { device: "mobile" | "desktop"; clicks: number }[]): DeviceCounts {
  return {
    mobile: rows.find((row) => row.device === "mobile")?.clicks ?? 0,
    desktop: rows.find((row) => row.device === "desktop")?.clicks ?? 0,
  };
}
