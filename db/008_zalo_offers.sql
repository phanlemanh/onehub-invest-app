-- 008_zalo_offers.sql — staging zalo posts + canonical offers + asset stats
CREATE TABLE IF NOT EXISTS stg_zalo_posts (
  post_id     text PRIMARY KEY,        -- 'mock-sale-0-abc123' | 'zalo-<msg_id>'
  snapshot_id text NOT NULL REFERENCES airbnb_snapshots(snapshot_id) ON DELETE CASCADE,
  group_name  text,
  author_hash text,
  posted_at   timestamptz,
  text        text NOT NULL,
  captured_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_offers (
  offer_id    text PRIMARY KEY,        -- hash của dedup_key
  area_id     text REFERENCES areas(id),
  kind        text NOT NULL,           -- 'sale' | 'rent_lt'
  price_vnd   bigint,
  area_m2     numeric,
  price_perm2 bigint,                  -- tính từ price/area hoặc parse trực tiếp
  bedrooms    int,
  phuong_raw  text,                    -- tên phường parse từ text
  confidence  text NOT NULL DEFAULT 'low', -- high (đủ giá+DT+phường) | medium | low
  first_seen  timestamptz NOT NULL,
  last_seen   timestamptz NOT NULL,
  n_reposts   int NOT NULL DEFAULT 1,
  post_ids    text[] NOT NULL DEFAULT '{}',
  source      text NOT NULL DEFAULT 'mock' -- 'mock' | 'zalo'
);
CREATE INDEX IF NOT EXISTS sale_offers_area_idx ON sale_offers(area_id, kind);

-- Median + yield theo area × kind
CREATE TABLE IF NOT EXISTS market_asset_stats (
  area_id       text NOT NULL REFERENCES areas(id),
  kind          text NOT NULL,        -- 'sale' | 'rent_lt'
  n_offers      int,
  median_price  numeric,
  p25_price     numeric,
  p75_price     numeric,
  median_perm2  numeric,              -- sale only
  median_rent   numeric,              -- rent_lt only (VND/tháng)
  updated_at    timestamptz DEFAULT now(),
  PRIMARY KEY (area_id, kind)
);
