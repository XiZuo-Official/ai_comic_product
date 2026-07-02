create table if not exists idea_threads (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  project_id uuid not null references projects(id) on delete cascade,
  title varchar(120) not null,
  status varchar(24) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idea_threads_owner_id_project_id_idx on idea_threads (owner_id, project_id);
create index if not exists idea_threads_owner_id_updated_at_idx on idea_threads (owner_id, updated_at);

create table if not exists idea_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references idea_threads(id) on delete cascade,
  role varchar(24) not null,
  status varchar(24) not null default 'completed',
  content text not null,
  ai_job_id uuid,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idea_messages_thread_id_created_at_idx on idea_messages (thread_id, created_at);
create index if not exists idea_messages_thread_id_role_idx on idea_messages (thread_id, role);

create table if not exists idea_context_snapshots (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references idea_threads(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  ai_job_id uuid,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idea_context_snapshots_thread_id_created_at_idx on idea_context_snapshots (thread_id, created_at);
create index if not exists idea_context_snapshots_project_id_created_at_idx on idea_context_snapshots (project_id, created_at);
