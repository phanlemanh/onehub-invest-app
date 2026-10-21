import type { ReactNode } from "react"
import { LayoutGridIcon, BotIcon, RouteIcon, RadioTowerIcon, WrenchIcon, FileSpreadsheetIcon, SunIcon, MoonIcon, MonitorIcon } from "lucide-react"

export interface NavSection {
  id: string
  label: string
  icon: ReactNode
}

/** Top bar sections. customize: swap the labels and icons for your own product. */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <LayoutGridIcon className="size-4" aria-hidden="true" />
    ),
  },
  {
    id: "fleet",
    label: "Fleet",
    icon: (
      <BotIcon className="size-4" aria-hidden="true" />
    ),
  },
  {
    id: "missions",
    label: "Missions",
    icon: (
      <RouteIcon className="size-4" aria-hidden="true" />
    ),
  },
  {
    id: "stations",
    label: "Stations",
    icon: (
      <RadioTowerIcon className="size-4" aria-hidden="true" />
    ),
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: (
      <WrenchIcon className="size-4" aria-hidden="true" />
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <FileSpreadsheetIcon className="size-4" aria-hidden="true" />
    ),
  },
]

export interface WorkspaceTab {
  id: string
  label: string
}

export const WORKSPACE_TABS: WorkspaceTab[] = [
  { id: "summary", label: "Summary" },
  { id: "delivery-center", label: "Delivery Center" },
  { id: "performance", label: "Performance" },
  { id: "coverage", label: "Coverage" },
  { id: "issues", label: "Issues" },
  { id: "capacity", label: "Capacity" },
  { id: "trends", label: "Trends" },
  { id: "access", label: "Access" },
]

/** The tab the console opens on. */
export const DEFAULT_TAB = "delivery-center"

export interface PageStat {
  id: string
  count: number
  label: string
}

export const PAGE_STATS: PageStat[] = [
  { id: "robots", count: 342, label: "Robots" },
  { id: "missions", count: 58, label: "Missions" },
  { id: "stations", count: 12, label: "Stations" },
]

export const PAGE = {
  title: "Mission Control Center",
  description:
    "Track robot status, capacity, assignments, health, and activity across your entire operating fleet.",
}

/** Signed-in operator. customize: point this at your own session record. */
export const ACCOUNT = {
  name: "Shadcn",
  role: "Author of Shadcn/ui",
  email: "shadcn@reui.io",
  initials: "SC",
  image: "https://github.com/shadcn.png",
}

// Swatches for the account menu's theme row; the values are the ones the page
// theme itself takes.
export const THEME_OPTIONS: {
  value: "light" | "dark" | "system"
  label: string
  icon: ReactNode
}[] = [
  {
    value: "light",
    label: "Light",
    icon: (
      <SunIcon aria-hidden="true" />
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: (
      <MoonIcon aria-hidden="true" />
    ),
  },
  {
    value: "system",
    label: "System",
    icon: (
      <MonitorIcon aria-hidden="true" />
    ),
  },
]

// The alerts the notifications drawer lists.
export type NotificationType =
  | "mention"
  | "comment"
  | "billing"
  | "security"
  | "deployment"
  | "system"
  | "task"
  | "order"
  | "stock"
  | "review"
  | "shipment"
  | "share"
  | "invite"
  | "feature"
  | "usage"
  | "approval"
  | "integration"
  | "achievement"
  | "feedback"
  | "team_join"
  | "reaction"
  | "event"

export type NotificationVariant = "info" | "success" | "warning" | "destructive"

export type NotificationAction = {
  label: string
  variant?: "default" | "outline" | "destructive"
  action?: string
}

export type NotificationAttachment = {
  name: string
  size: string
  url?: string
}

export type NotificationAvatar = {
  src: string
  fallback: string
}

export type NotificationGroupMember = {
  src: string
  fallback: string
  online?: boolean
}

export type NotificationMeta = {
  label: string
  value: string
  color?: string
}

export type Notification = {
  id: string
  type: NotificationType
  variant?: NotificationVariant
  title: string
  body?: string
  time: string
  unread?: boolean
  avatar?: NotificationAvatar
  username?: string
  link?: string
  actions?: NotificationAction[]
  badge?: string
  attachment?: NotificationAttachment
  meta?: NotificationMeta
  progress?: number
  progressVariant?: "default" | "success"
  avatarGroup?: NotificationGroupMember[]
  avatarGroupCount?: number
  rating?: number
  eventDate?: string
  eventTime?: string
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "mention",
    variant: "info",
    title: "mentioned you in Mission",
    body: "Can you check the pallet handover at Station 12 before tonight?",
    time: "2 min ago",
    unread: true,
    avatar: {
      src: "https://reui.io/assets/300-61.png",
      fallback: "MS",
    },
    username: "Mira Stone",
    link: "#8812",
  },
  {
    id: "n2",
    type: "system",
    variant: "warning",
    title: "Dock 4 lost telemetry",
    body: "No heartbeat for 6 minutes. Robots queued at the dock were rerouted.",
    time: "15 min ago",
    unread: true,
    badge: "Urgent",
    actions: [
      { label: "Reconnect", variant: "default" },
      { label: "Dismiss", variant: "outline" },
    ],
  },
  {
    id: "n3",
    type: "feedback",
    variant: "success",
    title: "rated the new mission planner",
    body: "Route previews made the night shift handover much faster.",
    time: "1 hour ago",
    unread: true,
    avatar: {
      src: "https://reui.io/assets/300-62.png",
      fallback: "LG",
    },
    username: "Leo Grant",
    rating: 4,
  },
  {
    id: "n4",
    type: "approval",
    variant: "warning",
    title: "Pending approval",
    body: "Night Shift route change for Depot B requires your approval before rollout.",
    time: "2 hours ago",
    unread: true,
    actions: [
      { label: "Approve", variant: "default" },
      { label: "Review", variant: "outline" },
    ],
    meta: { label: "Priority", value: "High", color: "text-warning" },
  },
  {
    id: "n5",
    type: "deployment",
    variant: "success",
    title: "Firmware 2.4.1 rolled out",
    body: "286 robots updated to the new battery controller without downtime.",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: "n6",
    type: "team_join",
    variant: "success",
    title: "3 new operators joined the fleet",
    body: "Nora, Theo and David have been added to the Night Shift roster.",
    time: "4 hours ago",
    unread: true,
    avatarGroup: [
      {
        src: "https://reui.io/assets/300-63.png",
        fallback: "NV",
        online: true,
      },
      {
        src: "https://reui.io/assets/300-64.png",
        fallback: "TP",
      },
      {
        src: "https://reui.io/assets/300-65.png",
        fallback: "DK",
      },
    ],
  },
  {
    id: "n7",
    type: "achievement",
    variant: "success",
    title: "Charging milestone reached!",
    body: "1,000 charge cycles completed this month across the fleet.",
    time: "5 hours ago",
    unread: false,
    progress: 72,
    progressVariant: "success",
    meta: { label: "Goal", value: "1,200 cycles", color: "text-success" },
  },
  {
    id: "n8",
    type: "event",
    variant: "info",
    title: "Maintenance window reminder",
    body: "Quarterly dock service for Depot B chargers.",
    time: "6 hours ago",
    unread: true,
    eventDate: "Sep 3, 2026",
    eventTime: "1:00 to 3:00 AM",
    meta: { label: "Where", value: "Depot B", color: "text-info" },
    actions: [
      { label: "Acknowledge", variant: "default" },
      { label: "Decline", variant: "outline" },
    ],
  },
  {
    id: "n9",
    type: "share",
    variant: "info",
    title: "shared the monthly fleet audit",
    time: "8 hours ago",
    unread: false,
    avatar: {
      src: "https://reui.io/assets/300-65.png",
      fallback: "DK",
    },
    username: "David Kim",
    attachment: { name: "Fleet audit August.pdf", size: "2.4 MB" },
  },
]