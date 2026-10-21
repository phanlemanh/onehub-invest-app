"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "cn"

import { Badge } from "@/components/reui/badge"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import { InsightGrid, type InsightColumn } from "@/components/insight/insight-grid"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { fmtInt } from "@/lib/format"
import type { FinderRow } from "@/lib/queries"
import {
  BIN_SWATCH,
  binOf,
  cutsOf,
  FINDER_METRICS,
  formatCut,
  formatMetric,
  metricLabel,
  type FinderMetric,
} from "./bins"
import { ChoroplethMap } from "./choropleth-map"
import { MetricBarCell, TrendSparkline } from "./finder-cells"

export type FinderLevel = "market" | "submarket"

const NUM = { headerClassName: "text-end", cellClassName: "text-end tabular-nums" }

// Pressed lifts to the card surface (chart-6 toolbar pattern).
const TOGGLE_ITEM =
  "text-muted-foreground data-pressed:bg-card dark:data-pressed:bg-muted data-pressed:text-foreground"

/**
 * Cỡ mẫu tối thiểu để xếp hạng: một-hai listing cho số cực đoan (vd 1 listing,
 * công suất 100%) và chiếm đầu bảng. AirDNA cũng chỉ chấm market ≥ 15 listing.
 */
const MIN_LISTINGS = 5

const valueOf = (row: FinderRow, metric: FinderMetric) =>
  metric === "listings" ? row.listings : row[metric]

/**
 * Market Finder (IA §3.2): bảng xếp hạng 60% | bản đồ 40%, một bộ chọn chỉ số
 * điều khiển cả thanh trong bảng, màu bản đồ và chú giải (IA L4, L5).
 */
export function FinderView({
  rows,
  level,
  markets,
  market,
  initialMetric,
  initialView,
  currency,
}: {
  rows: FinderRow[]
  level: FinderLevel
  markets: { slug: string; name: string }[]
  /** Slug thị trường đang xem ở cấp phường. */
  market: string
  initialMetric: FinderMetric
  initialView: "list" | "map"
  currency: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [metric, setMetric] = useState<FinderMetric>(initialMetric)
  const [view, setView] = useState<"list" | "map">(initialView)
  const [sampled, setSampled] = useState(true)
  const ranked = useMemo(
    () => (sampled ? rows.filter((r) => r.listings >= MIN_LISTINGS) : rows),
    [rows, sampled]
  )
  const hiddenCount = rows.length - ranked.length

  /** Đổi cấp/thị trường cần dữ liệu mới từ server; đổi chỉ số thì không. */
  function navigate(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) params.set(k, v)
    params.set("metric", metric)
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }))
  }

  function changeMetric(next: FinderMetric) {
    setMetric(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set("metric", next)
    window.history.replaceState(null, "", `${pathname}?${params}`)
  }

  const values = useMemo(
    () => ranked.map((r) => valueOf(r, metric)).filter((v): v is number => v !== null),
    [ranked, metric]
  )
  const cuts = useMemo(() => cutsOf(values), [values])
  const max = values.length > 0 ? Math.max(...values) : 0
  const label = metricLabel(metric)
  const levelName = level === "market" ? "thị trường" : "phường"
  const marketName = markets.find((m) => m.slug === market)?.name

  const columns = useMemo<InsightColumn<FinderRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataGridColumnHeader
            title={level === "market" ? "Thị trường" : "Phường / xã"}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <Link
            prefetch={false}
            href={row.original.href}
            className="text-foreground block truncate font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
        size: 170,
        enableSorting: true,
      },
      {
        id: metric,
        accessorFn: (r) => valueOf(r, metric) ?? -Infinity,
        header: ({ column }) => <DataGridColumnHeader title={label} column={column} />,
        cell: ({ row }) => {
          const v = valueOf(row.original, metric)
          return (
            <MetricBarCell
              value={v}
              max={max}
              bin={binOf(v, cuts)}
              label={`${label} của ${row.original.name}`}
              text={formatMetric(metric, v, currency)}
            />
          )
        },
        size: 220,
        enableSorting: true,
      },
      // Số listing là ngữ cảnh cho mọi chỉ số — trừ khi chính nó đang được xếp hạng.
      ...(metric === "listings"
        ? []
        : [
            {
              id: "col-listings",
              accessorFn: (r: FinderRow) => r.listings,
              header: ({ column }) => <DataGridColumnHeader title="Listing" column={column} />,
              cell: ({ row }) => fmtInt(row.original.listings),
              size: 80,
              meta: NUM,
              enableSorting: true,
            } satisfies InsightColumn<FinderRow>,
          ]),
      {
        id: "trend",
        header: "Lịch đặt",
        cell: ({ row }) => <TrendSparkline data={row.original.series} />,
        size: 110,
        enableSorting: false,
      },
    ],
    [level, metric, label, max, cuts, currency]
  )

  const legend = cuts
    ? [
        `< ${formatCut(metric, cuts[0])}`,
        `${formatCut(metric, cuts[0])} – ${formatCut(metric, cuts[1])}`,
        `${formatCut(metric, cuts[1])} – ${formatCut(metric, cuts[2])}`,
        `> ${formatCut(metric, cuts[2])}`,
      ]
    : []

  const rankedIds = new Set(ranked.map((r) => r.id))
  const mapAreas = rows.map((r) => {
    const v = valueOf(r, metric)
    const inRank = rankedIds.has(r.id)
    return {
      id: r.id,
      name: r.name,
      href: r.href,
      // Khu vực chưa đủ mẫu vẫn hiện (xám) để bản đồ đủ địa giới.
      bin: inRank ? binOf(v, cuts) : null,
      label: inRank
        ? `${label}: ${formatMetric(metric, v, currency)}`
        : `Chưa đủ mẫu (${fmtInt(r.listings)} listing)`,
      geometry: r.geometry,
    }
  })
  const withShape = rows.filter((r) => r.geometry).length

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-60 transition-opacity")}>
      {/* Thanh công cụ: cấp, thị trường, chỉ số; trên điện thoại thêm Danh sách|Bản đồ. */}
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          multiple={false}
          value={[level]}
          onValueChange={(value) => value[0] && navigate({ level: value[0] })}
          variant="outline"
          spacing={0}
          aria-label="Cấp khu vực"
        >
          <ToggleGroupItem value="market" className={TOGGLE_ITEM}>
            Thị trường
          </ToggleGroupItem>
          <ToggleGroupItem value="submarket" className={TOGGLE_ITEM}>
            Phường
          </ToggleGroupItem>
        </ToggleGroup>

        {level === "submarket" && markets.length > 1 && (
          <Select
            value={market}
            items={markets.map((m) => ({ value: m.slug, label: m.name }))}
            onValueChange={(value) => value && navigate({ market: String(value) })}
          >
            <SelectTrigger aria-label="Thị trường" className="min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {markets.map((m) => (
                <SelectItem key={m.slug} value={m.slug}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={metric}
          items={FINDER_METRICS}
          onValueChange={(value) => value && changeMetric(value as FinderMetric)}
        >
          <SelectTrigger aria-label="Xếp hạng và tô màu theo" className="min-w-40">
            <span className="text-muted-foreground">Theo</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {FINDER_METRICS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToggleGroup
          multiple
          value={sampled ? ["sampled"] : []}
          onValueChange={(value) => setSampled(value.includes("sampled"))}
          variant="outline"
          spacing={0}
          aria-label="Cỡ mẫu"
        >
          <ToggleGroupItem value="sampled" className={TOGGLE_ITEM}>
            ≥ {MIN_LISTINGS} listing
          </ToggleGroupItem>
        </ToggleGroup>

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
        <div className={cn("min-w-0", view === "map" && "max-lg:hidden")}>
          <InsightGrid
            key={`${level}-${market}-${metric}-${sampled}`}
            title={level === "market" ? "Xếp hạng thị trường" : `Xếp hạng phường · ${marketName ?? ""}`}
            description={
              hiddenCount > 0
                ? `${fmtInt(ranked.length)} ${levelName} đủ mẫu, xếp theo ${label} · ẩn ${fmtInt(hiddenCount)} khu vực dưới ${MIN_LISTINGS} listing`
                : `${fmtInt(ranked.length)} ${levelName}, xếp theo ${label}`
            }
            data={ranked}
            columns={columns}
            getRowId={(r) => r.id}
            initialSort={[{ id: metric, desc: true }]}
            pageSize={25}
          />
        </div>

        <div
          className={cn(
            "min-w-0 lg:sticky lg:top-4",
            view === "list" && "max-lg:hidden"
          )}
        >
          <Frame spacing="default" className="w-full min-w-0">
            <FrameHeader>
              <FrameTitle role="heading" aria-level={3}>
                Bản đồ {levelName}
              </FrameTitle>
              <FrameDescription>
                Tô màu theo {label} · bấm vào khu vực để xem Insight
              </FrameDescription>
            </FrameHeader>
            <FramePanel className="h-[60svh] overflow-hidden p-0 lg:h-[calc(100svh-14rem)]">
              <ChoroplethMap areas={mapAreas} />
            </FramePanel>
            <FrameFooter className="text-muted-foreground flex-row flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              <ul aria-label={`Chú giải ${label}`} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {legend.map((text, bin) => (
                  <li key={text} className="flex items-center gap-1.5 tabular-nums">
                    <span aria-hidden="true" className={cn("size-2.5 rounded-sm", BIN_SWATCH[bin])} />
                    {text}
                  </li>
                ))}
                {hiddenCount > 0 && (
                  <li className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="size-2.5 rounded-sm bg-slate-200" />
                    Chưa đủ mẫu
                  </li>
                )}
              </ul>
              {withShape < rows.length && (
                <Badge variant="outline" className="ml-auto">
                  {fmtInt(rows.length - withShape)} {levelName} chưa có ranh giới
                </Badge>
              )}
            </FrameFooter>
          </Frame>
        </div>
      </div>
    </div>
  )
}
