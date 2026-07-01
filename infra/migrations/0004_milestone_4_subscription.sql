CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(80) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  description varchar(240),
  monthly_price_cents integer NOT NULL DEFAULT 0 CHECK (monthly_price_cents >= 0),
  currency varchar(3) NOT NULL DEFAULT 'USD',
  credit_grant_amount integer NOT NULL CHECK (credit_grant_amount > 0),
  billing_period varchar(24) NOT NULL DEFAULT 'monthly',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL UNIQUE,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status varchar(32) NOT NULL,
  provider varchar(60) NOT NULL,
  provider_subscription_id varchar(180),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  last_payment_failure_reason varchar(180),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_subscription_id_idx
  ON subscriptions (provider, provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_owner_id_status_idx
  ON subscriptions (owner_id, status);

CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider varchar(60) NOT NULL,
  provider_event_id varchar(180) NOT NULL,
  event_type varchar(80) NOT NULL,
  owner_id text NOT NULL,
  plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  credit_ledger_entry_id uuid,
  payload text NOT NULL DEFAULT '{}',
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);

CREATE INDEX IF NOT EXISTS subscription_events_owner_id_created_at_idx
  ON subscription_events (owner_id, created_at DESC);

INSERT INTO plans (
  code,
  name,
  description,
  monthly_price_cents,
  currency,
  credit_grant_amount,
  billing_period,
  is_active
)
VALUES (
  'mvp_creator',
  'MVP Creator',
  'Placeholder MVP subscription plan until a payment provider is approved.',
  0,
  'USD',
  120,
  'monthly',
  true
)
ON CONFLICT (code) DO NOTHING;
