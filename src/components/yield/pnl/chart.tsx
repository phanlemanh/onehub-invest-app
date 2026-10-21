"use client"

/**
 * Doanh thu và chi phí 12 tháng tới — chuyển thể từ @reui/chart-36: cột doanh
 * thu/chi phí, biên lợi nhuận trong làn phía trên, mốc "ngang thuê dài hạn".
 * Mọi cột là ước tính; doanh thu chia theo số đêm của tháng (chưa có mùa vụ).
 */
import { useMemo, useRef, useState, type ReactNode } from "react"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import { IconTile } from "@/components/reui/icon-tile"
import { toast } from "sonner"

import { ChartToolbar, type ChartActions } from "./chart-toolbar"
import {
  CHART_CONFIG,
  DEFAULT_VIEW,
  periodsOf,
  totalsOf,
  type MonthFigures,
  type ViewState,
} from "./data"
import { formatPercent, moneyFormatter, periodTitle } from "./format"
import { TOAST_ERROR_ICON, TOAST_SUCCESS_ICON, UI_ICONS } from "./icons"
import { MarginPlot, type PlotHandle } from "./margin-plot"
import { CAP_BOX, DotSeparator, Fact, LineKey, SeriesDot, TargetKey } from "./value-faces"

function Stat({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 @2xl:px-(--frame-panel-px) @2xl:py-(--frame-panel-py) @2xl:not-first:border-s">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xl leading-none font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        <Fact className="text-muted-foreground text-xs tabular-nums">{meta}</Fact>
      </dd>
    </div>
  )
}

function LegendItem({ glyph, children }: { glyph: ReactNode; children: string }) {
  return (
    <li className="text-muted-foreground flex h-4 items-center gap-1.5">
      {glyph}
      <span className={CAP_BOX}>{children}</span>
    </li>
  )
}

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

export function PnlChart({
  months,
  currency,
  breakEvenMargin,
  ltNetIncome,
}: {
  months: MonthFigures[]
  currency: string
  /** Biên để ngang thuê dài hạn; null khi không có số thuê dài hạn. */
  breakEvenMargin: number | null
  ltNetIncome: number | null
}) {
  const [view, setView] = useState<ViewState>(DEFAULT_VIEW)
  const plot = useRef<PlotHandle>(null)
  const money = useMemo(() => moneyFormatter(currency), [currency])
  const rows = useMemo(() => periodsOf(months, view.granularity), [months, view.granularity])
  const year = totalsOf(months)
  // Mốc chỉ có nghĩa khi đạt được: biên > 100% nghĩa là ngắn hạn không thể bằng.
  const target = breakEvenMargin !== null && breakEvenMargin <= 1 ? breakEvenMargin : null
  const vsLt = ltNetIncome !== null ? year.net - ltNetIncome : null

  const patchView = (patch: Partial<ViewState>) => {
    const next = { ...view, ...patch }
    if (next.granularity !== view.granularity)
      plot.current?.regroup(periodsOf(months, next.granularity))
    setView(next)
  }

  const summary = `Ước tính 12 tháng tới: doanh thu ${money(year.revenue)}, chi phí ${money(year.expenses)}, thu nhập ròng ${money(year.net)} (biên ${formatPercent(year.margin)}).${
    vsLt !== null ? ` So với thuê dài hạn: ${vsLt >= 0 ? "cao hơn" : "thấp hơn"} ${money(Math.abs(vsLt))}/năm.` : ""
  }`

  const actions: ChartActions = {
    downloadCsv: () => {
      const csv = [
        "ky,doanh_thu,chi_phi,thu_nhap_rong,bien",
        ...rows.map((row) =>
          [periodTitle(row), Math.round(row.revenue), Math.round(row.expenses), Math.round(row.net), row.margin.toFixed(4)].join(",")
        ),
      ].join("\n")
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
      const link = document.createElement("a")
      link.href = url
      link.download = `uoc-tinh-loi-suat-${view.granularity}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("Đã tải CSV", {
        icon: TOAST_SUCCESS_ICON,
        description: `${rows.length} ${view.granularity === "month" ? "tháng" : "quý"}.`,
      })
    },
    copySummary: () => void copyText(summary, "Đã sao chép tóm tắt", summary),
  }

  const chartLabel = `Doanh thu và chi phí ước tính theo ${view.granularity === "month" ? "tháng" : "quý"}, biên lợi nhuận là đường phía trên.`

  return (
    <Frame spacing="default" className="w-full min-w-0">
      <FrameHeader className="flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
          <IconTile variant="frame" size="sm" aria-hidden="true">
            {UI_ICONS.ledger}
          </IconTile>
          <div className="flex min-w-0 flex-col gap-px">
            <FrameTitle role="heading" aria-level={2} className="truncate">
              Doanh thu và chi phí 12 tháng tới
            </FrameTitle>
            <FrameDescription className="truncate">
              Cho thuê ngắn hạn, sau phí vận hành, nền tảng, thuế và chi phí cố định
            </FrameDescription>
          </div>
        </div>
        <ChartToolbar view={view} onViewChange={patchView} actions={actions} />
      </FrameHeader>

      <FramePanel className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-col gap-2.5">
            <span className="text-muted-foreground text-sm">Thu nhập ròng / năm</span>
            <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
              {money(year.net)}
            </span>
          </div>
          <ul aria-label="Chú giải" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <LegendItem glyph={<SeriesDot series="revenue" />}>{CHART_CONFIG.revenue.label}</LegendItem>
            <LegendItem glyph={<SeriesDot series="expenses" />}>{CHART_CONFIG.expenses.label}</LegendItem>
            <LegendItem glyph={<LineKey />}>{CHART_CONFIG.margin.label}</LegendItem>
            {view.target && target !== null ? (
              <LegendItem glyph={<TargetKey />}>Ngang thuê dài hạn</LegendItem>
            ) : null}
          </ul>
        </div>
        <MarginPlot
          ref={plot}
          rows={rows}
          target={view.target}
          targetMargin={target}
          targetLabel="Ngang thuê DH"
          money={money}
          label={chartLabel}
        />
      </FramePanel>

      <FramePanel className="@container">
        <dl className="grid grid-cols-2 gap-5 @2xl:-mx-(--frame-panel-px) @2xl:-my-(--frame-panel-py) @2xl:grid-cols-4 @2xl:gap-0">
          <Stat label="Doanh thu" value={money(year.revenue)} meta="Trung vị listing so sánh" />
          <Stat label="Chi phí" value={money(year.expenses)} meta="Theo giả định trong form" />
          <Stat label="Biên lợi nhuận" value={formatPercent(year.margin)} meta="Thu nhập ròng ÷ doanh thu" />
          <Stat
            label="So với thuê dài hạn"
            value={vsLt === null ? "—" : `${vsLt >= 0 ? "+" : "−"}${money(Math.abs(vsLt))}`}
            meta={
              vsLt === null
                ? "Chưa có giá thuê dài hạn của phường"
                : breakEvenMargin !== null && breakEvenMargin > 1
                  ? "Ngắn hạn chưa thể bằng ở mức doanh thu này"
                  : "Thu nhập ròng/năm, thuê DH đã trừ thuế 10%"
            }
          />
        </dl>
      </FramePanel>

      <FrameFooter className="text-muted-foreground flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <span className="flex min-w-0 items-center gap-1.5">
          <Fact>Ước tính, chưa có mùa vụ</Fact>
          <DotSeparator />
          <Fact>Doanh thu chia theo số đêm của tháng</Fact>
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <Fact>{currency}</Fact>
        </span>
      </FrameFooter>
    </Frame>
  )
}
