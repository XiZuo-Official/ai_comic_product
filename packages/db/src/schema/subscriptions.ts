import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: varchar("description", { length: 240 }),
  monthlyPriceCents: integer("monthly_price_cents").notNull().default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  creditGrantAmount: integer("credit_grant_amount").notNull(),
  billingPeriod: varchar("billing_period", { length: 24 }).notNull().default("monthly"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull().unique(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 32 }).notNull(),
    provider: varchar("provider", { length: 60 }).notNull(),
    providerSubscriptionId: varchar("provider_subscription_id", { length: 180 }),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    lastPaymentFailureReason: varchar("last_payment_failure_reason", { length: 180 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerStatusIdx: index("subscriptions_owner_id_status_idx").on(table.ownerId, table.status),
    providerSubscriptionIdx: uniqueIndex("subscriptions_provider_subscription_id_idx").on(table.provider, table.providerSubscriptionId)
  })
);

export const subscriptionEvents = pgTable(
  "subscription_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: varchar("provider", { length: 60 }).notNull(),
    providerEventId: varchar("provider_event_id", { length: 180 }).notNull(),
    eventType: varchar("event_type", { length: 80 }).notNull(),
    ownerId: text("owner_id").notNull(),
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "set null" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),
    creditLedgerEntryId: uuid("credit_ledger_entry_id"),
    payload: text("payload").notNull().default("{}"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerCreatedAtIdx: index("subscription_events_owner_id_created_at_idx").on(table.ownerId, table.createdAt),
    providerEventIdx: uniqueIndex("subscription_events_provider_event_id_idx").on(table.provider, table.providerEventId)
  })
);

export type PlanRow = typeof plans.$inferSelect;
export type SubscriptionEventRow = typeof subscriptionEvents.$inferSelect;
export type SubscriptionRow = typeof subscriptions.$inferSelect;
