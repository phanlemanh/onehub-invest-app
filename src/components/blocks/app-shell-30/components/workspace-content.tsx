import { cn } from "cn"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Empty slots waiting for a page body. customize: replace these with your own.
// The stock hairline rides outside the box, so it is drawn inside instead.
const SLOT =
  "after:inset-ring-border relative shadow-xs ring-0 after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:inset-ring"

// Every slot is a washed ground with one clear block over it: the summary slots
// hang theirs from the ceiling, the wide slot stands its on the floor.
const SLOT_GROUND = "bg-muted/50 dark:bg-card/50 gap-0 py-0"
// The wide slot's bar is the full 44 the design draws, so its mark centres on
// the band rather than on a box sitting at the band's floor.
const WIDE_GROUND = "bg-muted/50 dark:bg-card/50 gap-0 py-0"
const SLOT_BODY = "bg-card border-border"

// The marks that stand where content goes. They drop a step in dark so they
// stay under the card rather than over it.
const MARK = "bg-input/50 dark:bg-input/30 shrink-0"

// The design lists four rows and leaves the second one open, on a 12px rhythm.
const TRACKER_ROWS = ["h-[106px]", "h-[312px]", "h-[106px]", "h-[106px]"]

// The design opens the second row on its stages, so that one carries a body.
const OPEN_ROW = 1

// The row carries no edge at all: the marks inside it do the reading, so the
// list stays flat against the body it sits on.
const ROW_SURFACE = "shadow-none ring-0"

// A tracker row: the stop it runs, a couple of figures, and its control.
function TrackerRow({ height, open }: { height: string; open: boolean }) {
  return (
    <Card
      size="sm"
      className={cn("shrink-0 justify-start gap-3", ROW_SURFACE, height)}
    >
      <CardContent className="flex items-center gap-4">
        <Skeleton className={cn(MARK, "size-3.5 rounded-full")} />
        <Skeleton className={cn(MARK, "h-4 w-40")} />
        <Skeleton className={cn(MARK, "h-4 w-20 max-lg:hidden")} />
        <Skeleton className={cn(MARK, "h-4 w-20 max-lg:hidden")} />
        <Skeleton className={cn(MARK, "ml-auto size-7 rounded-lg")} />
      </CardContent>
      {/* An open row shows the stages it runs under the stop. */}
      {open && (
        <CardContent className="min-h-0 flex-1">
          <Skeleton className={cn(MARK, "size-full rounded-lg")} />
        </CardContent>
      )}
    </Card>
  )
}

// One key per slot, so the next editor can see what each one is reserved for.
const SLOT_KEYS = ["fleet", "uptime", "alerts", "battery"]

// The design fills a summary slot with a tile and its name, the figure under
// them, and the faces it counts along the floor.
function SummarySlot({ short }: { short: boolean }) {
  return (
    <Card
      aria-hidden="true"
      className={cn(
        "h-[100px] lg:min-h-0",
        short ? "lg:h-[144px]" : "lg:h-[148px]",
        SLOT,
        SLOT_GROUND
      )}
    >
      <CardContent
        className={cn(
          "flex h-[60px] shrink-0 flex-col justify-center gap-4 rounded-b-xl border-b p-0",
          short ? "lg:h-[104px]" : "lg:h-[108px]",
          SLOT_BODY
        )}
      >
        {/* The tile, the name it carries and the row's own menu. */}
        <div className="flex items-center gap-2.5 px-(--card-spacing)">
          <Skeleton className={cn(MARK, "size-7 rounded-lg")} />
          <Skeleton className={cn(MARK, "h-5 w-24")} />
          <Skeleton className={cn(MARK, "ml-auto size-8 rounded-lg")} />
        </div>
        {/* The figure and its caption, which a phone has no room for. */}
        <div className="hidden items-center gap-1.5 px-(--card-spacing) lg:flex">
          <Skeleton className={cn(MARK, "h-6 w-10")} />
          <Skeleton className={cn(MARK, "h-3.5 w-26")} />
        </div>
      </CardContent>

      <div className="flex flex-1 items-center px-(--card-spacing)">
        <div className="flex -space-x-2">
          {["a", "b", "c", "d"].map((face) => (
            <Skeleton
              key={face}
              className={cn(MARK, "ring-card size-5 rounded-full ring-2")}
            />
          ))}
        </div>
        <Skeleton className={cn(MARK, "ml-auto h-4 w-28 max-sm:hidden")} />
      </div>
    </Card>
  )
}

export function WorkspaceContent() {
  return (
    <div className="flex w-full flex-1 flex-col gap-4 sm:gap-6 lg:min-h-0 lg:flex-row lg:items-start">
      {/* Phones pair the summary slots two up so the wide slot still gets the
          rest of the panel; the design's single column returns at lg. */}
      <div className="grid w-full shrink-0 grid-cols-2 gap-4 sm:gap-6 lg:flex lg:min-h-0 lg:w-[330px] lg:flex-col lg:self-stretch">
        {SLOT_KEYS.map((slot, index) => (
          // The design draws the first slot 4px shorter than the three below it.
          <SummarySlot key={slot} short={index === 0} />
        ))}
      </div>

      <Card
        aria-hidden="true"
        className={cn(
          "min-h-screen w-full min-w-0 flex-1 lg:min-h-0 lg:self-stretch",
          SLOT,
          WIDE_GROUND
        )}
      >
        {/* The ground is the bar: the body starts below it and rounds up out of
            it, so the wash shows as a 44px strip at the ceiling. */}
        <CardHeader className="flex h-11 shrink-0 flex-row items-center">
          <Skeleton className={cn(MARK, "h-5 w-40")} />
        </CardHeader>
        <CardContent
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-3 rounded-t-xl border-t",
            SLOT_BODY
          )}
        >
          {/* The rows the tracker lists. */}
          {TRACKER_ROWS.map((height, index) => (
            <TrackerRow key={index} height={height} open={index === OPEN_ROW} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}