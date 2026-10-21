import type { ReactNode } from "react"
import type { BadgeProps } from "@/components/reui/badge"
import { UsersIcon, FileTextIcon, ShieldCheckIcon, RocketIcon, LockIcon, ZapIcon } from "lucide-react"

export type PresetValue = "service-desk" | "ops-brief" | "partner-portal"

export type TemplateValue = "response-hub" | "partner-room" | "signal-board"

export type RuntimeValue = "next-app" | "worker" | "hybrid"

export type RegionValue = "iad" | "fra" | "sin"

export type SelectOption<TValue extends string = string> = {
  value: TValue
  label: string
  description: string
}

export type PromptPreset = {
  value: PresetValue
  label: string
  description: string
  prompt: string
  icon: ReactNode
}

export type RepositoryRecord = {
  id: string
  name: string
  owner: string
  branch: string
  updated: string
  visibility: string
  description: string
  badgeVariant: BadgeProps["variant"]
}

export type StarterTemplate = {
  value: TemplateValue
  title: string
  description: string
  badge: string
  badgeVariant: BadgeProps["variant"]
  icon: ReactNode
  stats: string[]
}

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    value: "service-desk",
    label: "Service Desk",
    description: "Queues, SLAs, and owner handoff.",
    prompt:
      "Create a service desk app with priority queues, SLA badges, and owner handoff notes.",
    icon: (
      <UsersIcon aria-hidden="true" />
    ),
  },
  {
    value: "ops-brief",
    label: "Ops Brief",
    description: "Incidents, owners, and live notes.",
    prompt:
      "Build an operations brief for incident updates, readiness checks, and executive notes.",
    icon: (
      <FileTextIcon aria-hidden="true" />
    ),
  },
  {
    value: "partner-portal",
    label: "Partner Portal",
    description: "Secure access and shared assets.",
    prompt:
      "Generate a partner portal with asset requests, approval status, and secure onboarding.",
    icon: (
      <ShieldCheckIcon aria-hidden="true" />
    ),
  },
]

export const REPOSITORIES: RepositoryRecord[] = [
  {
    id: "meadow-relay",
    name: "meadow-relay",
    owner: "atlaslane",
    branch: "main",
    updated: "8 min ago",
    visibility: "Private",
    description: "Customer routing and SLA webhooks.",
    badgeVariant: "secondary",
  },
  {
    id: "dispatch-room",
    name: "dispatch-room",
    owner: "atlaslane",
    branch: "release",
    updated: "1 h ago",
    visibility: "Internal",
    description: "Shift handoff tools for launch teams.",
    badgeVariant: "info-light",
  },
  {
    id: "signal-ledger",
    name: "signal-ledger",
    owner: "platform-labs",
    branch: "stable",
    updated: "4 h ago",
    visibility: "Private",
    description: "Event audit views and status streams.",
    badgeVariant: "secondary",
  },
  {
    id: "northline-web",
    name: "northline-web",
    owner: "field-systems",
    branch: "preview",
    updated: "Yesterday",
    visibility: "Shared",
    description: "Authenticated portal and asset vault.",
    badgeVariant: "success-light",
  },
]

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    value: "response-hub",
    title: "Response Hub",
    description: "Incident queues, escalation notes, and executive readouts.",
    badge: "Ops",
    badgeVariant: "warning-light",
    icon: (
      <RocketIcon aria-hidden="true" />
    ),
    stats: ["Queues", "SLA clock", "Briefing"],
  },
  {
    value: "partner-room",
    title: "Partner Room",
    description: "Access requests, resource sharing, and approval lanes.",
    badge: "Secure",
    badgeVariant: "success-light",
    icon: (
      <LockIcon aria-hidden="true" />
    ),
    stats: ["Approvals", "Assets", "Audit"],
  },
  {
    value: "signal-board",
    title: "Signal Board",
    description: "Live signals, deployment health, and operator annotations.",
    badge: "Live",
    badgeVariant: "info-light",
    icon: (
      <ZapIcon aria-hidden="true" />
    ),
    stats: ["Events", "Health", "Notes"],
  },
]

export const RUNTIME_OPTIONS: SelectOption<RuntimeValue>[] = [
  {
    value: "next-app",
    label: "Next.js App",
    description: "Pages, actions, and authenticated routes.",
  },
  {
    value: "worker",
    label: "Edge Worker",
    description: "Fast event handlers and request transforms.",
  },
  {
    value: "hybrid",
    label: "Hybrid Runtime",
    description: "Application UI with background processors.",
  },
]

export const REGION_OPTIONS: SelectOption<RegionValue>[] = [
  {
    value: "iad",
    label: "US East",
    description: "Low latency for North America.",
  },
  {
    value: "fra",
    label: "Frankfurt",
    description: "EU processing and residency.",
  },
  {
    value: "sin",
    label: "Singapore",
    description: "Asia-Pacific edge entry.",
  },
]

export const DEFAULT_FORM_VALUES = {
  appName: "Meadow Relay",
  appSlug: "meadow-relay",
  command:
    "pnpm create launch-room@latest meadow-relay --template response-hub",
}