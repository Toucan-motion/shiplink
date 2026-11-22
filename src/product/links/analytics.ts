import { and, count, desc, eq, gte, isNull } from "drizzle-orm";

import { db } from "@/core/db";
import { click, link } from "@/core/db/schema";

import { fillDays, lastDays, startOfWindow, utcDay } from "./days";
import { type DailyClicks, type DeviceCounts, type TopEntry, toDeviceCounts } from "./stats";

// Reads for the Analytics page: every active link of one user, added up.

export type TopLink = { id: string; slug: string; destination: string; clicks: number };
export type RecentClick = {
  id: string;
  slug: string;
  createdAt: Date;
  country: string | null;
  referrerHost: string | null;
  device: "mobile" | "desktop";
};

export type AccountStats = {
  total: number;
  days: DailyClicks[];
  topLinks: TopLink[];
  topReferrers: TopEntry[];
  topCountries: TopEntry[];
  devices: DeviceCounts;
  recentClicks: RecentClick[];
};

const TOP_LIMIT = 5;
const RECENT_LIMIT = 8;

export async function getAccountStats(userId: string, historyDays: number): Promise<AccountStats> {
  const dates = lastDays(historyDays);

  // Clicks on this user's links (deleted links left out) inside the window.
  // Every query below joins click -> link and filters by userId: the same
  // ownership rule as everywhere else, just one join away.
  const scope = and(
    eq(link.userId, userId),
    isNull(link.deletedAt),
    gte(click.createdAt, startOfWindow(dates)),
  );

  const [perDay, topLinks, topReferrers, topCountries, perDevice, recentClicks] = await Promise.all([
    db
      .select({ date: utcDay, clicks: count() })
      .from(click)
      .innerJoin(link, eq(click.linkId, link.id))
      .where(scope)
      .groupBy(utcDay),
    db
      .select({ id: link.id, slug: link.slug, destination: link.destination, clicks: count() })
      .from(click)
      .innerJoin(link, eq(click.linkId, link.id))
      .where(scope)
      .groupBy(link.id)
      .orderBy(desc(count()))
      .limit(TOP_LIMIT),
    db
      .select({ name: click.referrerHost, clicks: count() })
      .from(click)
      .innerJoin(link, eq(click.linkId, link.id))
      .where(scope)
      .groupBy(click.referrerHost)
      .orderBy(desc(count()))
      .limit(TOP_LIMIT),
    db
      .select({ name: click.country, clicks: count() })
      .from(click)
      .innerJoin(link, eq(click.linkId, link.id))
      .where(scope)
      .groupBy(click.country)
      .orderBy(desc(count()))
      .limit(TOP_LIMIT),
    db
      .select({ device: click.device, clicks: count() })
      .from(click)
      .innerJoin(link, eq(click.linkId, link.id))
      .where(scope)
      .groupBy(click.device),
    db
      .select({
        id: click.id,
        slug: link.slug,
        createdAt: click.createdAt,
        country: click.country,
        referrerHost: click.referrerHost,
        device: click.device,
      })
      .from(click)
      .innerJoin(link, eq(click.linkId, link.id))
      .where(scope)
      .orderBy(desc(click.createdAt))
      .limit(RECENT_LIMIT),
  ]);

  const days = fillDays(dates, perDay);

  return {
    total: days.reduce((sum, day) => sum + day.clicks, 0),
    days,
    topLinks,
    topReferrers,
    topCountries,
    devices: toDeviceCounts(perDevice),
    recentClicks,
  };
}
