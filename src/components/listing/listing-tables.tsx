"use client"

import { useMemo } from "react"
import Link from "next/link"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { InsightGrid, type InsightColumn } from "@/components/insight/insight-grid"
import { fmtInt, fmtMoney, fmtMoneyCompact, fmtPct } from "@/lib/format"
import type { ListingCardRow } from "@/lib/queries"
import { roomTypeVi } from "./listing-labels"

const NUM = { headerClassName: "text-end", cellClassName: "text-end tabular-nums" }

/** Listing tương tự (comps) — DataGrid trong Frame như các bảng Insight. */
export function CompsTable({
  rows,
  currency,
  description,
}: {
  rows: ListingCardRow[]
  currency: string
  description: string
}) {
  const columns = useMemo<InsightColumn<ListingCardRow>[]>(
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
        size: 240,
        enableSorting: true,
      },
      {
        id: "type",
        accessorFn: (r) => r.roomType ?? "",
        header: "Loại",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {[
              roomTypeVi(row.original.roomType),
              row.original.bedrooms !== null ? `${row.original.bedrooms} PN` : null,
              row.original.areaName,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </span>
        ),
        size: 200,
      },
      {
        id: "price",
        accessorFn: (r) => r.priceListed ?? -Infinity,
        header: ({ column }) => <DataGridColumnHeader title="Giá niêm yết" column={column} />,
        cell: ({ row }) => fmtMoney(row.original.priceListed, currency),
        size: 120,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "occupancy",
        accessorFn: (r) => r.occupancy ?? -Infinity,
        header: ({ column }) => <DataGridColumnHeader title="Công suất" column={column} />,
        cell: ({ row }) => fmtPct(row.original.occupancy),
        size: 100,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "booked",
        accessorFn: (r) => r.booked,
        header: ({ column }) => <DataGridColumnHeader title="Đêm đã đặt" column={column} />,
        cell: ({ row }) => fmtInt(row.original.booked),
        size: 110,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "revenue",
        accessorFn: (r) => r.revenue,
        header: ({ column }) => <DataGridColumnHeader title="Doanh thu ước tính" column={column} />,
        cell: ({ row }) =>
          row.original.revenue > 0 ? fmtMoneyCompact(row.original.revenue, currency) : "—",
        size: 140,
        meta: NUM,
        enableSorting: true,
      },
    ],
    [currency]
  )
  return (
    <InsightGrid
      title="Listing tương tự"
      description={description}
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      initialSort={[{ id: "occupancy", desc: true }]}
    />
  )
}
