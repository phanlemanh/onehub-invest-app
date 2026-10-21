-- 018_ops_audit.sql — C4 P3 (DCA): audit log mọi thao tác ghi ops (ops:write).
-- Actor là MÃ (machine token name / user id), không bao giờ tên nguồn tầng A.
CREATE TABLE IF NOT EXISTS ops_audit (
  id bigserial PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL,            -- 'machine:cloud-sync' | 'user:<id>' | 'api:<token-name>'
  action text NOT NULL,           -- 'ops.ingest' | 'zalo.account.create' | ...
  env text NOT NULL DEFAULT 'local', -- 'local' | 'cloud'
  detail jsonb DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_ops_audit_at ON ops_audit (at DESC);
