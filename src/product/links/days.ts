import { sql } from "drizzle-orm";

import { click } from "@/core/db/schema";

// Date helpers shared by the stats queries.

// DECISION: a "day" is a UTC day. It's the same for every visitor and every
// server, and one line of SQL. Showing days in each user's own timezone would
// need their timezone stored and passed into every query.
export const utcDay = sql<string>`to_char(${click.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;

// ["2026-11-15", ..., "2026-11-21"] for n = 7, oldest first, in UTC.
export function lastDays(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const day = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (n - 1 - i)),
    );
    return day.toISOString().slice(0, 10);
  });
}

// Midnight UTC at the start of the first of the last n days.
export function startOfWindow(days: string[]): Date {
  return new Date(`${days[0]}T00:00:00Z`);
}

// The database only returns days that had clicks. Charts need every day,
// so quiet days come back as zero instead of disappearing.
export function fillDays(days: string[], rows: { date: string; clicks: number }[]) {
  const clicksByDate = new Map(rows.map((row) => [row.date, row.clicks]));
  return days.map((date) => ({ date, clicks: clicksByDate.get(date) ?? 0 }));
}
