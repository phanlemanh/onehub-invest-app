-- 014_zalo_agent_source.sql — C2: đăng ký source_id 'zalo-agent' vào S03
-- (Agent ingest bridge — ADR-0006 sửa đổi). Coverage API + SLO nhận diện được.
UPDATE source_registry
SET source_ids = array_append(source_ids, 'zalo-agent')
WHERE code = 'S03' AND NOT ('zalo-agent' = ANY (source_ids));
