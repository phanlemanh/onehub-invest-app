import { type ReactNode } from "react"
import { cn } from "cn"

import { SWATCHES, type SeriesKey } from "./data"

/** Trims a label to its caps, so `items-center` lines the letters up with
 *  the dot or control beside it. Needs a fixed-height row. */
export const CAP_BOX = "[text-box:trim-both_cap_alphabetic]"

export function DotSeparator() {
  return (
    <span
      aria-hidden="true"
      className="bg-muted-foreground/40 size-1 shrink-0 rounded-full"
    />
  )
}

export function SeriesDot({ series }: { series: SeriesKey }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-2 shrink-0 rounded-full", SWATCHES[series])}
    />
  )
}

/** The margin line's key: a short stroke with a dot at its end. */
export function LineKey() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center">
      <span className={cn("h-0.5 w-2.5 rounded-full", SWATCHES.margin)} />
      <span className={cn("-ms-0.5 size-1.5 rounded-full", SWATCHES.margin)} />
    </span>
  )
}

/** The target's key: a short dashed stroke. */
export function TargetKey() {
  return (
    <span
      aria-hidden="true"
      className="border-muted-foreground/70 w-3 shrink-0 border-t-2 border-dashed"
    />
  )
}

/** A text-xs fact on a status line: cap-trimmed inside an h-4 row. */
export function Fact({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn("flex h-4 items-center", className)}>
      <span className={CAP_BOX}>{children}</span>
    </span>
  )
}