"use client"

import { Badge } from "@/components/reui/badge"
import { Frame, FramePanel } from "@/components/reui/frame"

import { Separator } from "@/components/ui/separator"
import type { StatTile } from "./tiers"

/**
 * Hàng KPI — chuyển thể từ @reui/stats-1. Khác bản gốc: không có menu "…"
 * (chưa có thao tác thật); badge là VỊ TRÍ so với nhóm so sánh (phân vị) thay
 * cho % so với tháng trước — dữ liệu chưa có lịch sử để so.
 */
export function StatTiles({ items }: { items: StatTile[] }) {
  return (
    <div className="grid grow grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((stat) => (
        <Frame key={stat.title}>
          <FramePanel className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-muted-foreground text-sm font-medium">{stat.title}</h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-foreground text-2xl font-medium tracking-tight tabular-nums">
                  {stat.value}
                </span>
                {stat.tier && <Badge variant={stat.tier.variant}>{stat.tier.label}</Badge>}
              </div>
              <Separator />
              <div className="text-muted-foreground text-xs">{stat.footer}</div>
            </div>
          </FramePanel>
        </Frame>
      ))}
    </div>
  )
}
