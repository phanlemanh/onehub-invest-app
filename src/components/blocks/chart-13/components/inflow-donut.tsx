import { useId, useSyncExternalStore } from "react"
import {
  Cell,
  Pie,
  PieChart,
  Sector,
  type PieProps,
  type PieSectorDataItem,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { formatMillions } from "./format"
import { type Slice } from "./inflow-view"
import { chartConfig, SliceDot } from "./value-faces"

/** The house chart rhythm: 400ms on the house ease-out, which Recharts parses
 *  at runtime; its own "ease-out" keyword is an ease-in-out. */
const SLICE_MOTION = {
  animationDuration: 400,
  animationEasing:
    "cubic-bezier(0.23, 1, 0.32, 1)" as PieProps["animationEasing"],
  animationBegin: 0,
} as const

const SIZE = 160
const RING = { inner: 56, outer: 76, corner: 6 }

/** Follows the preview's frozen flag, so a frozen demo draws at rest. */
function subscribeDemo(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-demo"],
  })
  return () => observer.disconnect()
}

function useFrozenDemo() {
  return useSyncExternalStore(
    subscribeDemo,
    () => document.documentElement.dataset.demo === "frozen",
    () => false
  )
}

/** The hovered slice steps out by 4px, with no transition: hover is instant. */
function ActiveSlice(props: PieSectorDataItem) {
  return (
    <Sector
      cx={props.cx}
      cy={props.cy}
      innerRadius={props.innerRadius}
      outerRadius={(props.outerRadius ?? RING.outer) + 4}
      startAngle={props.startAngle}
      endAngle={props.endAngle}
      cornerRadius={RING.corner}
      fill={props.fill}
    />
  )
}

function SliceTooltip({ slice }: { slice: Slice }) {
  return (
    <div className="flex min-w-48 items-center gap-2">
      <SliceDot slice={slice.key} />
      <span className="text-muted-foreground min-w-0 flex-1 truncate">
        {slice.name}
      </span>
      <span className="text-foreground font-medium tabular-nums">
        {formatMillions(slice.amount)}
      </span>
      <span className="text-muted-foreground w-8 text-end tabular-nums">
        {slice.share}%
      </span>
    </div>
  )
}

export function InflowDonut({
  slices,
  center,
  label,
}: {
  slices: Slice[]
  /** The tracked sources' combined share, read inside the ring. */
  center: string
  label: string
}) {
  const frozen = useFrozenDemo()
  const hatch = `chart-13-hatch${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  return (
    // Centred while stacked over the legend, beside it once there is room.
    <div className="relative size-40 shrink-0 justify-self-center @lg:justify-self-auto">
      {/* The centre sits under the chart, so the tooltip paints above it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5"
      >
        <span className="text-xl font-semibold tracking-tight tabular-nums">
          {center}
        </span>
        <span className="text-muted-foreground text-xs">Top 3 sources</span>
      </div>

      <ChartContainer
        role="img"
        aria-label={label}
        className="relative aspect-square size-40"
        config={chartConfig}
        initialDimension={{ width: SIZE, height: SIZE }}
      >
        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <pattern
              id={hatch}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" fill="var(--color-rest)" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke="var(--color-hatch)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          {/* Free to leave the small plot, so it is never clipped by it */}
          <ChartTooltip
            cursor={false}
            isAnimationActive={false}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 10 }}
            content={
              <ChartTooltipContent
                hideLabel
                hideIndicator
                formatter={(_value, _name, item) => (
                  <SliceTooltip slice={item.payload as Slice} />
                )}
              />
            }
          />
          <Pie
            data={slices}
            dataKey="amount"
            nameKey="name"
            startAngle={90}
            endAngle={-270}
            innerRadius={RING.inner}
            outerRadius={RING.outer}
            paddingAngle={3}
            cornerRadius={RING.corner}
            stroke="none"
            activeShape={ActiveSlice}
            {...SLICE_MOTION}
            // Off for the frozen demo; "auto" honours reduced motion.
            isAnimationActive={frozen ? false : "auto"}
          >
            {slices.map((slice) => (
              <Cell
                key={slice.key}
                fill={
                  slice.key === "rest"
                    ? `url(#${hatch})`
                    : `var(--color-${slice.key})`
                }
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  )
}