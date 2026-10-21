"use client"

import { useState, type ReactNode } from "react"
import {
  type ColumnDef,
  type PaginationState,
  type RowData,
  type SortingState,
  useTable,
} from "@tanstack/react-table"

import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
  type DataGridFeatures,
} from "@/components/reui/data-grid/data-grid"
import type { DataGridI18nOverrides } from "@/components/reui/data-grid/data-grid-i18n"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"

export type InsightColumn<T extends RowData> = ColumnDef<DataGridFeatures, T>

/** Nhãn tiếng Việt cho mọi bảng trong portal. */
export const DATA_GRID_VI: DataGridI18nOverrides = {
  labels: {
    sortAscending: "Tăng dần",
    sortDescending: "Giảm dần",
    loading: "Đang tải…",
    empty: "Chưa có dữ liệu",
    rowsPerPage: "Số dòng",
    paginationInfo: ({ from, to, count }) => `${from}–${to} / ${count}`,
    previousPage: "Trang trước",
    nextPage: "Trang sau",
    goToPage: (page) => `Tới trang ${page}`,
  },
}

/**
 * Bảng chuẩn của trang Insight: Frame + DataGrid (mẫu c-data-grid-11), sort
 * phía client, phân trang chỉ khi vượt pageSize.
 */
export function InsightGrid<T extends RowData>({
  title,
  description,
  badge,
  data,
  columns,
  getRowId,
  initialSort,
  pageSize = 10,
  footnote,
}: {
  title: string
  description?: string
  badge?: ReactNode
  data: T[]
  columns: InsightColumn<T>[]
  getRowId: (row: T) => string
  initialSort?: SortingState
  pageSize?: number
  footnote?: ReactNode
}) {
  const [sorting, setSorting] = useState<SortingState>(initialSort ?? [])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const paged = data.length > pageSize

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    getRowId,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  return (
    <Frame spacing="default" className="w-full min-w-0">
      <FrameHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-px">
          <FrameTitle role="heading" aria-level={3}>
            {title}
          </FrameTitle>
          {description && <FrameDescription>{description}</FrameDescription>}
        </div>
        {badge}
      </FrameHeader>
      <FramePanel className="flex flex-col gap-3">
        <DataGrid table={table} recordCount={data.length} i18n={DATA_GRID_VI}>
          <div className="w-full space-y-2.5">
            <DataGridContainer>
              <DataGridScrollArea>
                <DataGridTable />
              </DataGridScrollArea>
            </DataGridContainer>
            {paged && <DataGridPagination sizes={[10, 25, 50]} />}
          </div>
        </DataGrid>
        {footnote && <p className="text-muted-foreground text-xs">{footnote}</p>}
      </FramePanel>
    </Frame>
  )
}
