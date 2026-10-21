import { Badge, type BadgeProps } from "@/components/reui/badge"
import { cn } from "cn"

import type { ChartConfig } from "@/components/ui/chart"

import { formatChange } from "./format"
import { TREND_ICONS } from "./icons"
import { type Slice } from "./inflow-view"

/** Trims a label to its caps, so `items-center` centres the letters exactly. */
export const CAP_BOX = "[text-box:trim-both_cap_alphabetic]"

/** A cap-trimmed label that still ellipsizes; it clips only sideways, so
 *  descenders survive the trimmed box. */
export const CAP_TRUNCATE = `${CAP_BOX} overflow-x-clip text-ellipsis whitespace-nowrap`

// One violet ramp stepping by lightness, a step brighter on the dark card;
// the untracked rest is a neutral hatch, so it never reads as a source.
export const chartConfig = {
  lead: {
    label: "Lead",
    theme: {
      light: "var(--color-violet-700)",
      dark: "var(--color-violet-500)",
    },
  },
  second: {
    label: "Second",
    theme: {
      light: "var(--color-violet-500)",
      dark: "var(--color-violet-400)",
    },
  },
  third: {
    label: "Third",
    theme: {
      light: "var(--color-violet-300)",
      dark: "var(--color-violet-300)",
    },
  },
  rest: {
    label: "Rest",
    theme: { light: "var(--color-zinc-100)", dark: "var(--color-zinc-800)" },
  },
  hatch: {
    label: "Hatch",
    theme: { light: "var(--color-zinc-300)", dark: "var(--color-zinc-600)" },
  },
} satisfies ChartConfig

// Static class literals, so Tailwind emits every colour the ring uses.
const SLICE_DOT: Record<Slice["key"], string> = {
  lead: "bg-violet-700 dark:bg-violet-500",
  second: "bg-violet-500 dark:bg-violet-400",
  third: "bg-violet-300",
  rest: "bg-zinc-300 dark:bg-zinc-600",
}

/** A slice's face: a dot in its ring colour. */
export function SliceDot({ slice }: { slice: Slice["key"] }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-2.5 shrink-0 rounded-full", SLICE_DOT[slice])}
    />
  )
}

type Trend = keyof typeof TREND_ICONS

const TREND_VARIANT: Record<Trend, BadgeProps["variant"]> = {
  up: "success-light",
  down: "destructive-light",
  flat: "outline",
}

/** A change on the period before: arrow, sign and tone, so no channel
 *  carries the direction alone. More inflow is good for every source. */
export function ChangeBadge({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <Badge variant="outline">
        <span className={CAP_BOX}>New</span>
      </Badge>
    )
  }
  const trend: Trend =
    Math.abs(change) < 0.0005 ? "flat" : change > 0 ? "up" : "down"
  return (
    <Badge variant={TREND_VARIANT[trend]} className="tabular-nums">
      {TREND_ICONS[trend]}
      <span className={CAP_BOX}>{formatChange(change)}</span>
    </Badge>
  )
}

export function DotSeparator() {
  return (
    <span
      aria-hidden="true"
      className="bg-muted-foreground/40 size-1 shrink-0 rounded-full"
    />
  )
}