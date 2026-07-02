import { relations, sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const aiJobs = pgTable(
  "ai_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    jobType: varchar("job_type", { length: 60 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("queued"),
    prompt: text("prompt").notNull(),
    promptTemplateKey: varchar("prompt_template_key", { length: 120 }).notNull(),
    promptTemplateVersion: integer("prompt_template_version").notNull(),
    input: jsonb("input").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    result: jsonb("result").$type<Record<string, unknown>>(),
    error: text("error"),
    estimatedCost: integer("estimated_cost").notNull(),
    progress: integer("progress").notNull().default(0),
    creditReservationId: uuid("credit_reservation_id"),
    idempotencyKey: varchar("idempotency_key", { length: 160 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerCreatedAtIdx: index("ai_jobs_owner_id_created_at_idx").on(table.ownerId, table.createdAt),
    ownerIdempotencyIdx: uniqueIndex("ai_jobs_owner_id_idempotency_key_idx").on(table.ownerId, table.idempotencyKey),
    ownerStatusIdx: index("ai_jobs_owner_id_status_idx").on(table.ownerId, table.status)
  })
);

export const aiJobSteps = pgTable(
  "ai_job_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => aiJobs.id, { onDelete: "cascade" }),
    stepName: varchar("step_name", { length: 80 }).notNull(),
    status: varchar("status", { length: 24 }).notNull(),
    message: text("message"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    jobCreatedAtIdx: index("ai_job_steps_job_id_created_at_idx").on(table.jobId, table.createdAt)
  })
);

export const aiPromptTemplates = pgTable(
  "ai_prompt_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateKey: varchar("template_key", { length: 120 }).notNull(),
    version: integer("version").notNull(),
    purpose: varchar("purpose", { length: 80 }).notNull(),
    systemPrompt: text("system_prompt").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    templateVersionIdx: uniqueIndex("ai_prompt_templates_key_version_idx").on(table.templateKey, table.version)
  })
);

export const aiProviderCalls = pgTable(
  "ai_provider_calls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => aiJobs.id, { onDelete: "cascade" }),
    stepId: uuid("step_id").references(() => aiJobSteps.id, { onDelete: "set null" }),
    providerId: varchar("provider_id", { length: 80 }).notNull(),
    operation: varchar("operation", { length: 80 }).notNull(),
    status: varchar("status", { length: 24 }).notNull(),
    requestMetadata: jsonb("request_metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    responseMetadata: jsonb("response_metadata").$type<Record<string, unknown>>(),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true })
  },
  (table) => ({
    jobStartedAtIdx: index("ai_provider_calls_job_id_started_at_idx").on(table.jobId, table.startedAt),
    providerStatusIdx: index("ai_provider_calls_provider_id_status_idx").on(table.providerId, table.status)
  })
);

export const aiJobRelations = relations(aiJobs, ({ many }) => ({
  providerCalls: many(aiProviderCalls),
  steps: many(aiJobSteps)
}));

export const aiJobStepRelations = relations(aiJobSteps, ({ many, one }) => ({
  job: one(aiJobs, {
    fields: [aiJobSteps.jobId],
    references: [aiJobs.id]
  }),
  providerCalls: many(aiProviderCalls)
}));

export const aiProviderCallRelations = relations(aiProviderCalls, ({ one }) => ({
  job: one(aiJobs, {
    fields: [aiProviderCalls.jobId],
    references: [aiJobs.id]
  }),
  step: one(aiJobSteps, {
    fields: [aiProviderCalls.stepId],
    references: [aiJobSteps.id]
  })
}));

export type AiJobRow = typeof aiJobs.$inferSelect;
export type AiJobStepRow = typeof aiJobSteps.$inferSelect;
export type AiPromptTemplateRow = typeof aiPromptTemplates.$inferSelect;
export type AiProviderCallRow = typeof aiProviderCalls.$inferSelect;
