import type { Metadata } from "next";

import { AirdnaMarketsTable, CalibrationTable, TruthfulCoverageTable } from "@/components/ops/quality-tables";
import { getRulerHealth } from "@/lib/ops-queries";
import { pool } from "@/lib/db";
import { getAirdnaComparison, getAirdnaMarkets, getTruthfulCoverage } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chất lượng dữ liệu" };

/**
 * /ops/quality — đối chiếu số tự thu với AirDNA. AirDNA chỉ là nguồn hiệu
 * chuẩn (CLAUDE.md, IA rủi ro R1): số của họ CHỈ hiện ở Ops, không ở Invest.
 */
export default async function QualityPage() {
  const ruler = await getRulerHealth();
  const { rows: dq } = await pool.query(
    `SELECT check_name, entity, status, detail, checked_at::text FROM dq_check_results
     WHERE checked_at > now() - interval '7 days' ORDER BY checked_at DESC LIMIT 20`,
  );
  const { rows: markets } = await pool.query<{ id: string; name: string }>(
    `SELECT id, name FROM areas WHERE region_type = 'market' ORDER BY name`,
  );
  const [comparisons, airdnaMarkets, truthful] = await Promise.all([
    Promise.all(
      markets.map(async (m) => ({ market: m, data: await getAirdnaComparison(m.id) })),
    ),
    getAirdnaMarkets(),
    getTruthfulCoverage(),
  ]);
  const calibrated = comparisons.filter((c) => c.data !== null);

  return (
    <div className="flex flex-col gap-6">
      {/* G-1 Lô 2: kết quả DQ checks gần nhất (enum-vocab + các check khác) */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">DQ checks (7 ngày)</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b bg-muted/30 text-left">
                <th className="px-3 py-2 font-medium">Check</th>
                <th className="px-2 py-2 font-medium">Đối tượng</th>
                <th className="px-2 py-2 font-medium">Kết quả</th>
                <th className="px-3 py-2 font-medium">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {dq.map((r: { check_name: string; entity: string; status: string; detail: string | null; checked_at: string }, i: number) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-1.5 font-mono">{r.check_name}</td>
                  <td className="text-muted-foreground px-2 py-1.5">{r.entity}</td>
                  <td className="px-2 py-1.5">
                    <span className={r.status === 'pass' ? 'text-emerald-600' : r.status === 'warn' ? 'text-amber-600' : 'text-red-600'}>
                      {r.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-3 py-1.5">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* H3-P3: chất lượng thước P2 + phân bố tier (kiến trúc 3 tầng giá) */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Thước giá &amp; kiến trúc 3 tầng</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-[11px]">Phường có thước P2 (n≥5)</p>
            <p className="text-lg font-semibold tabular-nums">
              {ruler.phuongWithRuler}
              <span className="text-muted-foreground text-xs font-normal">/{ruler.totalPhuong}</span>
            </p>
          </div>
          {ruler.offersByTier.map((t) => (
            <div key={t.tier} className="rounded-lg border p-3">
              <p className="text-muted-foreground text-[11px]">Offers tầng {t.tier}</p>
              <p className="text-lg font-semibold tabular-nums">{t.offers}</p>
            </div>
          ))}
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-[11px]">Người bán (sellers)</p>
            <p className="text-lg font-semibold tabular-nums">{ruler.sellers}</p>
            <p className="text-muted-foreground text-[10px]">{ruler.gapOffers} offers có bait_gap</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-medium">Chất lượng dữ liệu</h1>
        <p className="text-muted-foreground text-xs">
          Đối chiếu số tự thu với AirDNA Market Research. Nội bộ — không hiển thị cho
          nhà đầu tư.
        </p>
      </div>
      <TruthfulCoverageTable rows={truthful} />
      {calibrated.map(({ market, data }) => (
        <CalibrationTable key={market.id} marketName={market.name} data={data!} />
      ))}
      <AirdnaMarketsTable rows={airdnaMarkets} />
    </div>
  );
}
