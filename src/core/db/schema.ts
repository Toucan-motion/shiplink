import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

// All database tables, in one place, so drizzle-kit can diff them and write
// SQL migrations into ./migrations.

// user, session, account, verification: owned by Better Auth.
export * from "./auth-schema";

// ---------------------------------------------------------------------------
// Product tables. Replace these with your own product's tables.
// ---------------------------------------------------------------------------

// Timestamps use `withTimezone` (Postgres timestamptz): each value is an exact
// moment, so "clicks per day" comes out right whatever timezone the database
// server happens to run in.

export const link = pgTable(
  "link",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Unique across deleted links too: a short URL someone already shared
    // must never start pointing somewhere new.
    slug: text("slug").notNull().unique(),
    destination: text("destination").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // Soft delete: the row stays so old clicks and stats still make sense.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("link_user_id_idx").on(table.userId)],
);

export const click = pgTable(
  "click",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    linkId: text("link_id")
      .notNull()
      .references(() => link.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    referrerHost: text("referrer_host"),
    country: text("country"),
    device: text("device", { enum: ["mobile", "desktop"] }).notNull(),
  },
  // Every stats query asks "clicks of this link since date X".
  (table) => [index("click_link_id_created_at_idx").on(table.linkId, table.createdAt)],
);
