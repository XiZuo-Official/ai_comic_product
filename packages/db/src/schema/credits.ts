import { integer, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const creditAccounts = pgTable("credit_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull().unique(),
  balance: integer("balance").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const creditReservations = pgTable(
  "credit_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => creditAccounts.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    reason: varchar("reason", { length: 120 }),
    idempotencyKey: varchar("idempotency_key", { length: 160 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    accountStatusIdx: index("credit_reservations_account_id_status_idx").on(table.accountId, table.status),
    accountIdempotencyIdx: uniqueIndex("credit_reservations_account_id_idempotency_key_idx").on(table.accountId, table.idempotencyKey)
  })
);

export const creditRefunds = pgTable(
  "credit_refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => creditAccounts.id, { onDelete: "cascade" }),
    reservationId: uuid("reservation_id").references(() => creditReservations.id, { onDelete: "set null" }),
    amount: integer("amount").notNull(),
    reason: varchar("reason", { length: 120 }),
    idempotencyKey: varchar("idempotency_key", { length: 160 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    accountIdempotencyIdx: uniqueIndex("credit_refunds_account_id_idempotency_key_idx").on(table.accountId, table.idempotencyKey)
  })
);

export const creditLedgerEntries = pgTable(
  "credit_ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => creditAccounts.id, { onDelete: "cascade" }),
    reservationId: uuid("reservation_id").references(() => creditReservations.id, { onDelete: "set null" }),
    refundId: uuid("refund_id").references(() => creditRefunds.id, { onDelete: "set null" }),
    entryType: varchar("entry_type", { length: 32 }).notNull(),
    amountDelta: integer("amount_delta").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    description: varchar("description", { length: 180 }),
    idempotencyKey: varchar("idempotency_key", { length: 160 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    accountCreatedAtIdx: index("credit_ledger_entries_account_id_created_at_idx").on(table.accountId, table.createdAt),
    accountIdempotencyIdx: uniqueIndex("credit_ledger_entries_account_id_idempotency_key_idx").on(table.accountId, table.idempotencyKey)
  })
);

export type CreditAccountRow = typeof creditAccounts.$inferSelect;
export type CreditLedgerEntryRow = typeof creditLedgerEntries.$inferSelect;
export type CreditRefundRow = typeof creditRefunds.$inferSelect;
export type CreditReservationRow = typeof creditReservations.$inferSelect;
