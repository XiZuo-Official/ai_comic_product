import { relations, sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { assets } from "./assets";
import { projects } from "./projects";

export const characters = pgTable(
  "characters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    normalizedName: varchar("normalized_name", { length: 120 }).notNull(),
    description: varchar("description", { length: 800 }),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    ownerProjectIdx: index("characters_owner_id_project_id_idx").on(table.ownerId, table.projectId),
    projectStatusIdx: index("characters_project_id_status_idx").on(table.projectId, table.status),
    activeNameIdx: uniqueIndex("characters_active_project_normalized_name_idx")
      .on(table.ownerId, table.projectId, table.normalizedName)
      .where(sql`deleted_at is null`)
  })
);

export const characterVersions = pgTable(
  "character_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    characterId: uuid("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 40 }).notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    characterIdx: index("character_versions_character_id_idx").on(table.characterId)
  })
);

export const characterAssets = pgTable(
  "character_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    characterId: uuid("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    characterAssetIdx: uniqueIndex("character_assets_character_id_asset_id_idx").on(table.characterId, table.assetId),
    ownerProjectIdx: index("character_assets_owner_id_project_id_idx").on(table.ownerId, table.projectId),
    assetIdx: index("character_assets_asset_id_idx").on(table.assetId)
  })
);

export const characterRelations = relations(characters, ({ many, one }) => ({
  assets: many(characterAssets),
  project: one(projects, {
    fields: [characters.projectId],
    references: [projects.id]
  }),
  versions: many(characterVersions)
}));

export const characterVersionRelations = relations(characterVersions, ({ one }) => ({
  character: one(characters, {
    fields: [characterVersions.characterId],
    references: [characters.id]
  })
}));

export const characterAssetRelations = relations(characterAssets, ({ one }) => ({
  asset: one(assets, {
    fields: [characterAssets.assetId],
    references: [assets.id]
  }),
  character: one(characters, {
    fields: [characterAssets.characterId],
    references: [characters.id]
  }),
  project: one(projects, {
    fields: [characterAssets.projectId],
    references: [projects.id]
  })
}));

export type CharacterRow = typeof characters.$inferSelect;
export type CharacterVersionRow = typeof characterVersions.$inferSelect;
export type CharacterAssetRow = typeof characterAssets.$inferSelect;
