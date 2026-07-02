ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS description varchar(500);
