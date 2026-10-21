-- One Invest — schema nền tảng (M1′)
-- Hierarchy areas mirror AirDNA: country → market → submarket (→ neighborhood sau này).
-- Metrics precompute theo area × tháng (ADR-0001/0002).
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS areas (
  id          text PRIMARY KEY,          -- 'th-bangkok', 'th-bangkok-bang-kapi'
  parent_id   text REFERENCES areas(id),
  region_type text NOT NULL,             -- country | market | submarket
  name        text NOT NULL,
  country_code text NOT NULL,
  market_type text,                      -- mid_size_city | urban_metro | ... (market level)
  geom        geometry(MultiPolygon, 4326),
  geom_pt     geography(Point, 4326),
  meta        jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS listings (
  id            text PRIMARY KEY,        -- 'abnb_123456'
  area_id       text NOT NULL REFERENCES areas(id),
  name          text,
  room_type     text,
  property_type text,
  bedrooms      int,
  bathrooms     numeric,
  accommodates  int,
  price_listed  numeric,                 -- USD, giá niêm yết (≠ ADR)
  minimum_nights int,
  latitude      double precision,
  longitude     double precision,
  geom          geography(Point, 4326),
  last_seen     date NOT NULL
);
CREATE INDEX IF NOT EXISTS listings_area_idx ON listings(area_id);

-- Một đêm của một listing (từ calendar snapshot, cửa sổ 12 tháng tới)
CREATE TABLE IF NOT EXISTS nights (
  listing_id   text NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  night        date NOT NULL,
  available    boolean NOT NULL,         -- true = còn trống, false = đã đặt/owner-block (xem divergence)
  price        numeric,                  -- USD/đêm (đã quy đổi; không gồm phí vệ sinh)
  PRIMARY KEY (listing_id, night)
);
CREATE INDEX IF NOT EXISTS nights_night_idx ON nights(night);

-- Metrics precompute — mirror quan sát AirDNA: một dòng / area / tháng
CREATE TABLE IF NOT EXISTS market_metrics (
  area_id          text NOT NULL REFERENCES areas(id),
  month            date NOT NULL,        -- ngày đầu tháng
  listing_count    int,                  -- listing có ≥1 đêm đặt trong tháng
  booked_nights    int,
  available_nights int,
  revenue          numeric,              -- Σ price trên các đêm đặt
  adr              numeric,              -- revenue / booked_nights
  occupancy        numeric,              -- booked / (booked + available)
  revpar           numeric,              -- revenue / (booked + available)
  PRIMARY KEY (area_id, month)
);
