"use client"

// This file keeps "use no memo": its own cell/header templates read state
// through builder calls on a stable row/column, which React Compiler cannot
// see. The primitive wraps its own such reads in TanStack's Subscribe; a
// consumer template has to opt out or subscribe itself.
"use no memo"

import { memo, useMemo, useState } from "react"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Badge } from "@/components/reui/badge"
import { type DataGridFeatures } from "@/components/reui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataGridTableRowPin } from "@/components/reui/data-grid/data-grid-table"
import { Row, type ColumnDef } from "@tanstack/react-table"
import { cn } from "cn"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Item, ItemMedia } from "@/components/ui/item"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CATEGORY_LABELS,
  ContactPriority,
  ContactStatus,
  IContact,
  type CategoryLabel,
} from "./data"
import { MoreHorizontalIcon, PinOffIcon, Pin, EyeIcon, MailIcon, CopyIcon, Trash2Icon } from "lucide-react"

// ── Category tag colors (light + dark) ──

const categoryBadgeClass: Record<CategoryLabel, string> = {
  "E-commerce":
    "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  Enterprise:
    "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
  P2P: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  AI: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
  Digital: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  Infrastructure:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300",
  "Developer tools":
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300",
  Automation:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300",
}

function getCategoryClasses(tag: string): string {
  if (CATEGORY_LABELS.includes(tag as CategoryLabel)) {
    return categoryBadgeClass[tag as CategoryLabel]
  }
  return "bg-muted text-muted-foreground"
}

export const CategoryTags = memo(function CategoryTags({
  tags,
}: {
  tags: CategoryLabel[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className={cn("border-0", getCategoryClasses(tag))}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
})

// ── Availability dot (aligned with data-grid-1 CustomerCell) ──

const availabilityColor: Record<string, string> = {
  online: "bg-green-500",
  away: "bg-yellow-400",
  busy: "bg-red-500",
  offline: "bg-gray-500",
}

// ── Status badge ──

const statusConfig: Record<ContactStatus, { dot: string }> = {
  Active: { dot: "bg-emerald-500" },
  Lead: { dot: "bg-blue-500" },
  Prospect: { dot: "bg-amber-500" },
  Churned: { dot: "bg-muted-foreground" },
}

export function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <Badge variant="outline">
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full!",
          statusConfig[status].dot
        )}
      />
      {status}
    </Badge>
  )
}

// ── Priority badge ──

const priorityConfig: Record<
  ContactPriority,
  { variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  High: { variant: "destructive-light" },
  Medium: { variant: "warning-light" },
  Low: { variant: "secondary" },
}

export function PriorityBadge({ priority }: { priority: ContactPriority }) {
  return <Badge variant={priorityConfig[priority].variant}>{priority}</Badge>
}

// ── Score (shadcn Progress) ──

function ScoreCell({ score }: { score: number }) {
  const indicatorClass =
    score >= 75
      ? "**:data-[slot=progress-indicator]:bg-emerald-500"
      : score >= 40
        ? "**:data-[slot=progress-indicator]:bg-amber-500"
        : "**:data-[slot=progress-indicator]:bg-red-500"
  return (
    <Progress
      value={score}
      className={cn(
        "min-w-0 flex-1 flex-row flex-nowrap items-center gap-2 **:data-[slot=progress-track]:order-1 **:data-[slot=progress-track]:min-w-12 **:data-[slot=progress-track]:flex-1 **:data-[slot=progress-value]:order-2",
        indicatorClass
      )}
    >
      <ProgressLabel className="sr-only">Lead score</ProgressLabel>
      <ProgressValue className="text-muted-foreground shrink-0 text-[10px] leading-none tabular-nums">
        {(_, value) => `${value ?? score}%`}
      </ProgressValue>
    </Progress>
  )
}

// ── Stock sparkline (thin smooth curve; green = up, red = down vs series start) ──

// Smooth the polyline into a flowing cubic-bezier path: each segment's control
// points follow the slope of the neighbouring points (Catmull-Rom style).
function buildSmoothLinePath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ""
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`

  const smoothing = 0.2
  const controlPoint = (
    current: { x: number; y: number },
    previous: { x: number; y: number } | undefined,
    next: { x: number; y: number } | undefined,
    reverse?: boolean
  ) => {
    const p = previous ?? current
    const n = next ?? current
    const angle = Math.atan2(n.y - p.y, n.x - p.x) + (reverse ? Math.PI : 0)
    const length = Math.hypot(n.x - p.x, n.y - p.y) * smoothing
    return {
      x: current.x + Math.cos(angle) * length,
      y: current.y + Math.sin(angle) * length,
    }
  }

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const start = controlPoint(pts[i - 1], pts[i - 2], pts[i])
    const end = controlPoint(pts[i], pts[i - 1], pts[i + 1], true)
    d += ` C ${start.x} ${start.y} ${end.x} ${end.y} ${pts[i].x} ${pts[i].y}`
  }
  return d
}

function StockSparkline({ data }: { data: number[] }) {
  const w = 92
  const h = 26
  const padX = 2
  const padY = 2
  const innerW = w - padX * 2
  const innerH = h - padY * 2

  const { linePath, strokeClass } = useMemo(() => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const n = data.length
    const step = innerW / Math.max(1, n - 1)

    const pts = data.map((v, i) => {
      const x = padX + i * step
      const y = padY + ((max - v) / range) * innerH
      return { x, y }
    })

    const linePath = buildSmoothLinePath(pts)

    const delta = data[data.length - 1] - data[0]
    const strokeClass =
      delta > 0
        ? "stroke-emerald-600 dark:stroke-emerald-400"
        : delta < 0
          ? "stroke-red-600 dark:stroke-red-400"
          : "stroke-muted-foreground"

    return { linePath, strokeClass }
  }, [data])

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0"
      aria-hidden
    >
      <path
        d={linePath}
        fill="none"
        className={cn(strokeClass)}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Contact cell (same layout as data-grid-1 CustomerCell) ──

const ContactCell = memo(function ContactCell({
  row,
}: {
  row: Row<DataGridFeatures, IContact>
}) {
  const o = row.original

  return (
    <div className="flex items-center gap-2">
      <div className="relative shrink-0">
        <Avatar className="size-8">
          <AvatarImage src={o.avatar} alt="" />
          <AvatarFallback>
            {o.name
              .split("")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "ring-background absolute right-0 bottom-0.5 size-2 rounded-full ring-2",
            availabilityColor[o.availability]
          )}
          aria-hidden
        />
      </div>
      <div className="min-w-0">
        <div className="text-foreground line-clamp-1 font-medium">{o.name}</div>
        <div
          className="text-muted-foreground line-clamp-1 text-xs"
          title={o.email}
        >
          {o.email}
        </div>
      </div>
    </div>
  )
})

// ── Actions cell ──

export function ActionsCell({ row }: { row: Row<DataGridFeatures, IContact> }) {
  const { copyToClipboard } = useCopyToClipboard()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isPinned = row.getIsPinned()

  const handleDeleteConfirm = () => {
    setDeleteOpen(false)
    toast.message("Delete requested", {
      description: `${row.original.name}. Connect your CRM (demo).`,
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              aria-label="Row actions"
            />
          }
        >
          <MoreHorizontalIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => row.pin(isPinned ? false : "top")}>
              {isPinned ? (
                <PinOffIcon className="size-4" aria-hidden="true" />
              ) : (
                <Pin className="size-4" aria-hidden="true" />
              )}
              {isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toast.info("View contact", {
                  description: "Open your detail route (demo).",
                })
              }
            >
              <EyeIcon className="size-4" aria-hidden="true" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toast.message("Compose email", {
                  description: "Wire to your mailer (demo).",
                })
              }
            >
              <MailIcon className="size-4" aria-hidden="true" />
              Email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                copyToClipboard(row.original.email)
                toast.success("Email copied", {
                  description: row.original.email,
                })
              }}
            >
              <CopyIcon className="size-4" aria-hidden="true" />
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon className="size-4" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              <span className="text-foreground font-medium">
                {row.original.name}
              </span>{" "}
              from the list. Connect your API to persist changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ── Column definitions ──

export const columns: ColumnDef<DataGridFeatures, IContact>[] = [
  {
    id: "pin",
    header: "",
    cell: ({ row }) => <DataGridTableRowPin row={row} />,
    enableSorting: false,
    size: 40,
    enableResizing: false,
    enableHiding: false,
    meta: {
      skeleton: <Skeleton className="mx-auto size-7 rounded-md" />,
    },
  },
  {
    accessorKey: "name",
    id: "name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Contact" visibility={true} column={column} />
    ),
    cell: ({ row }) => <ContactCell row={row} />,
    enableSorting: true,
    enableHiding: false,
    enableResizing: true,
    minSize: 200,
    meta: {
      autoSize: true,
      skeleton: (
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ),
    },
  },
  {
    accessorKey: "company",
    id: "company",
    header: ({ column }) => (
      <DataGridColumnHeader title="Company" visibility={true} column={column} />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <Item className="w-auto shrink-0 border-0 p-0 [&_svg]:size-5">
          <ItemMedia variant="icon" className="size-auto">
            {row.original.companyLogo}
          </ItemMedia>
        </Item>
        <span className="text-foreground min-w-0 truncate font-medium">
          {row.original.company}
        </span>
      </div>
    ),
    size: 140,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: (
        <div className="flex min-w-0 items-center gap-2.5">
          <Skeleton className="size-5 shrink-0 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
      ),
    },
  },
  {
    accessorKey: "jobTitle",
    id: "jobTitle",
    header: ({ column }) => (
      <DataGridColumnHeader title="Title" visibility={true} column={column} />
    ),
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="text-foreground truncate text-sm font-medium">
          {row.original.jobTitle}
        </div>
        <div className="text-muted-foreground truncate text-xs">
          {row.original.department}
        </div>
      </div>
    ),
    size: 160,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: (
        <div className="flex min-w-0 flex-col gap-0.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      ),
    },
  },
  {
    accessorKey: "location",
    id: "location",
    header: ({ column }) => (
      <DataGridColumnHeader
        title="Location"
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <img
          src={`https://flagcdn.com/${row.original.flag.toLowerCase()}.svg`}
          alt=""
          className="size-4 shrink-0 rounded-full object-cover"
        />
        <span className="text-foreground truncate text-sm font-medium">
          {row.original.location}
        </span>
      </div>
    ),
    size: 150,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: (
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-4 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      ),
    },
  },
  {
    accessorKey: "tags",
    id: "tags",
    header: ({ column }) => (
      <DataGridColumnHeader
        title="Category"
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => <CategoryTags tags={row.original.tags} />,
    size: 220,
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: (
        <div className="flex flex-wrap items-center gap-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ),
    },
  },
  {
    accessorKey: "score",
    id: "score",
    header: ({ column }) => (
      <DataGridColumnHeader title="Score" visibility={true} column={column} />
    ),
    cell: ({ row }) => <ScoreCell score={row.original.score} />,
    size: 148,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: (
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="h-2 min-w-12 flex-1 rounded-full" />
          <Skeleton className="h-3 w-10 shrink-0" />
        </div>
      ),
    },
  },
  {
    accessorKey: "engagementData",
    id: "stock",
    header: ({ column }) => (
      <DataGridColumnHeader title="Stock" visibility={true} column={column} />
    ),
    cell: ({ row }) => <StockSparkline data={row.original.engagementData} />,
    size: 108,
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: <Skeleton className="h-[26px] w-[92px] rounded-md" />,
    },
  },
  {
    accessorKey: "revenue",
    id: "revenue",
    header: ({ column }) => (
      <DataGridColumnHeader title="Amount" visibility={true} column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-foreground text-sm font-semibold tabular-nums">
        $
        {row.original.revenue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}
      </span>
    ),
    size: 110,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: <Skeleton className="h-4 w-24" />,
    },
  },
  {
    accessorKey: "lastContact",
    id: "lastContact",
    header: ({ column }) => (
      <DataGridColumnHeader
        title="Last Contact"
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.lastContact}
      </span>
    ),
    size: 130,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: <Skeleton className="h-4 w-28" />,
    },
  },
  {
    accessorKey: "priority",
    id: "priority",
    header: ({ column }) => (
      <DataGridColumnHeader
        title="Priority"
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    size: 90,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: <Skeleton className="h-6 w-16 rounded-full" />,
    },
  },
  {
    accessorKey: "status",
    id: "status",
    header: ({ column }) => (
      <DataGridColumnHeader title="Status" visibility={true} column={column} />
    ),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    size: 110,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: <Skeleton className="h-6 w-24 rounded-full" />,
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell row={row} />,
    size: 60,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    meta: {
      skeleton: <Skeleton className="mx-auto size-7 rounded-md" />,
    },
  },
]