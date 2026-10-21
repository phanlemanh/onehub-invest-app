"use client"

import { useMemo, useState } from "react"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/reui/badge"
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { fmtInt } from "@/lib/format"
import type { ListingCardRow } from "@/lib/queries"
import { ListingCard } from "./listing-card"
import { ListingsMap } from "./listings-map"

type SortKey = "revenue" | "occupancy" | "price-desc" | "price-asc"

const SORTS: { value: SortKey; label: string }[] = [
  { value: "revenue", label: "Doanh thu" },
  { value: "occupancy", label: "Công suất" },
  { value: "price-desc", label: "Giá cao → thấp" },
  { value: "price-asc", label: "Giá thấp → cao" },
]

const COMPARE: Record<SortKey, (a: ListingCardRow, b: ListingCardRow) => number> = {
  revenue: (a, b) => b.revenue - a.revenue || b.booked - a.booked,
  occupancy: (a, b) => (b.occupancy ?? -1) - (a.occupancy ?? -1),
  "price-desc": (a, b) => (b.priceListed ?? -1) - (a.priceListed ?? -1),
  "price-asc": (a, b) =>
    (a.priceListed ?? Number.POSITIVE_INFINITY) - (b.priceListed ?? Number.POSITIVE_INFINITY),
}

const PAGE = 24
const ALL_AREAS = "__all__"

// Pressed lifts to the card surface (chart-6 toolbar pattern).
const TOGGLE_ITEM =
  "text-muted-foreground data-pressed:bg-card dark:data-pressed:bg-muted data-pressed:text-foreground"

/**
 * Duyệt listing (IA §3.2, AirDNA "Short-term Rentals"): lưới thẻ | bản đồ nhãn
 * giá. Kéo/zoom bản đồ → lưới lọc theo vùng đang xem; rê chuột thẻ → nhãn sáng.
 */
export function ListingsExplorer({
  listings,
  currency,
}: {
  listings: ListingCardRow[]
  currency: string
}) {
  const [sort, setSort] = useState<SortKey>("revenue")
  const [area, setArea] = useState<string>(ALL_AREAS)
  const [visible, setVisible] = useState<Set<string> | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)
  const [view, setView] = useState<"list" | "map">("list")
  const [resetKey, setResetKey] = useState(0)

  const areas = useMemo(
    () =>
      [...new Set(listings.map((l) => l.areaName).filter((a): a is string => Boolean(a)))].sort(
        (a, b) => a.localeCompare(b, "vi")
      ),
    [listings]
  )
  // Bản đồ hiện mọi listing của phường đã chọn; lưới còn lọc thêm theo khung nhìn.
  const inArea = useMemo(
    () => (area === ALL_AREAS ? listings : listings.filter((l) => l.areaName === area)),
    [listings, area]
  )
  const rows = useMemo(
    () => (visible ? inArea.filter((l) => visible.has(l.id)) : inArea).sort(COMPARE[sort]),
    [inArea, visible, sort]
  )

  function clearViewport() {
    setVisible(null)
    setResetKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={area}
          items={[
            { value: ALL_AREAS, label: "Tất cả phường" },
            ...areas.map((a) => ({ value: a, label: a })),
          ]}
          onValueChange={(value) => {
            setArea(String(value ?? ALL_AREAS))
            setVisible(null)
            setShown(PAGE)
          }}
        >
          <SelectTrigger aria-label="Phường" className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value={ALL_AREAS}>Tất cả phường</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          items={SORTS}
          onValueChange={(value) => value && setSort(value as SortKey)}
        >
          <SelectTrigger aria-label="Sắp xếp" className="min-w-44">
            <span className="text-muted-foreground">Xếp theo</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {visible && (
          <Badge variant="info-light" className="gap-1.5">
            Đang lọc theo vùng bản đồ
            <Button
              variant="ghost"
              size="icon-xs"
              className="-me-1"
              aria-label="Bỏ lọc theo vùng bản đồ"
              onClick={clearViewport}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </Badge>
        )}

        <ToggleGroup
          multiple={false}
          value={[view]}
          onValueChange={(value) => value[0] && setView(value[0] as "list" | "map")}
          variant="outline"
          spacing={0}
          aria-label="Chế độ xem"
          className="ml-auto lg:hidden"
        >
          <ToggleGroupItem value="list" className={TOGGLE_ITEM}>
            Danh sách
          </ToggleGroupItem>
          <ToggleGroupItem value="map" className={TOGGLE_ITEM}>
            Bản đồ
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className={cn("flex min-w-0 flex-col gap-4", view === "map" && "max-lg:hidden")}>
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {fmtInt(rows.length)} listing
            {visible ? " trong vùng bản đồ" : area === ALL_AREAS ? "" : ` ở ${area}`}
          </p>
          {rows.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>Không có listing trong vùng này</EmptyTitle>
                <EmptyDescription>Kéo bản đồ sang chỗ khác, hoặc bỏ lọc theo vùng.</EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" size="sm" onClick={clearViewport}>
                Bỏ lọc
              </Button>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {rows.slice(0, shown).map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  currency={currency}
                  active={listing.id === activeId}
                  onHover={setActiveId}
                />
              ))}
            </div>
          )}
          {rows.length > shown && (
            <Button variant="outline" className="self-center" onClick={() => setShown((n) => n + PAGE)}>
              Xem thêm {fmtInt(Math.min(PAGE, rows.length - shown))} listing
            </Button>
          )}
        </div>

        <div className={cn("min-w-0 lg:sticky lg:top-4", view === "list" && "max-lg:hidden")}>
          <Frame spacing="default" className="w-full min-w-0">
            <FrameHeader>
              <FrameTitle role="heading" aria-level={3}>
                Bản đồ giá
              </FrameTitle>
              <FrameDescription>
                Nhãn = giá niêm yết một đêm · kéo hoặc zoom để lọc danh sách
              </FrameDescription>
            </FrameHeader>
            <FramePanel className="h-[60svh] overflow-hidden p-0 lg:h-[calc(100svh-12rem)]">
              <ListingsMap
                listings={inArea}
                activeId={activeId}
                onHover={setActiveId}
                onViewportChange={(ids) => {
                  setVisible(ids)
                  setShown(PAGE)
                }}
                resetKey={resetKey}
              />
            </FramePanel>
          </Frame>
        </div>
      </div>
    </div>
  )
}
