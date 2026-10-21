"use client"

import { StatTiles } from "@/components/page/stat-tiles"
import { tierOf, type StatTile } from "@/components/page/tiers"
import { fmtInt, fmtMoney, fmtMoneyCompact, fmtPct } from "@/lib/format"
import type { SiblingBenchmark } from "@/lib/queries"

/** Bốn KPI của trang Insight; với phường, badge = vị trí so với phường anh em. */
export function InsightStats({
  kpis,
  currency,
  months,
  benchmark,
}: {
  kpis: { revenue: number; listings: number; adr: number | null; occupancy: number | null }
  currency: string
  months: number
  benchmark: SiblingBenchmark | null
}) {
  const window = `${months} tháng tới`
  const peers = benchmark ? `${benchmark.nSiblings} phường cùng thị trường` : null
  const items: StatTile[] = [
    {
      title: "Doanh thu",
      value: fmtMoneyCompact(kpis.revenue, currency),
      footer: `Tổng giá niêm yết đêm đã đặt, ${window}`,
    },
    {
      title: "Listing hoạt động",
      value: fmtInt(kpis.listings),
      footer: "Số listing có lịch cao nhất trong một tháng",
    },
    {
      title: "Giá phòng (ADR)",
      value: fmtMoney(kpis.adr, currency),
      tier: benchmark ? tierOf(benchmark.adr.mine, benchmark.adr.p) : null,
      footer: benchmark
        ? `Trung vị ${peers}: ${fmtMoney(benchmark.adr.p[1], currency)}`
        : `Doanh thu ÷ đêm đã đặt, ${window}`,
    },
    {
      title: "Công suất",
      value: fmtPct(kpis.occupancy),
      tier: benchmark ? tierOf(benchmark.occ.mine, benchmark.occ.p) : null,
      footer: benchmark
        ? `Trung vị ${peers}: ${fmtPct(benchmark.occ.p[1])}`
        : `Đêm đã đặt ÷ (đã đặt + còn trống), ${window}`,
    },
  ]
  return <StatTiles items={items} />
}
