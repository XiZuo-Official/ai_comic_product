CREATE TABLE IF NOT EXISTS credit_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  status varchar(24) NOT NULL DEFAULT 'active',
  reason varchar(120),
  idempotency_key varchar(160),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS credit_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES credit_reservations(id) ON DELETE SET NULL,
  amount integer NOT NULL CHECK (amount > 0),
  reason varchar(120),
  idempotency_key varchar(160),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS credit_ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES credit_reservations(id) ON DELETE SET NULL,
  refund_id uuid REFERENCES credit_refunds(id) ON DELETE SET NULL,
  entry_type varchar(32) NOT NULL,
  amount_delta integer NOT NULL,
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  description varchar(180),
  idempotency_key varchar(160),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS credit_ledger_entries_account_id_created_at_idx
  ON credit_ledger_entries (account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS credit_reservations_account_id_status_idx
  ON credit_reservations (account_id, status);
