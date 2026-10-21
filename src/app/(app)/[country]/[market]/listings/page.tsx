export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingsExplorer } from "@/components/listing/listings-explorer";
import { PageHeader } from "@/components/page/page-header";
import { fmtInt } from "@/lib/format";
import { currencyFor, getArea, getMarketListings } from "@/lib/queries";

type Params = Promise<{ country: string; market: string }>;

const COUNTRY_VI: Record<string, string> = { vn: "Việt Nam" };
/** Số listing gửi xuống trình duyệt (DOM marker + thẻ) — xếp theo doanh thu. */
const LIMIT = 300;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { country, market } = await params;
  const area = await getArea(`${country}-${market}`);
  return { title: area ? `Listing tại ${area.name}` : "Không tìm thấy" };
}

/** Duyệt listing của một thị trường (IA §3.2): lưới thẻ | bản đồ nhãn giá. */
export default async function MarketListingsPage({ params }: { params: Params }) {
  const { country, market } = await params;
  const marketId = `${country}-${market}`;
  const area = await getArea(marketId);
  if (!area || area.regionType !== "market") notFound();

  const { rows, total } = await getMarketListings(marketId, { limit: LIMIT });
  const capped = total > rows.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={[
          { label: COUNTRY_VI[country] ?? country.toUpperCase(), href: `/${country}` },
          { label: area.name, href: `/${country}/${market}` },
          { label: "Listing" },
        ]}
        title={`Listing tại ${area.name}`}
        stats={[
          `${fmtInt(total)} listing`,
          ...(capped ? [`hiện ${fmtInt(rows.length)} doanh thu cao nhất`] : []),
        ]}
        description="Airbnb tự thu thập · công suất và doanh thu tính trên lịch đặt các tháng tới"
      />
      <ListingsExplorer listings={rows} currency={currencyFor(marketId)} />
    </div>
  );
}
