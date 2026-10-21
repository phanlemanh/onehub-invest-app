import { pool } from "./db";

export type CoverageRow = {
  code: string;
  city: string;
  lastSnapshotAt: string | null;
  ageDays: number | null;
  sloDays: number;
  status: "fresh" | "stale" | "none";
};

/** Coverage đơn giản cho public build — không source_registry. */
export async function getCoverageOverview(): Promise<CoverageRow[]> {
  const { rows } = await pool.query(
    `SELECT 'DATA' AS code, a.name AS city,
            max(l.last_seen)::text AS last,
            EXTRACT(DAY FROM now() - max(l.last_seen))::int AS age
     FROM listings l
     JOIN areas a ON a.id = l.area_id OR a.id = (SELECT parent_id FROM areas WHERE id = l.area_id)
     WHERE a.country_code = 'vn'
     GROUP BY a.name ORDER BY a.name`,
  );
  return rows.map((r) => ({
    code: "DATA",
    city: r.city,
    lastSnapshotAt: r.last,
    ageDays: r.age,
    sloDays: 7,
    status: r.age <= 7 ? "fresh" : "stale",
  }));
}
