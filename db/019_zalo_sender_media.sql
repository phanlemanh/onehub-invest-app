-- 019_zalo_sender_media.sql — G1 "căn giá tốt + liên hệ": giữ người đăng + ảnh.
-- PII tầng A: CHỈ máy local — stg_zalo_posts không nằm trong FILL sync-cloud.
ALTER TABLE stg_zalo_posts
  ADD COLUMN IF NOT EXISTS sender_name text,
  ADD COLUMN IF NOT EXISTS sender_id text,
  ADD COLUMN IF NOT EXISTS conversation_id text,
  ADD COLUMN IF NOT EXISTS media jsonb;   -- [{path, url, type}] — file copy vào snapshot media/
