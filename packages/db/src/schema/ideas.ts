import { relations, sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { projects } from "./projects";

export const ideaThreads = pgTable(
  "idea_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerProjectIdx: index("idea_threads_owner_id_project_id_idx").on(table.ownerId, table.projectId),
    ownerUpdatedAtIdx: index("idea_threads_owner_id_updated_at_idx").on(table.ownerId, table.updatedAt)
  })
);

export const ideaMessages = pgTable(
  "idea_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => ideaThreads.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 24 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("completed"),
    content: text("content").notNull(),
    aiJobId: uuid("ai_job_id"),
    error: text("error"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    threadCreatedAtIdx: index("idea_messages_thread_id_created_at_idx").on(table.threadId, table.createdAt),
    threadRoleIdx: index("idea_messages_thread_id_role_idx").on(table.threadId, table.role)
  })
);

export const ideaContextSnapshots = pgTable(
  "idea_context_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => ideaThreads.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    aiJobId: uuid("ai_job_id"),
    context: jsonb("context").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    threadCreatedAtIdx: index("idea_context_snapshots_thread_id_created_at_idx").on(table.threadId, table.createdAt),
    projectCreatedAtIdx: index("idea_context_snapshots_project_id_created_at_idx").on(table.projectId, table.createdAt)
  })
);

export const ideaThreadRelations = relations(ideaThreads, ({ many, one }) => ({
  contextSnapshots: many(ideaContextSnapshots),
  messages: many(ideaMessages),
  project: one(projects, {
    fields: [ideaThreads.projectId],
    references: [projects.id]
  })
}));

export const ideaMessageRelations = relations(ideaMessages, ({ one }) => ({
  thread: one(ideaThreads, {
    fields: [ideaMessages.threadId],
    references: [ideaThreads.id]
  })
}));

export const ideaContextSnapshotRelations = relations(ideaContextSnapshots, ({ one }) => ({
  project: one(projects, {
    fields: [ideaContextSnapshots.projectId],
    references: [projects.id]
  }),
  thread: one(ideaThreads, {
    fields: [ideaContextSnapshots.threadId],
    references: [ideaThreads.id]
  })
}));

export type IdeaThreadRow = typeof ideaThreads.$inferSelect;
export type IdeaMessageRow = typeof ideaMessages.$inferSelect;
export type IdeaContextSnapshotRow = typeof ideaContextSnapshots.$inferSelect;
