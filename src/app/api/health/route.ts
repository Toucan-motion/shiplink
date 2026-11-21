import { sql } from "drizzle-orm";

import { db } from "@/core/db";

// A health check must hit the database every time, never a cached answer.
export const dynamic = "force-dynamic";

// Polled by uptime monitors and by Railway's healthcheck. A 503 tells the
// platform this instance can't serve real traffic, so it won't route to it.
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: "ok" });
  } catch (error) {
    console.error("Health check failed: database unreachable", error);
    return Response.json({ ok: false, db: "unreachable" }, { status: 503 });
  }
}
