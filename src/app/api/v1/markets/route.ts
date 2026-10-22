import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/markets — danh sách markets + Market Score (public API).
 * Query: ?country=vn&limit=50
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const country = u.searchParams.get("country") ?? "vn";
  const limit = Math.min(200, Number(u.searchParams.get("limit") ?? 50) || 50);

  const { rows } = await pool.query(
    `SELECT a.id, a.name, a.country_code,
            ms.total AS market_score,
            (SELECT count(*)::int FROM listings l
             JOIN areas sa ON sa.id = l.area_id
             WHERE coalesce(sa.parent_id, sa.id) = a.id) AS listing_count
     FROM areas a
     LEFT JOIN airdna_scores ms ON ms.airdna_id = (
       SELECT x.source_area_key FROM area_sources x
       WHERE x.area_id = a.id AND x.source = 'S02' LIMIT 1
     )
     WHERE a.region_type = 'market' AND a.country_code = $1
     ORDER BY ms.total DESC NULLS LAST, a.name
     LIMIT $2`,
    [country, limit],
  );

  return NextResponse.json({
    data: rows.map((r) => ({
      id: r.id,
      name: r.name,
      countryCode: r.country_code,
      marketScore: r.market_score === null ? null : Number(r.market_score),
      listingCount: r.listing_count,
    })),
    meta: { total: rows.length, limit },
  });
}
