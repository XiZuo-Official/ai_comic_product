create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  project_id uuid not null references projects(id) on delete cascade,
  display_name varchar(160) not null,
  description varchar(500),
  mime_type varchar(120) not null,
  file_size integer not null,
  storage_provider varchar(40) not null,
  storage_key text not null,
  status varchar(24) not null default 'uploading',
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assets_owner_id_project_id_idx on assets (owner_id, project_id);
create index if not exists assets_project_id_status_idx on assets (project_id, status);
create unique index if not exists assets_storage_provider_storage_key_idx on assets (storage_provider, storage_key);

create table if not exists asset_variants (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  variant_type varchar(40) not null,
  storage_provider varchar(40) not null,
  storage_key text not null,
  mime_type varchar(120),
  file_size integer,
  status varchar(24) not null default 'ready',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists asset_variants_asset_id_idx on asset_variants (asset_id);
create unique index if not exists asset_variants_storage_provider_storage_key_idx on asset_variants (storage_provider, storage_key);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  name varchar(40) not null,
  normalized_name varchar(40) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tags_owner_id_normalized_name_idx on tags (owner_id, normalized_name);

create table if not exists asset_tags (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists asset_tags_asset_id_tag_id_idx on asset_tags (asset_id, tag_id);
create index if not exists asset_tags_tag_id_idx on asset_tags (tag_id);
