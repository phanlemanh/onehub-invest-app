import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import { UI_ICONS } from "./icons"

// Varied widths, so the rows read as names, not a uniform grid.
const NAME_WIDTHS = ["w-32", "w-24", "w-28"]

/** The data body's measured height, side by side and stacked, so a state
 *  that resolves never moves the footer. */
const BODY_HEIGHT = "min-h-[14.875rem] @max-lg:min-h-[26.125rem]"

/** The total, the ring and its rows while inflows load, on the real
 *  layout's grid, so nothing moves when the data lands. */
export function InflowsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading capital inflows"
      className={cn("flex flex-col gap-6", BODY_HEIGHT)}
    >
      <div className="flex flex-col gap-3">
        <span className="flex h-5 items-center">
          <Skeleton className="h-3 w-24" />
        </span>
        <span className="flex h-5.5 items-center gap-2.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-3 w-36 @max-sm:hidden" />
        </span>
      </div>
      <div className="grid gap-6 @lg:grid-cols-[10rem_minmax(0,1fr)] @lg:items-center">
        <Skeleton className="size-40 justify-self-center rounded-full @lg:justify-self-auto" />
        <div className="flex flex-col divide-y">
          {NAME_WIDTHS.map((width) => (
            <div key={width} className="flex h-11 items-center gap-3">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className={cn("h-3", width)} />
              <Skeleton className="ms-auto h-3 w-12" />
              <Skeleton className="h-3 w-8 @max-sm:hidden" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Nothing settled this week; the month has inflows, so that is the way on. */
export function InflowsEmpty({ onViewMonth }: { onViewMonth: () => void }) {
  return (
    <Empty className={BODY_HEIGHT}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{UI_ICONS.empty}</EmptyMedia>
        <EmptyTitle>No Inflows This Week</EmptyTitle>
        <EmptyDescription>
          Nothing has settled in the last 7 days.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" size="sm" onClick={onViewMonth}>
          View Month
        </Button>
      </EmptyContent>
    </Empty>
  )
}

/** The ledger feed failed: what broke, and a Retry that recovers. */
export function InflowsError({ onRetry }: { onRetry: () => void }) {
  return (
    <Empty className={BODY_HEIGHT}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="text-destructive">
          {UI_ICONS.error}
        </EmptyMedia>
        <EmptyTitle>Inflows Unavailable</EmptyTitle>
        <EmptyDescription>
          The ledger feed timed out. No transfers were lost.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {UI_ICONS.retry}
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  )
}