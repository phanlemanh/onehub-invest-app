export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinderView, type FinderLevel } from "@/components/finder/finder-view";
import { FINDER_METRICS, type FinderMetric } from "@/components/finder/bins";
import { Badge } from "@/components/reui/badge";
import { fmtInt } from "@/lib/format";
import { currencyFor, getCountryMarkets, getFinderAreas } from "@/lib/queries";

const COUNTRY_VI: Record<string, string> = { vn: "Việt Nam" };

type Params = Promise<{ country: string }>;
type Search = Promise<{ level?: string; market?: string; metric?: string; view?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { country } = await params;
  return { title: `Thị trường ${COUNTRY_VI[country] ?? country.toUpperCase()}` };
}

/**
 * Market Finder (IA §3.2) — chỉ số TỰ THU. Số AirDNA đã rời trang này sang
 * /ops/quality (IA rủi ro R1).
 */
export default async function FinderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { country } = await params;
  const sp = await searchParams;
  const marketsAll = await getCountryMarkets(country);
  if (marketsAll.length === 0) notFound();

  const countryRows = await getFinderAreas({ country }, { geometry: sp.level === "market" });
  if (countryRows.length === 0) notFound();
  // Thị trường nhiều listing nhất đứng đầu — làm mặc định cho cấp phường.
  const markets = [...countryRows]
    .sort((a, b) => b.listings - a.listings)
    .map((r) => ({ slug: r.id.slice(country.length + 1), name: r.name }));

  // Mặc định cấp PHƯỜNG: mới có vài tỉnh tự thu, so sánh có nghĩa nằm ở phường.
  const level: FinderLevel = sp.level === "market" ? "market" : "submarket";
  const market = markets.some((m) => m.slug === sp.market) ? sp.market! : markets[0].slug;
  const metric: FinderMetric = FINDER_METRICS.some((m) => m.value === sp.metric)
    ? (sp.metric as FinderMetric)
    : "revpar";

  const rows =
    level === "market"
      ? countryRows
      : await getFinderAreas({ marketId: `${country}-${market}` });
  const listings = countryRows.reduce((sum, r) => sum + r.listings, 0);
  const notCovered = marketsAll.length - countryRows.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header theo app-shell-30: tiêu đề + badge đếm + mô tả. */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <h1 className="text-xl font-medium">
            Thị trường {COUNTRY_VI[country] ?? country.toUpperCase()}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              `${fmtInt(countryRows.length)} thị trường tự thu`,
              `${fmtInt(listings)} listing`,
            ].map((text) => (
              <Badge key={text} variant="outline" size="sm" radius="full" className="dark:bg-background px-1.5">
                {text}
              </Badge>
            ))}
            {notCovered > 0 && (
              <Badge variant="info-light" size="sm" radius="full" className="px-1.5">
                {fmtInt(notCovered)} thị trường đang thu thập
              </Badge>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Xếp hạng theo số liệu Airbnb tự thu thập · lịch đặt các tháng tới · bấm một dòng
          hoặc một vùng trên bản đồ để xem Insight
        </p>
      </div>

      <FinderView
        rows={rows}
        level={level}
        markets={markets}
        market={market}
        initialMetric={metric}
        initialView={sp.view === "map" ? "map" : "list"}
        currency={currencyFor(`${country}-${market}`)}
      />
    </div>
  );
}
