import { relations, sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { assets } from "./assets";
import { projects } from "./projects";

export const comicPages = pgTable(
  "comic_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    pageNumber: integer("page_number").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerProjectIdx: index("comic_pages_owner_id_project_id_idx").on(table.ownerId, table.projectId),
    projectNumberIdx: index("comic_pages_project_id_page_number_idx").on(table.projectId, table.pageNumber),
    projectStatusIdx: index("comic_pages_project_id_status_idx").on(table.projectId, table.status)
  })
);

export const comicPanels = pgTable(
  "comic_panels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    pageId: uuid("page_id")
      .notNull()
      .references(() => comicPages.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id").references(() => assets.id, { onDelete: "set null" }),
    x: integer("x").notNull(),
    y: integer("y").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    orderIndex: integer("order_index").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    assetIdx: index("comic_panels_asset_id_idx").on(table.assetId),
    pageOrderIdx: index("comic_panels_page_id_order_index_idx").on(table.pageId, table.orderIndex),
    projectIdx: index("comic_panels_project_id_idx").on(table.projectId)
  })
);

export const comicBubbles = pgTable(
  "comic_bubbles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    pageId: uuid("page_id")
      .notNull()
      .references(() => comicPages.id, { onDelete: "cascade" }),
    panelId: uuid("panel_id").references(() => comicPanels.id, { onDelete: "set null" }),
    text: varchar("text", { length: 500 }).notNull(),
    x: integer("x").notNull(),
    y: integer("y").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    orderIndex: integer("order_index").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    pageOrderIdx: index("comic_bubbles_page_id_order_index_idx").on(table.pageId, table.orderIndex),
    panelIdx: index("comic_bubbles_panel_id_idx").on(table.panelId),
    projectIdx: index("comic_bubbles_project_id_idx").on(table.projectId)
  })
);

export const comicLayoutVersions = pgTable(
  "comic_layout_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => comicPages.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 40 }).notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    pageIdx: index("comic_layout_versions_page_id_idx").on(table.pageId)
  })
);

export const comicPageRelations = relations(comicPages, ({ many, one }) => ({
  bubbles: many(comicBubbles),
  panels: many(comicPanels),
  project: one(projects, {
    fields: [comicPages.projectId],
    references: [projects.id]
  }),
  versions: many(comicLayoutVersions)
}));

export const comicPanelRelations = relations(comicPanels, ({ many, one }) => ({
  asset: one(assets, {
    fields: [comicPanels.assetId],
    references: [assets.id]
  }),
  bubbles: many(comicBubbles),
  page: one(comicPages, {
    fields: [comicPanels.pageId],
    references: [comicPages.id]
  }),
  project: one(projects, {
    fields: [comicPanels.projectId],
    references: [projects.id]
  })
}));

export const comicBubbleRelations = relations(comicBubbles, ({ one }) => ({
  page: one(comicPages, {
    fields: [comicBubbles.pageId],
    references: [comicPages.id]
  }),
  panel: one(comicPanels, {
    fields: [comicBubbles.panelId],
    references: [comicPanels.id]
  }),
  project: one(projects, {
    fields: [comicBubbles.projectId],
    references: [projects.id]
  })
}));

export const comicLayoutVersionRelations = relations(comicLayoutVersions, ({ one }) => ({
  page: one(comicPages, {
    fields: [comicLayoutVersions.pageId],
    references: [comicPages.id]
  })
}));

export type ComicPageRow = typeof comicPages.$inferSelect;
export type ComicPanelRow = typeof comicPanels.$inferSelect;
export type ComicBubbleRow = typeof comicBubbles.$inferSelect;
export type ComicLayoutVersionRow = typeof comicLayoutVersions.$inferSelect;
