"use client"

import type { ReactNode } from "react"
import { Badge, type BadgeProps } from "@/components/reui/badge"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  ACTIVITY_CELLS,
  ACTIVITY_MONTHS,
  ACTIVITY_SUMMARY,
  ACTIVITY_WEEKDAYS,
  type ActivityCell,
  type ActivityIntensity,
} from "./data"

const activityTone: Record<ActivityIntensity, string> = {
  0: "bg-muted",
  1: "bg-primary/20",
  2: "bg-primary/50",
  3: "bg-primary",
}

const activityBadgeVariant: Record<
  Exclude<ActivityIntensity, 0>,
  BadgeProps["variant"]
> = {
  1: "warning",
  2: "default",
  3: "success",
}

function HeatmapScrollArea({ children }: { children: ReactNode }) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className="relative min-w-0 pb-2"
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-lg transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        <ScrollAreaPrimitive.Content data-slot="scroll-area-content">
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        data-slot="scroll-area-scrollbar"
        data-orientation="horizontal"
        orientation="horizontal"
        className="flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent"
      >
        <ScrollAreaPrimitive.Thumb
          data-slot="scroll-area-thumb"
          className="bg-foreground/15 relative flex-1 rounded-full"
        />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

interface ActivitySummaryItemProps {
  label: string
  description: string
  badgeVariant?: BadgeProps["variant"]
  syncing?: boolean
}

function ActivitySummaryItem({
  label,
  description,
  badgeVariant,
  syncing,
}: ActivitySummaryItemProps) {
  const content = badgeVariant ? (
    <Badge variant={badgeVariant}>
      {syncing ? <Spinner className="size-3" aria-hidden="true" /> : null}
      {label}
    </Badge>
  ) : (
    <>
      {syncing ? <Spinner className="size-3" aria-hidden="true" /> : null}
      <span>{label}</span>
    </>
  )

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-1.5 rounded-sm align-middle text-sm leading-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={description}
          />
        }
      >
        {content}
      </TooltipTrigger>
      <TooltipContent className="max-w-64 p-3">
        <p className="text-xs opacity-80">{description}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function ActivityCellMark({ cell }: { cell: ActivityCell }) {
  const cellClassName = `${activityTone[cell.intensity]}   block size-full rounded-md`

  if (cell.intensity === 0) {
    return (
      <span
        className="bg-muted block size-full rounded-md"
        aria-hidden="true"
      />
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex size-full rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={`${cell.weekday}, ${cell.dateLabel}: ${cell.eventCount} events`}
          />
        }
      >
        <span className={cellClassName} aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent className="text-background w-64 p-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-background/70 text-[10px] leading-none font-medium tracking-wide uppercase">
                {cell.dateLabel}
              </p>
              <p className="mt-1 text-sm leading-tight font-semibold">
                {cell.weekday}
              </p>
            </div>
            <Badge variant={activityBadgeVariant[cell.intensity]}>
              {cell.statusLabel}
            </Badge>
          </div>

          <div className="border-background/15 border-y py-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg leading-none font-semibold">
                {cell.eventCount}
              </span>
              <span className="text-background/75 text-xs">
                events recorded
              </span>
            </div>
            <p className="text-background/80 mt-1 text-xs leading-relaxed">
              {cell.description}
            </p>
          </div>

          <dl className="grid gap-1.5 text-xs">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-background/65">Source</dt>
              <dd className="font-medium">Audit log</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-background/65">Stream</dt>
              <dd className="font-medium">Identity events</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-background/65">Sync</dt>
              <dd>
                <Badge variant="success">{cell.syncedAt}</Badge>
              </dd>
            </div>
          </dl>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export function ActivityHeatmap() {
  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <ActivitySummaryItem
          label={ACTIVITY_SUMMARY.activeDays}
          description={ACTIVITY_SUMMARY.activeDescription}
          badgeVariant="outline"
        />
        <ActivitySummaryItem
          label={ACTIVITY_SUMMARY.busiestDate}
          description={`${ACTIVITY_SUMMARY.busiestDay}: ${ACTIVITY_SUMMARY.busiestDescription}`}
          badgeVariant="outline"
        />
        <ActivitySummaryItem
          label="Syncing"
          description={ACTIVITY_SUMMARY.syncDescription}
          badgeVariant="warning-light"
          syncing
        />
        <ActivitySummaryItem
          label={ACTIVITY_SUMMARY.updatedAt}
          description="Last completed profile activity sync from audit-log events."
          badgeVariant="success-light"
        />
      </div>

      {/* Heatmap */}
      <div className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-1.5">
        <div className="text-muted-foreground grid grid-rows-[repeat(7,0.75rem)] gap-1 text-[9px] leading-none">
          {ACTIVITY_WEEKDAYS.map((day, index) => (
            <span
              key={`${day}-${index}`}
              className="grid size-3 place-items-center"
            >
              {day}
            </span>
          ))}
        </div>

        <HeatmapScrollArea>
          <div className="flex w-max min-w-[50rem] flex-col gap-3">
            <div
              className="grid auto-cols-[0.75rem] grid-flow-col grid-rows-[repeat(7,0.75rem)] gap-1"
              aria-label="Profile activity heatmap"
            >
              {ACTIVITY_CELLS.map((cell) => (
                <ActivityCellMark key={cell.id} cell={cell} />
              ))}
            </div>

            <div className="text-muted-foreground grid grid-cols-12 text-xs leading-none">
              {ACTIVITY_MONTHS.map((month, index) => (
                <span
                  key={month}
                  className={
                    index === ACTIVITY_MONTHS.length - 1
                      ? "text-end"
                      : undefined
                  }
                >
                  {month}
                </span>
              ))}
            </div>
          </div>
        </HeatmapScrollArea>
      </div>
    </div>
  )
}