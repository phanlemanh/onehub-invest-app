import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/deals — căn giá tốt (public API, P4: thước P2).
 * Query: ?market=<id>&limit=30&min_discount=5
 * Thước = median price/m² phường từ vải Chợ Tốt (S06, n≥5); deals là tin
 * nội bộ P1 (S03/S05). Lưu ý: contact info (PII tầng A) KHÔNG trả về.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const market = u.searchParams.get("market");
  const limit = Math.min(100, Number(u.searchParams.get("limit") ?? 30) || 30);
  const minDiscount = Math.max(0, Math.min(50, Number(u.searchParams.get("min_discount") ?? 5) || 5));

  const params: unknown[] = [];
  let marketWhere = "";
  if (market) {
    params.push(market);
    marketWhere = ` AND (a.id = $${params.length} OR a.parent_id = $${params.length})`;
  }
  params.push(limit, minDiscount);

  const { rows } = await pool.query(
    `WITH ruler AS (SELECT area_id, m, n FROM v_ruler_p2_area)
     SELECT o.offer_id, o.source, o.price_vnd, o.area_m2, o.price_perm2, o.bedrooms,
            o.confidence, o.last_seen::text,
            o.area_id, a.name AS phuong,
            r.m AS median_perm2, r.n AS ruler_n,
            ROUND((1 - o.price_perm2::numeric / r.m::numeric) * 100, 1) AS discount_pct
     FROM sale_offers o
     JOIN ruler r ON r.area_id = o.area_id
     LEFT JOIN areas a ON a.id = o.area_id
     WHERE o.price_tier = 'P1' AND o.kind = 'sale'
       AND o.price_perm2 > 0 AND o.area_id IS NOT NULL
       AND o.last_seen >= now() - interval '45 days'
       AND ROUND((1 - o.price_perm2::numeric / r.m::numeric) * 100, 1) >= $${params.length}
       AND ROUND((1 - o.price_perm2::numeric / r.m::numeric) * 100, 1) <= 50
       ${marketWhere}
     ORDER BY discount_pct DESC
     LIMIT $${params.length - 1}`,
    params,
  );

  return NextResponse.json({
    data: rows.map((r) => ({
      offerId: r.offer_id,
      source: r.source,
      priceVnd: r.price_vnd === null ? null : Number(r.price_vnd),
      areaM2: r.area_m2 === null ? null : Number(r.area_m2),
      pricePerm2: r.price_perm2 === null ? null : Number(r.price_perm2),
      bedrooms: r.bedrooms,
      phuong: r.phuong,
      medianPerm2: r.median_perm2 === null ? null : Number(r.median_perm2),
      rulerN: r.ruler_n === null ? null : Number(r.ruler_n),
      discountPct: r.discount_pct === null ? null : Number(r.discount_pct),
      confidence: r.confidence,
      lastSeen: r.last_seen,
    })),
    meta: { total: rows.length, minDiscount, ruler: "S06 phường n>=5" },
  });
}
