-- Seed data for onehub-data-api local development
-- Creates: 3 markets, 12 submarkets, 60 listings, metrics, asset stats
-- Run: psql $DATABASE_URL -f seed.sql

BEGIN;

-- Clear existing seed data
TRUNCATE listings, nights, areas, market_metrics, market_asset_stats,
  sale_offers, airdna_scores, airdna_market_metrics, airdna_listings, area_sources
  RESTART IDENTITY CASCADE;

-- Markets (3)
INSERT INTO areas (id, name, region_type, country_code, meta) VALUES
  ('vn-hanoi', 'Hà Nội', 'market', 'vn', '{"seed": true}'),
  ('vn-hcmc', 'TP. Hồ Chí Minh', 'market', 'vn', '{"seed": true}'),
  ('vn-thanh-pho-da-nang', 'Đà Nẵng', 'market', 'vn', '{"seed": true}');

-- Submarkets (4 per market = 12)
INSERT INTO areas (id, parent_id, name, region_type, country_code, meta) VALUES
  ('vn-hanoi-hoan-kiem', 'vn-hanoi', 'Hoàn Kiếm', 'submarket', 'vn', '{"seed": true}'),
  ('vn-hanoi-ba-dinh', 'vn-hanoi', 'Ba Đình', 'submarket', 'vn', '{"seed": true}'),
  ('vn-hanoi-cau-giay', 'vn-hanoi', 'Cầu Giấy', 'submarket', 'vn', '{"seed": true}'),
  ('vn-hanoi-dong-da', 'vn-hanoi', 'Đống Đa', 'submarket', 'vn', '{"seed": true}'),
  ('vn-hcmc-quan-1', 'vn-hcmc', 'Quận 1', 'submarket', 'vn', '{"seed": true}'),
  ('vn-hcmc-quan-3', 'vn-hcmc', 'Quận 3', 'submarket', 'vn', '{"seed": true}'),
  ('vn-hcmc-phu-nhuan', 'vn-hcmc', 'Phú Nhuận', 'submarket', 'vn', '{"seed": true}'),
  ('vn-hcmc-binh-thanh', 'vn-hcmc', 'Bình Thạnh', 'submarket', 'vn', '{"seed": true}'),
  ('vn-dn-hai-chau', 'vn-thanh-pho-da-nang', 'Hải Châu', 'submarket', 'vn', '{"seed": true}'),
  ('vn-dn-son-tra', 'vn-thanh-pho-da-nang', 'Sơn Trà', 'submarket', 'vn', '{"seed": true}'),
  ('vn-dn-ngu-hanh-son', 'vn-thanh-pho-da-nang', 'Ngũ Hành Sơn', 'submarket', 'vn', '{"seed": true}'),
  ('vn-dn-lien-chieu', 'vn-thanh-pho-da-nang', 'Liên Chiểu', 'submarket', 'vn', '{"seed": true}');

-- Market Scores
INSERT INTO airdna_scores (airdna_id, total, seasonality, revenue_growth, regulation, rental_demand, captured_at) VALUES
  ('seed-hn', 89, 82, 74, 71, 91, now()),
  ('seed-hcmc', 94, 97, 76, 67, 59, now()),
  ('seed-dn', 76, 88, 62, 78, 73, now());

-- Crosswalk
INSERT INTO area_sources (area_id, source, source_area_key, meta) VALUES
  ('vn-hanoi', 'S02', 'seed-hn', '{"seed": true}'),
  ('vn-hcmc', 'S02', 'seed-hcmc', '{"seed": true}'),
  ('vn-thanh-pho-da-nang', 'S02', 'seed-dn', '{"seed": true}');

-- Market metrics (12 months ADR, occupancy, revenue)
INSERT INTO airdna_market_metrics (airdna_id, metric, period, value)
SELECT
  m.airdna_id,
  metric,
  (date_trunc('month', current_date) - (n || ' months')::interval)::date::text,
  CASE metric
    WHEN 'adr' THEN base_adr * (1 + (random() - 0.5) * 0.15)
    WHEN 'occupancy' THEN LEAST(95, GREATEST(35, base_occ + (random() - 0.5) * 15))
    WHEN 'revenue' THEN base_rev * (1 + (random() - 0.5) * 0.2)
    WHEN 'revpar' THEN base_adr * base_occ / 100 * (1 + (random() - 0.5) * 0.15)
  END
FROM airdna_scores m
CROSS JOIN generate_series(0, 11) AS n
CROSS JOIN (VALUES ('adr'), ('occupancy'), ('revenue'), ('revpar')) AS t(metric)
CROSS JOIN LATERAL (
  SELECT
    CASE m.airdna_id
      WHEN 'seed-hn' THEN 950000
      WHEN 'seed-hcmc' THEN 1250000
      ELSE 1450000
    END AS base_adr,
    CASE m.airdna_id
      WHEN 'seed-hn' THEN 58
      WHEN 'seed-hcmc' THEN 62
      ELSE 55
    END AS base_occ,
    CASE m.airdna_id
      WHEN 'seed-hn' THEN 14000000
      WHEN 'seed-hcmc' THEN 22000000
      ELSE 18000000
    END AS base_rev
) b;

-- Listings (60 total, ~20 per market, distributed across submarkets)
INSERT INTO listings (id, area_id, name, room_type, bedrooms, accommodates,
  price_listed, latitude, longitude, photo_urls, review_count, last_seen)
SELECT
  'seed_' || market_code || '_' || LPAD(n::text, 3, '0'),
  area_id,
  'Listing ' || area_name || ' #' || n,
  CASE WHEN n % 3 = 0 THEN 'Entire home' ELSE 'Private room' END,
  CASE WHEN n % 4 = 0 THEN 3 WHEN n % 3 = 0 THEN 2 ELSE 1 END,
  CASE WHEN n % 4 = 0 THEN 6 WHEN n % 3 = 0 THEN 4 ELSE 2 END,
  (800000 + (n * 137) % 4000000)::bigint,
  CASE market_code WHEN 'hn' THEN 21.0 + (n % 10) * 0.02 WHEN 'hcmc' THEN 10.75 + (n % 10) * 0.02 ELSE 16.05 + (n % 10) * 0.02 END,
  CASE market_code WHEN 'hn' THEN 105.78 + (n % 12) * 0.02 WHEN 'hcmc' THEN 106.65 + (n % 12) * 0.02 ELSE 108.2 + (n % 12) * 0.02 END,
  CASE WHEN n % 5 = 0 THEN NULL
    ELSE jsonb_build_array(
      'https://a0.muscache.com/im/pictures/hosting/Hosting-demo/hosting-' || n || '/photo-1.jpeg',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-demo/hosting-' || n || '/photo-2.jpeg',
      'https://a0.muscache.com/im/pictures/hosting/Hosting-demo/hosting-' || n || '/photo-3.jpeg'
    )
  END,
  (n * 7) % 300,
  now() - (n % 7 || ' days')::interval
FROM (
  SELECT 'hn' AS market_code, 'vn-hanoi' AS market_id, area_id, name AS area_name,
    21.02 AS base_lat, 105.80 AS base_lng
  FROM areas WHERE parent_id = 'vn-hanoi'
  UNION ALL
  SELECT 'hcmc', 'vn-hcmc', area_id, name, 10.78, 106.68
  FROM areas WHERE parent_id = 'vn-hcmc'
  UNION ALL
  SELECT 'dn', 'vn-thanh-pho-da-nang', area_id, name, 16.06, 108.22
  FROM areas WHERE parent_id = 'vn-thanh-pho-da-nang'
) sub
CROSS JOIN generate_series(1, 5) AS n;

-- Nights (30 days per listing)
INSERT INTO nights (listing_id, night, available, price)
SELECT l.id,
  current_date + (n || ' days')::interval,
  (l.id_hash % 3 != 0), -- ~33% booked
  l.price_listed * (0.8 + (l.id_hash % 5) * 0.1)
FROM (
  SELECT id, price_listed,
    ('x' || substr(md5(id), 1, 8))::bit(32)::int AS id_hash
  FROM listings
) l
CROSS JOIN generate_series(0, 29) AS n;

-- Asset stats (per submarket)
INSERT INTO market_asset_stats (area_id, kind, n_offers, median_price, p25_price, p75_price, median_perm2, median_rent)
SELECT area_id, 'sale',
  20 + (substr(md5(area_id), 1, 2)::bit(8)::int % 30),
  3500000000 + (substr(md5(area_id), 1, 4)::bit(16)::int % 5000000000),
  2500000000 + (substr(md5(area_id), 2, 4)::bit(16)::int % 3000000000),
  5000000000 + (substr(md5(area_id), 3, 4)::bit(16)::int % 7000000000),
  45000000 + (substr(md5(area_id), 1, 3)::bit(12)::int % 40000000),
  12000000 + (substr(md5(area_id), 2, 3)::bit(12)::int % 15000000)
FROM areas WHERE region_type = 'submarket';

-- Sale offers (20 for deals demo)
INSERT INTO sale_offers (offer_id, area_id, kind, price_vnd, area_m2, price_perm2,
  bedrooms, confidence, first_seen, last_seen, n_reposts, post_ids, source)
SELECT
  'seed_offer_' || LPAD(n::text, 3, '0'),
  (SELECT id FROM areas WHERE region_type = 'submarket' ORDER BY md5(id) LIMIT 1 OFFSET (n % 12)),
  'sale',
  -- Some below median (deals), some above
  CASE WHEN n % 3 = 0 THEN 2500000000 + (n * 137) % 1000000000
       ELSE 4000000000 + (n * 173) % 3000000000 END,
  60 + (n * 7) % 60,
  CASE WHEN n % 3 = 0 THEN 30000000 + (n * 11) % 10000000
       ELSE 55000000 + (n * 13) % 20000000 END,
  CASE WHEN n % 3 = 0 THEN 2 ELSE 3 END,
  CASE WHEN n % 2 = 0 THEN 'high' ELSE 'medium' END,
  now() - (n % 10 || ' days')::interval,
  now() - (n % 5 || ' days')::interval,
  1,
  ARRAY['seed_post_' || n],
  'S03'
FROM generate_series(1, 20) AS n;

-- Calibration listings (for coverage demo)
INSERT INTO airdna_listings (id, airdna_market_id, combined_market_id, bedrooms,
  revenue_ltm, occupancy, adr, latitude, longitude, photo_urls, captured_at, first_seen)
SELECT
  'abnb_seed_' || LPAD(n::text, 4, '0'),
  market_key,
  NULL,
  1 + (n % 4),
  500000000 + (n * 137) % 2000000000,
  0.4 + (n % 5) * 0.08,
  800000 + (n * 173) % 2000000,
  16.0 + (n % 10) * 0.05,
  108.0 + (n % 10) * 0.05,
  jsonb_build_array('https://a0.muscache.com/im/pictures/hosting/Hosting-cal/cal-' || n || '/photo-1.jpeg'),
  now(),
  now()
FROM generate_series(1, 200) AS n
CROSS JOIN (VALUES ('seed-hn'), ('seed-hcmc'), ('seed-dn')) AS t(market_key);

COMMIT;
