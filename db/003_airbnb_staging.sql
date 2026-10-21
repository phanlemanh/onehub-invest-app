-- 003_airbnb_staging.sql — staging tiêu thụ snapshot từ one-invest-collector
-- (DATA-CONTRACT schemaVersion 1; payload giữ nguyên vẹn, mọi chuẩn hoá ở tầng transform)
CREATE TABLE IF NOT EXISTS airbnb_snapshots (
  snapshot_id  text PRIMARY KEY,          -- "hanoi__airbnb-listing__20261017T155743"
  city         text NOT NULL,
  source       text NOT NULL,             -- airbnb-discovery | airbnb-listing | ...
  collected_at timestamptz,
  manifest     jsonb NOT NULL             -- nguyên vẹn manifest (coverage telemetry)
);

-- Payload nguyên vẹn mỗi listing theo snapshot (re-parse được khi transform đổi)
CREATE TABLE IF NOT EXISTS stg_abnb_listings (
  listing_id  text NOT NULL,              -- Airbnb listing id ("1774…")
  snapshot_id text NOT NULL REFERENCES airbnb_snapshots(snapshot_id) ON DELETE CASCADE,
  fetched_at  timestamptz,
  payload     jsonb NOT NULL,             -- {url, deferredState, pdpSections, calendar}
  PRIMARY KEY (listing_id, snapshot_id)
);
CREATE INDEX IF NOT EXISTS stg_abnb_listings_snap_idx ON stg_abnb_listings(snapshot_id);

-- Calendar bung thành dòng/đêm (PdpCalendarDay) — tương đương bảng nights của M1′
CREATE TABLE IF NOT EXISTS stg_abnb_nights (
  listing_id  text NOT NULL,
  snapshot_id text NOT NULL,
  night       date NOT NULL,
  available   boolean,
  min_nights  int,
  PRIMARY KEY (listing_id, snapshot_id, night)
);
