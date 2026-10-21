-- 020_airdna_listing_media.sql — G1: ảnh + URL listing từ AirDNA submarket
-- listings endpoint (images[] là CDN muscache công khai — an toàn sync cloud).
ALTER TABLE airdna_listings ADD COLUMN IF NOT EXISTS photo_urls jsonb;
ALTER TABLE airdna_listings ADD COLUMN IF NOT EXISTS listing_url text;
