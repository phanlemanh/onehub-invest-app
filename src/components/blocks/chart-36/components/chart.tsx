"use client"

/**
 * Operating Margin: FY2026 revenue and operating expenses as paired columns,
 * the operating margin they leave in a lane above, the plan's target and a hatched
 * forecast for the open months. Customize: `MONTHS` and the plan in data.ts.
 */
import { useMemo, useRef, useState, type ReactNode } from "react"
import { Badge } from "@/components/reui/badge"
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
  AS_OF,
  CHART_CONFIG,
  CLOSED_MONTHS,
  DEFAULT_VIEW,
  FISCAL_YEAR,
  MONTHS,
  periodsOf,
  PRIOR_YTD,
  TARGET_MARGIN,
  totalsOf,
  type ViewState,
} from "./data"
import {
  formatDay,
  formatPercent,
  formatPoints,
  formatUsd,
  monthSpan,
  periodTitle,
} from "./format"
import {
  BADGE_TREND_ICONS,
  TOAST_ERROR_ICON,
  TOAST_SUCCESS_ICON,
  UI_ICONS,
} from "./icons"
import { MarginPlot, type PlotHandle } from "./margin-plot"
import {
  CAP_BOX,
  DotSeparator,
  Fact,
  LineKey,
  SeriesDot,
  TargetKey,
} from "./value-faces"

const YTD = totalsOf(MONTHS.slice(0, CLOSED_MONTHS))
const PRIOR = totalsOf([PRIOR_YTD])
const OUTLOOK = totalsOf(MONTHS)
const CLOSED_SPAN = monthSpan(0, CLOSED_MONTHS - 1)
const FORECAST_SPAN = monthSpan(CLOSED_MONTHS, MONTHS.length - 1)
const UNIT_NAME = { month: "months", quarter: "quarters" } as const

const SUMMARY = `FY${FISCAL_YEAR} ${CLOSED_SPAN}: revenue ${formatUsd(YTD.revenue)}, expenses ${formatUsd(YTD.expenses)}, operating income ${formatUsd(YTD.net)} at a ${formatPercent(YTD.margin)} operating margin. Full-year outlook ${formatPercent(OUTLOOK.margin)} against a ${formatPercent(TARGET_MARGIN)} target.`

/** Operating income growth reads as state: up is good. */
function ChangeBadge({ change }: { change: number }) {
  const up = change >= 0
  return (
    <Badge variant={up ? "success-light" : "destructive-light"}>
      {up ? BADGE_TREND_ICONS.up : BADGE_TREND_ICONS.down}
      <span className={cn(CAP_BOX, "tabular-nums")}>
        {formatPercent(change, true)}
      </span>
    </Badge>
  )
}

function Stat({
  label,
  value,
  meta,
}: {
  label: string
  value: string
  meta: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 @2xl:px-(--frame-panel-px) @2xl:py-(--frame-panel-py) @2xl:not-first:border-s">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xl leading-none font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        <Fact className="text-muted-foreground text-xs tabular-nums">
          {meta}
        </Fact>
      </dd>
    </div>
  )
}

function LegendItem({
  glyph,
  children,
}: {
  glyph: ReactNode
  children: string
}) {
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
    toast.error("Copy failed", {
      icon: TOAST_ERROR_ICON,
      description: "The browser blocked clipboard access.",
    })
  }
}

export function Chart() {
  const [view, setView] = useState<ViewState>(DEFAULT_VIEW)
  const plot = useRef<PlotHandle>(null)
  const { granularity, forecast } = view
  const rows = useMemo(
    () => periodsOf(granularity, forecast),
    [granularity, forecast]
  )

  const patchView = (patch: Partial<ViewState>) => {
    const next = { ...view, ...patch }
    // The plot measures its bars before the rows change, then morphs.
    if (next.granularity !== granularity || next.forecast !== forecast)
      plot.current?.regroup(periodsOf(next.granularity, next.forecast))
    setView(next)
  }

  const actions: ChartActions = {
    downloadCsv: () => {
      const csv = [
        "period,revenue_usd,expenses_usd,operating_income_usd,operating_margin,status",
        ...rows.map((row) =>
          [
            periodTitle(row),
            row.revenue * 1000,
            row.expenses * 1000,
            row.net * 1000,
            row.margin.toFixed(4),
            row.forecast ? "forecast" : "closed",
          ].join(",")
        ),
      ].join("\n")
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
      const link = document.createElement("a")
      link.href = url
      link.download = `operating-margin-fy${FISCAL_YEAR}-${granularity}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("CSV downloaded", {
        icon: TOAST_SUCCESS_ICON,
        description: `${rows.length} ${UNIT_NAME[granularity]} of FY${FISCAL_YEAR}.`,
      })
    },
    copySummary: () => void copyText(SUMMARY, "Summary copied", SUMMARY),
  }

  const chartLabel = `Revenue and operating expenses by ${granularity}, with operating margin as a line${
    forecast ? ` and ${FORECAST_SPAN} forecast hatched` : ""
  }. Arrow keys move between ${UNIT_NAME[granularity]}.`
  const outlookGap = OUTLOOK.margin - TARGET_MARGIN

  return (
    <Frame spacing="default" className="w-full max-w-4xl min-w-0">
      <FrameHeader className="flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* The basis wraps the toolbar below the title before the subtitle
            would truncate. */}
        <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
          <IconTile variant="frame" size="sm" aria-hidden="true">
            {UI_ICONS.ledger}
          </IconTile>
          <div className="flex min-w-0 flex-col gap-px">
            <FrameTitle role="heading" aria-level={3} className="truncate">
              Operating Margin
            </FrameTitle>
            <FrameDescription className="truncate">
              {`FY${FISCAL_YEAR} revenue, costs and margin`}
            </FrameDescription>
          </div>
        </div>
        <ChartToolbar view={view} onViewChange={patchView} actions={actions} />
      </FrameHeader>

      <FramePanel className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-col gap-2.5">
            <span className="text-muted-foreground text-sm">
              Operating Income YTD
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
                {formatUsd(YTD.net)}
              </span>
              <div className="flex items-center gap-2">
                <ChangeBadge change={YTD.net / PRIOR.net - 1} />
                <Fact className="text-muted-foreground text-xs">
                  {`vs ${CLOSED_SPAN} ${FISCAL_YEAR - 1}`}
                </Fact>
              </div>
            </div>
          </div>
          <ul
            aria-label="Legend"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
          >
            <LegendItem glyph={<SeriesDot series="revenue" />}>
              {CHART_CONFIG.revenue.label}
            </LegendItem>
            <LegendItem glyph={<SeriesDot series="expenses" />}>
              {CHART_CONFIG.expenses.label}
            </LegendItem>
            <LegendItem glyph={<LineKey />}>
              {CHART_CONFIG.margin.label}
            </LegendItem>
            {view.target ? (
              <LegendItem glyph={<TargetKey />}>Target</LegendItem>
            ) : null}
          </ul>
        </div>
        <MarginPlot
          ref={plot}
          rows={rows}
          target={view.target}
          label={chartLabel}
        />
      </FramePanel>

      <FramePanel className="@container">
        <dl className="grid grid-cols-2 gap-5 @2xl:-mx-(--frame-panel-px) @2xl:-my-(--frame-panel-py) @2xl:grid-cols-4 @2xl:gap-0">
          <Stat
            label="Revenue"
            value={formatUsd(YTD.revenue)}
            meta={`${formatPercent(YTD.revenue / PRIOR.revenue - 1, true)} vs last year`}
          />
          <Stat
            label="Expenses"
            value={formatUsd(YTD.expenses)}
            meta={`${formatPercent(YTD.expenses / PRIOR.expenses - 1, true)} vs last year`}
          />
          <Stat
            label="Operating Margin"
            value={formatPercent(YTD.margin)}
            meta={`${formatPoints(YTD.margin - PRIOR.margin)} vs last year`}
          />
          <Stat
            label="FY Outlook"
            value={formatPercent(OUTLOOK.margin)}
            meta={`${formatPoints(Math.abs(outlookGap), false)} ${
              outlookGap < 0 ? "below" : "above"
            } target`}
          />
        </dl>
      </FramePanel>

      <FrameFooter className="text-muted-foreground flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <span className="flex min-w-0 items-center gap-1.5">
          <Fact>{`${CLOSED_SPAN} closed`}</Fact>
          {forecast ? (
            <>
              <DotSeparator />
              <Fact>{`${FORECAST_SPAN} forecast`}</Fact>
            </>
          ) : null}
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <Fact>USD</Fact>
          <DotSeparator />
          <Fact className="tabular-nums">{`As of ${formatDay(AS_OF)}`}</Fact>
        </span>
      </FrameFooter>
    </Frame>
  )
}