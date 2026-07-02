CREATE TABLE IF NOT EXISTS "comic_pages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" text NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "title" varchar(120) NOT NULL,
  "page_number" integer NOT NULL,
  "status" varchar(24) DEFAULT 'active' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "comic_panels" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" text NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "page_id" uuid NOT NULL REFERENCES "comic_pages"("id") ON DELETE cascade,
  "asset_id" uuid REFERENCES "assets"("id") ON DELETE set null,
  "x" integer NOT NULL,
  "y" integer NOT NULL,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "comic_bubbles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" text NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "page_id" uuid NOT NULL REFERENCES "comic_pages"("id") ON DELETE cascade,
  "panel_id" uuid REFERENCES "comic_panels"("id") ON DELETE set null,
  "text" varchar(500) NOT NULL,
  "x" integer NOT NULL,
  "y" integer NOT NULL,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "comic_layout_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "page_id" uuid NOT NULL REFERENCES "comic_pages"("id") ON DELETE cascade,
  "action" varchar(40) NOT NULL,
  "snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "comic_pages_owner_id_project_id_idx" ON "comic_pages" ("owner_id", "project_id");
CREATE INDEX IF NOT EXISTS "comic_pages_project_id_page_number_idx" ON "comic_pages" ("project_id", "page_number");
CREATE INDEX IF NOT EXISTS "comic_pages_project_id_status_idx" ON "comic_pages" ("project_id", "status");
CREATE INDEX IF NOT EXISTS "comic_panels_asset_id_idx" ON "comic_panels" ("asset_id");
CREATE INDEX IF NOT EXISTS "comic_panels_page_id_order_index_idx" ON "comic_panels" ("page_id", "order_index");
CREATE INDEX IF NOT EXISTS "comic_panels_project_id_idx" ON "comic_panels" ("project_id");
CREATE INDEX IF NOT EXISTS "comic_bubbles_page_id_order_index_idx" ON "comic_bubbles" ("page_id", "order_index");
CREATE INDEX IF NOT EXISTS "comic_bubbles_panel_id_idx" ON "comic_bubbles" ("panel_id");
CREATE INDEX IF NOT EXISTS "comic_bubbles_project_id_idx" ON "comic_bubbles" ("project_id");
CREATE INDEX IF NOT EXISTS "comic_layout_versions_page_id_idx" ON "comic_layout_versions" ("page_id");
