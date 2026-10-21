"use client"

import { useState } from "react"
import Link from "next/link"
import { BookmarkIcon, FilterIcon, GitCompareIcon } from "lucide-react"

import { Badge } from "@/components/reui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SavedItemCard, type SavedArea } from "./saved-item"

type Filter = "all" | "market" | "submarket"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "market", label: "Thị trường" },
  { value: "submarket", label: "Phường" },
]

/** So sánh tối đa 4 khu vực một lúc (comparison-1 có 4 cột). */
const COMPARE_MAX = 4

/**
 * Đã lưu — chuyển thể Wishlist của @reui/wishlist-2: tiêu đề + badge đếm,
 * tab lọc có số, lưới thẻ, trạng thái trống. Tín hiệu giá/tồn kho thành loại
 * khu vực; "Add all to cart" thành "So sánh".
 */
export function SavedList({ areas, email }: { areas: SavedArea[]; email: string }) {
  const [filter, setFilter] = useState<Filter>("all")
  const counts: Record<Filter, number> = {
    all: areas.length,
    market: areas.filter((a) => a.regionType === "market").length,
    submarket: areas.filter((a) => a.regionType === "submarket").length,
  }
  const shown = filter === "all" ? areas : areas.filter((a) => a.regionType === filter)
  const compareIds = shown.slice(0, COMPARE_MAX).map((a) => a.id)

  return (
    <section aria-labelledby="saved-title" className="flex flex-col">
      <header className="mb-5 flex flex-col gap-3 sm:mb-7">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <h1 id="saved-title" className="text-foreground text-2xl leading-tight font-semibold tracking-tight sm:text-[1.75rem]">
                Đã lưu
              </h1>
              {areas.length > 0 && (
                <Badge variant="default" radius="full" className="tabular-nums" aria-label={`${areas.length} khu vực đã lưu`}>
                  {areas.length}
                </Badge>
              )}
            </div>
            {compareIds.length >= 2 && (
              <Button
                nativeButton={false}
                render={<Link href={`/so-sanh?areas=${compareIds.join(",")}`} />}
              >
                <GitCompareIcon data-icon="inline-start" aria-hidden="true" />
                So sánh {compareIds.length} khu vực
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">{email}</p>
        </div>
      </header>

      {areas.length > 0 && (
        <div className="mb-5 sm:mb-6">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
            <TabsList variant="line" className="h-10! w-full justify-start gap-1 border-b">
              {FILTERS.map((option) => {
                const count = counts[option.value]
                return (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    disabled={count === 0 && option.value !== "all"}
                    aria-label={`${option.label}, ${count} khu vực`}
                    className="group-data-horizontal/tabs:after:bottom-[-5px]! gap-2 px-3 py-1.5"
                  >
                    <span>{option.label}</span>
                    <span className="text-muted-foreground bg-muted inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums">
                      {count}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      )}

      {areas.length === 0 ? (
        <Empty className="min-h-[320px] justify-center border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookmarkIcon aria-hidden="true" className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Chưa lưu khu vực nào</EmptyTitle>
            <EmptyDescription>
              Mở một thị trường hoặc phường và bấm “Lưu” để theo dõi ở đây.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href="/vn" />}>
              Xem thị trường Việt Nam
            </Button>
          </EmptyContent>
        </Empty>
      ) : shown.length === 0 ? (
        <Empty className="min-h-[280px] justify-center py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FilterIcon aria-hidden="true" className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Không có khu vực nào ở mục này</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" onClick={() => setFilter("all")}>
              Xem tất cả
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ul role="list" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {shown.map((area) => (
            <li key={area.id} className="min-w-0">
              <SavedItemCard area={area} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
