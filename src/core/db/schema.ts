import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

// All database tables, in one place, so drizzle-kit can diff them and write
// SQL migrations into ./migrations.

// user, session, account, verification: owned by Better Auth.
export * from "./auth-schema";

// Timestamps in our own tables use `withTimezone` (Postgres timestamptz): each
// value is an exact moment, so "clicks per day" or "renews on" come out right
// whatever timezone the database server happens to run in.

// ---------------------------------------------------------------------------
// Billing. Stripe is the source of truth: these tables are a local copy that
// the webhook keeps up to date, so we don't call Stripe on every page load.
// ---------------------------------------------------------------------------

// One row per user who has ever started a checkout.
// DECISION: the row is created as soon as we create their Stripe customer, so
// the customer is reused next time. Until they actually subscribe, the
// subscription columns stay null, and null status means Free.
export const subscription = pgTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Stripe's own status string: active, trialing, past_due, canceled, ...
  // The plan is derived from it in core/billing/plans.ts, never stored.
  status: text("status"),
  priceId: text("price_id"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Ids of Stripe webhook events we've already handled. Stripe can deliver the
// same event more than once; this table is how we notice.
export const stripeEvent = pgTable("stripe_event", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Product tables. Replace these with your own product's tables.
// ---------------------------------------------------------------------------

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
