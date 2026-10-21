import type { Metadata } from "next";

import { AirdnaMarketsTable, CalibrationTable, TruthfulCoverageTable } from "@/components/ops/quality-tables";
import { pool } from "@/lib/db";
import { getAirdnaComparison, getAirdnaMarkets, getTruthfulCoverage } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chất lượng dữ liệu" };

/**
 * /ops/quality — đối chiếu số tự thu với AirDNA. AirDNA chỉ là nguồn hiệu
 * chuẩn (CLAUDE.md, IA rủi ro R1): số của họ CHỈ hiện ở Ops, không ở Invest.
 */
export default async function QualityPage() {
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
