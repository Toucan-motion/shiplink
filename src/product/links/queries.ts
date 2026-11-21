import { and, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/core/db";
import { click, link } from "@/core/db/schema";

// Reads only. Every query that returns a user's data takes the userId and
// filters by it, so one user can never see another user's links.

export async function listLinks(userId: string) {
  return db
    .select({
      id: link.id,
      slug: link.slug,
      destination: link.destination,
      createdAt: link.createdAt,
      clicks: count(click.id),
    })
    .from(link)
    .leftJoin(click, eq(click.linkId, link.id))
    .where(and(eq(link.userId, userId), isNull(link.deletedAt)))
    .groupBy(link.id)
    .orderBy(desc(link.createdAt));
}

export async function countActiveLinks(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(link)
    .where(and(eq(link.userId, userId), isNull(link.deletedAt)));
  return row?.total ?? 0;
}

// Used by the public redirect, so there's no user to filter by.
export async function findActiveLinkBySlug(slug: string) {
  const [row] = await db
    .select({ id: link.id, destination: link.destination })
    .from(link)
    .where(and(eq(link.slug, slug), isNull(link.deletedAt)));
  return row ?? null;
}

// Deleted links count too: their slugs are never handed out again.
export async function isSlugTaken(slug: string): Promise<boolean> {
  const [row] = await db.select({ id: link.id }).from(link).where(eq(link.slug, slug));
  return row !== undefined;
}
