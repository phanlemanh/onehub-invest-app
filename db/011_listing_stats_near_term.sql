-- 011_listing_stats_near_term.sql — công suất "90 đêm đầu" tính sẵn cho truy vấn lợi suất
-- (getYieldRows / getYieldComps), để /yield, /so-sanh và trang Insight thị trường không
-- gộp ~11 triệu dòng nights mỗi lần tải. pipeline/sql/410_listing_stats.sql đổ vào.
-- "90 đêm đầu" = đêm trong [first_night, first_night + 90) của từng listing.
ALTER TABLE listing_stats
  ADD COLUMN IF NOT EXISTS nights90 int NOT NULL DEFAULT 0,  -- số đêm trong 90 đêm đầu
  ADD COLUMN IF NOT EXISTS booked90 int NOT NULL DEFAULT 0;  -- đêm đã đặt trong 90 đêm đầu
