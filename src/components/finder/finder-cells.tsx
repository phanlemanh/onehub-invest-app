"use client"

import { useMemo } from "react"
import { cn } from "cn"

import { Progress, ProgressLabel } from "@/components/ui/progress"
import { BIN_INDICATOR } from "./bins"

/**
 * Thanh chỉ số đang xếp hạng — mẫu ScoreCell của @reui/data-grid-base-2. Độ dài
 * = tỉ lệ với khu vực cao nhất; màu = bậc phân vị, cùng màu với bản đồ.
 */
export function MetricBarCell({
  value,
  max,
  bin,
  label,
  text,
}: {
  value: number | null
  max: number
  bin: number | null
  label: string
  text: string
}) {
  const percent = value !== null && max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-20 shrink-0 text-end text-sm tabular-nums">{text}</span>
      <Progress
        value={percent}
        className={cn(
          "min-w-0 flex-1 flex-row flex-nowrap items-center **:data-[slot=progress-track]:min-w-12 **:data-[slot=progress-track]:flex-1",
          bin === null ? "**:data-[slot=progress-indicator]:bg-muted-foreground/30" : BIN_INDICATOR[bin]
        )}
      >
        <ProgressLabel className="sr-only">{label}</ProgressLabel>
      </Progress>
    </div>
  )
}

// Smooth the polyline into a flowing cubic-bezier path: each segment's control
// points follow the slope of the neighbouring points (Catmull-Rom style).
function buildSmoothLinePath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ""
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`

  const smoothing = 0.2
  const controlPoint = (
    current: { x: number; y: number },
    previous: { x: number; y: number } | undefined,
    next: { x: number; y: number } | undefined,
    reverse?: boolean
  ) => {
    const p = previous ?? current
    const n = next ?? current
    const angle = Math.atan2(n.y - p.y, n.x - p.x) + (reverse ? Math.PI : 0)
    const length = Math.hypot(n.x - p.x, n.y - p.y) * smoothing
    return {
      x: current.x + Math.cos(angle) * length,
      y: current.y + Math.sin(angle) * length,
    }
  }

  // Làm tròn 2 chữ số: cos/sin lệch ở chữ số cuối giữa Node và trình duyệt → lệch hydrate.
  const r = (v: number) => Math.round(v * 100) / 100
  let d = `M ${r(pts[0].x)} ${r(pts[0].y)}`
  for (let i = 1; i < pts.length; i++) {
    const start = controlPoint(pts[i - 1], pts[i - 2], pts[i])
    const end = controlPoint(pts[i], pts[i - 1], pts[i + 1], true)
    d += ` C ${r(start.x)} ${r(start.y)} ${r(end.x)} ${r(end.y)} ${r(pts[i].x)} ${r(pts[i].y)}`
  }
  return d
}

/**
 * Doanh thu theo tháng của lịch đặt — StockSparkline của @reui/data-grid-base-2.
 * Khác bản gốc: một màu trung tính. Lịch TƯƠNG LAI luôn thưa dần về cuối, nên
 * xanh/đỏ theo đầu–cuối sẽ tô đỏ gần như mọi dòng và nói sai về thị trường.
 */
export function TrendSparkline({ data }: { data: number[] }) {
  const w = 92
  const h = 26
  const padX = 2
  const padY = 2
  const innerW = w - padX * 2
  const innerH = h - padY * 2

  const linePath = useMemo(() => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const step = innerW / Math.max(1, data.length - 1)
    return buildSmoothLinePath(
      data.map((v, i) => ({ x: padX + i * step, y: padY + ((max - v) / range) * innerH }))
    )
  }, [data, innerW, innerH])

  if (data.length < 2) return <span className="text-muted-foreground">—</span>
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      <path
        d={linePath}
        fill="none"
        className="stroke-muted-foreground"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
