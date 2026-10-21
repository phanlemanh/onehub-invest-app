-- 010_listing_stats.sql — thống kê theo listing tính sẵn (pipeline/sql/410_listing_stats.sql đổ vào)
-- để trang Duyệt listing / chi tiết listing không gộp ~11 triệu dòng nights mỗi lần tải.
CREATE TABLE IF NOT EXISTS listing_stats (
  listing_id  text PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  nights      int NOT NULL,          -- số đêm có trong lịch
  booked      int NOT NULL,          -- đêm đã đặt (NOT available)
  revenue     numeric NOT NULL,      -- sum(price) của đêm đã đặt, đơn vị tiền của market
  occupancy   numeric,               -- booked / nights
  first_night date,
  last_night  date,
  computed_at timestamptz NOT NULL DEFAULT now()
);
