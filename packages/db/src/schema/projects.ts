import { relations, sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerIdx: index("projects_owner_id_idx").on(table.ownerId),
    activeOwnerIdx: index("projects_active_owner_id_idx").on(table.ownerId, table.deletedAt)
  })
);

export const projectSettings = pgTable("project_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const projectVersions = pgTable(
  "project_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 40 }).notNull(),
    snapshot: text("snapshot").notNull().default(sql`'{}'::text`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    projectIdx: index("project_versions_project_id_idx").on(table.projectId)
  })
);

export const projectRelations = relations(projects, ({ many, one }) => ({
  settings: one(projectSettings, {
    fields: [projects.id],
    references: [projectSettings.projectId]
  }),
  versions: many(projectVersions)
}));

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
