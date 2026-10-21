"use client"

import { useMemo } from "react"

import { Badge } from "@/components/reui/badge"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { InsightGrid, type InsightColumn } from "@/components/insight/insight-grid"
import { fmtInt } from "@/lib/format"
import type { FlowDay, JobStatus } from "@/lib/collections-queries"

const NUM = { headerClassName: "text-end", cellClassName: "text-end tabular-nums" }

export function FlowTable({ days }: { days: FlowDay[] }) {
  const columns = useMemo<InsightColumn<FlowDay>[]>(
    () => [
      {
        id: "day",
        accessorKey: "day",
        header: ({ column }) => <DataGridColumnHeader title="Ngày" column={column} />,
        size: 110,
        enableSorting: false,
      },
      {
        id: "airdnaMarkets",
        accessorFn: (r) => r.airdnaMarkets,
        header: ({ column }) => <DataGridColumnHeader title="AirDNA market" column={column} />,
        cell: ({ row }) => fmtInt(row.original.airdnaMarkets),
        size: 130,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "airdnaListings",
        accessorFn: (r) => r.airdnaListings,
        header: ({ column }) => <DataGridColumnHeader title="AirDNA listing (LTM)" column={column} />,
        cell: ({ row }) => fmtInt(row.original.airdnaListings),
        size: 160,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "airbnbSeen",
        accessorFn: (r) => r.airbnbListingsSeen,
        header: ({ column }) => <DataGridColumnHeader title="Airbnb listing tươi" column={column} />,
        cell: ({ row }) => fmtInt(row.original.airbnbListingsSeen),
        size: 150,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "airbnbSnapshots",
        accessorFn: (r) => r.airbnbSnapshots,
        header: ({ column }) => <DataGridColumnHeader title="Airbnb snapshot" column={column} />,
        cell: ({ row }) => fmtInt(row.original.airbnbSnapshots),
        size: 140,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "zaloPosts",
        accessorFn: (r) => r.zaloPosts,
        header: ({ column }) => <DataGridColumnHeader title="Zalo post (raw)" column={column} />,
        cell: ({ row }) => fmtInt(row.original.zaloPosts),
        size: 130,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "zaloOffers",
        accessorFn: (r) => r.zaloOffers,
        header: ({ column }) => <DataGridColumnHeader title="Zalo offer (parse)" column={column} />,
        cell: ({ row }) => fmtInt(row.original.zaloOffers),
        size: 140,
        meta: NUM,
        enableSorting: true,
      },
    ],
    []
  )
  return (
    <InsightGrid
      title="Luồng 7 ngày qua"
      description="Số bản ghi chảy vào theo nguồn, theo ngày (giờ máy)"
      data={days}
      columns={columns}
      getRowId={(r) => r.day}
      pageSize={10}
    />
  )
}

function aliveBadge(alive: JobStatus["alive"]) {
  if (alive === "yes") return <Badge variant="success-light">Sống</Badge>
  if (alive === "no") return <Badge variant="warning-light">Không phản hồi</Badge>
  return <Badge variant="outline">Theo lịch</Badge>
}

export function SchedulerTable({ jobs }: { jobs: JobStatus[] }) {
  const columns = useMemo<InsightColumn<JobStatus>[]>(
    () => [
      {
        id: "label",
        accessorKey: "label",
        header: ({ column }) => <DataGridColumnHeader title="Job" column={column} />,
        size: 300,
        enableSorting: false,
      },
      {
        id: "schedule",
        accessorKey: "schedule",
        header: "Lịch",
        size: 180,
      },
      {
        id: "alive",
        header: "Trạng thái",
        cell: ({ row }) => aliveBadge(row.original.alive),
        size: 130,
      },
      {
        id: "lastLogAt",
        accessorFn: (r) => r.lastLogAt ?? "",
        header: ({ column }) => <DataGridColumnHeader title="Chạy cuối" column={column} />,
        cell: ({ row }) =>
          row.original.lastLogAt
            ? new Date(row.original.lastLogAt).toLocaleString("vi-VN", { hour12: false })
            : "—",
        size: 160,
        enableSorting: true,
      },
      {
        id: "lastLine",
        accessorKey: "lastLine",
        header: "Dòng log cuối",
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-xs">
            {row.original.lastLine ?? "—"}
          </span>
        ),
        size: 320,
        enableSorting: false,
      },
    ],
    []
  )
  return (
    <InsightGrid
      title="Máy móc (launchd)"
      description="5 agent tự chạy — log lần cuối + probe dịch vụ KeepAlive"
      data={jobs}
      columns={columns}
      getRowId={(r) => r.id}
      pageSize={10}
    />
  )
}

function groupStatusBadge(lastSeenAt: string | null) {
  if (!lastSeenAt) return <Badge variant="outline">Chưa thấy tin</Badge>
  const hours = (Date.now() - new Date(lastSeenAt).getTime()) / 3600000
  if (hours <= 24) return <Badge variant="success-light">Hoạt động</Badge>
  if (hours <= 72) return <Badge variant="warning-light">Im {Math.floor(hours)}h</Badge>
  return <Badge variant="warning-light">Im {Math.floor(hours / 24)} ngày — kiểm tra kick/đổi tên</Badge>
}

export function ZaloGroupsTable({
  rows,
  allowlist,
}: {
  rows: import("@/lib/collections-queries").ZaloGroupRow[]
  allowlist: import("@/lib/collections-queries").ZaloAllowlistEntry[]
}) {
  const columns = useMemo<InsightColumn<import("@/lib/collections-queries").ZaloGroupRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataGridColumnHeader title="Nhóm" column={column} />,
        size: 260,
        enableSorting: false,
      },
      {
        id: "status",
        accessorFn: (r) => r.lastSeenAt ?? "",
        header: "Trạng thái",
        cell: ({ row }) => groupStatusBadge(row.original.lastSeenAt),
        size: 200,
      },
      {
        id: "seen",
        accessorFn: (r) => r.seen,
        header: ({ column }) => <DataGridColumnHeader title="Thấy (log)" column={column} />,
        cell: ({ row }) => fmtInt(row.original.seen),
        size: 100,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "passed",
        accessorFn: (r) => r.passed,
        header: ({ column }) => <DataGridColumnHeader title="Qua cổng" column={column} />,
        cell: ({ row }) => fmtInt(row.original.passed),
        size: 100,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "accepted",
        accessorFn: (r) => r.accepted,
        header: ({ column }) => <DataGridColumnHeader title="Vào raw" column={column} />,
        cell: ({ row }) => fmtInt(row.original.accepted),
        size: 100,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "owner",
        accessorFn: (r) => r.ownerAccount ?? "",
        header: "Tài khoản",
        cell: ({ row }) => row.original.ownerAccount ?? "—",
        size: 110,
        enableSorting: true,
      },
      {
        id: "real7",
        accessorFn: (r) => r.realPosts7d,
        header: ({ column }) => <DataGridColumnHeader title="Post thật 7 ngày" column={column} />,
        cell: ({ row }) => fmtInt(row.original.realPosts7d),
        size: 140,
        meta: NUM,
        enableSorting: true,
      },
      {
        id: "mock7",
        accessorFn: (r) => r.mockPosts7d,
        header: ({ column }) => <DataGridColumnHeader title="Post mock" column={column} />,
        cell: ({ row }) => (row.original.mockPosts7d ? fmtInt(row.original.mockPosts7d) : "—"),
        size: 100,
        meta: NUM,
        enableSorting: true,
      },
    ],
    []
  )
  const enabled = allowlist.filter((a) => a.enabled)
  return (
    <InsightGrid
      title="Nhóm Zalo"
      description={`Danh mục nguồn cộng đồng — thật tách mock; allowlist đang bật ${enabled.length} nhóm`}
      data={rows}
      columns={columns}
      getRowId={(r) => r.name}
      pageSize={10}
      footnote={
        "Qua cổng = gate Kev ≥0.9 (parse hook log). Allowlist (group id, chưa map tên — V2): " +
        (enabled.map((a) => a.groupId.replace("group:", "…").slice(-6)).join(", ") || "—") +
        ". Nhóm im >72h: kiểm tra bị kick/đổi tên; nhóm mock chỉ để so sánh, không đếm vào dòng thật."
      }
    />
  )
}
