-- 004_stg_discovery.sql — staging output của airbnb-discovery (listing-ref)
CREATE TABLE IF NOT EXISTS stg_abnb_discovery (
  listing_id   text NOT NULL,
  snapshot_id  text NOT NULL REFERENCES airbnb_snapshots(snapshot_id) ON DELETE CASCADE,
  title        text,          -- "Căn hộ tại Quận Hoàn Kiếm" → nguồn suy ra area
  href         text,
  price_label  text,          -- giá hiển thị trên card (nếu có)
  fetched_at   timestamptz,
  PRIMARY KEY (listing_id, snapshot_id)
);
