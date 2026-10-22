export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingHeatmap } from "@/components/listing/booking-heatmap";
import {
  airbnbUrlOf,
  bedroomsVi,
  roomTypeVi,
} from "@/components/listing/listing-labels";
import { ListingActions } from "@/components/listing/listing-actions";
import { CompsTable } from "@/components/listing/listing-tables";
import { PageHeader, type Crumb } from "@/components/page/page-header";
import { StatTiles } from "@/components/page/stat-tiles";
import { tierOf, type StatTile, type Tier } from "@/components/page/tiers";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import { fmtInt, fmtMoney, fmtMoneyCompact, fmtPct } from "@/lib/format";
import { getListingDetail, getListingPeers, getMarketListings } from "@/lib/queries";

type Params = Promise<{ id: string }>;

const COUNTRY_VI: Record<string, string> = { vn: "Việt Nam" };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingDetail(decodeURIComponent(id));
  return { title: listing?.name ?? "Listing" };
}

/** Giá cao không phải "tốt" — bậc giá dùng nhãn trung tính, không xanh/vàng. */
function priceTier(price: number | null, p: number[] | undefined): Tier | null {
  if (price === null || !p) return null;
  if (price >= p[2]) return { label: "Cao cấp", variant: "outline" };
  if (price >= p[1]) return { label: "Trên trung vị", variant: "outline" };
  if (price >= p[0]) return { label: "Tầm trung", variant: "outline" };
  return { label: "Giá thấp", variant: "outline" };
}

/** Chi tiết listing (IA §3.2): KPI so với listing cùng khu vực, lịch 12 tháng, comps. */
export default async function ListingPage({ params }: { params: Params }) {
  const { id } = await params;
  const listing = await getListingDetail(decodeURIComponent(id));
  if (!listing) notFound();

  const marketId = listing.marketPath ? listing.marketPath.slice(1).replace("/", "-") : null;
  const peers = listing.areaId ? await getListingPeers(listing.areaId, marketId) : null;

  // Comps: 10 listing gần nhất cùng số phòng ngủ trong thị trường (AirDNA chọn
  // comps theo khoảng cách). Lọc trước khi gộp nights → không cần cache.
  const comps =
    marketId && listing.lat !== null && listing.lng !== null
      ? (
          await getMarketListings(marketId, {
            limit: 10,
            excludeId: listing.id,
            bedrooms: listing.bedrooms,
            near: { lat: listing.lat, lng: listing.lng },
          })
        ).rows
      : [];

  const cc = marketId?.split("-")[0] ?? "vn";
  const crumbs: Crumb[] = [
    { label: COUNTRY_VI[cc] ?? cc.toUpperCase(), href: `/${cc}` },
    ...(listing.marketName && listing.marketPath
      ? [{ label: listing.marketName, href: listing.marketPath }]
      : []),
    ...(listing.areaName && listing.areaPath
      ? [{ label: listing.areaName, href: listing.areaPath }]
      : []),
    { label: "Listing" },
  ];
  const badges = [
    roomTypeVi(listing.roomType),
    listing.reviewCount ? `${fmtInt(listing.reviewCount)} đánh giá` : null,
    bedroomsVi(listing.bedrooms),
    listing.accommodates ? `${listing.accommodates} khách` : null,
    listing.minimumNights ? `Tối thiểu ${listing.minimumNights} đêm` : null,
  ].filter((b): b is string => Boolean(b));

  const peerScope = peers?.scope === "area" ? `${peers.n} listing cùng phường` : `${peers?.n ?? 0} listing cùng thị trường`;
  const { stats, currency } = listing;
  const tiles: StatTile[] = [
    {
      title: "Giá niêm yết",
      value: fmtMoney(listing.priceListed, currency),
      tier: priceTier(listing.priceListed, peers?.price),
      footer: peers ? `Trung vị ${peerScope}: ${fmtMoney(peers.price[1], currency)}` : "Giá một đêm trên Airbnb",
    },
    {
      title: "Công suất",
      value: fmtPct(stats.occupancy),
      tier: tierOf(stats.occupancy, peers?.occ),
      footer:
        listing.priceListed === null
          ? "Listing chưa báo giá — lịch kín có thể do chủ nhà chặn, không tính công suất"
          : peers?.occ
            ? `Trung vị ${peerScope}: ${fmtPct(peers.occ[1])}`
            : "Đêm đã đặt ÷ tổng đêm của lịch",
    },
    {
      title: "Đêm đã đặt",
      value: `${fmtInt(stats.booked)}/${fmtInt(stats.nights)}`,
      footer: `Trong ${fmtInt(stats.nights)} đêm tới của lịch`,
    },
    {
      title: "Doanh thu ước tính",
      value: stats.revenue > 0 ? fmtMoneyCompact(stats.revenue, currency) : "—",
      footer:
        stats.revenue > 0
          ? "Tổng giá các đêm đã đặt trong lịch tới"
          : "Chưa thu được giá theo đêm của listing này",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={crumbs}
        title={listing.name ?? listing.id}
        stats={badges}
        description={`Airbnb · ${listing.id}${listing.lastSeen ? ` · quét gần nhất ${listing.lastSeen.split("-").reverse().join("/")}` : ""}`}
        actions={<ListingActions airbnbUrl={airbnbUrlOf(listing.id)} />}
      />

      {listing.photoUrls && listing.photoUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-2 md:grid-cols-5">
          {listing.photoUrls.slice(0, 10).map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- CDN Airbnb ngoài domain, kích thước động
            <img
              key={u}
              // DB đã chuẩn hoá https:// từ backfill 2026-10-21; chỉ thêm
              // scheme cho URL trần còn sót (tránh https://https:// đúp).
              // Ảnh chính: aki_policy=x_large (im_w=1024 bị CDN 404 tùy ảnh);
              // ảnh phụ im_w=480 luôn ổn định.
              src={`${u.startsWith("http") ? u : `https://${u}`}${i === 0 ? "?aki_policy=x_large" : "?im_w=480"}`}
              alt={i === 0 ? `Ảnh chính — ${listing.name ?? listing.id}` : `Ảnh ${i + 1}`}
              className={`h-28 w-full rounded-md object-cover md:h-32 ${i === 0 ? "col-span-2 row-span-2 h-60 md:h-60" : ""}`}
              loading={i < 2 ? "eager" : "lazy"}
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      )}
      {listing.photoSource === "airdna" && (
        <p className="text-muted-foreground text-xs">
          Ảnh từ AirDNA (listing này chưa tự thu PDP).
          {listing.listingUrl && (
            <>
              {" "}
              <a
                href={listing.listingUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Xem trên Airbnb ↗
              </a>
            </>
          )}
        </p>
      )}
      {listing.photoSource === "self" && listing.listingUrl && (
        <p className="text-muted-foreground text-xs">
          <a href={listing.listingUrl} target="_blank" rel="noreferrer" className="underline">
            Xem trên Airbnb ↗
          </a>
        </p>
      )}

      <StatTiles items={tiles} />

      <Frame spacing="default" className="w-full min-w-0">
        <FrameHeader>
          <FrameTitle role="heading" aria-level={2}>
            Lịch {fmtInt(stats.nights)} đêm tới
          </FrameTitle>
          <FrameDescription>
            Đêm không còn trống được tính là đã đặt — có thể gồm cả đêm chủ nhà tự khoá lịch.
          </FrameDescription>
        </FrameHeader>
        <FramePanel>
          <BookingHeatmap nights={listing.calendar} currency={currency} lastSeen={listing.lastSeen} />
        </FramePanel>
      </Frame>

      {comps.length > 0 && (
        <CompsTable
          rows={comps}
          currency={currency}
          description={`${comps.length} listing gần nhất${listing.bedrooms !== null ? ` cùng ${bedroomsVi(listing.bedrooms)}` : ""} trong ${listing.marketName ?? "thị trường"}`}
        />
      )}
    </div>
  );
}
