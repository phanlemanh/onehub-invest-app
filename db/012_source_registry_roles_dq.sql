-- 012_source_registry_roles_dq.sql — C1 (ADR-0007): SPL source registry +
-- users.role (clearance law portals.md) + dq_check_results (DQO) + mã nguồn
-- ở tầng serving (S01–S04). Mapping mã↔tên thật CHỈ sống ở DB local — không
-- sync cloud, không commit ra ngoài (bảng này nằm trong pg_dump backup DR).

-- ===== SPL — Source Registry (tầng A ↔ B, secret) =====
CREATE TABLE IF NOT EXISTS source_registry (
  code       text PRIMARY KEY,          -- S01… — mã ổn định vĩnh viễn, không tái sử dụng
  real_name  text NOT NULL,             -- tầng A: tên nguồn thật (KHÔNG rời máy)
  label_vi   text NOT NULL,             -- tầng C: nhãn tiếng Việt cho UI
  status     text NOT NULL DEFAULT 'active',  -- active | retired
  since      date NOT NULL DEFAULT current_date,
  retired_at date
);

INSERT INTO source_registry (code, real_name, label_vi) VALUES
  ('S01', 'airbnb',   'Tự thu'),
  ('S02', 'airdna',   'Hiệu chuẩn'),
  ('S03', 'zalo',     'Cộng đồng'),
  ('S04', 'osm',      'Địa giới mở')
ON CONFLICT (code) DO NOTHING;

-- ===== Clearance law — users.role (portals.md) =====
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE role = 'user';  -- hệ thống 1 người: chủ sở hữu = admin

-- ===== DQO — kết quả check chất lượng (pipeline/sql/450 đổ vào) =====
CREATE TABLE IF NOT EXISTS dq_check_results (
  id         serial PRIMARY KEY,
  checked_at timestamptz NOT NULL DEFAULT now(),
  check_name text NOT NULL,     -- occupancy-domain | listing-volume | adr-drift | not-null | freshness
  entity     text NOT NULL,     -- 'hanoi' | 'hcmc' | 'market_metrics' …
  status     text NOT NULL,     -- pass | fail | skip
  detail     text
);
CREATE INDEX IF NOT EXISTS dq_check_results_checked_at_idx ON dq_check_results (checked_at DESC);

-- ===== SPL — mã B ở tầng serving =====
-- market_metrics: mọi số hiện có tính từ dữ liệu tự thu
ALTER TABLE market_metrics ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'S01';

-- Đổi giá trị cũ sang mã
UPDATE area_sources SET source = 'S02' WHERE source = 'airdna';
UPDATE sale_offers SET source = 'S03' WHERE source = 'mock';
