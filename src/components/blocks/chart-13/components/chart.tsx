"use client"

/**
 * Capital Inflows: the period's total and its change on the period before,
 * over a ring of the three tracked sources and the untracked rest, with a
 * per-source breakdown, a period switch, CSV export and a copyable summary.
 */
import { useState } from "react"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import { cn } from "cn"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { CardToolbar, type CardActions } from "./card-toolbar"
import { DEFAULT_PERIOD, INFLOWS, periodOf, type PeriodKey } from "./data"
import { useDemoState } from "./demo-state"
import { formatChange, formatMillions } from "./format"
import { TOAST_ERROR_ICON, TOAST_SUCCESS_ICON, UI_ICONS } from "./icons"
import { InflowDonut } from "./inflow-donut"
import { InflowsEmpty, InflowsError, InflowsSkeleton } from "./inflow-states"
import { changeOf, slicesOf, type Slice } from "./inflow-view"
import {
  CAP_BOX,
  CAP_TRUNCATE,
  ChangeBadge,
  DotSeparator,
  SliceDot,
} from "./value-faces"

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

/** One row per slice and one for the total, in raw USD millions. */
function csvOf(slices: Slice[], total: number, previousTotal: number) {
  const header = [
    "source",
    "amount_usd_m",
    "previous_usd_m",
    "share_pct",
    "change_pct",
  ]
  const row = (name: string, amount: number, previous: number, share: number) =>
    [
      name,
      amount.toFixed(1),
      previous.toFixed(1),
      share,
      previous > 0 ? ((amount / previous - 1) * 100).toFixed(1) : "",
    ].join(",")
  return [
    header.join(","),
    ...slices.map((slice) =>
      row(slice.name, slice.amount, slice.previous, slice.share)
    ),
    row("Total", total, previousTotal, 100),
  ].join("\n")
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Summary copied", {
      icon: TOAST_SUCCESS_ICON,
      description: text,
    })
  } catch {
    toast.error("Copy failed", {
      icon: TOAST_ERROR_ICON,
      description: "The browser blocked clipboard access.",
    })
  }
}

function InfoTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="About Capital Inflows"
            className="text-muted-foreground -my-1"
          />
        }
      >
        {UI_ICONS.info}
      </TooltipTrigger>
      <TooltipContent side="top">
        Settled capital received from tracked sources.
      </TooltipContent>
    </Tooltip>
  )
}

/** The tracked sources on one shared grid, so amounts, shares and changes
 *  line up across rows. Narrow, the share leaves for the ring and tooltip. */
function SourceLegend({ slices }: { slices: Slice[] }) {
  const sources = slices.filter((slice) => slice.key !== "rest")
  return (
    <ul
      aria-label="Inflows by source"
      className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 divide-y @max-sm:grid-cols-[minmax(0,1fr)_auto_auto]"
    >
      {sources.map((slice) => (
        <li
          key={slice.key}
          className="col-span-full grid h-11 grid-cols-subgrid items-center"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <SliceDot slice={slice.key} />
            <span className={cn("min-w-0 text-sm font-medium", CAP_TRUNCATE)}>
              {slice.name}
            </span>
          </span>
          <span
            className={cn("text-end text-sm font-medium tabular-nums", CAP_BOX)}
          >
            {formatMillions(slice.amount)}
          </span>
          <span
            className={cn(
              "text-muted-foreground w-8 text-end text-xs tabular-nums @max-sm:hidden",
              CAP_BOX
            )}
          >
            {slice.share}%
          </span>
          <span className="flex justify-end">
            <ChangeBadge change={changeOf(slice.amount, slice.previous)} />
          </span>
        </li>
      ))}
    </ul>
  )
}

const DEMO_STATES = ["empty", "loading", "error"] as const

export function Chart() {
  const [periodKey, setPeriodKey] = useState<PeriodKey>(DEFAULT_PERIOD)
  const demo = useDemoState(DEMO_STATES)
  const [recovered, setRecovered] = useState(false)
  // Empty is this week only, so the month is the way on; an error holds
  // until Retry, and loading holds for as long as the demo asks.
  const state =
    demo === "empty"
      ? periodKey === "week"
        ? "empty"
        : null
      : recovered
        ? null
        : demo
  const status =
    state === "loading"
      ? { dot: "bg-muted-foreground/40", text: "Updating" }
      : state === "error"
        ? { dot: "bg-destructive", text: "Update failed" }
        : { dot: "bg-success", text: "Updated 2 min ago" }
  const period = periodOf(periodKey)
  const { total, previousTotal } = INFLOWS[periodKey]
  const slices = slicesOf(periodKey)
  const tracked =
    100 - (slices.find((slice) => slice.key === "rest")?.share ?? 0)
  const change = changeOf(total, previousTotal)

  const summary = [
    `Capital inflows, ${period.caption}: ${formatMillions(total)}`,
    change === null
      ? "with nothing in the period before."
      : `${formatChange(change)} on ${period.previous} (${formatMillions(previousTotal)}).`,
    slices
      .map(
        (slice) =>
          `${slice.name} ${formatMillions(slice.amount)} (${slice.share}%)`
      )
      .join(", ") + ".",
  ].join(" ")

  const actions: CardActions = {
    exportCsv: () => {
      const name = `capital-inflows-${periodKey}.csv`
      download(name, csvOf(slices, total, previousTotal), "text/csv")
      toast.success("Inflows exported", {
        icon: TOAST_SUCCESS_ICON,
        description: `${name}, ${slices.length} sources and the total.`,
      })
    },
    copySummary: () => void copyText(summary),
    resetView: () => setPeriodKey(DEFAULT_PERIOD),
  }

  return (
    <TooltipProvider delay={150}>
      <Frame
        stacked
        spacing="default"
        className="@container w-full max-w-xl min-w-0"
      >
        <FrameHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-px">
            <span className="flex h-5 min-w-0 items-center gap-1">
              <FrameTitle className={CAP_TRUNCATE}>Capital Inflows</FrameTitle>
              <InfoTooltip />
            </span>
            <FrameDescription>All sources, {period.caption}</FrameDescription>
          </div>
          <CardToolbar
            period={periodKey}
            onPeriodChange={setPeriodKey}
            canExport={state === null}
            canReset={periodKey !== DEFAULT_PERIOD}
            actions={actions}
          />
        </FrameHeader>

        <FramePanel className="flex flex-col gap-6">
          {state === "loading" ? (
            <InflowsSkeleton />
          ) : state === "error" ? (
            <InflowsError onRetry={() => setRecovered(true)} />
          ) : state === "empty" ? (
            <InflowsEmpty onViewMonth={() => setPeriodKey("month")} />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <span className="text-muted-foreground flex h-5 items-center text-sm">
                  <span className={CAP_BOX}>Total inflows</span>
                </span>
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                  <span
                    className={cn(
                      "text-3xl font-semibold tracking-tight tabular-nums",
                      CAP_BOX
                    )}
                  >
                    {formatMillions(total)}
                  </span>
                  <ChangeBadge change={change} />
                  <span className="text-muted-foreground flex h-4 min-w-0 items-center text-xs tabular-nums">
                    <span className={CAP_TRUNCATE}>
                      vs {formatMillions(previousTotal)} {period.previous}
                    </span>
                  </span>
                </span>
              </div>

              {/* Side by side once the legend has room beside the ring */}
              <div className="grid gap-6 @lg:grid-cols-[10rem_minmax(0,1fr)] @lg:items-center">
                <InflowDonut
                  slices={slices}
                  center={`${tracked}%`}
                  label={`Capital inflows by source, ${period.caption}: ${slices
                    .map((slice) => `${slice.name} ${slice.share}%`)
                    .join(", ")}`}
                />
                <SourceLegend slices={slices} />
              </div>
            </>
          )}
        </FramePanel>

        <FrameFooter className="text-muted-foreground flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
          <span className="flex h-4 items-center gap-2">
            <span
              aria-hidden="true"
              className={cn("size-1.5 shrink-0 rounded-full", status.dot)}
            />
            <span className={CAP_BOX}>{status.text}</span>
            <DotSeparator />
            <span className={CAP_BOX}>Settled transfers</span>
          </span>
          <span className="flex h-4 items-center">
            <span className={CAP_BOX}>USD, millions</span>
          </span>
        </FrameFooter>
      </Frame>
    </TooltipProvider>
  )
}