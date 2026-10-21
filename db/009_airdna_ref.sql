-- 009_airdna_ref.sql — AirDNA reference data (đối chiếu + nguồn hạng nhất)
CREATE TABLE IF NOT EXISTS airdna_markets (
  airdna_id     text PRIMARY KEY,      -- '47'
  name          text,
  country_code  text,
  meta          jsonb DEFAULT '{}',    -- full payload minus geospatial
  captured_at   timestamptz,
  snapshot_id   text
);

CREATE TABLE IF NOT EXISTS airdna_market_metrics (
  airdna_id  text NOT NULL REFERENCES airdna_markets(airdna_id) ON DELETE CASCADE,
  metric     text NOT NULL,           -- adr | occupancy | revenue | revpar | listing_count
  period     text NOT NULL,           -- '2025-10' etc
  value      numeric,
  PRIMARY KEY (airdna_id, metric, period)
);

CREATE TABLE IF NOT EXISTS airdna_scores (
  airdna_id  text PRIMARY KEY REFERENCES airdna_markets(airdna_id) ON DELETE CASCADE,
  total      numeric,
  seasonality numeric,
  revenue_growth numeric,
  regulation numeric,
  rental_demand numeric,
  investability numeric,
  captured_at timestamptz
);

CREATE TABLE IF NOT EXISTS airdna_submarket_metrics (
  airdna_sub_id  text NOT NULL,
  airdna_market_id text NOT NULL,
  name           text,
  meta           jsonb DEFAULT '{}',
  PRIMARY KEY (airdna_sub_id)
);
