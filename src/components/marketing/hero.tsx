"use client"

import Link from "next/link"
import { CircleCheckIcon, DatabaseIcon } from "lucide-react"

import { Badge } from "@/components/reui/badge"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame"
import { MetricBarCell } from "@/components/finder/finder-cells"
import { SearchCommand } from "@/components/shell/search-command"
import { fmtInt, fmtMoney, fmtPct } from "@/lib/format"
import type { FinderRow, SearchEntry } from "@/lib/queries"
import { FrameBackdrop } from "./frame-backdrop"

export type HeroPreview = {
  market: FinderRow
  topAreas: FinderRow[]
  currency: string
}

/** Bản xem trước bằng số thật — thay "app console" giả của hero-8. */
function LivePreview({ preview }: { preview: HeroPreview }) {
  const { market, topAreas, currency } = preview
  const max = Math.max(...topAreas.map((a) => a.revpar ?? 0), 1)
  return (
    <Frame spacing="sm" className="bg-background size-full overflow-hidden">
      <FrameHeader>
        <FrameTitle>{market.name}</FrameTitle>
        <FrameDescription>Lịch đặt các tháng tới · số thật</FrameDescription>
      </FrameHeader>
      <FramePanel className="grid grid-cols-3 gap-3 text-sm">
        {[
          ["Listing", fmtInt(market.listings)],
          ["Công suất", fmtPct(market.occupancy)],
          ["RevPAR", market.revpar ? fmtMoney(market.revpar, currency) : "—"],
        ].map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className="truncate font-semibold tabular-nums">{value}</span>
          </div>
        ))}
      </FramePanel>
      <FramePanel className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">Phường RevPAR cao nhất (≥ 5 listing)</span>
        {topAreas.map((a) => (
          <div key={a.id} className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-2">
            <Link href={a.href} prefetch={false} className="truncate text-sm font-medium hover:underline">
              {a.name}
            </Link>
            <MetricBarCell
              value={a.revpar}
              max={max}
              bin={a.revpar && a.revpar >= max * 0.75 ? 3 : 2}
              label={`RevPAR của ${a.name}`}
              text={a.revpar ? fmtMoney(a.revpar, currency) : "—"}
            />
          </div>
        ))}
      </FramePanel>
    </Frame>
  )
}

/**
 * Hero trang chủ — chuyển thể từ @reui/hero-8: badge, tiêu đề hai tông, mô tả,
 * ô nhập + điểm chứng minh, khung sản phẩm trên nền vẽ. Khác bản gốc: ô email →
 * ô tìm khu vực (⌘K); khung "console" giả → bản xem trước số thật; điểm chứng
 * minh là số đếm thật từ DB.
 */
export function Hero({
  entries,
  proofPoints,
  preview,
}: {
  entries: SearchEntry[]
  proofPoints: string[]
  preview: HeroPreview | null
}) {
  return (
    <section aria-labelledby="hero-title" className="bg-background relative flex w-full items-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="relative mx-auto grid w-full max-w-xl grid-cols-1 items-center gap-8 lg:max-w-7xl lg:grid-cols-2">
        <div className="@container flex flex-col items-start justify-center gap-6">
          <Badge variant="outline" size="xl" radius="full" className="text-foreground h-7">
            <DatabaseIcon className="size-3.5 shrink-0" aria-hidden="true" />
            Dữ liệu Airbnb tự thu thập
          </Badge>

          <h1 id="hero-title" className="text-foreground text-4xl leading-tight font-semibold tracking-tight @lg:text-5xl @lg:leading-none">
            <span className="@lg:block">Phường nào đáng đầu tư</span>{" "}
            <span className="text-muted-foreground @lg:block">cho thuê ngắn hạn?</span>
          </h1>

          <p className="text-muted-foreground text-base leading-6">
            Công suất, giá phòng và RevPAR theo từng phường; duyệt listing trên bản đồ; ước tính lợi suất một căn
            so với cho thuê dài hạn.
          </p>

          <SearchCommand entries={entries} variant="hero" />

          <ul className="flex flex-col gap-3">
            {proofPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <CircleCheckIcon aria-hidden="true" className="text-foreground size-4 shrink-0" />
                <span className="text-muted-foreground text-base leading-6">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="@container w-full">
          <div className="border-input/30 dark:border-input/20 relative aspect-[4/3] overflow-hidden rounded-xl border p-[5cqw]">
            <FrameBackdrop />
            <div className="relative size-full rounded-xl bg-white/25 p-[1.25cqw] dark:bg-white/15">
              {preview ? <LivePreview preview={preview} /> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
