"use client"

import { Fragment, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { ArrowRightIcon, CircleHelpIcon, InfoIcon, MapPinIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/reui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SearchEntry } from "@/lib/queries"
import { AddAreaCommand } from "./add-area-command"
import { COMPARE_MAX, type CompareArea, type CompareGroup, type CompareRow } from "./compare-types"

function RowHint({ label, hint }: { label: string; hint: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={`Về ${label}`}
        className="text-muted-foreground/70 hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex size-4 shrink-0 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      >
        <CircleHelpIcon className="size-3.5" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-pretty">{hint}</TooltipContent>
    </Tooltip>
  )
}

/** Ô đầu cột — ProductHeaderCell của comparison-1, ảnh thay bằng ô RevPAR. */
function AreaHeaderCell({ area, onRemove }: { area: CompareArea; onRemove: (id: string) => void }) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-4 p-4">
      <div className="flex items-start justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground -mt-1 -mr-1"
          aria-label={`Bỏ ${area.name} khỏi so sánh`}
          onClick={() => onRemove(area.id)}
        >
          <XIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="bg-muted flex h-20 w-full flex-col items-start justify-end gap-0.5 rounded-md p-3">
        <span className="text-muted-foreground text-xs">RevPAR</span>
        <span className="text-xl font-semibold tracking-tight tabular-nums">{area.headline}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs font-medium">
          <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{area.parentName ?? "Thị trường"}</span>
        </span>
        <Link
          href={area.href}
          prefetch={false}
          className="text-foreground hover:text-primary block min-w-0 truncate text-sm font-semibold underline-offset-2 transition-colors hover:underline"
        >
          {area.name}
        </Link>
      </div>
      <Button size="sm" className="mt-auto w-full" nativeButton={false} render={<Link href={area.href} prefetch={false} />}>
        Xem Insight
        <ArrowRightIcon data-icon="inline-end" className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}

/** Ô tốt nhất của một hàng (chỉ khi ≥ 2 khu vực có số). */
function bestOf(areas: CompareArea[], row: CompareRow) {
  if (!row.better) return null
  const vals = areas
    .map((a) => ({ id: a.id, raw: a.values[row.id]?.raw ?? null }))
    .filter((v): v is { id: string; raw: number } => v.raw !== null)
  if (vals.length < 2) return null
  return vals.reduce((a, b) => ((row.better === "high" ? b.raw > a.raw : b.raw < a.raw) ? b : a)).id
}

/**
 * So sánh khu vực — chuyển thể Comparison của @reui/comparison-1: cột nhãn dính
 * trái, nhóm hàng, cột xoá được, cuộn ngang. Danh sách cột nằm trên URL.
 */
export function AreaComparison({
  areas,
  groups,
  entries,
}: {
  areas: CompareArea[]
  groups: CompareGroup[]
  entries: SearchEntry[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const ids = areas.map((a) => a.id)

  const go = (next: string[]) =>
    startTransition(() =>
      router.replace(next.length ? `${pathname}?areas=${next.join(",")}` : pathname, { scroll: false })
    )

  return (
    <TooltipProvider delay={150}>
      <section className={cn("flex flex-col", pending && "opacity-60 transition-opacity")} aria-labelledby="compare-heading">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 id="compare-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              So sánh khu vực
            </h1>
            <p className="text-muted-foreground mt-1 text-sm leading-5">
              Đặt cạnh nhau tối đa {COMPARE_MAX} thị trường hoặc phường.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">
              {areas.length}/{COMPARE_MAX} khu vực
            </span>
            <AddAreaCommand
              entries={entries}
              exclude={ids}
              disabled={areas.length >= COMPARE_MAX}
              onAdd={(id) => go([...ids, id])}
            />
          </div>
        </header>

        {areas.length === 0 ? (
          <Empty className="border-border bg-muted/30 mt-8 border border-dashed">
            <EmptyHeader>
              <EmptyTitle>Chưa chọn khu vực nào</EmptyTitle>
              <EmptyDescription>
                Bấm “Thêm khu vực”, hoặc mở một thị trường/phường và bấm “So sánh”.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/vn" />}>
                Xem thị trường Việt Nam
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="border-border mt-8 overflow-hidden rounded-md border">
            <ScrollAreaPrimitive.Root data-slot="scroll-area" className="relative">
              <ScrollAreaPrimitive.Viewport
                data-slot="scroll-area-viewport"
                className="size-full overflow-x-auto overflow-y-hidden rounded-lg"
              >
                <table className="w-full table-fixed border-collapse text-sm">
                  <colgroup>
                    <col className="w-[12rem] sm:w-[14rem]" />
                    {areas.map((a) => (
                      <col key={a.id} className="w-[16rem]" />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="border-border border-b">
                      <th
                        scope="col"
                        className="bg-muted after:bg-border sticky left-0 z-20 p-4 text-left align-bottom after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:content-['']"
                      >
                        <span className="sr-only">Khu vực</span>
                      </th>
                      {areas.map((area, index) => (
                        <th key={area.id} scope="col" className={cn("border-border text-left align-top", index > 0 && "border-l")}>
                          <AreaHeaderCell area={area} onRemove={(id) => go(ids.filter((x) => x !== id))} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group, groupIndex) => (
                      <Fragment key={group.id}>
                        <tr>
                          <th
                            scope="colgroup"
                            colSpan={areas.length + 1}
                            className={cn(
                              "bg-muted text-muted-foreground border-border border-b p-0 text-left text-xs font-semibold tracking-wide uppercase",
                              groupIndex > 0 && "border-t"
                            )}
                          >
                            <span className="sticky left-0 inline-flex items-center gap-2 px-4 py-2">
                              {group.label}
                              {group.badge && (
                                <Badge variant="warning-light" size="sm" className="normal-case">
                                  {group.badge}
                                </Badge>
                              )}
                            </span>
                          </th>
                        </tr>
                        {group.rows.map((row) => {
                          const best = bestOf(areas, row)
                          return (
                            <tr key={row.id} className="border-border border-b last:border-b-0">
                              <th
                                scope="row"
                                className="bg-background after:bg-border sticky left-0 z-20 px-4 py-2 text-left align-middle text-sm font-medium after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:content-['']"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <span>{row.label}</span>
                                  {row.hint ? <RowHint label={row.label} hint={row.hint} /> : null}
                                </span>
                              </th>
                              {areas.map((area, index) => {
                                const value = area.values[row.id]
                                return (
                                  <td key={area.id} className={cn("border-border px-4 py-2 align-middle", index > 0 && "border-l")}>
                                    {value ? (
                                      <span className={cn("inline-flex items-center gap-1.5 text-sm tabular-nums", best === area.id && "text-success font-semibold")}>
                                        {value.text}
                                        {best === area.id && <span className="sr-only">(tốt nhất)</span>}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">—</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </ScrollAreaPrimitive.Viewport>
              <ScrollBar orientation="horizontal" className="ml-[12rem] sm:ml-[14rem]" />
              <ScrollAreaPrimitive.Corner />
            </ScrollAreaPrimitive.Root>
          </div>
        )}

        <p className="text-muted-foreground mt-6 flex items-start gap-2 text-xs">
          <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Số tự thu trên lịch đặt các tháng tới, bình quân theo đêm. Ô xanh là khu vực tốt nhất của hàng.
            Giá bán và thuê dài hạn là dữ liệu mô phỏng.
          </span>
        </p>
      </section>
    </TooltipProvider>
  )
}
