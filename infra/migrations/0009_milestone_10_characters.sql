CREATE TABLE IF NOT EXISTS "characters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" text NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "name" varchar(120) NOT NULL,
  "normalized_name" varchar(120) NOT NULL,
  "description" varchar(800),
  "status" varchar(24) DEFAULT 'active' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "character_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "character_id" uuid NOT NULL REFERENCES "characters"("id") ON DELETE cascade,
  "action" varchar(40) NOT NULL,
  "snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "character_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" text NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "character_id" uuid NOT NULL REFERENCES "characters"("id") ON DELETE cascade,
  "asset_id" uuid NOT NULL REFERENCES "assets"("id") ON DELETE cascade,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "characters_owner_id_project_id_idx" ON "characters" ("owner_id", "project_id");
CREATE INDEX IF NOT EXISTS "characters_project_id_status_idx" ON "characters" ("project_id", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "characters_active_project_normalized_name_idx"
  ON "characters" ("owner_id", "project_id", "normalized_name")
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "character_versions_character_id_idx" ON "character_versions" ("character_id");
CREATE UNIQUE INDEX IF NOT EXISTS "character_assets_character_id_asset_id_idx" ON "character_assets" ("character_id", "asset_id");
CREATE INDEX IF NOT EXISTS "character_assets_owner_id_project_id_idx" ON "character_assets" ("owner_id", "project_id");
CREATE INDEX IF NOT EXISTS "character_assets_asset_id_idx" ON "character_assets" ("asset_id");
