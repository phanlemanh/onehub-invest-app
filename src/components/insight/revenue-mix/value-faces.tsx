import { cn } from "cn"

import type { ChartConfig } from "@/components/ui/chart"

import { type Slice } from "./view"

/** Trims a label to its caps, so `items-center` centres the letters exactly. */
export const CAP_BOX = "[text-box:trim-both_cap_alphabetic]"

/** A cap-trimmed label that still ellipsizes; it clips only sideways, so
 *  descenders survive the trimmed box. */
export const CAP_TRUNCATE = `${CAP_BOX} overflow-x-clip text-ellipsis whitespace-nowrap`

// One violet ramp stepping by lightness, a step brighter on the dark card;
// the untracked rest is a neutral hatch, so it never reads as a source.
export const chartConfig = {
  lead: {
    label: "Thứ nhất",
    theme: {
      light: "var(--color-violet-700)",
      dark: "var(--color-violet-500)",
    },
  },
  second: {
    label: "Thứ hai",
    theme: {
      light: "var(--color-violet-500)",
      dark: "var(--color-violet-400)",
    },
  },
  third: {
    label: "Thứ ba",
    theme: {
      light: "var(--color-violet-300)",
      dark: "var(--color-violet-300)",
    },
  },
  rest: {
    label: "Khác",
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

export function DotSeparator() {
  return (
    <span
      aria-hidden="true"
      className="bg-muted-foreground/40 size-1 shrink-0 rounded-full"
    />
  )
}