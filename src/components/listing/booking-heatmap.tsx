"use client"

import type { ReactNode } from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { cn } from "cn"

import { Badge, type BadgeProps } from "@/components/reui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { fmtMoney, fmtPct } from "@/lib/format"

/**
 * Lịch đặt phòng 12 tháng — chuyển thể activity heatmap của @reui/form-5: mỗi
 * cột một tuần (T2→CN), mỗi ô một đêm. Ba trạng thái thay cho 4 mức cường độ.
 */
type Night = { night: string; available: boolean | null; price: number | null }
type Cell = Night & { weekday: number } // 0 = T2

const WEEKDAYS = ["T2", "", "T4", "", "T6", "", "CN"]
const WEEKDAY_LONG = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

const TONE = {
  booked: "bg-primary",
  open: "bg-muted",
  unknown: "bg-muted/40",
} as const

const stateOf = (n: Night) =>
  n.available === false ? "booked" : n.available === true ? "open" : "unknown"

function HeatmapScrollArea({ children }: { children: ReactNode }) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className="relative min-w-0 pb-2">
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
        className="flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent"
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

function SummaryItem({
  label,
  description,
  variant = "outline",
}: {
  label: string
  description: string
  variant?: BadgeProps["variant"]
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center rounded-sm align-middle focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={description}
          />
        }
      >
        <Badge variant={variant}>{label}</Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 p-3">
        <p className="text-xs opacity-80">{description}</p>
      </TooltipContent>
    </Tooltip>
  )
}

const dateLabel = (iso: string) => {
  const [y, m, d] = iso.split("-")
  return `${Number(d)}/${Number(m)}/${y}`
}

function NightCell({ cell, currency }: { cell: Cell; currency: string }) {
  const state = stateOf(cell)
  const status =
    state === "booked" ? "Đã có khách đặt" : state === "open" ? "Còn trống" : "Chưa rõ"
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex size-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={`${WEEKDAY_LONG[cell.weekday]}, ${dateLabel(cell.night)}: ${status}`}
          />
        }
      >
        <span className={cn("block size-full rounded-sm", TONE[state])} aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent className="p-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold">
            {WEEKDAY_LONG[cell.weekday]}, {dateLabel(cell.night)}
          </span>
          <span className="text-xs opacity-80">
            {status}
            {cell.price ? ` · ${fmtMoney(cell.price, currency)}` : ""}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export function BookingHeatmap({
  nights,
  currency,
  lastSeen,
}: {
  nights: Night[]
  currency: string
  lastSeen: string | null
}) {
  if (nights.length === 0) {
    return <p className="text-muted-foreground text-sm">Chưa có lịch cho listing này.</p>
  }

  // Thứ của đêm đầu (0 = T2) → số ô đệm trước để cột đầu bắt đầu từ T2.
  const weekdayOf = (iso: string) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7
  const lead = weekdayOf(nights[0].night)
  const cells: (Cell | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...nights.map((n) => ({ ...n, weekday: weekdayOf(n.night) })),
  ]
  const weeks = Math.ceil(cells.length / 7)

  // Nhãn tháng tại cột tuần chứa ngày 1 của tháng.
  const months = nights
    .map((n, i) => ({ n, i }))
    .filter(({ n, i }) => i === 0 || n.night.endsWith("-01"))
    .map(({ n, i }) => ({
      label: `T${Number(n.night.slice(5, 7))}`,
      column: Math.floor((i + lead) / 7) + 1,
    }))

  // Tóm tắt (mẫu ActivitySummary của block).
  const booked = nights.filter((n) => n.available === false).length
  const byMonth = new Map<string, { booked: number; total: number }>()
  for (const n of nights) {
    const key = n.night.slice(0, 7)
    const m = byMonth.get(key) ?? { booked: 0, total: 0 }
    m.total += 1
    if (n.available === false) m.booked += 1
    byMonth.set(key, m)
  }
  const busiest = [...byMonth.entries()].sort(
    (a, b) => b[1].booked / b[1].total - a[1].booked / a[1].total
  )[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SummaryItem
          label={`${booked}/${nights.length} đêm đã đặt`}
          description={`Công suất ${fmtPct(booked / nights.length)} trong ${nights.length} đêm tới.`}
        />
        {busiest && (
          <SummaryItem
            label={`Đông nhất: T${Number(busiest[0].slice(5))}/${busiest[0].slice(0, 4)}`}
            description={`${fmtPct(busiest[1].booked / busiest[1].total)} số đêm của tháng này đã có khách.`}
          />
        )}
        {lastSeen && (
          <SummaryItem
            label={`Quét ${dateLabel(lastSeen)}`}
            description="Lần gần nhất collector thấy lịch của listing này trên Airbnb."
            variant="success-light"
          />
        )}
      </div>

      <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-1.5">
        <div className="text-muted-foreground grid grid-rows-[repeat(7,0.75rem)] gap-1 text-[9px] leading-none">
          {WEEKDAYS.map((day, index) => (
            <span key={index} className="grid h-3 place-items-center">
              {day}
            </span>
          ))}
        </div>

        <HeatmapScrollArea>
          <div className="flex w-max flex-col gap-2">
            <div
              className="grid auto-cols-[0.75rem] grid-flow-col grid-rows-[repeat(7,0.75rem)] gap-1"
              aria-label="Lịch đặt phòng theo ngày"
            >
              {cells.map((cell, index) =>
                cell ? (
                  <NightCell key={cell.night} cell={cell} currency={currency} />
                ) : (
                  <span key={`pad-${index}`} aria-hidden="true" />
                )
              )}
            </div>
            <div
              className="text-muted-foreground grid auto-cols-[0.75rem] grid-flow-col gap-1 text-xs leading-none"
              style={{ gridTemplateColumns: `repeat(${weeks}, 0.75rem)` }}
            >
              {months.map((m) => (
                <span
                  key={`${m.label}-${m.column}`}
                  className="whitespace-nowrap"
                  style={{ gridColumnStart: m.column }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </HeatmapScrollArea>
      </div>

      <ul aria-label="Chú giải lịch" className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cn("size-2.5 rounded-sm", TONE.booked)} />
          Đã đặt
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cn("size-2.5 rounded-sm", TONE.open)} />
          Còn trống
        </li>
      </ul>
    </div>
  )
}
