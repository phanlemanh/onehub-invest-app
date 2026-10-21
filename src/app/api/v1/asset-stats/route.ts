import { NextResponse } from "next/server";

import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/asset-stats — C3-wrap DCA: thống kê giá/phường cho MCP tool
 * `oneinvest_get_asset_stats`. Public (đã pseudonymize).
 * Query: ?area=<area_id> (bắt buộc) | ?market=<market_id> (tất cả phường con)
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const area = u.searchParams.get("area");
  const market = u.searchParams.get("market");

  if (!area && !market) {
    return NextResponse.json(
      { error: "cần ?area=<area_id> hoặc ?market=<market_id>" },
      { status: 400 },
    );
  }

  let query: string;
  const params: unknown[] = [];

  if (area) {
    params.push(area);
    query = `SELECT s.area_id, a.name AS area_name, a.parent_id,
                    s.kind, s.n_offers,
                    round(s.median_price::numeric)::bigint AS median_price,
                    round(s.p25_price::numeric)::bigint AS p25_price,
                    round(s.p75_price::numeric)::bigint AS p75_price,
                    round(s.median_perm2::numeric)::bigint AS median_perm2,
                    round(s.median_rent::numeric)::bigint AS median_rent
             FROM market_asset_stats s
             LEFT JOIN areas a ON a.id = s.area_id
             WHERE s.area_id = $1`;
  } else {
    params.push(market);
    query = `SELECT s.area_id, a.name AS area_name, a.parent_id,
                    s.kind, s.n_offers,
                    round(s.median_price::numeric)::bigint AS median_price,
                    round(s.p25_price::numeric)::bigint AS p25_price,
                    round(s.p75_price::numeric)::bigint AS p75_price,
                    round(s.median_perm2::numeric)::bigint AS median_perm2,
                    round(s.median_rent::numeric)::bigint AS median_rent
             FROM market_asset_stats s
             LEFT JOIN areas a ON a.id = s.area_id
             WHERE a.parent_id = $1 OR a.id = $1
             ORDER BY a.name`;
  }

  const { rows } = await pool.query(query, params);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: area ? `không có stats cho area "${area}"` : `không có stats cho market "${market}"` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    area: area ?? market,
    stats: rows.map((r) => ({
      areaId: r.area_id,
      areaName: r.area_name,
      kind: r.kind,
      nOffers: r.n_offers,
      medianPrice: r.median_price === null ? null : Number(r.median_price),
      p25Price: r.p25_price === null ? null : Number(r.p25_price),
      p75Price: r.p75_price === null ? null : Number(r.p75_price),
      medianPerm2: r.median_perm2 === null ? null : Number(r.median_perm2),
      medianRent: r.median_rent === null ? null : Number(r.median_rent),
    })),
  });
}
