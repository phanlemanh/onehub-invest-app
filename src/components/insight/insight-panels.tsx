"use client"

import { Badge } from "@/components/reui/badge"
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import { MiniMap } from "@/components/mini-map"
import { fmtInt } from "@/lib/format"
import type { SupplyPoint } from "@/lib/queries"

/** Bản đồ phường — MapLibre (ReUI không có map) đặt trong Frame. */
export function MapPanel({
  features,
  lat,
  lng,
  title,
  description,
}: {
  features: Parameters<typeof MiniMap>[0]["features"]
  lat: number
  lng: number
  title: string
  description: string
}) {
  return (
    <Frame spacing="default" className="w-full min-w-0">
      <FrameHeader>
        <FrameTitle role="heading" aria-level={3}>
          {title}
        </FrameTitle>
        <FrameDescription>{description}</FrameDescription>
      </FrameHeader>
      <FramePanel className="overflow-hidden p-0">
        <MiniMap features={features} lat={lat} lng={lng} />
      </FramePanel>
    </Frame>
  )
}

/** Nguồn cung qua các lần quét: tổng đã thấy + mỗi lần quét một badge. */
export function SupplyPanel({
  points,
  cumulative,
}: {
  points: SupplyPoint[]
  cumulative: number
}) {
  const latest = points.at(-1)
  return (
    <Frame spacing="default" className="w-full min-w-0">
      <FrameHeader>
        <FrameTitle role="heading" aria-level={3}>
          Nguồn cung qua các lần quét
        </FrameTitle>
        <FrameDescription>
          Mỗi lần quét tìm kiếm Airbnb thấy một phần thị trường; thứ tự kết quả
          xáo trộn nên &ldquo;mới&rdquo; là mới xuất hiện, không hẳn là mới đăng.
        </FrameDescription>
      </FrameHeader>
      <FramePanel className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <span className="text-2xl font-medium tracking-tight tabular-nums">
            {fmtInt(cumulative)}
          </span>
          <span className="text-muted-foreground text-sm">
            listing đã từng thấy (gộp mọi lần quét)
          </span>
          {latest && (
            <span className="text-muted-foreground text-sm tabular-nums">
              Lần gần nhất: {fmtInt(latest.seen)} thấy · +{fmtInt(latest.newVsPrev)} mới
            </span>
          )}
        </div>
        <ul aria-label="Các lần quét" className="flex flex-wrap gap-1.5">
          {points.map((point) => (
            <li key={point.snapshotId}>
              <Badge variant="outline" className="tabular-nums">
                {point.date} · {fmtInt(point.seen)}
              </Badge>
            </li>
          ))}
        </ul>
      </FramePanel>
    </Frame>
  )
}
