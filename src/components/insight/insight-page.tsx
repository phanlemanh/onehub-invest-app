import { notFound } from "next/navigation";

import { getSessionUser, isSaved } from "@/lib/auth";
import { fmtInt, fmtMoney, fmtMonth, fmtPct } from "@/lib/format";
import {
  currencyFor,
  getArea,
  getAreaBreakdown,
  getKpis,
  getMarketGeoJson,
  getMetrics,
  getSiblingBenchmark,
  getSupplyHistory,
  getFinderAreas,
  getYieldRows,
  getMarketFreshness,
  type MetricRow,
} from "@/lib/queries";
import { PageHeader, type Crumb } from "@/components/page/page-header";
import { InsightActions } from "./insight-actions";
import { InsightNav, type InsightSection } from "./insight-nav";
import { MapPanel, SupplyPanel } from "./insight-panels";
import { InsightStats } from "./insight-stats";
import {
  BedroomsTable,
  ListingsTable,
  SubmarketsTable,
  YieldTable,
} from "./insight-tables";
import type { MonthRow } from "./performance/data";
import { PerformanceChart } from "./performance/chart";
import { RevenueMixChart } from "./revenue-mix/chart";

const COUNTRY_VI: Record<string, string> = { vn: "Việt Nam" };
/** Quốc gia có trang Finder riêng (link được trong breadcrumb). */
const COUNTRY_PAGES = new Set(["vn", "th"]);

/** Slug bỏ dấu cho URL submarket (khớp resolveSubmarketId + pipeline slugify). */
function slugOf(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toMonthRows(metrics: MetricRow[]): MonthRow[] {
  return metrics.map((m) => {
    const [y, mo] = m.month.split("-").map(Number);
    return {
      day: Date.UTC(y, mo - 1, 1),
      revenue: m.revenue,
      occupancy: m.occupancy ?? 0,
      adr: m.adr ?? 0,
      revpar: m.revpar ?? 0,
      bookedNights: m.bookedNights,
      availableNights: m.availableNights,
    };
  });
}

/** Một section có neo cho thanh mục lục; scroll-mt chừa chỗ thanh dính. */
function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-6">
      {children}
    </section>
  );
}

/**
 * Trang Insight thị trường / phường (IA §3.2). Mọi khối là block ReUI chuyển
 * thể; riêng bản đồ là MapLibre (ReUI không có map).
 */
export async function InsightPage({ areaId }: { areaId: string }) {
  const area = await getArea(areaId);
  if (!area) notFound();
  const isMarket = area.regionType === "market";

  const [metrics, kpis, benchmark, geo, breakdown, submarkets, user, supply, yieldRows, freshness] =
    await Promise.all([
      getMetrics(areaId),
      getKpis(areaId),
      isMarket ? Promise.resolve(null) : getSiblingBenchmark(areaId),
      getMarketGeoJson(area.parentId ?? areaId, areaId),
      getAreaBreakdown(areaId),
      isMarket ? getFinderAreas({ marketId: areaId }, { geometry: false }) : Promise.resolve([]),
      getSessionUser(),
      isMarket ? getSupplyHistory(areaId) : Promise.resolve(null),
      isMarket ? getYieldRows(areaId) : Promise.resolve([]),
      getMarketFreshness(area.parentId ?? areaId),
    ]);
  const saved = user ? await isSaved(user.id, areaId) : false;

  const currency = currencyFor(areaId);
  const [cc, ...rest] = (area.parentId ?? area.id).split("-");
  const basePath = `/${cc}/${rest.join("-")}`;
  const currentPath = isMarket ? basePath : `${basePath}/${slugOf(area.name)}`;
  const months = toMonthRows(metrics);
  const span =
    metrics.length > 0
      ? `${fmtMonth(metrics[0].month)} – ${fmtMonth(metrics[metrics.length - 1].month)}`
      : "chưa có tháng nào";
  const source = "Airbnb tự thu thập"; // ADR-0008: chỉ VN

  const crumbs: Crumb[] = [
    { label: COUNTRY_VI[cc] ?? cc.toUpperCase(), href: COUNTRY_PAGES.has(cc) ? `/${cc}` : undefined },
    ...(isMarket
      ? [{ label: area.name }]
      : [{ label: area.parentName ?? "", href: basePath }, { label: area.name }]),
  ];
  const stats = [
    `${fmtInt(kpis.listings)} listing`,
    ...(isMarket && submarkets.length > 0 ? [`${fmtInt(submarkets.length)} phường`] : []),
    `${metrics.length} tháng dữ liệu`,
  ];

  const sections: InsightSection[] = [
    { id: "tong-quan", label: "Tổng quan" },
    { id: "hieu-suat", label: "Hiệu suất" },
    { id: "co-cau", label: "Cơ cấu" },
    ...(isMarket && submarkets.length > 0 ? [{ id: "phuong", label: "Phường" }] : []),
    ...(breakdown.topListings.length > 0 ? [{ id: "listing", label: "Listing" }] : []),
    ...(supply ? [{ id: "nguon-cung", label: "Nguồn cung" }] : []),
    ...(yieldRows.length > 0 ? [{ id: "loi-suat", label: "Lợi suất" }] : []),
  ];

  // Câu tóm tắt bằng lời thường (IA L10), sinh theo luật — không LLM.
  const summary =
    kpis.listings > 0
      ? `${area.name} có ${fmtInt(kpis.listings)} listing đang hoạt động. Trong ${metrics.length} tháng tới, ${fmtPct(kpis.occupancy)} số đêm đã có khách đặt, giá trung bình ${fmtMoney(kpis.adr, currency)} một đêm.`
      : `${area.name} chưa có listing nào trong dữ liệu tự thu thập.`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={crumbs}
        title={area.name}
        stats={stats}
        description={`${source} · lịch đặt ${span}`}
        actions={
          <InsightActions
            areaId={areaId}
            currentPath={currentPath}
            saved={saved}
            signedIn={user !== null}
            mapHref={isMarket ? `${basePath}/map` : undefined}
          />
        }
      />

      <InsightNav sections={sections} />

      <div className="flex flex-col gap-10">
        <Section id="tong-quan">
          <p className="text-muted-foreground max-w-3xl text-sm">{summary}</p>
          <InsightStats
            kpis={kpis}
            currency={currency}
            months={metrics.length}
            benchmark={benchmark}
          />
          <MapPanel
            features={geo?.features ?? []}
            lat={geo?.lat ?? area.lat}
            lng={geo?.lng ?? area.lng}
            title={isMarket ? "Bản đồ phường" : `${area.name} trong ${area.parentName ?? "thị trường"}`}
            description={
              isMarket
                ? "Ranh giới phường theo OpenStreetMap"
                : "Phường đang xem được tô đậm"
            }
          />
        </Section>

        <Section id="hieu-suat">
          <PerformanceChart months={months} currency={currency} source={source} />
        </Section>

        <Section id="co-cau">
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueMixChart
              rows={breakdown.roomTypes.map((r) => ({
                label: r.label,
                revenue: r.revenue,
                listings: r.listings,
              }))}
              currency={currency}
              window={`${metrics.length} tháng tới`}
            />
            <BedroomsTable rows={breakdown.bedrooms} currency={currency} />
          </div>
        </Section>

        {isMarket && submarkets.length > 0 && (
          <Section id="phuong">
            <SubmarketsTable rows={submarkets} currency={currency} />
          </Section>
        )}

        {breakdown.topListings.length > 0 && (
          <Section id="listing">
            <ListingsTable rows={breakdown.topListings} currency={currency} allHref={`${basePath}/listings`} />
          </Section>
        )}

        {supply && (
          <Section id="nguon-cung">
            <SupplyPanel points={supply.points} cumulative={supply.cumulative} />
          </Section>
        )}

        {yieldRows.length > 0 && (
          <Section id="loi-suat">
            <YieldTable rows={yieldRows} currency={currency} basePath={basePath} />
          </Section>
        )}

        <p className="text-muted-foreground pt-2 text-[11px]">
          {freshness.lastSnapshotAt
            ? `Cập nhật dữ liệu ${freshness.lastSnapshotAt.slice(0, 10)} · ${fmtInt(freshness.listingCount)} listing`
            : "Chưa có dữ liệu thu thập cho thị trường này"}
        </p>
      </div>
    </div>
  );
}
