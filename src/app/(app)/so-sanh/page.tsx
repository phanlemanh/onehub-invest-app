export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { AreaComparison } from "@/components/compare/comparison";
import { COMPARE_MAX, type CompareArea, type CompareGroup } from "@/components/compare/compare-types";
import { fmtInt, fmtMoney, fmtMoneyCompact, fmtPct } from "@/lib/format";
import { currencyFor, getFinderAreas, getSearchIndex, getYieldRows, type YieldRow } from "@/lib/queries";

export const metadata: Metadata = { title: "So sánh khu vực" };

const GROUPS: CompareGroup[] = [
  {
    id: "performance",
    label: "Hiệu suất",
    rows: [
      { id: "revpar", label: "RevPAR", hint: "Doanh thu ÷ đêm khả dụng — gộp giá và công suất.", better: "high" },
      { id: "occupancy", label: "Công suất", hint: "Đêm đã đặt ÷ (đã đặt + còn trống).", better: "high" },
      { id: "adr", label: "Giá phòng (ADR)", hint: "Doanh thu ÷ đêm đã đặt.", better: null },
      { id: "revenue", label: "Doanh thu", hint: "Tổng giá niêm yết đêm đã đặt, cả khu vực.", better: "high" },
      { id: "listings", label: "Listing", hint: "Số listing có lịch cao nhất trong một tháng.", better: null },
    ],
  },
  {
    id: "yield",
    label: "Lợi suất (căn 60 m²)",
    badge: "Mô phỏng",
    rows: [
      { id: "perm2", label: "Giá bán / m²", better: "low" },
      { id: "rentLt", label: "Thuê dài hạn / tháng", better: null },
      { id: "yieldStr", label: "Yield ngắn hạn", hint: "Trước chi phí, theo một căn.", better: "high" },
      { id: "yieldLt", label: "Yield dài hạn", hint: "Trước thuế.", better: "high" },
    ],
  },
];

/** So sánh tối đa 4 khu vực (IA §3.2) — comparison-1 chuyển thể, số cùng nguồn Finder. */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ areas?: string }>;
}) {
  const { areas: raw } = await searchParams;
  const ids = [...new Set((raw ?? "").split(",").map((s) => s.trim()).filter(Boolean))].slice(0, COMPARE_MAX);
  const [rows, entries] = await Promise.all([
    getFinderAreas({ ids }, { geometry: false }),
    getSearchIndex(),
  ]);
  // Lợi suất theo phường của các thị trường liên quan.
  const marketIds = [...new Set(rows.map((r) => r.id.split("-").slice(0, 2).join("-")))];
  const yieldById = new Map<string, YieldRow>();
  for (const m of marketIds) for (const y of await getYieldRows(m)) yieldById.set(y.areaId, y);

  const byId = new Map(rows.map((r) => [r.id, r]));
  const areas: CompareArea[] = ids.flatMap((id) => {
    const r = byId.get(id);
    if (!r) return [];
    const currency = currencyFor(id);
    const y = yieldById.get(id);
    const money = (v: number | null) => (v ? { text: fmtMoney(v, currency), raw: v } : null);
    const compact = (v: number | null) => (v ? { text: fmtMoneyCompact(v, currency), raw: v } : null);
    const pct = (v: number | null) => (v !== null ? { text: fmtPct(v), raw: v } : null);
    return [
      {
        id,
        name: r.name,
        parentName: r.parentName,
        href: r.href,
        headline: r.revpar ? fmtMoney(r.revpar, currency) : "—",
        values: {
          revpar: money(r.revpar),
          occupancy: pct(r.occupancy),
          adr: money(r.adr),
          revenue: compact(r.revenue),
          listings: { text: fmtInt(r.listings), raw: r.listings },
          perm2: compact(y?.medianPerm2 ?? null),
          rentLt: compact(y?.medianRentLt ?? null),
          yieldStr: pct(y?.yieldStr ?? null),
          yieldLt: pct(y?.yieldLt ?? null),
        },
      },
    ];
  });
  const hasYield = areas.some((a) => a.values.yieldLt || a.values.yieldStr);

  return (
    <AreaComparison
      areas={areas}
      groups={hasYield ? GROUPS : GROUPS.filter((g) => g.id !== "yield")}
      entries={entries}
    />
  );
}
