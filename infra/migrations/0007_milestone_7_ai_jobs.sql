create table if not exists ai_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  job_type varchar(60) not null,
  status varchar(24) not null default 'queued',
  prompt text not null,
  prompt_template_key varchar(120) not null,
  prompt_template_version integer not null,
  input jsonb not null default '{}'::jsonb,
  result jsonb,
  error text,
  estimated_cost integer not null,
  progress integer not null default 0,
  credit_reservation_id uuid,
  idempotency_key varchar(160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_jobs_owner_id_created_at_idx on ai_jobs (owner_id, created_at);
create index if not exists ai_jobs_owner_id_status_idx on ai_jobs (owner_id, status);
create unique index if not exists ai_jobs_owner_id_idempotency_key_idx on ai_jobs (owner_id, idempotency_key);

create table if not exists ai_job_steps (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references ai_jobs(id) on delete cascade,
  step_name varchar(80) not null,
  status varchar(24) not null,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_job_steps_job_id_created_at_idx on ai_job_steps (job_id, created_at);

create table if not exists ai_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  template_key varchar(120) not null,
  version integer not null,
  purpose varchar(80) not null,
  system_prompt text not null,
  status varchar(24) not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ai_prompt_templates_key_version_idx on ai_prompt_templates (template_key, version);

create table if not exists ai_provider_calls (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references ai_jobs(id) on delete cascade,
  step_id uuid references ai_job_steps(id) on delete set null,
  provider_id varchar(80) not null,
  operation varchar(80) not null,
  status varchar(24) not null,
  request_metadata jsonb not null default '{}'::jsonb,
  response_metadata jsonb,
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists ai_provider_calls_job_id_started_at_idx on ai_provider_calls (job_id, started_at);
create index if not exists ai_provider_calls_provider_id_status_idx on ai_provider_calls (provider_id, status);
