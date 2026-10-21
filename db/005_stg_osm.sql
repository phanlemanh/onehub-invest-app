-- 005_stg_osm.sql — staging ranh giới hành chính từ OSM (Overpass)
CREATE TABLE IF NOT EXISTS stg_osm_boundaries (
  osm_id     text NOT NULL,
  snapshot_id text NOT NULL REFERENCES airbnb_snapshots(snapshot_id) ON DELETE CASCADE,
  name       text,
  payload    jsonb NOT NULL,   -- nguyên vẹn element Overpass (tags + members.geometry)
  PRIMARY KEY (osm_id, snapshot_id)
);
