import { pool } from "./db";

/**
 * G2/P4 — Deals v2: căn giá tốt từ tín hiệu riêng P1 (Zalo S03 + Facebook
 * S05), đo bằng THƯỚC VẢI CÔNG KHAI P2 (median price/m² theo phường từ
 * Chợ Tốt S06, n≥5). Đây là hiện thực hoá "bait gap" của kiến trúc 3 tầng:
 * discount = % dưới giá rao công khai cùng phường (docs/research/
 * investment-pipeline-4-stages.md).
 *
 * PII: seller_phone là tầng A — sale_offers KHÔNG sync cloud (sync-cloud
 * chỉ chạm bảng airdna_*), nên trên Vercel không có dữ liệu này tự nhiên.
 * Broker chip join sellers registry (cũng local-only).
 */
export type DealRow = {
  offerId: string;
  source: string; // 'S03' | 'S05'
  priceVnd: number | null;
  areaM2: number | null;
  pricePerm2: number | null;
  bedrooms: number | null;
  phuong: string | null;
  areaPath: string | null;
  medianPerm2: number | null; // thước P2 cùng phường
  rulerN: number | null; // số tin S06 dựng thước
  discountPct: number | null; // % dưới thước P2
  confidence: string;
  firstSeen: string;
  lastSeen: string;
  nReposts: number;
  // liên hệ + broker (chỉ local)
  sellerName: string | null;
  sellerPhone: string | null;
  groupName: string | null;
  mediaPath: string | null;
  mediaUrl: string | null; // ảnh FB (CDN url) — khác path local Zalo
  postText: string | null;
  brokerNAds: number | null;
  brokerMedianGap: number | null;
};

export async function getDeals(limit = 30, minDiscountPct = 5): Promise<DealRow[]> {
  // Cloud KHÔNG có stg_zalo_posts (PII tầng A — leak gate cấm): query đầy đủ
  // fail 42P01 → fallback bỏ lateral contact; trang cloud tự nhiên không cột
  // liên hệ (đúng thiết kế PII — P4).
  const full = `WITH ruler AS (SELECT area_id, m, n FROM v_ruler_p2_area), base AS (
       SELECT o.offer_id, o.source, o.price_vnd, o.area_m2, o.price_perm2, o.bedrooms,
              o.confidence, o.first_seen::text, o.last_seen::text, o.n_reposts,
              o.area_id, o.post_ids, o.seller_name, o.seller_phone,
              a.name AS phuong,
              r.m AS median_perm2, r.n AS ruler_n,
              ROUND((1 - o.price_perm2::numeric / r.m::numeric) * 100, 1) AS discount_pct,
              sel.n_ads AS broker_n_ads,
              sel.flags->>'median_gap_pct' AS broker_med_gap
       FROM sale_offers o
       JOIN ruler r ON r.area_id = o.area_id
       LEFT JOIN areas a ON a.id = o.area_id
       LEFT JOIN sellers sel ON sel.phone_hash = o.seller_phone_hash
       WHERE o.price_tier = 'P1'
         AND o.kind = 'sale'
         AND o.price_perm2 IS NOT NULL AND o.price_perm2 > 0
         AND o.area_id IS NOT NULL
         AND o.last_seen >= now() - interval '45 days'
         AND ROUND((1 - o.price_perm2::numeric / r.m::numeric) * 100, 1) >= $1
         AND ROUND((1 - o.price_perm2::numeric / r.m::numeric) * 100, 1) <= 50 -- guard thước mỏng
       ORDER BY discount_pct DESC
       LIMIT $2
     )
     SELECT b.*,
       z.sender_name, z.group_name,
       COALESCE(z.media->0->>'path', NULL) AS media_path,
       COALESCE(z.media->0->>'url', NULL) AS media_url,
       left(z.text, 200) AS post_text
     FROM base b
     LEFT JOIN LATERAL (
       SELECT sender_name, group_name, media, text
       FROM stg_zalo_posts z
       WHERE z.post_id = ANY(b.post_ids)
       ORDER BY z.captured_at DESC
       LIMIT 1
     ) z ON TRUE
     ORDER BY b.discount_pct DESC`;
  const noContact = full.replace(/LEFT JOIN LATERAL \([\s\S]*?\) z ON TRUE/, "/* cloud: không có stg_zalo_posts (PII) */")
    .replace(/z\.sender_name, z\.group_name,[\s\S]*?AS post_text/, "NULL AS sender_name, NULL AS group_name, NULL AS media_path, NULL AS media_url, NULL AS post_text")
    // cột PII cũng không tồn tại trên cloud sale_offers (sync loại) → NULL hoá
    .replace("o.area_id, o.post_ids, o.seller_name, o.seller_phone,", "o.area_id, o.post_ids, NULL AS seller_name, NULL AS seller_phone,");
  let rows;
  try {
    ({ rows } = await pool.query(full, [minDiscountPct, limit]));
  } catch {
    ({ rows } = await pool.query(noContact, [minDiscountPct, limit]));
  }
  return rows.map((r) => ({
    offerId: r.offer_id,
    source: r.source,
    priceVnd: r.price_vnd === null ? null : Number(r.price_vnd),
    areaM2: r.area_m2 === null ? null : Number(r.area_m2),
    pricePerm2: r.price_perm2 === null ? null : Number(r.price_perm2),
    bedrooms: r.bedrooms,
    phuong: r.phuong,
    areaPath: r.area_id
      ? `/${r.area_id.split("-")[0]}/${r.area_id.split("-").slice(1).join("-")}`
      : null,
    medianPerm2: r.median_perm2 === null ? null : Number(r.median_perm2),
    rulerN: r.ruler_n === null ? null : Number(r.ruler_n),
    discountPct: r.discount_pct === null ? null : Number(r.discount_pct),
    confidence: r.confidence,
    firstSeen: r.first_seen,
    lastSeen: r.last_seen,
    nReposts: r.n_reposts,
    sellerName: r.seller_name ?? r.sender_name ?? null,
    sellerPhone: r.seller_phone ?? null,
    groupName: r.group_name ?? null,
    mediaPath: r.media_path ?? null,
    mediaUrl: r.media_url ?? null,
    postText: r.post_text ?? null,
    brokerNAds: r.broker_n_ads === null ? null : Number(r.broker_n_ads),
    brokerMedianGap:
      r.broker_med_gap === null || r.broker_med_gap === undefined ? null : Number(r.broker_med_gap),
  }));
}
