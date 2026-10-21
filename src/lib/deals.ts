import { pool } from "./db";

/**
 * G2 — Deals: căn giá tốt nhất từ nguồn cộng đồng (Zalo).
 * "Giá tốt" = price/m² thấp hơn đáng kể median cùng phường (market_asset_stats).
 * PII người đăng nằm ở stg_zalo_posts — bảng này KHÔNG sync cloud, nên trên
 * Vercel deals tự nhiên không có cột liên hệ (an toàn theo kiến trúc).
 */
export type DealRow = {
  offerId: string;
  priceVnd: number | null;
  areaM2: number | null;
  pricePerm2: number | null;
  bedrooms: number | null;
  phuong: string | null;
  areaPath: string | null;
  medianPerm2: number | null;
  discountPct: number | null; // % dưới median phường
  confidence: string;
  firstSeen: string;
  lastSeen: string;
  nReposts: number;
  // liên hệ (chỉ local — stg không sync)
  senderName: string | null;
  groupName: string | null;
  mediaPath: string | null;
  postText: string | null;
};

export async function getDeals(limit = 30, minDiscountPct = 5): Promise<DealRow[]> {
  const { rows } = await pool.query(
    `WITH base AS (
       SELECT o.offer_id, o.price_vnd, o.area_m2, o.price_perm2, o.bedrooms,
              o.confidence, o.first_seen::text, o.last_seen::text, o.n_reposts,
              o.area_id, o.post_ids,
              a.name AS phuong,
              s.median_perm2
       FROM sale_offers o
       LEFT JOIN areas a ON a.id = o.area_id
       LEFT JOIN market_asset_stats s ON s.area_id = o.area_id AND s.kind = o.kind
       WHERE o.kind = 'sale'
         AND o.price_perm2 IS NOT NULL AND o.price_perm2 > 0
         AND o.area_id IS NOT NULL
         AND s.median_perm2 IS NOT NULL AND s.median_perm2 > 0
         AND o.last_seen >= now() - interval '45 days'
     )
     SELECT sc.*,
       z.sender_name, z.group_name, z.media->0->>'path' AS media_path,
       left(z.text, 200) AS post_text
     FROM (
       SELECT offer_id, price_vnd, area_m2, price_perm2, bedrooms, phuong, area_id,
              median_perm2,
              ROUND((1 - price_perm2::numeric / median_perm2) * 100, 1) AS discount_pct,
              confidence, first_seen, last_seen, n_reposts, post_ids
       FROM base
       WHERE ROUND((1 - price_perm2::numeric / median_perm2) * 100, 1) >= $1
         AND ROUND((1 - price_perm2::numeric / median_perm2) * 100, 1) <= 50 -- guard stats hỏng
       ORDER BY discount_pct DESC
       LIMIT $2
     ) sc
     LEFT JOIN LATERAL (
       SELECT sender_name, group_name, media, text
       FROM stg_zalo_posts z
       WHERE z.post_id = ANY(sc.post_ids)
       ORDER BY z.captured_at DESC
       LIMIT 1
     ) z ON TRUE
     ORDER BY sc.discount_pct DESC`,
    [minDiscountPct, limit],
  );
  return rows.map((r) => ({
    offerId: r.offer_id,
    priceVnd: r.price_vnd === null ? null : Number(r.price_vnd),
    areaM2: r.area_m2 === null ? null : Number(r.area_m2),
    pricePerm2: r.price_perm2 === null ? null : Number(r.price_perm2),
    bedrooms: r.bedrooms,
    phuong: r.phuong,
    areaPath: r.area_id
      ? `/${r.area_id.split("-")[0]}/${r.area_id.split("-").slice(1).join("-")}`
      : null,
    medianPerm2: r.median_perm2 === null ? null : Number(r.median_perm2),
    discountPct: r.discount_pct === null ? null : Number(r.discount_pct),
    confidence: r.confidence,
    firstSeen: r.first_seen,
    lastSeen: r.last_seen,
    nReposts: r.n_reposts,
    senderName: r.sender_name ?? null,
    groupName: r.group_name ?? null,
    mediaPath: r.media_path ?? null,
    postText: r.post_text ?? null,
  }));
}
