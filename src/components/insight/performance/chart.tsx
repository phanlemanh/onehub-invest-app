"use client"

/**
 * Hiệu suất theo tháng — chuyển thể từ @reui/chart-6: bốn ô chỉ số chuyển một
 * đường xu hướng. Dữ liệu là lịch đặt phòng các tháng TỚI, nên không có lớp
 * "kỳ trước"; mốc là lễ/mùa du lịch Việt Nam.
 */
import { useMemo, useState } from "react"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import { IconTile } from "@/components/reui/icon-tile"
import { cn } from "cn"
import { toast } from "sonner"

import { ChartToolbar, type ChartActions } from "./chart-toolbar"
import {
  DEFAULT_VIEW,
  metricOf,
  rangeOf,
  type MetricSpec,
  type MonthRow,
  type ViewState,
} from "./data"
import { formatSpan, formattersFor, type Formatters } from "./format"
import { TOAST_ERROR_ICON, TOAST_SUCCESS_ICON, UI_ICONS } from "./icons"
import { MetricPlot } from "./metric-plot"
import { MetricTiles } from "./metric-tiles"
import {
  averageOf,
  plotRows,
  summariesOf,
  windowOf,
  type PlotRow,
} from "./series"
import { AverageKey, CAP_BOX, DotSeparator, Fact, MetricDot } from "./value-faces"

async function copyText(text: string, title: string, description: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(title, { icon: TOAST_SUCCESS_ICON, description })
  } catch {
    toast.error("Không sao chép được", {
      icon: TOAST_ERROR_ICON,
      description: "Trình duyệt chặn quyền truy cập clipboard.",
    })
  }
}

const sameView = (a: ViewState, b: ViewState) =>
  a.metric === b.metric &&
  a.range === b.range &&
  a.annotations === b.annotations &&
  a.average === b.average &&
  a.grid === b.grid

/** What the plot measures on the left; its span and average on the right. */
function PlotLegend({
  metric,
  rows,
  view,
  format,
}: {
  metric: MetricSpec
  rows: PlotRow[]
  view: ViewState
  format: Formatters
}) {
  const first = rows[0]?.day ?? 0
  const last = rows.at(-1)?.day ?? 0
  const average = averageOf(rows)
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
      <Fact className="text-muted-foreground">{metric.basis}</Fact>
      <ul
        aria-label="Chú giải"
        className="flex flex-wrap items-center gap-x-4 gap-y-2"
      >
        <li className="flex h-4 items-center gap-1.5">
          <MetricDot swatch={metric.swatch} />
          <span className={cn(CAP_BOX, "tabular-nums")}>
            {formatSpan(first, last)}
          </span>
        </li>
        {view.average ? (
          <li className="text-muted-foreground flex h-4 items-center gap-1.5">
            <AverageKey />
            <span className={cn(CAP_BOX, "tabular-nums")}>
              TB {format.value(metric.key, average)}
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  )
}

export function PerformanceChart({
  months,
  currency,
  source,
}: {
  /** Mọi tháng có dữ liệu, cũ trước. */
  months: MonthRow[]
  currency: string
  /** Nguồn dữ liệu, cho chân khung. */
  source: string
}) {
  const [view, setView] = useState<ViewState>(DEFAULT_VIEW)
  const format = useMemo(() => formattersFor(currency), [currency])
  const metric = metricOf(view.metric)
  const range = rangeOf(view.range)
  const shown = useMemo(() => windowOf(months, view.range), [months, view.range])
  const rows = useMemo(() => plotRows(shown, view.metric), [shown, view.metric])
  const summaries = useMemo(() => summariesOf(shown), [shown])
  const summary = summaries[view.metric]

  const patchView = (patch: Partial<ViewState>) =>
    setView((current) => ({ ...current, ...patch }))

  const table = (delimiter: "," | "\t") => {
    const header = ["Tháng", metric.label]
    const lines = rows.map((row) => [
      new Date(row.day).toISOString().slice(0, 7),
      `${row.current}`,
    ])
    return [header, ...lines]
      .map((line) =>
        line
          .map((cell) => (delimiter === "," ? `"${cell}"` : cell))
          .join(delimiter)
      )
      .join("\n")
  }

  const first = rows[0]?.day ?? 0
  const last = rows.at(-1)?.day ?? 0
  const summaryText = `${metric.label}, ${formatSpan(first, last)}: ${format.headline(metric.key, summary.value)}. Tháng cuối ${format.value(metric.key, rows.at(-1)?.current ?? 0)}.`

  const actions: ChartActions = {
    downloadCsv: () => {
      const name = `hieu-suat-${metric.key}-${view.range}.csv`
      const url = URL.createObjectURL(
        new Blob([table(",")], { type: "text/csv" })
      )
      const link = document.createElement("a")
      link.href = url
      link.download = name
      link.click()
      URL.revokeObjectURL(url)
      toast.success("Đã tải CSV", {
        icon: TOAST_SUCCESS_ICON,
        description: `${name}, ${rows.length} tháng.`,
      })
    },
    copyData: () =>
      void copyText(
        table("\t"),
        "Đã sao chép bảng số",
        `${rows.length} tháng ${metric.label.toLowerCase()}, dán được vào bảng tính.`
      ),
    copySummary: () =>
      void copyText(summaryText, "Đã sao chép tóm tắt", summaryText),
    resetView: () => patchView(DEFAULT_VIEW),
  }

  const chartLabel = `${metric.label} theo tháng, ${formatSpan(first, last)}. Phím mũi tên để chuyển tháng.`

  return (
    <Frame spacing="default" className="w-full min-w-0">
      <FrameHeader className="flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
          <IconTile variant="frame" size="sm" aria-hidden="true">
            {UI_ICONS.chart}
          </IconTile>
          <div className="flex min-w-0 flex-col gap-px">
            <FrameTitle role="heading" aria-level={2} className="truncate">
              Hiệu suất theo tháng
            </FrameTitle>
            <FrameDescription className="truncate">
              Lịch đặt phòng {range.months} tháng tới, tính tới hôm nay
            </FrameDescription>
          </div>
        </div>
        <ChartToolbar
          view={view}
          onViewChange={patchView}
          canReset={!sameView(view, DEFAULT_VIEW)}
          actions={actions}
        />
      </FrameHeader>

      <FramePanel className="@container">
        <MetricTiles
          active={view.metric}
          summaries={summaries}
          months={shown.length}
          format={format}
          onSelect={(next) => patchView({ metric: next })}
        />
      </FramePanel>

      <FramePanel className="flex flex-col gap-4">
        <PlotLegend metric={metric} rows={rows} view={view} format={format} />
        <MetricPlot
          rows={rows}
          metric={metric}
          view={view}
          label={chartLabel}
          format={format}
        />
      </FramePanel>

      <FrameFooter className="text-muted-foreground flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <span className="flex min-w-0 items-center gap-1.5">
          <Fact>{source}</Fact>
          <DotSeparator />
          <Fact>{currency}</Fact>
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <Fact>Tháng xa còn ít booking — công suất thấp không có nghĩa là thị trường yếu</Fact>
        </span>
      </FrameFooter>
    </Frame>
  )
}
