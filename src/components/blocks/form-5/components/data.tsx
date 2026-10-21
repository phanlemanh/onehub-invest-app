"use client"

import type { ReactNode } from "react"
import type { BadgeProps } from "@/components/reui/badge"
import { UserRoundCogIcon, Building2Icon, ShieldCheckIcon, CopyIcon, RefreshCwIcon, UserMinusIcon, SettingsIcon, Trash2Icon, MailIcon, KeyRoundIcon, GlobeIcon, UsersIcon, UserIcon, CalendarCheckIcon, ActivityIcon } from "lucide-react"

// ── Types ──

export type ProfileTabValue = "profile" | "organizations" | "security"
export type ActivityIntensity = 0 | 1 | 2 | 3
export type ProfileActionVariant = "default" | "destructive"

export interface ProfileTab {
  value: ProfileTabValue
  label: string
  icon: ReactNode
}

export interface ProfileSelectOption {
  value: string
  label: string
  description?: string
}

export interface ProfileCountryOption {
  code: string
  label: string
}

export interface ActivityCell {
  id: string
  intensity: ActivityIntensity
  dateLabel: string
  description: string
  eventCount: number
  statusLabel: string
  syncedAt: string
  weekday: string
}

export interface ProfileBadge {
  label: string
  variant: BadgeProps["variant"]
}

export interface ProfileAction {
  id: string
  label: string
  icon: ReactNode
  variant?: ProfileActionVariant
}

export interface ProfileAccountRow {
  id: string
  label: string
  description: string
  meta?: string
  icon: ReactNode
  badge?: ProfileBadge
  verification?: {
    badgeLabel: string
    description: string
    source: string
    updatedAt: string
  }
  actions: ProfileAction[]
}

export interface AuditFact {
  id: string
  label: string
  value: string
  description: string
  icon: ReactNode
  copyable?: boolean
}

export interface SecuritySetting {
  id: string
  title: string
  description: string
  defaultChecked: boolean
}

// ── Profile ──

export const PROFILE_IDENTITY = {
  firstName: "Iris",
  lastName: "Kwon",
  displayName: "Iris Kwon",
  initials: "IK",
  status: "Active today",
  role: "Product operations lead",
  avatar:
    "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=128&h=128&dpr=2&q=80",
  email: "iris.kwon@atlaslane.dev",
  handle: "iris-kwon",
  countryCode: "ca",
  location: "Toronto, Canada",
  timezone: "america-toronto",
  bio: "Coordinates launch approvals, customer handoffs, and product readiness across the Atlas Lane workspace.",
  userId: "usr_8R4m...KX92",
  createdAt: "March 18, 2026",
  updatedAt: "Updated 3h ago",
} as const

export const PROFILE_TABS: ProfileTab[] = [
  {
    value: "profile",
    label: "Profile",
    icon: (
      <UserRoundCogIcon aria-hidden="true" />
    ),
  },
  {
    value: "organizations",
    label: "Organizations",
    icon: (
      <Building2Icon aria-hidden="true" />
    ),
  },
  {
    value: "security",
    label: "Security",
    icon: (
      <ShieldCheckIcon aria-hidden="true" />
    ),
  },
]

export const ROLE_OPTIONS: ProfileSelectOption[] = [
  {
    value: "product-ops-lead",
    label: "Product operations lead",
    description: "Owns launch coordination and readiness handoff.",
  },
  {
    value: "customer-success",
    label: "Customer success manager",
    description: "Manages customer account health and renewals.",
  },
  {
    value: "workspace-admin",
    label: "Workspace admin",
    description: "Manages access, billing, and workspace defaults.",
  },
]

export const LOCALE_OPTIONS: ProfileSelectOption[] = [
  {
    value: "en-ca",
    label: "English (Canada)",
  },
  {
    value: "en-us",
    label: "English (United States)",
  },
  {
    value: "fr-ca",
    label: "French (Canada)",
  },
]

export const COUNTRY_OPTIONS: ProfileCountryOption[] = [
  {
    code: "ca",
    label: "Canada",
  },
  {
    code: "us",
    label: "United States",
  },
  {
    code: "gb",
    label: "United Kingdom",
  },
  {
    code: "de",
    label: "Germany",
  },
  {
    code: "fr",
    label: "France",
  },
  {
    code: "jp",
    label: "Japan",
  },
  {
    code: "au",
    label: "Australia",
  },
  {
    code: "uz",
    label: "Uzbekistan",
  },
]

export const TIMEZONE_OPTIONS: ProfileSelectOption[] = [
  {
    value: "america-toronto",
    label: "Eastern Time (UTC-5)",
  },
  {
    value: "america-los-angeles",
    label: "Pacific Time (UTC-8)",
  },
  {
    value: "europe-london",
    label: "Greenwich Mean Time (UTC+0)",
  },
  {
    value: "europe-berlin",
    label: "Central European Time (UTC+1)",
  },
  {
    value: "asia-tokyo",
    label: "Japan Standard Time (UTC+9)",
  },
  {
    value: "asia-tashkent",
    label: "Uzbekistan Time (UTC+5)",
  },
]

export const VISIBILITY_OPTIONS: ProfileSelectOption[] = [
  {
    value: "workspace",
    label: "Visible to workspace",
    description: "Shown in assignments, mentions, and activity rows.",
  },
  {
    value: "team",
    label: "Team only",
    description: "Shown to direct collaborators and admins.",
  },
  {
    value: "private",
    label: "Private",
    description: "Only admins can view the extended profile.",
  },
]

export const ACTIVITY_YEAR_OPTIONS: ProfileSelectOption[] = [
  {
    value: "2026",
    label: "2026",
  },
  {
    value: "2025",
    label: "2025",
  },
]

export const ORGANIZATION_ROLE_OPTIONS: ProfileSelectOption[] = [
  {
    value: "owner",
    label: "Workspace owner",
  },
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "member",
    label: "Member",
  },
]

export const MFA_OPTIONS: ProfileSelectOption[] = [
  {
    value: "passkey",
    label: "Passkey and authenticator",
  },
  {
    value: "authenticator",
    label: "Authenticator app",
  },
  {
    value: "email",
    label: "Email code fallback",
  },
]

export const SESSION_OPTIONS: ProfileSelectOption[] = [
  {
    value: "14-days",
    label: "14 days",
  },
  {
    value: "30-days",
    label: "30 days",
  },
  {
    value: "90-days",
    label: "90 days",
  },
]

// ── Activity ──

const highActivityCells = new Set([
  88, 89, 90, 91, 115, 137, 138, 139, 192, 241,
])

export const ACTIVITY_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const
export const ACTIVITY_WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const
export const ACTIVITY_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

const activityStartDate = new Date(Date.UTC(2025, 11, 28))

const activityDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

const activityEventCounts: Record<ActivityIntensity, number> = {
  0: 0,
  1: 3,
  2: 7,
  3: 14,
}

const activityStatusLabels: Record<ActivityIntensity, string> = {
  0: "No activity",
  1: "Light",
  2: "Active",
  3: "Peak",
}

const activityDescriptions: Record<ActivityIntensity, string> = {
  0: "No profile or workspace activity was recorded for this day.",
  1: "Profile opened and directory sync refreshed.",
  2: "Profile edits and workspace visits recorded.",
  3: "Profile edits, handoffs, and identity syncs recorded.",
}

export const ACTIVITY_CELLS: ActivityCell[] = Array.from(
  { length: 52 * 7 },
  (_, index) => {
    let intensity: ActivityIntensity = 0

    if (index % 31 === 0 || index % 43 === 0) {
      intensity = 1
    }

    if (index % 67 === 0 || index % 73 === 0) {
      intensity = 2
    }

    if (highActivityCells.has(index)) {
      intensity = 3
    }

    const date = new Date(activityStartDate)
    date.setUTCDate(activityStartDate.getUTCDate() + index)

    const eventCount =
      intensity === 0
        ? 0
        : intensity === 3
          ? activityEventCounts[intensity]
          : activityEventCounts[intensity] + (index % intensity)

    return {
      id: `activity-${index}`,
      intensity,
      dateLabel: activityDateFormatter.format(date),
      description: activityDescriptions[intensity],
      eventCount,
      statusLabel: activityStatusLabels[intensity],
      syncedAt: "Synced 20m ago",
      weekday: ACTIVITY_WEEKDAY_NAMES[index % ACTIVITY_WEEKDAY_NAMES.length],
    }
  }
)

export const ACTIVITY_SUMMARY = {
  activeDays: "41 active days",
  activeDescription:
    "Profile edits, workspace visits, and sign-in events were recorded on 41 days this year.",
  busiestDate: "Apr 22",
  busiestDay: "Wednesday",
  busiestDescription: "14 activity events, including 5 workspace handoffs.",
  updatedAt: "Synced 20m ago",
  syncDescription:
    "Activity is refreshing from audit logs and identity-provider events.",
} as const

// ── Actions ──

export const HEADER_ACTIONS: ProfileAction[] = [
  {
    id: "copy-user-id",
    label: "Copy user ID",
    icon: (
      <CopyIcon aria-hidden="true" />
    ),
  },
  {
    id: "refresh-profile",
    label: "Refresh identity data",
    icon: (
      <RefreshCwIcon aria-hidden="true" />
    ),
  },
  {
    id: "suspend-access",
    label: "Suspend access",
    icon: (
      <UserMinusIcon aria-hidden="true" />
    ),
    variant: "destructive",
  },
]

const rowActions: ProfileAction[] = [
  {
    id: "copy-value",
    label: "Copy value",
    icon: (
      <CopyIcon aria-hidden="true" />
    ),
  },
  {
    id: "review-settings",
    label: "Review settings",
    icon: (
      <SettingsIcon aria-hidden="true" />
    ),
  },
  {
    id: "remove-record",
    label: "Remove record",
    icon: (
      <Trash2Icon aria-hidden="true" />
    ),
    variant: "destructive",
  },
]

// ── Rows ──

export const EMAIL_ROWS: ProfileAccountRow[] = [
  {
    id: "primary-email",
    label: "iris.kwon@atlaslane.dev",
    description: "Primary sign-in, recovery, and workspace notification email.",
    meta: "Added 3h ago",
    icon: (
      <MailIcon aria-hidden="true" />
    ),
    badge: {
      label: "Primary",
      variant: "success-light",
    },
    verification: {
      badgeLabel: "Verified",
      description: "Domain ownership and email routing have been confirmed.",
      source: "DNS + SMTP checks",
      updatedAt: "Checked 20m ago",
    },
    actions: rowActions,
  },
  {
    id: "work-alias",
    label: "launches@atlaslane.dev",
    description: "Shared launch review alias for customer-facing updates.",
    meta: "Linked 2d ago",
    icon: (
      <MailIcon aria-hidden="true" />
    ),
    actions: rowActions,
  },
]

export const CONNECTED_ACCOUNT_ROWS: ProfileAccountRow[] = [
  {
    id: "sso-account",
    label: "Atlas Lane SSO",
    description: "SAML identity source with profile sync enabled.",
    meta: "Synced 12m ago",
    icon: (
      <KeyRoundIcon aria-hidden="true" />
    ),
    badge: {
      label: "Managed",
      variant: "primary-light",
    },
    verification: {
      badgeLabel: "Managed",
      description: "Identity provider ownership and SAML metadata are active.",
      source: "SAML metadata",
      updatedAt: "Synced 12m ago",
    },
    actions: rowActions,
  },
  {
    id: "docs-portal",
    label: "Customer docs portal",
    description: "Public author profile for changelogs and launch notes.",
    meta: "Visible",
    icon: (
      <GlobeIcon aria-hidden="true" />
    ),
    actions: rowActions,
  },
]

export const ORGANIZATION_ROWS: ProfileAccountRow[] = [
  {
    id: "atlas-lane",
    label: "Atlas Lane",
    description: "Production workspace with billing and user admin access.",
    meta: "Owner",
    icon: (
      <Building2Icon aria-hidden="true" />
    ),
    badge: {
      label: "Default",
      variant: "info-light",
    },
    actions: rowActions,
  },
  {
    id: "launch-council",
    label: "Launch Council",
    description: "Cross-functional approval group for customer releases.",
    meta: "Admin",
    icon: (
      <UsersIcon aria-hidden="true" />
    ),
    actions: rowActions,
  },
]

export const AUDIT_FACTS: AuditFact[] = [
  {
    id: "user-id",
    label: "User ID",
    value: PROFILE_IDENTITY.userId,
    description: "Stable identifier",
    copyable: true,
    icon: (
      <UserIcon aria-hidden="true" />
    ),
  },
  {
    id: "primary-email-fact",
    label: "Primary Email",
    value: PROFILE_IDENTITY.email,
    description: "Verified contact",
    copyable: true,
    icon: (
      <MailIcon aria-hidden="true" />
    ),
  },
  {
    id: "created",
    label: "User Since",
    value: PROFILE_IDENTITY.createdAt,
    description: "Created by admin invite",
    icon: (
      <CalendarCheckIcon aria-hidden="true" />
    ),
  },
  {
    id: "updated",
    label: "Profile Updated",
    value: PROFILE_IDENTITY.updatedAt,
    description: "Identity sync complete",
    icon: (
      <ActivityIcon aria-hidden="true" />
    ),
  },
]

export const SECURITY_SETTINGS: SecuritySetting[] = [
  {
    id: "enforce-passkeys",
    title: "Require passkey on privileged actions",
    description: "Recommended for billing, role, and export changes.",
    defaultChecked: true,
  },
  {
    id: "notify-on-new-device",
    title: "Notify on new trusted device",
    description: "Send a profile alert when a device is approved.",
    defaultChecked: true,
  },
  {
    id: "hide-personal-email",
    title: "Hide personal email from workspace members",
    description: "Show only the workspace alias outside admin views.",
    defaultChecked: false,
  },
]