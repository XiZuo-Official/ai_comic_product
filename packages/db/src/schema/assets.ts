import { relations, sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { projects } from "./projects";

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 160 }).notNull(),
    description: varchar("description", { length: 500 }),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    fileSize: integer("file_size").notNull(),
    storageProvider: varchar("storage_provider", { length: 40 }).notNull(),
    storageKey: text("storage_key").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("uploading"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerProjectIdx: index("assets_owner_id_project_id_idx").on(table.ownerId, table.projectId),
    projectStatusIdx: index("assets_project_id_status_idx").on(table.projectId, table.status),
    storageRefIdx: uniqueIndex("assets_storage_provider_storage_key_idx").on(table.storageProvider, table.storageKey)
  })
);

export const assetVariants = pgTable(
  "asset_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    variantType: varchar("variant_type", { length: 40 }).notNull(),
    storageProvider: varchar("storage_provider", { length: 40 }).notNull(),
    storageKey: text("storage_key").notNull(),
    mimeType: varchar("mime_type", { length: 120 }),
    fileSize: integer("file_size"),
    status: varchar("status", { length: 24 }).notNull().default("ready"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    assetIdx: index("asset_variants_asset_id_idx").on(table.assetId),
    storageRefIdx: uniqueIndex("asset_variants_storage_provider_storage_key_idx").on(table.storageProvider, table.storageKey)
  })
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: varchar("name", { length: 40 }).notNull(),
    normalizedName: varchar("normalized_name", { length: 40 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerNormalizedNameIdx: uniqueIndex("tags_owner_id_normalized_name_idx").on(table.ownerId, table.normalizedName)
  })
);

export const assetTags = pgTable(
  "asset_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    assetTagIdx: uniqueIndex("asset_tags_asset_id_tag_id_idx").on(table.assetId, table.tagId),
    tagIdx: index("asset_tags_tag_id_idx").on(table.tagId)
  })
);

export const assetRelations = relations(assets, ({ many, one }) => ({
  project: one(projects, {
    fields: [assets.projectId],
    references: [projects.id]
  }),
  tags: many(assetTags),
  variants: many(assetVariants)
}));

export const assetVariantRelations = relations(assetVariants, ({ one }) => ({
  asset: one(assets, {
    fields: [assetVariants.assetId],
    references: [assets.id]
  })
}));

export const tagRelations = relations(tags, ({ many }) => ({
  assets: many(assetTags)
}));

export const assetTagRelations = relations(assetTags, ({ one }) => ({
  asset: one(assets, {
    fields: [assetTags.assetId],
    references: [assets.id]
  }),
  tag: one(tags, {
    fields: [assetTags.tagId],
    references: [tags.id]
  })
}));

export type AssetRow = typeof assets.$inferSelect;
export type AssetVariantRow = typeof assetVariants.$inferSelect;
export type AssetTagRow = typeof assetTags.$inferSelect;
export type TagRow = typeof tags.$inferSelect;
