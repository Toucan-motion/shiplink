import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/core/env";
import * as schema from "./schema";

// In dev, Next re-runs this module on every hot reload. Keeping the client on
// globalThis stops each reload from opening a fresh pool of connections.
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };

const client = globalForDb.pgClient ?? postgres(env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });
