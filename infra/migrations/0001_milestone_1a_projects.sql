create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  name varchar(120) not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_id_idx on projects (owner_id);
create index if not exists projects_active_owner_id_idx on projects (owner_id, deleted_at);

create table if not exists project_settings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  action varchar(40) not null,
  snapshot text not null default '{}'::text,
  created_at timestamptz not null default now()
);

create index if not exists project_versions_project_id_idx on project_versions (project_id);
