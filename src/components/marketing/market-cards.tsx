"use client"

import Link from "next/link"
import { MapIcon } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/reui/badge"
import { Frame, FramePanel } from "@/components/reui/frame"
import { fmtInt, fmtMoney, fmtPct } from "@/lib/format"
import type { FinderRow } from "@/lib/queries"

const GRADIENTS = [
  "from-indigo-400 via-indigo-500 to-indigo-600",
  "from-indigo-500 via-indigo-600 to-indigo-700",
  "from-indigo-600 via-indigo-700 to-indigo-800",
  "from-indigo-700 via-indigo-800 to-indigo-950",
] as const

/**
 * Dải diện tích của card-29 — khác bản gốc: đường viền vẽ từ doanh thu theo
 * tháng THẬT (bản gốc là hình cố định), để không ngụ ý một xu hướng không có.
 */
function SeriesArea({ series, index }: { series: number[]; index: number }) {
  const max = Math.max(...series, 1)
  const points = series.map((v, i) => {
    const x = series.length > 1 ? (i / (series.length - 1)) * 100 : 0
    const y = 100 - (v / max) * 85
    return `${x.toFixed(1)}% ${y.toFixed(1)}%`
  })
  const clipPath = `polygon(0 100%, ${points.join(", ")}, 100% 100%)`
  return (
    <div aria-hidden="true" className="relative -mx-4 mt-4 -mb-4 h-28 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-full bg-indigo-100/80 dark:bg-indigo-950/50" />
      <div className={cn("absolute inset-x-0 bottom-0 h-full bg-gradient-to-br", GRADIENTS[index % GRADIENTS.length])} style={{ clipPath }} />
    </div>
  )
}

export type MarketCard = FinderRow & { currency: string }

/** Thị trường nổi bật — chuyển thể CardGrid/CardItem của @reui/card-29. */
export function MarketCards({ markets }: { markets: MarketCard[] }) {
  const total = markets.length
  return (
    <div className="@container w-full">
      <Frame className="w-full">
        <FramePanel className="p-0!">
          <div className={cn("grid overflow-hidden", total >= 3 ? "@2xl:grid-cols-3" : "@2xl:grid-cols-2")}>
            {markets.map((m, index) => (
              <Link
                key={m.id}
                href={m.href}
                prefetch={false}
                className={cn(
                  "border-border/60 hover:bg-muted/40 flex min-h-[260px] flex-col overflow-hidden p-4 transition-colors",
                  index < total - 1 && "border-b @2xl:border-r @2xl:border-b-0"
                )}
              >
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <MapIcon aria-hidden="true" className="text-muted-foreground size-5" />
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-muted-foreground text-sm leading-relaxed">{m.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="text-xl leading-tight font-semibold tabular-nums">
                        {m.revpar ? fmtMoney(m.revpar, m.currency) : "—"}
                        <span className="text-muted-foreground/40 font-semibold"> RevPAR</span>
                      </div>
                      <Badge variant="outline">{fmtPct(m.occupancy)} công suất</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {fmtInt(m.listings)} listing · doanh thu theo tháng của lịch đặt (tháng xa còn ít booking)
                  </p>
                </div>
                <SeriesArea series={m.series} index={index} />
              </Link>
            ))}
          </div>
        </FramePanel>
      </Frame>
    </div>
  )
}
