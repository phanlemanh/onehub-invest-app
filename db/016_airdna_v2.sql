-- 016_airdna_v2.sql — E2 C1: AirDNA v2 submarket timeseries + future rates + listing LTM
-- (endpoint đã RE trong docs/research/airdna-listing-api.md, survey 7-9)

-- Timeseries tháng của submarket (mirror airdna_market_metrics ở cấp market;
-- airdna_submarket_metrics hiện là bảng registry quen tên — giữ nguyên)
CREATE TABLE IF NOT EXISTS airdna_sub_monthly (
  airdna_sub_id  text NOT NULL,
  metric         text NOT NULL,           -- adr | occupancy | revenue | revpar | listing_count
  period         text NOT NULL,           -- '2025-10'
  value          numeric,
  PRIMARY KEY (airdna_sub_id, metric, period)
);

-- future/rates: 163 ngày tương lai theo ngày (forward-looking — tự thu không có)
CREATE TABLE IF NOT EXISTS airdna_future_daily (
  airdna_sub_id         text NOT NULL,
  date                  date NOT NULL,
  booked_count          integer,
  available_count       integer,
  mean_booked_rate      numeric,
  median_booked_rate    numeric,
  mean_available_rate   numeric,
  median_available_rate numeric,
  occupancy             numeric,
  revpar                numeric,
  total_revenue         numeric,
  PRIMARY KEY (airdna_sub_id, date)
);

-- Listing-level LTM từ map_listings (+ enrich từ submarket listings).
-- id = 'abnb_<airbnb_id>' — CÙNG khóa với listings.id để join thẳng.
CREATE TABLE IF NOT EXISTS airdna_listings (
  id                    text PRIMARY KEY,
  airdna_market_id      text,
  combined_market_id    text,             -- submarket id của listing
  title                 text,
  bedrooms              integer,
  bathrooms             numeric,
  rating_overall        numeric,
  rating_location       numeric,
  review_count          integer,
  revenue_ltm           numeric,          -- VND
  revenue_potential_ltm numeric,
  occupancy             numeric,          -- 0-1
  adr                   numeric,          -- VND
  price_tier            text,
  latitude              double precision,
  longitude             double precision,
  metrics               jsonb DEFAULT '{}',  -- giữ nguyên metrics raw để re-parse
  captured_at           timestamptz,
  first_seen            timestamptz DEFAULT now(),
  snapshot_id           text
);
CREATE INDEX IF NOT EXISTS airdna_listings_market_idx ON airdna_listings (airdna_market_id);
CREATE INDEX IF NOT EXISTS airdna_listings_combined_idx ON airdna_listings (combined_market_id);
