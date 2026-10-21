-- 015_listing_media.sql — E2 B1: ảnh + review count từ raw sẵn có (re-parse,
-- không thu thập lại). Photo URLs từ CDN muscache trong pdpSections/
-- deferredState; reviewCount từ reviewCount field.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS photo_urls jsonb;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS review_count integer;
