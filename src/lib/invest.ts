import { pool } from "./db";

/**
 * G3 — Mô phỏng đầu tư dòng tiền (giai đoạn 3 của pipeline 4 giai đoạn,
 * docs/research/investment-pipeline-4-stages.md).
 * Defaults dẫn xuất từ dữ liệu thật của chính hệ thống:
 *   giá bán/m² + thuê LTR = vải công khai P2 (S06 Chợ Tốt, phường market)
 *   ADR + công suất = AirDNA (nguồn hiệu chuẩn, chỉ cấp số — CLAUDE.md)
 * Người dùng chỉnh mọi thông số — máy tính chạy client-side.
 */
export type InvestmentDefaults = {
  marketId: string;
  marketName: string;
  salePerm2: number | null; // VND/m² — median P2
  saleN: number;
  rentLt: number | null; // VND/tháng — median P2 rent
  rentN: number;
  adr: number | null; // VND/đêm — AirDNA
  occupancy: number | null; // % — AirDNA
  adrPeriod: string | null;
};

export async function getInvestmentDefaults(areaId: string): Promise<InvestmentDefaults | null> {
  const { rows: area } = await pool.query(
    `SELECT id, name FROM areas WHERE id = $1 AND region_type = 'market'`,
    [areaId],
  );
  if (area.length === 0) return null;

  const { rows: phuong } = await pool.query(
    `SELECT id FROM areas WHERE parent_id = $1 AND region_type = 'submarket'`,
    [areaId],
  );
  const ids = [areaId, ...phuong.map((p: { id: string }) => p.id)];

  // vải P2: bán + thuê (S06) — n của market = tổng offers dùng tính median
  // G-2: median bán theo CĂN (v_ruler_p2_area dedup repost — 'Một Căn Nhà')
  const { rows: sale } = await pool.query(
    `SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY m_per_prop) m, sum(n)::int n
     FROM (
       SELECT v.area_id, percentile_cont(0.5) WITHIN GROUP (ORDER BY o.price_perm2) AS m_per_prop, count(*)::int n
       FROM v_ruler_p2_area v
       JOIN properties pr ON pr.area_id = v.area_id AND pr.kind='sale'
       JOIN property_offers po ON po.property_id = pr.id
       JOIN sale_offers o ON o.offer_id = po.offer_id
         AND o.last_seen = (SELECT max(o2.last_seen) FROM sale_offers o2
                            JOIN property_offers po2 ON po2.offer_id = o2.offer_id
                            WHERE po2.property_id = pr.id)
       WHERE v.area_id = ANY($1::text[]) AND o.price_perm2 BETWEEN 5e6 AND 500e6
       GROUP BY v.area_id, v.n
     ) x`,
    [ids],
  );
  const { rows: rent } = await pool.query(
    `SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY price_vnd) m, count(*) n
     FROM sale_offers
     WHERE source='S06' AND kind='rent_lt' AND price_vnd BETWEEN 1e6 AND 200e6
       AND area_id = ANY($1::text[])`,
    [ids],
  );

  // AirDNA qua crosswalk area_sources (giống getAirdnaComparison)
  let adr: number | null = null;
  let occupancy: number | null = null;
  let adrPeriod: string | null = null;
  const { rows: xw } = await pool.query(
    `SELECT source_area_key FROM area_sources WHERE area_id = $1 AND source = 'S02' LIMIT 1`,
    [areaId],
  );
  if (xw[0]?.source_area_key) {
    const { rows: am } = await pool.query(
      `SELECT metric, value, period FROM airdna_market_metrics
       WHERE airdna_id = $1 AND metric IN ('adr','occupancy')
         AND period = (SELECT max(period) FROM airdna_market_metrics
                       WHERE airdna_id = $1 AND metric = 'adr')`,
      [xw[0].source_area_key],
    );
    for (const r of am) {
      if (r.metric === "adr") {
        adr = Number(r.value);
        adrPeriod = r.period;
      } else if (r.metric === "occupancy") {
        occupancy = Number(r.value);
      }
    }
  }

  return {
    marketId: areaId,
    marketName: area[0].name,
    salePerm2: sale[0]?.m ? Math.round(Number(sale[0].m)) : null,
    saleN: Number(sale[0]?.n ?? 0),
    rentLt: rent[0]?.m ? Math.round(Number(rent[0].m)) : null,
    rentN: Number(rent[0]?.n ?? 0),
    adr,
    occupancy,
    adrPeriod,
  };
}
