import { type ReactNode } from "react"

import { AnthropicBlack } from "@/components/ui/svgs/anthropicBlack"
import { AnthropicWhite } from "@/components/ui/svgs/anthropicWhite"
import { Convex } from "@/components/ui/svgs/convex"
import { CursorDark } from "@/components/ui/svgs/cursorDark"
import { CursorLight } from "@/components/ui/svgs/cursorLight"
import { Hono } from "@/components/ui/svgs/hono"
import { Mintlify } from "@/components/ui/svgs/mintlify"
import { ModelContextProtocolDark } from "@/components/ui/svgs/modelContextProtocolDark"
import { ModelContextProtocolLight } from "@/components/ui/svgs/modelContextProtocolLight"
import { N8n } from "@/components/ui/svgs/n8n"
import { Neon } from "@/components/ui/svgs/neon"
import { Openai } from "@/components/ui/svgs/openai"
import { OpenaiDark } from "@/components/ui/svgs/openaiDark"
import { Openclaw } from "@/components/ui/svgs/openclaw"
import { Paper } from "@/components/ui/svgs/paper"
import { Paypal } from "@/components/ui/svgs/paypal"
import { Planetscale } from "@/components/ui/svgs/planetscale"
import { PlanetscaleDark } from "@/components/ui/svgs/planetscaleDark"
import { Prisma } from "@/components/ui/svgs/prisma"
import { PrismaDark } from "@/components/ui/svgs/prismaDark"
import { RemixDark } from "@/components/ui/svgs/remixDark"
import { RemixLight } from "@/components/ui/svgs/remixLight"
import { ResendIconBlack } from "@/components/ui/svgs/resendIconBlack"
import { ResendIconWhite } from "@/components/ui/svgs/resendIconWhite"
import { Slack } from "@/components/ui/svgs/slack"
import { Stripe } from "@/components/ui/svgs/stripe"
import { Supabase } from "@/components/ui/svgs/supabase"
import { Surrealdb } from "@/components/ui/svgs/surrealdb"
import { Zoom } from "@/components/ui/svgs/zoom"

// ── Types ──

export type ContactStatus = "Lead" | "Active" | "Churned" | "Prospect"
export type ContactStage =
  | "Awareness"
  | "Consideration"
  | "Decision"
  | "Retention"
export type ContactPriority = "High" | "Medium" | "Low"

/** Closed vocabulary for category tags (filters + badge colors). */
export const CATEGORY_LABELS = [
  "E-commerce",
  "Enterprise",
  "P2P",
  "AI",
  "Digital",
  "Infrastructure",
  "Developer tools",
  "Automation",
] as const

export type CategoryLabel = (typeof CATEGORY_LABELS)[number]

export interface IContact {
  id: string
  name: string
  avatar: string
  availability: "online" | "away" | "busy" | "offline"
  email: string
  phone: string
  company: string
  companyLogo: ReactNode
  jobTitle: string
  department: string
  location: string
  flag: string
  status: ContactStatus
  stage: ContactStage
  priority: ContactPriority
  score: number
  revenue: number
  deals: number
  lastContact: string
  /** 1-4 labels from CATEGORY_LABELS */
  tags: CategoryLabel[]
  /** 16-point series for stock / trend sparkline */
  engagementData: number[]
}

// ── Helpers ──

/** Deterministic wavy 16-point series per row id (1-10 realistic range). */
export function engagementSeriesForId(id: string): number[] {
  const seed = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const out: number[] = []
  for (let i = 0; i < 16; i++) {
    const wobble =
      Math.sin((seed + i) * 0.85) * 2.8 + Math.cos((seed + i * 2) * 0.4) * 1.6
    const base = 4.2 + (seed % 4) + ((i * 5 + seed) % 4) * 0.35
    const v = Math.round(Math.max(1, Math.min(10, base + wobble)))
    out.push(v)
  }
  return out
}

function VercelMark() {
  return (
    <svg
      viewBox="0 0 76 65"
      className="text-foreground size-5 shrink-0"
      aria-hidden
    >
      <path fill="currentColor" d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  )
}

// ── Logos ──

const OPENAI_LOGO = (
  <>
    <span aria-hidden className="dark:hidden">
      <Openai className="size-5" />
    </span>
    <span aria-hidden className="hidden dark:block">
      <OpenaiDark className="size-5" />
    </span>
  </>
)

const RESEND_LOGO = (
  <>
    <span aria-hidden className="dark:hidden">
      <ResendIconBlack className="size-5" />
    </span>
    <span aria-hidden className="hidden dark:block">
      <ResendIconWhite className="size-5" />
    </span>
  </>
)

const ANTHROPIC_LOGO = (
  <>
    <span aria-hidden className="dark:hidden">
      <AnthropicBlack className="size-5" />
    </span>
    <span aria-hidden className="hidden dark:block">
      <AnthropicWhite className="size-5" />
    </span>
  </>
)

const PRISMA_LOGO = (
  <>
    <span aria-hidden className="dark:hidden">
      <Prisma className="size-5" />
    </span>
    <span aria-hidden className="hidden dark:block">
      <PrismaDark className="size-5" />
    </span>
  </>
)

const REMIX_LOGO = (
  <>
    <span aria-hidden className="dark:hidden">
      <RemixLight className="size-5" />
    </span>
    <span aria-hidden className="hidden dark:block">
      <RemixDark className="size-5" />
    </span>
  </>
)

const MCP_LOGO = (
  <>
    <span aria-hidden className="dark:hidden">
      <ModelContextProtocolLight className="size-5" />
    </span>
    <span aria-hidden className="hidden dark:block">
      <ModelContextProtocolDark className="size-5" />
    </span>
  </>
)

const PLANETSCALE_LOGO = (
  <>
    <span aria-hidden className="dark:hidden">
      <Planetscale className="text-foreground size-5" />
    </span>
    <span aria-hidden className="hidden dark:block">
      <PlanetscaleDark className="size-5" />
    </span>
  </>
)

const CURSOR_LOGO = (
  <>
    <span aria-hidden className="dark:hidden">
      <CursorLight className="text-foreground size-5 [&_path]:fill-current" />
    </span>
    <span aria-hidden className="hidden dark:block">
      <CursorDark className="text-foreground size-5 [&_path]:fill-current" />
    </span>
  </>
)

const SLACK_LOGO = <Slack className="size-5 shrink-0" aria-hidden="true" />

/** Light / dark symbol marks (see brand-logo-sourcing.mdc). */
const ZOOM_LOGO = <Zoom className="size-5 shrink-0" aria-hidden="true" />

// ── Data (22 rows, 1-4 categories each) ──

export const CONTACTS: IContact[] = [
  {
    id: "1",
    name: "Theresa Webb",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&dpr=2&q=80",
    availability: "online",
    email: "theresa@stripe.com",
    phone: "+1 (555) 234-5678",
    company: "Stripe",
    companyLogo: <Stripe className="size-5" aria-hidden="true" />,
    jobTitle: "VP of Sales",
    department: "Sales",
    location: "United States",
    flag: "us",
    status: "Active",
    stage: "Retention",
    priority: "High",
    score: 92,
    revenue: 48500,
    deals: 7,
    lastContact: "Mar 12, 2025",
    tags: ["E-commerce", "Enterprise"],
    engagementData: engagementSeriesForId("1"),
  },
  {
    id: "2",
    name: "Cameron Williamson",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&dpr=2&q=80",
    availability: "away",
    email: "cameron@mintlify.com",
    phone: "+1 (555) 345-6789",
    company: "Mintlify",
    companyLogo: <Mintlify className="size-5" aria-hidden="true" />,
    jobTitle: "Head of Engineering",
    department: "Engineering",
    location: "United Kingdom",
    flag: "gb",
    status: "Active",
    stage: "Decision",
    priority: "High",
    score: 93,
    revenue: 62300,
    deals: 5,
    lastContact: "Jun 16, 2025",
    tags: ["P2P", "AI", "Developer tools"],
    engagementData: engagementSeriesForId("2"),
  },
  {
    id: "3",
    name: "Kathryn Murphy",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&dpr=2&q=80",
    availability: "busy",
    email: "kathryn@paper.design",
    phone: "+1 (555) 456-7890",
    company: "Paper",
    companyLogo: <Paper className="size-5" aria-hidden="true" />,
    jobTitle: "Product Designer",
    department: "Design",
    location: "Germany",
    flag: "de",
    status: "Active",
    stage: "Consideration",
    priority: "Medium",
    score: 42,
    revenue: 31200,
    deals: 3,
    lastContact: "Aug 18, 2025",
    tags: ["E-commerce", "P2P", "Digital"],
    engagementData: engagementSeriesForId("3"),
  },
  {
    id: "4",
    name: "Dianne Russell",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&dpr=2&q=80",
    availability: "online",
    email: "dianne@openai.com",
    phone: "+1 (555) 567-8901",
    company: "OpenAI",
    companyLogo: OPENAI_LOGO,
    jobTitle: "Marketing Director",
    department: "Marketing",
    location: "Canada",
    flag: "ca",
    status: "Active",
    stage: "Retention",
    priority: "High",
    score: 77,
    revenue: 54700,
    deals: 9,
    lastContact: "Nov 29, 2025",
    tags: ["Digital", "AI"],
    engagementData: engagementSeriesForId("4"),
  },
  {
    id: "5",
    name: "Marvin McKinney",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&dpr=2&q=80",
    availability: "offline",
    email: "marvin@resend.dev",
    phone: "+1 (555) 678-9012",
    company: "Resend",
    companyLogo: RESEND_LOGO,
    jobTitle: "Software Engineer",
    department: "Engineering",
    location: "France",
    flag: "fr",
    status: "Prospect",
    stage: "Awareness",
    priority: "Low",
    score: 18,
    revenue: 0,
    deals: 1,
    lastContact: "Mar 13, 2025",
    tags: ["Digital", "P2P", "Automation"],
    engagementData: engagementSeriesForId("5"),
  },
  {
    id: "6",
    name: "Devon Lane",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&dpr=2&q=80",
    availability: "online",
    email: "devon@supabase.com",
    phone: "+1 (555) 789-0123",
    company: "Supabase",
    companyLogo: <Supabase className="size-5" aria-hidden="true" />,
    jobTitle: "Account Executive",
    department: "Sales",
    location: "Australia",
    flag: "au",
    status: "Active",
    stage: "Decision",
    priority: "High",
    score: 22,
    revenue: 78200,
    deals: 12,
    lastContact: "Feb 20, 2025",
    tags: ["E-commerce", "AI", "Infrastructure"],
    engagementData: engagementSeriesForId("6"),
  },
  {
    id: "7",
    name: "Wade Warren",
    avatar:
      "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=96&h=96&dpr=2&q=80",
    availability: "away",
    email: "wade@anthropic.com",
    phone: "+1 (555) 890-1234",
    company: "Anthropic",
    companyLogo: ANTHROPIC_LOGO,
    jobTitle: "Growth Manager",
    department: "Growth",
    location: "Japan",
    flag: "jp",
    status: "Lead",
    stage: "Consideration",
    priority: "Medium",
    score: 11,
    revenue: 14300,
    deals: 2,
    lastContact: "Apr 14, 2025",
    tags: ["E-commerce", "AI"],
    engagementData: engagementSeriesForId("7"),
  },
  {
    id: "8",
    name: "Courtney Henry",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&dpr=2&q=80",
    availability: "busy",
    email: "courtney@prisma.io",
    phone: "+1 (555) 901-2345",
    company: "Prisma",
    companyLogo: PRISMA_LOGO,
    jobTitle: "HR Business Partner",
    department: "People",
    location: "Brazil",
    flag: "br",
    status: "Active",
    stage: "Retention",
    priority: "Medium",
    score: 17,
    revenue: 29800,
    deals: 4,
    lastContact: "Oct 1, 2025",
    tags: ["E-commerce", "Digital", "P2P", "Enterprise"],
    engagementData: engagementSeriesForId("8"),
  },
  {
    id: "9",
    name: "Jane Cooper",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&dpr=2&q=80",
    availability: "online",
    email: "jane@neon.tech",
    phone: "+1 (555) 012-3456",
    company: "Neon",
    companyLogo: <Neon className="size-5" aria-hidden="true" />,
    jobTitle: "Customer Success",
    department: "CS",
    location: "India",
    flag: "in",
    status: "Churned",
    stage: "Awareness",
    priority: "Low",
    score: 65,
    revenue: 8400,
    deals: 1,
    lastContact: "May 15, 2025",
    tags: ["Digital", "Infrastructure"],
    engagementData: engagementSeriesForId("9"),
  },
  {
    id: "10",
    name: "Floyd Miles",
    avatar:
      "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=96&h=96&dpr=2&q=80",
    availability: "offline",
    email: "floyd@n8n.io",
    phone: "+1 (555) 123-9999",
    company: "N8n",
    companyLogo: <N8n className="size-5" aria-hidden="true" />,
    jobTitle: "CFO",
    department: "Finance",
    location: "Spain",
    flag: "es",
    status: "Active",
    stage: "Decision",
    priority: "High",
    score: 88,
    revenue: 91400,
    deals: 14,
    lastContact: "Apr 14, 2025",
    tags: ["E-commerce", "Digital", "Automation"],
    engagementData: engagementSeriesForId("10"),
  },
  {
    id: "11",
    name: "Leslie Alexander",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=96&h=96&dpr=2&q=80",
    availability: "online",
    email: "leslie@convex.dev",
    phone: "+1 (555) 222-3333",
    company: "Convex",
    companyLogo: <Convex className="size-5" aria-hidden="true" />,
    jobTitle: "Scrum Master",
    department: "Engineering",
    location: "Italy",
    flag: "it",
    status: "Prospect",
    stage: "Awareness",
    priority: "Low",
    score: 31,
    revenue: 5200,
    deals: 1,
    lastContact: "Jan 8, 2025",
    tags: ["P2P", "Developer tools"],
    engagementData: engagementSeriesForId("11"),
  },
  {
    id: "12",
    name: "Robert Fox",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&dpr=2&q=80",
    availability: "away",
    email: "robert@remix.run",
    phone: "+1 (555) 444-5555",
    company: "Remix",
    companyLogo: REMIX_LOGO,
    jobTitle: "Enterprise AE",
    department: "Sales",
    location: "South Korea",
    flag: "kr",
    status: "Active",
    stage: "Consideration",
    priority: "Medium",
    score: 59,
    revenue: 33600,
    deals: 6,
    lastContact: "Feb 28, 2025",
    tags: ["AI", "Digital", "Enterprise"],
    engagementData: engagementSeriesForId("12"),
  },
  {
    id: "13",
    name: "Bessie Cooper",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=96&h=96&dpr=2&q=80",
    availability: "online",
    email: "bessie@modelcontextprotocol.io",
    phone: "+1 (555) 666-7777",
    company: "Model Context Protocol",
    companyLogo: MCP_LOGO,
    jobTitle: "DX Engineer",
    department: "Developer Experience",
    location: "Netherlands",
    flag: "nl",
    status: "Active",
    stage: "Retention",
    priority: "High",
    score: 84,
    revenue: 41200,
    deals: 8,
    lastContact: "Mar 5, 2025",
    tags: ["AI", "E-commerce", "Developer tools"],
    engagementData: engagementSeriesForId("13"),
  },
  {
    id: "14",
    name: "Jenny Wilson",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=96&h=96&dpr=2&q=80",
    availability: "busy",
    email: "jenny@hono.dev",
    phone: "+1 (555) 888-9999",
    company: "Hono",
    companyLogo: <Hono className="size-5" aria-hidden="true" />,
    jobTitle: "Product Lead",
    department: "Product",
    location: "Sweden",
    flag: "se",
    status: "Lead",
    stage: "Consideration",
    priority: "Medium",
    score: 46,
    revenue: 18700,
    deals: 3,
    lastContact: "Nov 11, 2025",
    tags: ["Digital", "P2P"],
    engagementData: engagementSeriesForId("14"),
  },
  {
    id: "15",
    name: "Eleanor Pena",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&dpr=2&q=80",
    availability: "online",
    email: "eleanor@openclaw.dev",
    phone: "+1 (555) 100-2001",
    company: "Openclaw",
    companyLogo: <Openclaw className="size-5 shrink-0" aria-hidden="true" />,
    jobTitle: "Solutions Architect",
    department: "Sales Engineering",
    location: "Singapore",
    flag: "sg",
    status: "Active",
    stage: "Decision",
    priority: "High",
    score: 71,
    revenue: 55600,
    deals: 9,
    lastContact: "Jan 22, 2025",
    tags: ["Infrastructure", "Developer tools", "Enterprise", "Digital"],
    engagementData: engagementSeriesForId("15"),
  },
  {
    id: "16",
    name: "Jacob Jones",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=96&h=96&dpr=2&q=80",
    availability: "away",
    email: "jacob@planetscale.com",
    phone: "+1 (555) 100-2002",
    company: "PlanetScale",
    companyLogo: PLANETSCALE_LOGO,
    jobTitle: "Database Reliability",
    department: "Infrastructure",
    location: "Ireland",
    flag: "ie",
    status: "Active",
    stage: "Retention",
    priority: "Medium",
    score: 68,
    revenue: 42100,
    deals: 5,
    lastContact: "Dec 3, 2025",
    tags: ["Infrastructure", "Developer tools"],
    engagementData: engagementSeriesForId("16"),
  },
  {
    id: "17",
    name: "Kristin Watson",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&dpr=2&q=80",
    availability: "busy",
    email: "kristin@cursor.com",
    phone: "+1 (555) 100-2003",
    company: "Cursor",
    companyLogo: CURSOR_LOGO,
    jobTitle: "Design Ops",
    department: "Design",
    location: "Portugal",
    flag: "pt",
    status: "Prospect",
    stage: "Awareness",
    priority: "Low",
    score: 24,
    revenue: 2100,
    deals: 1,
    lastContact: "Feb 2, 2025",
    tags: ["Digital", "Automation"],
    engagementData: engagementSeriesForId("17"),
  },
  {
    id: "18",
    name: "Guy Hawkins",
    avatar:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=96&h=96&dpr=2&q=80",
    availability: "offline",
    email: "guy@surrealdb.com",
    phone: "+1 (555) 100-2004",
    company: "SurrealDB",
    companyLogo: <Surrealdb className="size-5 shrink-0" aria-hidden="true" />,
    jobTitle: "Platform Engineer",
    department: "Engineering",
    location: "Mexico",
    flag: "mx",
    status: "Lead",
    stage: "Consideration",
    priority: "Medium",
    score: 38,
    revenue: 12400,
    deals: 2,
    lastContact: "Mar 30, 2025",
    tags: ["Infrastructure", "P2P", "AI"],
    engagementData: engagementSeriesForId("18"),
  },
  {
    id: "19",
    name: "Annette Black",
    avatar:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=96&h=96&dpr=2&q=80",
    availability: "online",
    email: "annette@slack.com",
    phone: "+1 (555) 100-2005",
    company: "Slack",
    companyLogo: SLACK_LOGO,
    jobTitle: "Revenue Systems Lead",
    department: "Revenue Ops",
    location: "Norway",
    flag: "no",
    status: "Active",
    stage: "Retention",
    priority: "High",
    score: 81,
    revenue: 67800,
    deals: 11,
    lastContact: "Apr 8, 2025",
    tags: ["Automation", "Digital", "Enterprise"],
    engagementData: engagementSeriesForId("19"),
  },
  {
    id: "20",
    name: "Darrell Steward",
    avatar:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=96&h=96&dpr=2&q=80",
    availability: "away",
    email: "darrell@vercel.com",
    phone: "+1 (555) 100-2006",
    company: "Vercel",
    companyLogo: <VercelMark />,
    jobTitle: "Developer Advocate",
    department: "DX",
    location: "United States",
    flag: "us",
    status: "Active",
    stage: "Decision",
    priority: "High",
    score: 90,
    revenue: 71200,
    deals: 8,
    lastContact: "May 1, 2025",
    tags: ["Developer tools", "Digital", "AI"],
    engagementData: engagementSeriesForId("20"),
  },
  {
    id: "21",
    name: "Brooklyn Simmons",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=96&h=96&dpr=2&q=80",
    availability: "online",
    email: "brooklyn@paypal.com",
    phone: "+1 (555) 100-2007",
    company: "PayPal",
    companyLogo: <Paypal className="size-5 shrink-0" aria-hidden="true" />,
    jobTitle: "Partnerships Lead",
    department: "Alliances",
    location: "France",
    flag: "fr",
    status: "Churned",
    stage: "Awareness",
    priority: "Low",
    score: 12,
    revenue: 0,
    deals: 0,
    lastContact: "Jun 12, 2024",
    tags: ["E-commerce"],
    engagementData: engagementSeriesForId("21"),
  },
  {
    id: "22",
    name: "Cody Fisher",
    avatar:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=96&h=96&dpr=2&q=80",
    availability: "busy",
    email: "cody@zoom.us",
    phone: "+1 (555) 100-2008",
    company: "Zoom",
    companyLogo: ZOOM_LOGO,
    jobTitle: "Security Platform Lead",
    department: "Security",
    location: "Poland",
    flag: "pl",
    status: "Active",
    stage: "Retention",
    priority: "Medium",
    score: 55,
    revenue: 38900,
    deals: 4,
    lastContact: "Jul 19, 2025",
    tags: ["Digital", "Enterprise", "Automation"],
    engagementData: engagementSeriesForId("22"),
  },
]