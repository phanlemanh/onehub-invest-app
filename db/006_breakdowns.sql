-- 006_breakdowns.sql — bảng cache breakdowns precompute (400_breakdowns.sql đổ vào)
CREATE TABLE IF NOT EXISTS area_breakdowns (
  area_id text NOT NULL,
  kind    text NOT NULL,        -- bedrooms | roomTypes | topListings
  label   text NOT NULL,        -- bucket / room-type / 'listing:<id>'
  payload jsonb NOT NULL,
  PRIMARY KEY (area_id, kind, label)
);
CREATE INDEX IF NOT EXISTS area_breakdowns_area_idx ON area_breakdowns(area_id);
