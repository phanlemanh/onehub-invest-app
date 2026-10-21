"use client"

/**
 * Decorative product shot for the hero: an analytics console built as real markup,
 * authored at 1400 x 1000 and scaled to its container as one piece.
 * It is one `role="img"` to assistive tech, so nothing inside is focusable.
 * customize: content in KPIS / ORDERS / NAV_ITEMS; card surface in PANEL.
 */
import { useId } from "react"
import { Badge } from "@/components/reui/badge"
import { IconTile } from "@/components/reui/icon-tile"
import { cn } from "cn"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Item } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LayoutGridIcon, UsersIcon, ChevronDownIcon, Building2Icon, ChevronRightIcon, ShieldCheckIcon, WebhookIcon, KeyRoundIcon, CircleDollarSignIcon, TrendingUp, PackageIcon, ShoppingCartIcon, TrendingDown, LayersIcon, ChevronsUpDownIcon, ActivityIcon, SearchIcon, FilterIcon } from "lucide-react"

// Ambient motion. Delete this string and the <style> tag below to ship it static;
// nothing else depends on it.
const FRAME_MOTION = `
/* Each loop settles early then holds, so the shot reads as a console that just
   refreshed rather than a banner mid-cycle. */
@keyframes hero8-grow {
  0% { transform: scaleY(0.34) }
  38%, 100% { transform: scaleY(1) }
}
@keyframes hero8-rise {
  0% { opacity: 0.45; transform: translateY(3px) }
  14%, 100% { opacity: 1; transform: translateY(0) }
}
@keyframes hero8-fill {
  0% { transform: scaleX(0.12) }
  40%, 100% { transform: scaleX(1) }
}
@keyframes hero8-live {
  0%, 100% { opacity: 0 }
  26%, 58% { opacity: 0.07 }
}
@keyframes hero8-scan {
  0% { opacity: 0; transform: translateX(0) }
  12%, 72% { opacity: 1 }
  100% { opacity: 0; transform: translateX(351px) }
}
@keyframes hero8-blink {
  0%, 100% { opacity: 1 }
  50% { opacity: 0.45 }
}

/* Set \`--hero8-delay\` per element to stagger siblings; keep it a custom property,
   because an inline \`animation\` shorthand would outrank the reduced-motion rule. */
.hero8-grow,
.hero8-rise,
.hero8-track [data-slot="progress-indicator"] {
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  animation-iteration-count: infinite;
  animation-fill-mode: both;
  animation-delay: var(--hero8-delay, 0s);
}

.hero8-grow { animation-name: hero8-grow; animation-duration: 11.3s; }
.hero8-rise { animation-name: hero8-rise; animation-duration: 13.7s; }

/* The primitive owns the indicator node, so the fill is reached through its
   data-slot instead of a class on the element itself. */
.hero8-track [data-slot="progress-indicator"] {
  transform-origin: left center;
  animation-name: hero8-fill;
  animation-duration: 10.1s;
}

.hero8-blink {
  animation: hero8-blink 3.7s ease-in-out var(--hero8-delay, 0s) infinite;
}

.hero8-scan {
  opacity: 0;
  animation: hero8-scan 15.5s linear var(--hero8-delay, -5.5s) infinite;
}

.hero8-live > td { position: relative; }
.hero8-live > td::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: var(--color-sky-500);
  /* Custom properties inherit into pseudo-elements, which is the only way to
     stagger a highlight that has no element of its own. */
  animation: hero8-live 9.7s ease-in-out var(--hero8-delay, 0s) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero8-grow,
  .hero8-rise,
  .hero8-blink,
  .hero8-scan,
  .hero8-track [data-slot="progress-indicator"],
  .hero8-live > td::after {
    animation: none;
  }
  .hero8-scan,
  .hero8-live > td::after {
    opacity: 0;
  }
}
`

// Shared card surface. Keep the text color: Card re-applies `text-card-foreground`
// per instance, and an uncolored card here turns white-on-white.
const PANEL =
  "border-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 ring-slate-900/8 dark:ring-white/10"

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    active: true,
    icon: (
      <LayoutGridIcon aria-hidden="true" className="size-4 shrink-0" />
    ),
    trailing: null,
  },
  {
    id: "users",
    label: "Users",
    active: false,
    icon: (
      <UsersIcon aria-hidden="true" className="size-4 shrink-0" />
    ),
    trailing: (
      <ChevronDownIcon aria-hidden="true" className="ms-auto size-3 shrink-0 text-slate-400 dark:text-slate-500" />
    ),
  },
  {
    id: "organizations",
    label: "Organizations",
    active: false,
    icon: (
      <Building2Icon aria-hidden="true" className="size-4 shrink-0" />
    ),
    trailing: (
      <ChevronRightIcon aria-hidden="true" className="ms-auto size-3 shrink-0 text-slate-300 dark:text-slate-600" />
    ),
  },
  {
    id: "security",
    label: "Security",
    active: false,
    icon: (
      <ShieldCheckIcon aria-hidden="true" className="size-4 shrink-0" />
    ),
    trailing: (
      <ChevronRightIcon aria-hidden="true" className="ms-auto size-3 shrink-0 text-slate-300 dark:text-slate-600" />
    ),
  },
  {
    id: "webhooks",
    label: "Webhooks",
    active: false,
    icon: (
      <WebhookIcon aria-hidden="true" className="size-4 shrink-0" />
    ),
    trailing: null,
  },
  {
    id: "api-keys",
    label: "API Keys",
    active: false,
    icon: (
      <KeyRoundIcon aria-hidden="true" className="size-4 shrink-0" />
    ),
    trailing: null,
  },
]

/** Rendered under the Users row, which is the one expanded branch in the source shot. */
const USER_SUB_ITEMS = [
  { id: "all-users", label: "All Users", active: false },
  { id: "invitations", label: "Invitations", active: false },
  { id: "roles", label: "Roles", active: true },
]

const KPIS = [
  {
    id: "net-revenue",
    label: "Net Revenue",
    caption: "12.8% above plan",
    value: "$128,420",
    delta: "+12.8%",
    deltaClassName:
      "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    barClassName: "bg-emerald-500/70",
    bars: [34, 44, 39, 52, 47, 60, 55, 68, 63, 79, 86, 96],
    icon: (
      <CircleDollarSignIcon aria-hidden="true" />
    ),
    deltaIcon: (
      <TrendingUp aria-hidden="true" className="size-3" />
    ),
  },
  {
    id: "units-moved",
    label: "Units Moved",
    caption: "84% of monthly goal",
    value: "4,892",
    delta: "+9.4%",
    deltaClassName:
      "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    barClassName: "bg-violet-500/70",
    bars: [42, 38, 50, 46, 58, 53, 66, 61, 74, 70, 82, 90],
    icon: (
      <PackageIcon aria-hidden="true" />
    ),
    deltaIcon: (
      <TrendingUp aria-hidden="true" className="size-3" />
    ),
  },
  {
    id: "new-buyers",
    label: "New Buyers",
    caption: "188 via referral",
    value: "642",
    delta: "+18.6%",
    deltaClassName:
      "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    barClassName: "bg-sky-500/70",
    bars: [28, 36, 33, 45, 40, 54, 49, 63, 58, 72, 80, 88],
    icon: (
      <UsersIcon aria-hidden="true" />
    ),
    deltaIcon: (
      <TrendingUp aria-hidden="true" className="size-3" />
    ),
  },
  {
    id: "cart-recovery",
    label: "Cart Recovery",
    caption: "risk in paid social",
    value: "38.4%",
    delta: "-2.1%",
    deltaClassName:
      "border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300",
    barClassName: "bg-amber-400/80",
    bars: [88, 82, 85, 74, 78, 66, 70, 58, 62, 50, 46, 40],
    icon: (
      <ShoppingCartIcon aria-hidden="true" />
    ),
    deltaIcon: (
      <TrendingDown aria-hidden="true" className="size-3" />
    ),
  },
]

const PACE_STATS = [
  { id: "booked", label: "Booked", value: "$128K", suffix: null },
  { id: "plan-gap", label: "Plan Gap", value: "+$10K", suffix: null },
  { id: "gross-profit", label: "Gross Profit", value: "$41K", suffix: "32%" },
]

const PACE_LEGEND = [
  { id: "online", label: "Online", dotClassName: "bg-violet-500" },
  { id: "retail", label: "Retail", dotClassName: "bg-sky-400" },
  { id: "plan", label: "Plan", dotClassName: "bg-slate-400 dark:bg-slate-500" },
]

const PACE_TICKS = ["Aug 02", "Aug 03", "Aug 04"]

const MIX_STATS = [
  { id: "latest-orders", label: "Latest Orders", value: "46" },
  { id: "direct-share", label: "Direct Share", value: "39%" },
]

const MIX_LEGEND = [
  { id: "direct", label: "Direct", dotClassName: "bg-sky-400" },
  { id: "partners", label: "Partners", dotClassName: "bg-violet-500" },
  { id: "marketplace", label: "Marketplace", dotClassName: "bg-amber-400" },
]

/** Segments run top to bottom, matching the stack order in the source shot. */
const MIX_DAYS = [
  {
    id: "fri",
    label: "Fri",
    height: 100,
    segments: [
      { id: "marketplace", size: 32, className: "bg-amber-400" },
      { id: "partners", size: 24, className: "bg-violet-500" },
      { id: "direct", size: 44, className: "bg-sky-400" },
    ],
  },
  {
    id: "sat",
    label: "Sat",
    height: 96,
    segments: [
      { id: "marketplace", size: 34, className: "bg-amber-400" },
      { id: "partners", size: 26, className: "bg-violet-500" },
      { id: "direct", size: 40, className: "bg-sky-400" },
    ],
  },
  {
    id: "sun",
    label: "Sun",
    height: 93,
    segments: [
      { id: "marketplace", size: 31, className: "bg-amber-400" },
      { id: "partners", size: 22, className: "bg-violet-500" },
      { id: "direct", size: 47, className: "bg-sky-400" },
    ],
  },
  {
    id: "mon",
    label: "Mon",
    height: 99,
    segments: [
      { id: "marketplace", size: 29, className: "bg-amber-400" },
      { id: "partners", size: 28, className: "bg-violet-500" },
      { id: "direct", size: 43, className: "bg-sky-400" },
    ],
  },
]

/**
 * Percent widths because the table runs `table-fixed`: at this scale the auto
 * layout resolved 25px wider than the panel and clipped the row action.
 */
const ORDER_COLUMNS = [
  { id: "order", label: "Order", className: "w-[12%]" },
  { id: "customer", label: "Customer", className: "w-[22%]" },
  { id: "product", label: "Product", className: "w-[21%]" },
  { id: "fulfillment", label: "Fulfillment", className: "w-[15%]" },
  { id: "amount", label: "Amount", className: "w-[10%]" },
  { id: "status", label: "Status", className: "w-[12%]" },
]

/** Portraits come from the BLOCK_AVATARS pool; one person, one portrait. */
const ORDERS = [
  {
    id: "RVO-7423",
    date: "Aug 02",
    name: "Alex Johnson",
    channel: "Partner",
    initials: "AJ",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
    product: "Aero Carry Kit",
    stage: "Shipped",
    progress: 84,
    trackClassName: "[&_[data-slot=progress-indicator]]:bg-emerald-500",
    amount: "$652",
    quantity: "Qty 4",
    status: "Paid",
    statusClassName:
      "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    statusDotClassName: "bg-emerald-500",
    live: true,
  },
  {
    id: "RVO-7418",
    date: "Aug 04",
    name: "Mira Stone",
    channel: "Direct",
    initials: "MS",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&dpr=2&q=80",
    product: "Aero Carry Kit",
    stage: "Shipped",
    progress: 100,
    trackClassName: "[&_[data-slot=progress-indicator]]:bg-emerald-500",
    amount: "$489",
    quantity: "Qty 3",
    status: "Paid",
    statusClassName:
      "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    statusDotClassName: "bg-emerald-500",
    live: false,
  },
  {
    id: "RVO-7420",
    date: "Aug 03",
    name: "Nora Vale",
    channel: "Marketplace",
    initials: "NV",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&dpr=2&q=80",
    product: "Orbit Weekender",
    stage: "On Hold",
    progress: 28,
    trackClassName: "[&_[data-slot=progress-indicator]]:bg-violet-500",
    amount: "$319",
    quantity: "Qty 1",
    status: "Review",
    statusClassName:
      "border-violet-200 dark:border-violet-500/25 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300",
    statusDotClassName: "bg-violet-500",
    live: false,
  },
  {
    id: "RVO-7419",
    date: "Aug 03",
    name: "Leo Grant",
    channel: "Direct",
    initials: "LG",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&dpr=2&q=80",
    product: "Pulse Desk Lamp",
    stage: "Packing",
    progress: 56,
    trackClassName: "[&_[data-slot=progress-indicator]]:bg-amber-400",
    amount: "$268",
    quantity: "Qty 2",
    status: "Pending",
    statusClassName:
      "border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300",
    statusDotClassName: "bg-amber-400",
    live: false,
  },
]

/** A twelve bar micro history. Bars grow from the baseline on a long loop. */
function Sparkline({
  bars,
  className,
  delay = 0,
}: {
  bars: number[]
  className: string
  delay?: number
}) {
  return (
    <span aria-hidden="true" className="flex h-7 shrink-0 items-end gap-0.5">
      {bars.map((height, index) => (
        <span
          key={index}
          className={cn("hero8-grow w-1 origin-bottom rounded-full", className)}
          style={
            {
              height: `${height}%`,
              // Negative and cumulative, so bars start dispersed instead of
              // sweeping in as a wave each cycle.
              "--hero8-delay": `${delay - index * 0.09}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  )
}

// Two revenue series with the plan line over them. Keep `non-scaling-stroke` on
// every stroke, or the stretch to panel width thickens the lines.
function RevenuePaceChart() {
  const uid = useId().replace(/:/g, "")
  const onlineFillId = `${uid}-online`
  const retailFillId = `${uid}-retail`
  const hatchId = `${uid}-hatch`

  const online =
    "M0 33 C 24 31 44 16 74 15 C 104 14 120 25 150 24 C 180 23 198 12 228 11 C 240 10.6 250 11 260 11"
  const retail =
    "M0 43 C 24 42 44 33 74 32 C 104 31 120 38 150 37 C 180 36 198 32 228 31 C 240 30.6 250 31 260 31"
  const plan =
    "M0 38 C 40 36 72 25 112 25 C 152 25 180 30 212 28 C 232 27 248 27 260 27"

  return (
    <svg
      viewBox="0 0 260 56"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="min-h-0 w-full flex-1"
    >
      <defs>
        <linearGradient
          id={onlineFillId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
          className="text-violet-500"
        >
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.2} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
        </linearGradient>
        <linearGradient
          id={retailFillId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
          className="text-sky-400"
        >
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.24} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0.03} />
        </linearGradient>
        {/* The source fills both bands with a fine crosshatch rather than a flat wash. */}
        <pattern
          id={hatchId}
          width={4}
          height={4}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="4"
            strokeWidth={1}
            className="stroke-slate-400/20 dark:stroke-slate-500/20"
          />
        </pattern>
      </defs>

      <path d={`${online} L260 56 L0 56 Z`} fill={`url(#${onlineFillId})`} />
      <path d={`${online} L260 56 L0 56 Z`} fill={`url(#${hatchId})`} />
      <path d={`${retail} L260 56 L0 56 Z`} fill={`url(#${retailFillId})`} />

      <path
        d={plan}
        fill="none"
        strokeWidth={1}
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
        className="stroke-slate-400 dark:stroke-slate-500"
      />
      <path
        d={online}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-violet-500"
      />
      <path
        d={retail}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-sky-400"
      />

      {/* One slow read head crossing the window is the live-data signal. */}
      <g className="hero8-scan">
        <rect
          x={0}
          y={0}
          width={1}
          height={56}
          className="fill-violet-500/40"
        />
      </g>

      <line
        x1="0"
        y1="55.5"
        x2="260"
        y2="55.5"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        className="stroke-slate-200 dark:stroke-slate-700"
      />
    </svg>
  )
}

/**
 * Wallpaper chip for the rail promo. Drawn as a gradient rather than shipped as
 * an image so the frame stays a single self-contained file.
 */
function ThemePreview() {
  const uid = useId().replace(/:/g, "")
  const skyId = `${uid}-sky`
  const waveId = `${uid}-wave`

  return (
    <svg
      viewBox="0 0 96 34"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="h-10 w-full"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="1" y2="1">
          <stop
            offset="0%"
            className="text-violet-400"
            stopColor="currentColor"
          />
          <stop
            offset="55%"
            className="text-sky-400"
            stopColor="currentColor"
          />
          <stop
            offset="100%"
            className="text-fuchsia-400"
            stopColor="currentColor"
          />
        </linearGradient>
        <linearGradient id={waveId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity={0.55} />
          <stop offset="100%" stopColor="white" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <rect width={96} height={34} fill={`url(#${skyId})`} />
      <path
        d="M0 26 C 18 26 26 12 48 12 C 70 12 78 22 96 22 L96 34 L0 34 Z"
        fill={`url(#${waveId})`}
      />
    </svg>
  )
}

export function AppFrame() {
  /* Scaled as one piece, which is what makes it read as a screenshot. Keep the 1.4
     ratio (it fills the frame exactly) and the transform (`zoom` is not portable). */
  return (
    <div className="relative size-full overflow-hidden">
      <div
        className="absolute top-0 left-0 h-[1000px] w-[1400px] origin-top-left"
        style={{ transform: "scale(calc(100cqw / 1400px))" }}
      >
        <Card
          role="img"
          aria-label="Acme production console showing revenue, channel mix and the order queue"
          className={cn(
            PANEL,
            "flex size-full flex-col gap-0 overflow-hidden text-slate-900 shadow-2xl ring-slate-900/10 [--card-spacing:0px] dark:text-slate-50 dark:ring-white/10"
          )}
        >
          <style>{FRAME_MOTION}</style>

          {/* Top bar */}
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-slate-200 px-2.5 dark:border-slate-800">
            <IconTile
              variant="solid"
              size="xs"
              className="bg-slate-900 text-white [--icon-tile-icon-size:--spacing(4)]! [--icon-tile-size:--spacing(7)]! dark:bg-slate-100 dark:text-slate-900"
            >
              <LayersIcon aria-hidden="true" />
            </IconTile>

            <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-violet-500"
              />
              <span className="truncate">Acme Inc</span>
              <ChevronsUpDownIcon aria-hidden="true" className="size-3 shrink-0 text-slate-400 dark:text-slate-500" />
              <span
                aria-hidden="true"
                className="text-slate-300 dark:text-slate-600"
              >
                /
              </span>
              <span className="truncate">Web App</span>
              <span
                aria-hidden="true"
                className="text-slate-300 dark:text-slate-600"
              >
                /
              </span>
              <span className="truncate">Production</span>
              <ChevronsUpDownIcon aria-hidden="true" className="size-3 shrink-0 text-slate-400 dark:text-slate-500" />
            </div>

            <Badge
              radius="full"
              className="ms-auto h-6 gap-1.5 border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <ActivityIcon aria-hidden="true" className="hero8-blink size-3 text-rose-500 dark:text-rose-400" />
              System
              <span className="text-rose-500 dark:text-rose-400">Alert</span>
            </Badge>
          </div>

          {/* min-h-0 so the table below can scroll-clip inside the canvas rather
          than pushing the console past 1000 units. */}
          <div className="flex min-h-0 min-w-0 flex-1 items-stretch">
            {/* Sidebar */}
            <div className="flex w-54 shrink-0 flex-col gap-2 border-r border-slate-200 p-2 dark:border-slate-800">
              <Item
                variant="outline"
                size="xs"
                className="gap-2 border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
              >
                <SearchIcon aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">Search...</span>
                <Kbd className="ms-auto h-5 min-w-5 bg-slate-100 px-1.5 text-xs text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  ⌘K
                </Kbd>
              </Item>

              <div className="px-2 pt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                Platform
              </div>

              <div className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) => (
                  <div key={item.id} className="contents">
                    <Item
                      size="xs"
                      className={cn(
                        "gap-2 border-transparent px-2 py-1.5 text-sm",
                        item.active
                          ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                          : "text-slate-600 dark:text-slate-300"
                      )}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                      {item.trailing}
                    </Item>

                    {item.id === "users"
                      ? USER_SUB_ITEMS.map((sub) => (
                          <Item
                            key={sub.id}
                            size="xs"
                            className={cn(
                              "border-transparent py-1.5 ps-8 pe-2 text-sm",
                              sub.active
                                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                                : "text-slate-500 dark:text-slate-400"
                            )}
                          >
                            <span className="truncate">{sub.label}</span>
                          </Item>
                        ))
                      : null}
                  </div>
                ))}
              </div>

              {/* The source pins a promo card to the rail foot; without it the rail
              reads as an unfinished column once the workspace runs tall. */}
              <Card
                size="sm"
                className={cn(
                  PANEL,
                  "mt-auto gap-1.5 [--card-spacing:--spacing(2)]"
                )}
              >
                <CardContent className="flex flex-col gap-1.5">
                  <span className="text-sm leading-none font-medium text-slate-800 dark:text-slate-100">
                    Multi-theme Support
                  </span>
                  <span className="text-xs leading-tight text-slate-400 dark:text-slate-500">
                    Switch between eight ReUI styles.
                  </span>
                  <ThemePreview />
                </CardContent>
              </Card>
            </div>

            {/* Workspace */}
            <div className="flex min-w-0 flex-1 flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-950">
              {/* KPI strip */}
              <div className="grid grid-cols-4 gap-2.5">
                {KPIS.map((kpi, index) => (
                  <Card
                    key={kpi.id}
                    // Offsets this card's value and sparkline against the other
                    // three, so the strip never rises on one frame.
                    style={
                      {
                        "--hero8-delay": `${-index * 1.9}s`,
                      } as React.CSSProperties
                    }
                    size="sm"
                    className={cn(PANEL, "[--card-spacing:--spacing(2.5)]")}
                  >
                    <CardContent className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-1.5">
                        <IconTile
                          variant="soft"
                          size="xs"
                          className="text-slate-500 [--icon-tile-icon-size:--spacing(4)]! [--icon-tile-size:--spacing(7)]! dark:text-slate-400"
                        >
                          {kpi.icon}
                        </IconTile>
                        <Badge
                          radius="full"
                          className={cn(
                            "h-5 gap-1 px-1.5 text-xs font-medium",
                            kpi.deltaClassName
                          )}
                        >
                          {kpi.deltaIcon}
                          {kpi.delta}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="truncate text-sm leading-none font-medium text-slate-700 dark:text-slate-200">
                          {kpi.label}
                        </span>
                        <span className="truncate text-xs leading-none text-slate-400 dark:text-slate-500">
                          {kpi.caption}
                        </span>
                      </div>

                      <div className="flex items-end justify-between gap-1.5">
                        <span className="hero8-rise text-2xl leading-none font-semibold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
                          {kpi.value}
                        </span>
                        <Sparkline
                          bars={kpi.bars}
                          className={kpi.barClassName}
                          delay={-index * 1.9}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Revenue Pace and Channel Mix */}
              {/* Takes the leftover height: the KPI strip and queue size to their
                  content, so without flex-1 this row collapses to its charts. */}
              <div className="flex min-h-0 flex-1 items-stretch gap-4">
                <Card
                  size="sm"
                  className={cn(
                    PANEL,
                    "min-h-0 flex-3 [--card-spacing:--spacing(3)]"
                  )}
                >
                  <CardHeader>
                    <CardTitle className="text-sm leading-none">
                      Revenue Pace
                    </CardTitle>
                    <CardDescription className="text-xs leading-none text-slate-400 dark:text-slate-500">
                      Online and retail revenue
                    </CardDescription>
                    <CardAction className="flex items-center gap-2.5">
                      {PACE_LEGEND.map((entry) => (
                        <span
                          key={entry.id}
                          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              entry.dotClassName
                            )}
                          />
                          {entry.label}
                        </span>
                      ))}
                    </CardAction>
                  </CardHeader>

                  <CardContent className="flex min-h-0 flex-1 flex-col gap-2.5">
                    <div className="grid shrink-0 grid-cols-3 gap-2.5">
                      {PACE_STATS.map((stat) => (
                        <div key={stat.id} className="flex flex-col gap-1.5">
                          <span className="text-xs leading-none text-slate-400 dark:text-slate-500">
                            {stat.label}
                          </span>
                          <span className="flex items-baseline gap-1.5 text-2xl leading-none font-semibold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
                            {stat.value}
                            {stat.suffix ? (
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {stat.suffix}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      ))}
                    </div>

                    <RevenuePaceChart />

                    <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                      {PACE_TICKS.map((tick) => (
                        <span key={tick}>{tick}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card
                  size="sm"
                  className={cn(
                    PANEL,
                    "min-h-0 flex-2 [--card-spacing:--spacing(3)]"
                  )}
                >
                  <CardHeader>
                    <CardTitle className="text-sm leading-none">
                      Channel Mix
                    </CardTitle>
                    <CardDescription className="text-xs leading-none text-slate-400 dark:text-slate-500">
                      Daily order share
                    </CardDescription>
                    <CardAction>
                      <Badge className="h-6 border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                        Direct
                      </Badge>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="flex min-h-0 flex-1 flex-col gap-2.5">
                    <div className="grid shrink-0 grid-cols-2 gap-2.5">
                      {MIX_STATS.map((stat) => (
                        <div key={stat.id} className="flex flex-col gap-1.5">
                          <span className="text-xs leading-none text-slate-400 dark:text-slate-500">
                            {stat.label}
                          </span>
                          <span className="text-2xl leading-none font-semibold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {MIX_LEGEND.map((entry) => (
                        <span
                          key={entry.id}
                          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              entry.dotClassName
                            )}
                          />
                          {entry.label}
                        </span>
                      ))}
                    </div>

                    <div className="flex min-h-0 flex-1 items-end gap-2.5">
                      {MIX_DAYS.map((day, index) => (
                        <div
                          key={day.id}
                          className="flex h-full flex-1 flex-col items-center gap-1.5"
                        >
                          <div className="flex min-h-0 w-full flex-1 flex-col justify-end">
                            <div
                              aria-hidden="true"
                              className="hero8-grow flex w-full origin-bottom flex-col"
                              style={
                                {
                                  height: `${day.height}%`,
                                  "--hero8-delay": `${-index * 0.24}s`,
                                } as React.CSSProperties
                              }
                            >
                              {day.segments.map((segment) => (
                                <span
                                  key={segment.id}
                                  className={cn("w-full", segment.className)}
                                  style={{ height: `${segment.size}%` }}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {day.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Queue */}
              <Card
                size="sm"
                className={cn(PANEL, "[--card-spacing:--spacing(3)]")}
              >
                <CardHeader>
                  <CardTitle className="text-sm leading-none">
                    Order Queue
                  </CardTitle>
                  <CardDescription className="text-xs leading-none text-slate-400 dark:text-slate-500">
                    6 of 6 orders
                  </CardDescription>
                  <CardAction className="flex items-center gap-2">
                    <Item
                      variant="outline"
                      size="xs"
                      className="w-32 gap-2 border-slate-200 bg-white px-2 py-1 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
                    >
                      <SearchIcon aria-hidden="true" className="size-3 shrink-0" />
                      <span className="truncate">Search orders</span>
                    </Item>
                    <Badge className="h-6 gap-1.5 border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      <FilterIcon aria-hidden="true" className="size-3" />
                      Exceptions
                    </Badge>
                  </CardAction>
                </CardHeader>

                <CardContent>
                  <Table className="table-fixed text-sm">
                    <TableHeader>
                      <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
                        {ORDER_COLUMNS.map((column) => (
                          <TableHead
                            key={column.id}
                            className={cn(
                              "h-8 px-1.5 text-xs font-medium text-slate-400 dark:text-slate-500",
                              column.className
                            )}
                          >
                            {column.label}
                          </TableHead>
                        ))}
                        <TableHead className="h-8 w-[8%] px-1.5" />
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {ORDERS.map((order, index) => (
                        <TableRow
                          key={order.id}
                          // Inherited by the row wash and the fulfilment track, so
                          // the row moves as one unit.
                          style={
                            {
                              "--hero8-delay": `${-index * 1.3}s`,
                            } as React.CSSProperties
                          }
                          className={cn(
                            "border-slate-100 hover:bg-transparent dark:border-slate-800",
                            order.live ? "hero8-live" : null
                          )}
                        >
                          <TableCell className="px-1.5 py-1.5">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-slate-800 dark:text-slate-100">
                                {order.id}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                {order.date}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="px-1.5 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="size-5 shrink-0">
                                <AvatarImage
                                  src={order.image}
                                  alt={order.name}
                                  loading="lazy"
                                  decoding="async"
                                />
                                <AvatarFallback className="text-xs">
                                  {order.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex min-w-0 flex-col gap-1">
                                <span className="truncate text-slate-800 dark:text-slate-100">
                                  {order.name}
                                </span>
                                <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                                  {order.channel}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="truncate px-1.5 py-1.5 text-slate-700 dark:text-slate-200">
                            {order.product}
                          </TableCell>

                          <TableCell className="px-1.5 py-1.5">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {order.stage}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <Progress
                                  value={order.progress}
                                  aria-label={`${order.stage} progress`}
                                  className={cn(
                                    "hero8-track w-10 gap-0",
                                    "[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-slate-200",
                                    order.trackClassName
                                  )}
                                />
                                <span className="text-xs text-slate-400 tabular-nums dark:text-slate-500">
                                  {order.progress}%
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="px-1.5 py-1.5">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-slate-800 tabular-nums dark:text-slate-100">
                                {order.amount}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                {order.quantity}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="px-1.5 py-1.5">
                            <Badge
                              radius="full"
                              className={cn(
                                "h-5 gap-1 px-1.5 text-xs font-medium",
                                order.statusClassName
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "size-1.5 shrink-0 rounded-full",
                                  order.statusDotClassName
                                )}
                              />
                              {order.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="px-1.5 py-1.5">
                            <Badge className="h-6 border-slate-200 bg-white px-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                              View
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}