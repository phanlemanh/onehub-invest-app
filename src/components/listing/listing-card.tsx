"use client"

import Link from "next/link"
import { cn } from "cn"

import { Badge } from "@/components/reui/badge"
import { Frame, FramePanel } from "@/components/reui/frame"
import { fmtMoney, fmtMoneyCompact, fmtPct } from "@/lib/format"
import type { ListingCardRow } from "@/lib/queries"
import { bedroomsVi, roomTypeVi } from "./listing-labels"

/** Link class của product-grid-2 (ECOMMERCE_LINK_CLASS_NAME). */
const LINK =
  "hover:text-foreground focus-visible:ring-ring rounded-sm outline-none hover:underline focus-visible:ring-2"

/**
 * Thẻ listing — chuyển thể từ ProductCard của @reui/product-grid-2. Khác bản
 * gốc: KHÔNG có panel ảnh (collector chưa thu ảnh, không dùng ảnh giả); thay
 * swatch/giá bằng badge loại phòng và ba chỉ số. Rê chuột → nhãn giá trên bản
 * đồ sáng lên.
 */
export function ListingCard({
  listing,
  currency,
  active,
  onHover,
}: {
  listing: ListingCardRow
  currency: string
  active: boolean
  onHover: (id: string | null) => void
}) {
  const badges = [
    roomTypeVi(listing.roomType),
    bedroomsVi(listing.bedrooms),
    listing.accommodates ? `${listing.accommodates} khách` : null,
  ].filter((b): b is string => Boolean(b))

  return (
    <Frame
      variant="default"
      spacing="default"
      dense={false}
      className={cn("group/card min-w-0 transition-colors", active && "ring-ring/50 ring-2")}
      onMouseEnter={() => onHover(listing.id)}
      onMouseLeave={() => onHover(null)}
    >
      <FramePanel className="flex flex-col gap-3">
        {listing.areaName && listing.areaPath ? (
          <Link
            prefetch={false}
            href={listing.areaPath}
            className={cn(LINK, "text-muted-foreground w-fit text-xs font-medium tracking-wide uppercase")}
          >
            {listing.areaName}
          </Link>
        ) : (
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Chưa rõ phường
          </span>
        )}

        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="text-foreground min-w-0 text-base leading-snug font-medium tracking-tight">
            <Link
              prefetch={false}
              href={`/listing/${listing.id}`}
              className={cn(LINK, "block truncate")}
            >
              {listing.name ?? listing.id}
            </Link>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge key={badge} variant="outline" size="sm">
                {badge}
              </Badge>
            ))}
          </div>
        </div>

        <dl className="mt-auto grid grid-cols-3 gap-2 text-sm">
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-muted-foreground text-xs">Giá/đêm</dt>
            <dd className="truncate font-semibold tabular-nums">
              {fmtMoney(listing.priceListed, currency)}
            </dd>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-muted-foreground text-xs">Công suất</dt>
            <dd className="font-semibold tabular-nums">{fmtPct(listing.occupancy)}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-muted-foreground text-xs">Doanh thu</dt>
            <dd className="truncate font-semibold tabular-nums">
              {listing.revenue > 0 ? fmtMoneyCompact(listing.revenue, currency) : "—"}
            </dd>
          </div>
        </dl>
      </FramePanel>
    </Frame>
  )
}
