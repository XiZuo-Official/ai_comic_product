import { relations, sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid, varchar, integer } from "drizzle-orm/pg-core";

import { projects } from "./projects";

export const exportJobs = pgTable(
  "export_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 24 }).notNull().default("queued"),
    format: varchar("format", { length: 24 }).notNull().default("html"),
    settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    sourceSnapshot: jsonb("source_snapshot").$type<Record<string, unknown>>(),
    errorMessage: text("error_message"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerProjectIdx: index("export_jobs_owner_id_project_id_idx").on(table.ownerId, table.projectId),
    projectStatusIdx: index("export_jobs_project_id_status_idx").on(table.projectId, table.status)
  })
);

export const exportArtifacts = pgTable(
  "export_artifacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    exportJobId: uuid("export_job_id")
      .notNull()
      .references(() => exportJobs.id, { onDelete: "cascade" }),
    ownerId: text("owner_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    storageProvider: varchar("storage_provider", { length: 40 }).notNull(),
    storageKey: text("storage_key").notNull(),
    fileName: varchar("file_name", { length: 240 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    fileSize: integer("file_size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    exportJobIdx: index("export_artifacts_export_job_id_idx").on(table.exportJobId),
    ownerProjectIdx: index("export_artifacts_owner_id_project_id_idx").on(table.ownerId, table.projectId)
  })
);

export const exportJobRelations = relations(exportJobs, ({ many, one }) => ({
  artifacts: many(exportArtifacts),
  project: one(projects, {
    fields: [exportJobs.projectId],
    references: [projects.id]
  })
}));

export const exportArtifactRelations = relations(exportArtifacts, ({ one }) => ({
  exportJob: one(exportJobs, {
    fields: [exportArtifacts.exportJobId],
    references: [exportJobs.id]
  }),
  project: one(projects, {
    fields: [exportArtifacts.projectId],
    references: [projects.id]
  })
}));

export type ExportJobRow = typeof exportJobs.$inferSelect;
export type ExportArtifactRow = typeof exportArtifacts.$inferSelect;
