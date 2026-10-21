export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { CompsTable } from "@/components/listing/listing-tables";
import { PageHeader } from "@/components/page/page-header";
import { StatTiles } from "@/components/page/stat-tiles";
import type { StatTile } from "@/components/page/tiers";
import { Badge } from "@/components/reui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { PnlChart } from "@/components/yield/pnl/chart";
import { YieldConfidence } from "@/components/yield/yield-confidence";
import { YieldForm } from "@/components/yield/yield-form";
import { fmtInt, fmtMoney, fmtMoneyCompact, fmtPct } from "@/lib/format";
import { currencyFor, getYieldAreas, getYieldComps, getYieldMarkets } from "@/lib/queries";
import { COST_DEFAULTS, estimateYield, monthlyPnl, type YieldInputs } from "@/lib/yield";

export const metadata: Metadata = { title: "Ước tính lợi suất" };

type Search = Promise<Record<string, string | undefined>>;

const num = (v: string | undefined, fallback: number, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== undefined && v !== "" ? Math.min(max, Math.max(min, n)) : fallback;
};

/**
 * Ước tính lợi suất một căn (IA §3.2, "Rentalizer" VN). Báo cáo tính ở server
 * từ tham số URL → chia sẻ được. Giá bán/thuê dài hạn là dữ liệu MÔ PHỎNG (G1).
 */
export default async function YieldPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const markets = await getYieldMarkets();
  if (markets.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Chưa có dữ liệu bán/thuê</EmptyTitle>
          <EmptyDescription>Ước tính lợi suất cần giá bán và giá thuê của ít nhất một thị trường.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  const market = markets.find((m) => m.id === sp.market) ?? markets[0];
  const currency = currencyFor(market.id);
  const areas = await getYieldAreas(market.id);

  // Mặc định: phường có giá bán và nhiều listing nhất; căn 1 PN 60 m².
  const defaultArea =
    [...areas].filter((a) => a.medianPerm2).sort((a, b) => b.listings - a.listings)[0] ?? areas[0];
  const area = areas.find((a) => a.id === sp.area) ?? defaultArea;
  const sqm = num(sp.m2, 60, 15, 400);
  const inputs: YieldInputs = {
    area: area.id,
    bedrooms: num(sp.pn, 1, 0, 5),
    sqm,
    price: num(sp.price, area.medianPerm2 ? Math.round((area.medianPerm2 * sqm) / 1e7) * 1e7 : 3e9, 3e8, 2e11),
    mgmtPct: num(sp.mgmt, COST_DEFAULTS.mgmtPct, 0, 0.5),
    platformPct: num(sp.platform, COST_DEFAULTS.platformPct, 0, 0.2),
    taxPct: num(sp.tax, COST_DEFAULTS.taxPct, 0, 0.3),
    fixedMonthly: num(sp.fixed, COST_DEFAULTS.fixedMonthly, 0, 1e8),
    setupCost: num(sp.setup, COST_DEFAULTS.setupCost, 0, 2e9),
  };

  const comps = await getYieldComps(market.id, area.id, inputs.bedrooms);
  const samples = comps.rows
    .filter((r) => r.priceListed && r.occupancy90 !== null)
    .map((r) => ({ price: r.priceListed!, occupancy: r.occupancy90! }));
  const estimate = samples.length > 0 ? estimateYield(inputs, samples, comps.scope, area.rentLt) : null;

  const unitName = `${inputs.bedrooms === 0 ? "studio" : `căn ${inputs.bedrooms} PN`} ${fmtInt(sqm)} m²`;
  const tiles: StatTile[] = estimate
    ? [
        {
          title: "Doanh thu ngắn hạn / năm",
          value: fmtMoneyCompact(estimate.revenue.mid, currency),
          footer: `Khoảng ${fmtMoneyCompact(estimate.revenue.low, currency)} – ${fmtMoneyCompact(estimate.revenue.high, currency)} (p25–p75 listing so sánh)`,
        },
        {
          title: "Yield ròng ngắn hạn",
          value: fmtPct(estimate.netYield),
          tier: estimate.lt
            ? estimate.netYield >= estimate.lt.netYield
              ? { label: "Cao hơn thuê DH", variant: "success-light" }
              : { label: "Thấp hơn thuê DH", variant: "warning-light" }
            : null,
          footer: `Trước chi phí: ${fmtPct(estimate.grossYield)} · thu nhập ròng ${fmtMoneyCompact(estimate.noi, currency)}/năm`,
        },
        {
          title: "Yield ròng dài hạn",
          value: estimate.lt ? fmtPct(estimate.lt.netYield) : "—",
          tier: estimate.lt ? { label: "Mô phỏng", variant: "warning-light" } : null,
          footer: estimate.lt
            ? `Thuê ${fmtMoneyCompact(estimate.lt.rentMonthly, currency)}/tháng, đã trừ thuế 10%`
            : "Phường chưa có giá thuê dài hạn",
        },
        {
          title: "Hoàn vốn",
          value:
            estimate.paybackYears === null
              ? "Không hoàn vốn"
              : estimate.paybackYears > 50
                ? "> 50 năm"
                : `${estimate.paybackYears.toFixed(1).replace(".", ",")} năm`,
          footer: "(Giá mua + nội thất) ÷ thu nhập ròng ngắn hạn/năm",
        },
      ]
    : [];

  const summary = estimate
    ? `${unitName[0].toUpperCase()}${unitName.slice(1)} ở ${area.name}, giá ${fmtMoneyCompact(inputs.price, currency)}: cho thuê ngắn hạn ước đạt ${fmtMoneyCompact(estimate.revenue.mid, currency)} doanh thu/năm (công suất ${fmtPct(estimate.occupancy)}, giá ${fmtMoney(estimate.adr, currency)}/đêm), còn ${fmtMoneyCompact(estimate.noi, currency)} sau chi phí — yield ròng ${fmtPct(estimate.netYield)}${
        estimate.lt
          ? `, ${estimate.netYield >= estimate.lt.netYield ? "cao hơn" : "thấp hơn"} cho thuê dài hạn (${fmtPct(estimate.lt.netYield)}, mô phỏng).`
          : "."
      }`
    : null;

  const assumptions = [
    "Giá/đêm = giá niêm yết trên Airbnb (chưa trừ giảm giá, chưa gồm phí dọn dẹp)",
    "Công suất = tỉ lệ đêm không còn trống trong 90 đêm đầu của lịch",
    `Chi phí: quản lý ${fmtPct(inputs.mgmtPct, 0)}, nền tảng ${fmtPct(inputs.platformPct, 0)}, thuế ${fmtPct(inputs.taxPct, 0)} doanh thu, cố định ${fmtMoneyCompact(inputs.fixedMonthly, currency)}/tháng`,
    "Giá bán và giá thuê dài hạn của phường là dữ liệu mô phỏng — chỉ để dựng tính năng",
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={[{ label: market.name, href: `/${market.id.split("-")[0]}/${market.id.split("-").slice(1).join("-")}` }, { label: "Lợi suất" }]}
        title="Ước tính lợi suất"
        stats={[market.name, `${fmtInt(areas.length)} phường`]}
        description="Cho thuê ngắn hạn (Airbnb) so với cho thuê dài hạn — một căn cụ thể"
        actions={<Badge variant="warning-light">DỮ LIỆU MÔ PHỎNG</Badge>}
      />

      <YieldForm key={JSON.stringify(inputs)} areas={areas} initial={inputs} currency={currency} />

      {estimate ? (
        <>
          <p className="text-muted-foreground max-w-4xl text-sm">{summary}</p>
          <StatTiles items={tiles} />
          <YieldConfidence confidence={estimate.confidence} assumptions={assumptions} />
          <PnlChart
            months={monthlyPnl(estimate, inputs, new Date())}
            currency={currency}
            breakEvenMargin={estimate.breakEvenMargin}
            ltNetIncome={estimate.lt?.netIncome ?? null}
          />
          <CompsTable
            rows={comps.rows.map((r) => ({ ...r, occupancy: r.occupancy90 }))}
            currency={currency}
            description={`${fmtInt(comps.rows.length)} listing ${
              comps.scope === "area-bedrooms"
                ? `cùng ${area.name}, cùng số phòng ngủ`
                : comps.scope === "market-bedrooms"
                  ? `cùng số phòng ngủ trong ${market.name}`
                  : `trong ${market.name}`
            } · công suất tính trên 90 đêm đầu`}
          />
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Chưa đủ listing để ước tính</EmptyTitle>
            <EmptyDescription>
              Không có listing có giá trong {market.name} cho {unitName}. Thử số phòng ngủ khác.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
