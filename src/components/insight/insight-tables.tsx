"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Badge } from "@/components/reui/badge"
import { Button } from "@/components/ui/button"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { fmtInt, fmtMoney, fmtMoneyCompact, fmtPct } from "@/lib/format"
import type {
  BreakdownRow,
  FinderRow,
  TopListingRow,
  YieldRow,
} from "@/lib/queries"
import { InsightGrid, type InsightColumn } from "./insight-grid"

const NUM = { headerClassName: "text-end", cellClassName: "text-end tabular-nums" }

/** ADR/RevPAR = 0 nghĩa là chưa có đêm nào được đặt, không phải giá 0. */
const moneyOrDash = (currency: string) => (v: number | null) =>
  v ? fmtMoney(v, currency) : "—"

const ROOM_TYPE_VI: Record<string, string> = {
  "Entire home/apt": "Nguyên căn",
  "Private room": "Phòng riêng",
  "Hotel room": "Phòng khách sạn",
  "Shared room": "Phòng ở chung",
}

/** Cột số chuẩn: header sort được, căn phải, định dạng theo `render`. */
function numberColumn<T extends object>(
  id: string,
  title: string,
  get: (row: T) => number | null,
  render: (value: number | null) => string,
  size = 110
): InsightColumn<T> {
  return {
    id,
    accessorFn: (row) => get(row) ?? -Infinity,
    header: ({ column }) => <DataGridColumnHeader title={title} column={column} />,
    cell: ({ row }) => render(get(row.original)),
    size,
    meta: NUM,
    enableSorting: true,
  }
}

export function SubmarketsTable({
  rows,
  currency,
}: {
  rows: FinderRow[]
  currency: string
}) {
  const columns = useMemo<InsightColumn<FinderRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataGridColumnHeader title="Phường / xã" column={column} />,
        cell: ({ row }) => (
          <Link
            prefetch={false}
            href={row.original.href}
            className="text-foreground font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
        size: 200,
        enableSorting: true,
      },
      numberColumn<FinderRow>("listings", "Listing", (r) => r.listings, fmtInt, 90),
      numberColumn<FinderRow>("adr", "ADR", (r) => r.adr, moneyOrDash(currency)),
      numberColumn<FinderRow>("occupancy", "Công suất", (r) => r.occupancy, (v) => fmtPct(v), 100),
      numberColumn<FinderRow>("revpar", "RevPAR", (r) => r.revpar, moneyOrDash(currency)),
      numberColumn<FinderRow>(
        "revenue",
        "Doanh thu",
        (r) => r.revenue,
        (v) => (v === null ? "—" : fmtMoneyCompact(v, currency)),
        120
      ),
    ],
    [currency]
  )
  return (
    <InsightGrid
      title="Phường nổi bật"
      description="Cả cửa sổ lịch đặt; ADR, công suất, RevPAR bình quân theo đêm — cùng công thức với KPI và Finder"
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      initialSort={[{ id: "revenue", desc: true }]}
    />
  )
}

export function ListingsTable({
  rows,
  currency,
  allHref,
}: {
  rows: TopListingRow[]
  currency: string
  /** Trang Duyệt listing của thị trường. */
  allHref?: string
}) {
  const columns = useMemo<InsightColumn<TopListingRow>[]>(
    () => [
      {
        id: "name",
        accessorFn: (r) => r.name ?? r.id,
        header: ({ column }) => <DataGridColumnHeader title="Listing" column={column} />,
        cell: ({ row }) => (
          <Link
            prefetch={false}
            href={`/listing/${row.original.id}`}
            className="text-foreground block truncate font-medium hover:underline"
          >
            {row.original.name ?? row.original.id}
          </Link>
        ),
        size: 260,
        enableSorting: true,
      },
      {
        id: "type",
        accessorFn: (r) => r.roomType ?? "",
        header: ({ column }) => <DataGridColumnHeader title="Loại" column={column} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {[
              row.original.roomType ? (ROOM_TYPE_VI[row.original.roomType] ?? row.original.roomType) : null,
              row.original.bedrooms !== null ? `${row.original.bedrooms} PN` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </span>
        ),
        size: 150,
        enableSorting: true,
      },
      numberColumn<TopListingRow>("adr", "ADR", (r) => r.adr, moneyOrDash(currency)),
      numberColumn<TopListingRow>("occupancy", "Công suất", (r) => r.occupancy, (v) => fmtPct(v), 100),
      numberColumn<TopListingRow>(
        "revenue",
        "Doanh thu ước tính",
        (r) => r.revenue,
        (v) => (v === null ? "—" : fmtMoneyCompact(v, currency)),
        140
      ),
    ],
    [currency]
  )
  return (
    <InsightGrid
      title="Listing nổi bật"
      description="Doanh thu ước tính = tổng giá niêm yết các đêm đã đặt trong lịch tương lai"
      badge={
        allHref ? (
          <Button
            variant="outline"
            size="sm"
            className="text-xs shadow-xs"
            nativeButton={false}
            render={<Link href={allHref} />}
          >
            Xem tất cả
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
        ) : undefined
      }
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      initialSort={[{ id: "revenue", desc: true }]}
    />
  )
}

export function BedroomsTable({
  rows,
  currency,
}: {
  rows: BreakdownRow[]
  currency: string
}) {
  const columns = useMemo<InsightColumn<BreakdownRow>[]>(
    () => [
      {
        id: "label",
        accessorKey: "label",
        header: "Cỡ căn",
        cell: ({ row }) => (
          <span className="font-medium">
            {/^\d/.test(row.original.label) ? `${row.original.label} PN` : row.original.label}
          </span>
        ),
        size: 80,
      },
      numberColumn<BreakdownRow>("listings", "Listing", (r) => r.listings, fmtInt, 70),
      numberColumn<BreakdownRow>("adr", "ADR", (r) => r.adr, moneyOrDash(currency), 100),
      numberColumn<BreakdownRow>("occupancy", "Công suất", (r) => r.occupancy, (v) => fmtPct(v), 90),
      numberColumn<BreakdownRow>("share", "% doanh thu", (r) => r.share, (v) => fmtPct(v), 90),
    ],
    [currency]
  )
  return (
    <InsightGrid
      title="Theo số phòng ngủ"
      description="ADR và công suất theo cỡ căn"
      data={rows}
      columns={columns}
      getRowId={(r) => r.label}
    />
  )
}

/** Ngưỡng tham chiếu cho yield: STR ≥ 8%, thuê dài hạn ≥ 6% là tốt. */
function yieldBadge(v: number | null, good: number) {
  if (v === null) return <span className="text-muted-foreground">—</span>
  return (
    <Badge variant={v >= good ? "success-light" : "outline"} className="tabular-nums">
      {fmtPct(v)}
    </Badge>
  )
}

export function YieldTable({
  rows,
  currency,
  basePath,
}: {
  rows: YieldRow[]
  currency: string
  basePath: string
}) {
  const columns = useMemo<InsightColumn<YieldRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataGridColumnHeader title="Phường / xã" column={column} />,
        cell: ({ row }) => (
          <Link
            prefetch={false}
            href={`${basePath}/${row.original.slug}`}
            className="text-foreground font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
        size: 180,
        enableSorting: true,
      },
      numberColumn<YieldRow>(
        "perm2",
        "Giá bán / m²",
        (r) => r.medianPerm2,
        (v) => (v === null ? "—" : fmtMoneyCompact(v, currency)),
        120
      ),
      numberColumn<YieldRow>(
        "rentLt",
        "Thuê dài hạn / tháng",
        (r) => r.medianRentLt,
        (v) => (v === null ? "—" : fmtMoneyCompact(v, currency)),
        150
      ),
      numberColumn<YieldRow>(
        "str",
        "Ngắn hạn / tháng",
        (r) => r.strRevenueMonth,
        (v) => (v === null ? "—" : fmtMoneyCompact(v, currency)),
        140
      ),
      {
        id: "yieldStr",
        accessorFn: (r) => r.yieldStr ?? -Infinity,
        header: ({ column }) => <DataGridColumnHeader title="Yield ngắn hạn" column={column} />,
        cell: ({ row }) => yieldBadge(row.original.yieldStr, 0.08),
        size: 130,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "yieldLt",
        accessorFn: (r) => r.yieldLt ?? -Infinity,
        header: ({ column }) => <DataGridColumnHeader title="Yield dài hạn" column={column} />,
        cell: ({ row }) => yieldBadge(row.original.yieldLt, 0.06),
        size: 130,
        meta: NUM,
        enableSorting: true,
      },
    ],
    [basePath, currency]
  )
  return (
    <InsightGrid
      title="Lợi suất theo phường"
      description="Một căn 60 m²: giá bán, thuê dài hạn (tin rao) so với doanh thu ngắn hạn (trung vị giá × công suất 90 đêm đầu)"
      badge={
        <div className="flex items-center gap-2">
          <Badge variant="warning-light">DỮ LIỆU MÔ PHỎNG</Badge>
          <Button
            variant="outline"
            size="sm"
            className="text-xs shadow-xs"
            nativeButton={false}
            render={<Link href="/yield" />}
          >
            Ước tính một căn
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
      }
      data={rows}
      columns={columns}
      getRowId={(r) => r.areaId}
      initialSort={[{ id: "yieldStr", desc: true }]}
      footnote="Tin rao bán và thuê đang là dữ liệu giả lập để dựng tính năng (G1). Không dùng để ra quyết định đầu tư."
    />
  )
}
