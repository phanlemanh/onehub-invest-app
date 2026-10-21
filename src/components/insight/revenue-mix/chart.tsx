"use client"

/**
 * Cơ cấu doanh thu theo loại phòng — chuyển thể từ @reui/chart-13: tổng ở trên,
 * vòng donut ba loại lớn nhất + phần còn lại, bảng loại phòng với tỉ trọng.
 * Khác bản gốc: một cửa sổ duy nhất (không đổi kỳ), cột "thay đổi" thành số
 * listing vì chưa có kỳ trước.
 */
import { useMemo } from "react"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import { Badge } from "@/components/reui/badge"
import { cn } from "cn"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { fmtInt, fmtMoneyCompact } from "@/lib/format"

import { MoreMenu, type CardActions } from "./card-menu"
import { TOAST_ERROR_ICON, TOAST_SUCCESS_ICON, UI_ICONS } from "./icons"
import { MixDonut } from "./mix-donut"
import { CAP_BOX, CAP_TRUNCATE, DotSeparator, SliceDot } from "./value-faces"
import { slicesOf, type MixInput, type Slice } from "./view"

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

function csvOf(slices: Slice[], total: number) {
  const header = ["loai_phong", "doanh_thu", "listing", "ti_trong_pct"]
  return [
    header.join(","),
    ...slices.map((slice) =>
      [slice.name, Math.round(slice.amount), slice.listings, slice.share].join(",")
    ),
    ["Tổng", Math.round(total), "", 100].join(","),
  ].join("\n")
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Đã sao chép tóm tắt", {
      icon: TOAST_SUCCESS_ICON,
      description: text,
    })
  } catch {
    toast.error("Không sao chép được", {
      icon: TOAST_ERROR_ICON,
      description: "Trình duyệt chặn quyền truy cập clipboard.",
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
            aria-label="Về cơ cấu doanh thu"
            className="text-muted-foreground -my-1"
          />
        }
      >
        {UI_ICONS.info}
      </TooltipTrigger>
      <TooltipContent side="top">
        Tổng giá niêm yết các đêm đã đặt, chia theo loại phòng Airbnb.
      </TooltipContent>
    </Tooltip>
  )
}

/** The room types on one shared grid, so amounts and shares line up. */
function SliceLegend({
  slices,
  format,
}: {
  slices: Slice[]
  format: (v: number) => string
}) {
  return (
    <ul
      aria-label="Doanh thu theo loại phòng"
      className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 divide-y @max-sm:grid-cols-[minmax(0,1fr)_auto_auto]"
    >
      {slices.map((slice) => (
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
            {format(slice.amount)}
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
            <Badge variant="outline" className="tabular-nums">
              <span className={CAP_BOX}>{fmtInt(slice.listings)} listing</span>
            </Badge>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function RevenueMixChart({
  rows,
  currency,
  window,
}: {
  rows: MixInput[]
  currency: string
  /** Mô tả cửa sổ dữ liệu, vd "12 tháng tới". */
  window: string
}) {
  const format = (v: number) => fmtMoneyCompact(v, currency)
  const { slices, total } = useMemo(() => slicesOf(rows), [rows])
  const listings = slices.reduce((sum, slice) => sum + slice.listings, 0)
  const empty = total <= 0

  const summary = [
    `Doanh thu ${window}: ${format(total)}.`,
    slices.map((s) => `${s.name} ${format(s.amount)} (${s.share}%)`).join(", ") + ".",
  ].join(" ")

  const actions: CardActions = {
    exportCsv: () => {
      const name = "co-cau-doanh-thu.csv"
      download(name, csvOf(slices, total), "text/csv")
      toast.success("Đã tải CSV", {
        icon: TOAST_SUCCESS_ICON,
        description: `${name}, ${slices.length} loại phòng và tổng.`,
      })
    },
    copySummary: () => void copyText(summary),
  }

  return (
    <Frame stacked spacing="default" className="@container w-full min-w-0">
      <FrameHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-px">
          <span className="flex h-5 min-w-0 items-center gap-1">
            <FrameTitle role="heading" aria-level={3} className={CAP_TRUNCATE}>
              Cơ cấu doanh thu
            </FrameTitle>
            <InfoTooltip />
          </span>
          <FrameDescription>Theo loại phòng, {window}</FrameDescription>
        </div>
        <MoreMenu actions={actions} canExport={!empty} />
      </FrameHeader>

      <FramePanel className="flex flex-col gap-6">
        {empty ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Chưa có doanh thu</EmptyTitle>
              <EmptyDescription>
                Khu vực này chưa có đêm nào được đặt trong cửa sổ dữ liệu.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <span className="text-muted-foreground flex h-5 items-center text-sm">
                <span className={CAP_BOX}>Tổng doanh thu</span>
              </span>
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <span
                  className={cn(
                    "text-3xl font-semibold tracking-tight tabular-nums",
                    CAP_BOX
                  )}
                >
                  {format(total)}
                </span>
              </span>
            </div>

            <div className="grid gap-6 @lg:grid-cols-[10rem_minmax(0,1fr)] @lg:items-center">
              <MixDonut
                slices={slices}
                center={fmtInt(listings)}
                centerLabel="listing"
                format={format}
                label={`Doanh thu theo loại phòng: ${slices
                  .map((slice) => `${slice.name} ${slice.share}%`)
                  .join(", ")}`}
              />
              <SliceLegend slices={slices} format={format} />
            </div>
          </>
        )}
      </FramePanel>

      <FrameFooter className="text-muted-foreground flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <span className="flex h-4 items-center gap-2">
          <span className={CAP_BOX}>Giá niêm yết</span>
          <DotSeparator />
          <span className={CAP_BOX}>Đêm đã đặt</span>
        </span>
        <span className="flex h-4 items-center">
          <span className={CAP_BOX}>{currency}</span>
        </span>
      </FrameFooter>
    </Frame>
  )
}
