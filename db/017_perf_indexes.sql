-- 017_perf_indexes.sql — Perf-audit /ops (2026-10-20): các cột timestamp
-- dùng cho luồng ngày (getFlowDays GROUP BY với lọc >= since) đang seq-scan;
-- bảng airdna_listings 43k+ tăng nhanh mỗi đêm rotation.
CREATE INDEX IF NOT EXISTS idx_airdna_listings_captured_at ON airdna_listings (captured_at);
CREATE INDEX IF NOT EXISTS idx_airdna_markets_captured_at ON airdna_markets (captured_at);
CREATE INDEX IF NOT EXISTS idx_listings_last_seen ON listings (last_seen);
CREATE INDEX IF NOT EXISTS idx_airbnb_snapshots_collected_at ON airbnb_snapshots (collected_at);
CREATE INDEX IF NOT EXISTS idx_stg_zalo_posts_captured_at ON stg_zalo_posts (captured_at);
CREATE INDEX IF NOT EXISTS idx_sale_offers_first_seen ON sale_offers (first_seen);
