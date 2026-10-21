-- 002_auth.sql — M5′: auth + saved markets + plan (paywall demo)
-- Paywall mirror cơ chế AirDNA đã quan sát: field-level redaction (free) +
-- endpoint-level 401 (pro-only sections). `plan` là demo switch, không phải billing thật.
CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY,             -- 'usr_' || random hex
  email         text UNIQUE NOT NULL,
  password_hash text NOT NULL,                -- scrypt: '<salt-hex>$<key-hex>'
  plan          text NOT NULL DEFAULT 'free', -- free | pro
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token      text PRIMARY KEY,                -- 32-byte random hex
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS saved_markets (
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_id    text NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, area_id)
);
