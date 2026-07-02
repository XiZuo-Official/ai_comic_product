CREATE TABLE IF NOT EXISTS "export_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" text NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "status" varchar(24) DEFAULT 'queued' NOT NULL,
  "format" varchar(24) DEFAULT 'html' NOT NULL,
  "settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "source_snapshot" jsonb,
  "error_message" text,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "export_artifacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "export_job_id" uuid NOT NULL REFERENCES "export_jobs"("id") ON DELETE cascade,
  "owner_id" text NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "storage_provider" varchar(40) NOT NULL,
  "storage_key" text NOT NULL,
  "file_name" varchar(240) NOT NULL,
  "mime_type" varchar(120) NOT NULL,
  "file_size" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "export_jobs_owner_id_project_id_idx" ON "export_jobs" ("owner_id", "project_id");
CREATE INDEX IF NOT EXISTS "export_jobs_project_id_status_idx" ON "export_jobs" ("project_id", "status");
CREATE INDEX IF NOT EXISTS "export_artifacts_export_job_id_idx" ON "export_artifacts" ("export_job_id");
CREATE INDEX IF NOT EXISTS "export_artifacts_owner_id_project_id_idx" ON "export_artifacts" ("owner_id", "project_id");
