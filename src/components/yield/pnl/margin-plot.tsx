"use client"

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react"
import { Badge } from "@/components/reui/badge"
import { cn } from "cn"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Curve,
  DefaultZIndexes,
  Rectangle,
  useActiveTooltipLabel,
  usePlotArea,
  useXAxisScale,
  XAxis,
  YAxis,
  ZIndexLayer,
  type BarShapeProps,
  type TooltipContentProps,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { CHART_CONFIG, type Period } from "./data"
import { formatAxis, formatPercent, periodTitle } from "./format"
import { TREND_ICONS } from "./icons"
import {
  barId,
  captureMorph,
  EXPENSE_LAG_MS,
  fadeInLayers,
  morphBar,
  onSmoothFrame,
  PLOT_STYLE,
  REVEAL_MS,
  sourceOf,
  staggerOf,
  type Morph,
} from "./plot-motion"
import { CAP_BOX, LineKey, SeriesDot } from "./value-faces"

type BarKey = "revenue" | "expenses"

/** The bars' top tick sits at this share of the plot; the margin line runs
 *  between the lane's two shares above it. */
const BAR_SHARE = 0.6
const LANE: [number, number] = [0.68, 0.95]
/** Where the money axis's labels end, left of the plot; the lane's share it. */
const AXIS_LABEL_INSET = 12
/** Axis steps in USD thousands; whole millions past one fit the axis. */
const RADIUS = 3
const MAX_BAR_SIZE = 18
const BAR_GAP = 3
const AXIS_WIDTH = 44
/** Air right of the plot, so the last column's band never meets the edge. */
const PLOT_RIGHT = 4
const MARGIN = { top: 16, right: PLOT_RIGHT, bottom: 0, left: 0 }
/** The pointer crossfade; arrow keys snap, since a held key outruns it. */
const HOVER_FADE =
  "transition-opacity duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-has-[:focus-visible]/c36:transition-none"
/** Set on the host once the first reveal has landed. */
const SETTLED = "data-chart-36-settled"
/** Bars morph from their own top-left corner in plot coordinates. */
const FLIP_ORIGIN: CSSProperties = {
  transformBox: "view-box",
  transformOrigin: "0 0",
}

/** A reveal's start, and the animations held until it is set. */
type RevealClock = { at: number | null; waiting: Animation[] }

/** What the custom layers read, through context so the shape functions stay
 *  stable: an inline one would remount every bar per render. */
type PlotScope = {
  rows: Period[]
  id: string
  target: boolean
  /** Biên lợi nhuận để ngang thuê dài hạn; null = không vẽ mốc. */
  targetMargin: number | null
  targetLabel: string
  money: (value: number) => string
  joinReveal: (animation: Animation) => void
  host: RefObject<HTMLDivElement | null>
  layer: RefObject<SVGGElement | null>
  morph: RefObject<Morph | null>
}
const PlotContext = createContext<PlotScope | null>(null)

/** Pins the element's CSS animation to the reveal's clock as it attaches,
 *  before paint, so no frame shows it unpinned. */
function useRevealRef() {
  const scope = useContext(PlotContext)
  const join = scope?.joinReveal
  const host = scope?.host
  // Mã gốc của @reui/chart-36: callback ref đọc host.current lúc gắn node. Giữ
  // nguyên useCallback (đổi danh tính ref mỗi render sẽ ghim lại animation).
  return useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    (node: SVGGElement | null) => {
      // After the reveal the sheet drops these keyframes; skip the lookup,
      // which flushes style for every element that mounts.
      if (!node || !join || host?.current?.hasAttribute(SETTLED)) return
      for (const animation of node.getAnimations()) {
        if (animation instanceof CSSAnimation) join(animation)
      }
    },
    [join, host]
  )
}

/** Marks the read column's bars, band and dot lit, so a hover re-renders
 *  this alone and restyles only the columns it leaves and enters. */
function ReadSync() {
  const label = useActiveTooltipLabel()
  const scope = useContext(PlotContext)
  const index =
    scope && label !== undefined
      ? scope.rows.findIndex((row) => row.key === `${label}`)
      : -1
  useLayoutEffect(() => {
    const host = scope?.host.current
    if (!host) return
    if (index < 0) {
      host.removeAttribute("data-chart-36-reading")
      return
    }
    host.setAttribute("data-chart-36-reading", "")
    const lit = host.querySelectorAll(
      `[data-chart-36-col="${index}"], [data-chart-36-band="${index}"], [data-chart-36-dot="${index}"]`
    )
    for (const node of lit) node.setAttribute("data-chart-36-lit", "")
    return () => {
      for (const node of lit) node.removeAttribute("data-chart-36-lit")
    }
  }, [scope, index])
  return null
}

/** Round ticks from zero; the domain leaves the plot's top to the lane.
 *  Bước "đẹp" theo bậc độ lớn (1/2/2,5/5 × 10^k) — số tiền VND lên tới tỷ. */
function moneyAxis(rows: Period[]) {
  const max = Math.max(
    1,
    ...rows.map((row) => Math.max(row.revenue, row.expenses))
  )
  const power = 10 ** Math.floor(Math.log10(max / 3))
  const step =
    [1, 2, 2.5, 5, 10].map((unit) => unit * power).find((size) => max / size <= 3) ??
    10 * power
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let tick = 0; tick <= top; tick += step) ticks.push(tick)
  const domain: [number, number] = [0, top / BAR_SHARE]
  return { ticks, domain }
}

type RiseStyle = CSSProperties & { "--chart-36-delay": string }

type BarGeometry = Pick<
  BarShapeProps,
  "x" | "y" | "width" | "height" | "originalDataIndex"
>

/** Memoised on its geometry, so Recharts' own re-renders skip it. */
const PlotBar = memo(function PlotBar({
  series,
  y,
  width,
  height,
  originalDataIndex,
  ...geometry
}: BarGeometry & { series: BarKey }) {
  const scope = useContext(PlotContext)
  const riseRef = useRevealRef()
  const flipRef = useRef<SVGGElement>(null)
  const xScale = useXAxisScale()
  const row = scope?.rows[originalDataIndex]
  // Recharts centres a clamped bar in its own slot, so a wide column would
  // split the pair; both hug the column's middle instead.
  const middle = row ? xScale?.(row.key, { position: "middle" }) : undefined
  const x =
    middle === undefined
      ? geometry.x
      : series === "revenue"
        ? middle - BAR_GAP / 2 - width
        : middle + BAR_GAP / 2
  useLayoutEffect(() => {
    const node = flipRef.current
    const morph = scope?.morph.current ?? null
    if (!node || !row) return
    morphBar(node, morph, { x, y, width, height }, sourceOf(morph, series, row))
  }, [scope, row, series, x, y, width, height])
  if (!scope || !row || height <= 0) return <g />
  const delay =
    originalDataIndex * staggerOf(scope.rows.length) +
    (series === "expenses" ? EXPENSE_LAG_MS : 0)
  const riseStyle: RiseStyle = {
    transformBox: "view-box",
    transformOrigin: `0 ${y + height}px`,
    "--chart-36-delay": `${Math.round(delay)}ms`,
  }
  return (
    <g
      ref={flipRef}
      data-chart-36-bar={barId(series, row.start, row.months)}
      data-chart-36-col={originalDataIndex}
      className={HOVER_FADE}
      style={FLIP_ORIGIN}
    >
      {/* Each bar scales from the zero line; a forecast one is hatched. */}
      <g ref={riseRef} data-chart-36-rise="" style={riseStyle}>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          radius={[RADIUS, RADIUS, 0, 0]}
          fill={
            row.forecast
              ? `url(#${scope.id}-${series})`
              : `var(--color-${series})`
          }
          // A pale hatch alone fades into the card; the outline holds its edge.
          stroke={row.forecast ? `var(--color-${series})` : undefined}
          strokeWidth={row.forecast ? 1 : undefined}
        />
      </g>
    </g>
  )
})

const SHAPES = {
  revenue: (props: BarShapeProps) => (
    <PlotBar
      series="revenue"
      x={props.x}
      y={props.y}
      width={props.width}
      height={props.height}
      originalDataIndex={props.originalDataIndex}
    />
  ),
  expenses: (props: BarShapeProps) => (
    <PlotBar
      series="expenses"
      x={props.x}
      y={props.y}
      width={props.width}
      height={props.height}
      originalDataIndex={props.originalDataIndex}
    />
  ),
} satisfies Record<BarKey, (props: BarShapeProps) => ReactElement>

/** A diagonal hatch in a series colour, for its forecast bars. */
function Hatch({ id, series }: { id: string; series: BarKey }) {
  return (
    <pattern
      id={`${id}-${series}`}
      width={5}
      height={5}
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect
        width={5}
        height={5}
        fill={`var(--color-${series})`}
        fillOpacity={0.18}
      />
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={5}
        stroke={`var(--color-${series})`}
        strokeWidth={2}
      />
    </pattern>
  )
}

/** A band behind every column, lit by the plot sheet while it is read;
 *  each keeps its own, so moving between columns crossfades. */
function ColumnBands() {
  const plot = usePlotArea()
  const xScale = useXAxisScale()
  const rows = useContext(PlotContext)?.rows ?? []
  if (!plot || !xScale || rows.length === 0) return null
  const band = plot.width / rows.length
  return (
    <g aria-hidden="true" className="pointer-events-none">
      {rows.map((row, index) => {
        const middle = xScale(row.key, { position: "middle" })
        if (middle === undefined) return null
        return (
          <g key={row.key} data-chart-36-band={index} className={HOVER_FADE}>
            <Rectangle
              x={middle - band / 2}
              y={plot.y}
              width={band}
              height={plot.height}
              radius={4}
              className="fill-muted"
            />
          </g>
        )
      })}
    </g>
  )
}

/** Holds the old layer's fading copies during a regroup, above the plot. */
function MorphLayer() {
  const layer = useContext(PlotContext)?.layer
  return <g ref={layer} aria-hidden="true" className="pointer-events-none" />
}

/** Where the books close: a rule between the last closed column and the
 *  first forecast one, named in the gap between the bars and the lane. */
function ForecastRule() {
  const plot = usePlotArea()
  const xScale = useXAxisScale()
  const fadeRef = useRevealRef()
  const rows = useContext(PlotContext)?.rows ?? []
  const first = rows.findIndex((row) => row.forecast)
  if (!plot || !xScale || first <= 0) return null
  const middle = xScale(rows[first].key, { position: "middle" })
  if (middle === undefined) return null
  const x = middle - plot.width / rows.length / 2
  const top = plot.y + plot.height * (1 - (BAR_SHARE + LANE[0]) / 2)
  return (
    <g
      ref={fadeRef}
      data-chart-36-fade=""
      aria-hidden="true"
      className="pointer-events-none"
    >
      <line
        x1={x}
        x2={x}
        y1={top - 6}
        y2={plot.y + plot.height}
        stroke="var(--muted-foreground)"
        strokeOpacity={0.4}
        strokeDasharray="2 3"
      />
      <text
        x={x + 6}
        y={top}
        dy="0.35em"
        className="fill-muted-foreground text-xs"
      >
        Forecast
      </text>
    </g>
  )
}

/** Operating margin in a lane above the bars: solid through the closed
 *  months, dashed with open dots through the forecast. */
function MarginLane() {
  const plot = usePlotArea()
  const xScale = useXAxisScale()
  const revealRef = useRevealRef()
  const scope = useContext(PlotContext)
  if (!plot || !xScale || !scope || scope.rows.length === 0) return null
  // The target stays in the domain, so toggling it never moves the line.
  const target = scope.targetMargin
  const values = [
    ...scope.rows.map((row) => row.margin),
    ...(target === null ? [] : [target]),
  ]
  // Khoảng tối thiểu 20 điểm %: ước tính chia đều theo số đêm nên biên chỉ lệch
  // 1–2 điểm giữa các tháng; co làn theo đúng khoảng đó sẽ phóng đại thành sóng.
  const MIN_SPAN = 0.2
  const rawLow = Math.min(...values)
  const rawHigh = Math.max(...values)
  const pad = Math.max(0, MIN_SPAN - (rawHigh - rawLow)) / 2
  const low = rawLow - pad
  const span = Math.max(rawHigh - rawLow, MIN_SPAN)
  const yOf = (margin: number) =>
    plot.y +
    plot.height * (1 - LANE[0] - ((margin - low) / span) * (LANE[1] - LANE[0]))
  const points = scope.rows.flatMap((row) => {
    const x = xScale(row.key, { position: "middle" })
    return x === undefined ? [] : [{ x, y: yOf(row.margin), row }]
  })
  const closed = points.filter((point) => !point.row.forecast)
  // The forecast leg starts on the last close, so the two lines meet.
  const projected = points.slice(Math.max(0, closed.length - 1))
  const last = closed.at(-1)
  const targetY = target === null ? null : yOf(target)
  const right = plot.x + plot.width
  // 10% steps on a wide lane, 5% on a narrow one, so one always lands.
  const step = span >= 0.15 ? 0.1 : 0.05
  const ticks: number[] = []
  for (let k = Math.ceil(low / step); k * step <= low + span; k += 1)
    ticks.push(k * step)
  return (
    <g data-chart-36-lane="" aria-hidden="true" className="pointer-events-none">
      <g ref={revealRef} data-chart-36-fade="">
        {ticks.map((tick) => (
          <text
            key={tick}
            x={plot.x - AXIS_LABEL_INSET}
            y={yOf(tick)}
            dy="0.35em"
            textAnchor="end"
            className="fill-muted-foreground text-xs tabular-nums"
          >
            {`${Math.round(tick * 100)}%`}
          </text>
        ))}
        {targetY !== null && target !== null ? (
        <g
          className={cn(
            "transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
            !scope.target && "opacity-0"
          )}
        >
          <line
            x1={plot.x}
            x2={right}
            y1={targetY}
            y2={targetY}
            stroke="var(--muted-foreground)"
            strokeOpacity={0.7}
            strokeDasharray="4 4"
          />
          <text
            x={right}
            y={targetY + 14}
            textAnchor="end"
            stroke="var(--card)"
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
            className="fill-muted-foreground text-xs tabular-nums"
          >
            {`${scope.targetLabel} ${formatPercent(target)}`}
          </text>
        </g>
        ) : null}
      </g>
      <g ref={revealRef} data-chart-36-draw="">
        {projected.length > 1 ? (
          <Curve
            type="monotone"
            points={projected}
            fill="none"
            stroke="var(--color-margin)"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        ) : null}
        <Curve
          type="monotone"
          points={closed}
          fill="none"
          stroke="var(--color-margin)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {points.map((point) => (
          <circle
            key={point.row.key}
            cx={point.x}
            cy={point.y}
            r={2.5}
            fill={point.row.forecast ? "var(--card)" : "var(--color-margin)"}
            stroke={point.row.forecast ? "var(--color-margin)" : "var(--card)"}
            strokeWidth={1.5}
          />
        ))}
      </g>
      {last ? (
        <g ref={revealRef} data-chart-36-land="">
          <circle
            cx={last.x}
            cy={last.y}
            r={7}
            fill="var(--color-margin)"
            fillOpacity={0.16}
          />
          {/* The last close names the line; it drops below the dot when the
              lane's top leaves no room above. */}
          <text
            x={last.x - 9}
            y={last.y - 22 >= 0 ? last.y - 9 : last.y + 18}
            textAnchor="end"
            stroke="var(--card)"
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
            className="fill-foreground text-xs font-medium tabular-nums"
          >
            {formatPercent(last.row.margin)}
          </text>
        </g>
      ) : null}
      {/* The read column's dot, lit by the plot sheet. */}
      {points.map((point, index) => (
        <circle
          key={point.row.key}
          data-chart-36-dot={index}
          cx={point.x}
          cy={point.y}
          r={4}
          fill="var(--color-margin)"
          stroke="var(--card)"
          strokeWidth={2}
        />
      ))}
    </g>
  )
}

/** A tooltip row: a 16px glyph slot, the label, then the amount. */
function CardRow({
  glyph,
  label,
  value,
}: {
  glyph: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex h-4 items-center justify-between gap-4">
      <span className="text-muted-foreground inline-flex items-center gap-1.5">
        <span className="flex size-4 shrink-0 items-center justify-center">
          {glyph}
        </span>
        <span className={CAP_BOX}>{label}</span>
      </span>
      <span className={cn("font-medium tabular-nums", CAP_BOX)}>{value}</span>
    </div>
  )
}

function PeriodCard({
  active,
  payload,
}: Partial<Pick<TooltipContentProps, "active" | "payload">>) {
  const money = useContext(PlotContext)?.money ?? String
  const row: Period | undefined = payload?.[0]?.payload
  const items =
    payload?.filter(
      (item) => item.dataKey === "revenue" || item.dataKey === "expenses"
    ) ?? []
  if (!active || !row || items.length === 0) return null
  return (
    <ChartTooltipContent
      active
      payload={items}
      className="w-auto min-w-48"
      labelFormatter={() => (
        <span className="flex h-5 items-center justify-between gap-3">
          <span className={CAP_BOX}>{periodTitle(row)}</span>
          {row.forecast ? <Badge variant="outline">Ước tính</Badge> : null}
        </span>
      )}
      formatter={(value, name, _item, index) => {
        const key: BarKey = name === "expenses" ? "expenses" : "revenue"
        return (
          <div className="flex flex-1 flex-col gap-1.5">
            <CardRow
              glyph={<SeriesDot series={key} />}
              label={CHART_CONFIG[key].label}
              value={money(Number(value))}
            />
            {index === items.length - 1 ? (
              <div className="flex flex-col gap-1.5 border-t pt-1.5">
                <CardRow
                  glyph={row.net >= 0 ? TREND_ICONS.up : TREND_ICONS.down}
                  label="Thu nhập ròng"
                  value={money(row.net)}
                />
                <CardRow
                  glyph={<LineKey />}
                  label="Biên lợi nhuận"
                  value={formatPercent(row.margin)}
                />
              </div>
            ) : null}
          </div>
        )
      }}
    />
  )
}

// A stable element: a function content would remount the card every render.
const PERIOD_CARD = <PeriodCard />

export type PlotHandle = {
  /** Called before the rows change, so the new layout morphs from this one. */
  regroup: (next: Period[]) => void
}

export function MarginPlot({
  rows,
  target,
  targetMargin,
  targetLabel,
  money,
  label,
  ref,
}: {
  rows: Period[]
  target: boolean
  targetMargin: number | null
  targetLabel: string
  money: (value: number) => string
  label: string
  ref?: Ref<PlotHandle>
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "")
  const host = useRef<HTMLDivElement>(null)
  const layer = useRef<SVGGElement>(null)
  const morph = useRef<Morph | null>(null)
  // The reveal's clock, shared by every layer: unset until its first smooth
  // frame, when every animation waiting on it starts together.
  const clock = useRef<RevealClock | null>(null)
  const joinReveal = useCallback((animation: Animation) => {
    // Frozen demo guard: ?demo=frozen pins the demo, so it lands settled.
    if (document.documentElement.dataset.demo === "frozen") {
      animation.finish()
      return
    }
    let current = clock.current
    if (!current) {
      const next: RevealClock = { at: null, waiting: [] }
      clock.current = current = next
      onSmoothFrame((at) => {
        next.at = at
        for (const waiting of next.waiting) waiting.startTime = at
        next.waiting = []
        window.setTimeout(
          () => host.current?.setAttribute(SETTLED, ""),
          REVEAL_MS
        )
      })
    }
    // Held at its first frame, so a bar waits hidden on the zero line; a
    // bar mounted after the reveal lands settled.
    if (current.at === null) {
      animation.pause()
      current.waiting.push(animation)
    } else animation.startTime = current.at
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      regroup(next) {
        const svg = layer.current?.ownerSVGElement
        // Frozen demo guard: a frozen demo regroups without motion.
        if (!svg || !layer.current) return
        if (document.documentElement.dataset.demo === "frozen") return
        morph.current = captureMorph(svg, layer.current, next)
      },
    }),
    []
  )

  // The new margin lane and axis labels fade in under the outgoing copies.
  useLayoutEffect(() => {
    if (host.current) fadeInLayers(host.current, morph.current)
  }, [rows])

  const scope = useMemo(
    () => ({ rows, id, target, targetMargin, targetLabel, money, joinReveal, host, layer, morph }),
    [rows, id, target, targetMargin, targetLabel, money, joinReveal]
  )
  const axis = moneyAxis(rows)

  return (
    <>
      <style>{PLOT_STYLE}</style>
      {/* A click focuses Recharts' layer group; only keyboard focus rings. */}
      <ChartContainer
        ref={host}
        config={CHART_CONFIG}
        role="group"
        aria-label={label}
        className="group/c36 has-[:focus-visible]:ring-ring/50 aspect-auto h-72 w-full min-w-0 has-[:focus-visible]:ring-[3px] [&_[class*=recharts-zIndex-layer]]:outline-hidden"
      >
        <PlotContext.Provider value={scope}>
          <ComposedChart
            accessibilityLayer
            data={rows}
            barGap={BAR_GAP}
            barCategoryGap="26%"
            margin={MARGIN}
          >
            <defs>
              <Hatch id={id} series="revenue" />
              <Hatch id={id} series="expenses" />
            </defs>
            <ReadSync />
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 4"
              syncWithTicks
            />
            <XAxis
              dataKey="key"
              interval="equidistantPreserveStart"
              minTickGap={6}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              ticks={axis.ticks}
              domain={axis.domain}
              allowDataOverflow
              tickFormatter={formatAxis}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              width={AXIS_WIDTH}
            />
            <ZIndexLayer zIndex={DefaultZIndexes.cursorRectangle}>
              <ColumnBands />
            </ZIndexLayer>
            <ChartTooltip
              cursor={false}
              isAnimationActive={false}
              content={PERIOD_CARD}
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              maxBarSize={MAX_BAR_SIZE}
              isAnimationActive={false}
              shape={SHAPES.revenue}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              maxBarSize={MAX_BAR_SIZE}
              isAnimationActive={false}
              shape={SHAPES.expenses}
            />
            <ZIndexLayer zIndex={DefaultZIndexes.line}>
              <ForecastRule />
              <MarginLane />
            </ZIndexLayer>
            <ZIndexLayer zIndex={DefaultZIndexes.activeBar}>
              <MorphLayer />
            </ZIndexLayer>
          </ComposedChart>
        </PlotContext.Provider>
      </ChartContainer>
    </>
  )
}