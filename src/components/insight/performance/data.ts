import { type ChartConfig } from "@/components/ui/chart"

/**
 * Chuyển thể từ @reui/chart-6. Khác bản gốc: một điểm = một THÁNG (không phải
 * ngày), dữ liệu đi qua props, và không có lớp "kỳ trước" — dữ liệu hiện là lịch
 * đặt phòng 12 tháng TỚI nên không có kỳ trước để so (IA §3.2).
 */

// ── Types ──

export type MetricKey = "revenue" | "occupancy" | "adr" | "revpar"
export type RangeKey = "6m" | "12m"

/** One month, keyed by its first day (UTC ms). Nights carry the weights. */
export type MonthRow = {
  day: number
  revenue: number
  occupancy: number
  adr: number
  revpar: number
  bookedNights: number
  availableNights: number
}

export type MetricSpec = {
  key: MetricKey
  label: string
  /** Câu mô tả ngắn cho chú giải. */
  basis: string
  /** The chart's stroke and fill. */
  color: string
  /** The tile's indicator and key dot, as a static class. */
  swatch: string
}

export type Annotation = {
  id: string
  label: string
  kind: "marker" | "band"
  /** Tháng (1–12) bắt đầu và kết thúc; khớp theo tháng của từng năm. */
  fromMonth: number
  toMonth: number
}

export type LayerKey = "annotations" | "average" | "grid"

export type ViewState = { metric: MetricKey; range: RangeKey } & Record<
  LayerKey,
  boolean
>

// ── Calendar ──

export const RANGES = [
  { value: "6m", label: "6 tháng", months: 6 },
  { value: "12m", label: "12 tháng", months: 12 },
] as const satisfies readonly { value: RangeKey; label: string; months: number }[]

export const rangeOf = (value: RangeKey) =>
  RANGES.find((range) => range.value === value) ?? RANGES[1]

// ── Metrics ──

export const METRICS = [
  {
    key: "revenue",
    label: "Doanh thu",
    basis: "Tổng giá niêm yết các đêm đã đặt, theo tháng",
    color: "var(--color-teal-500)",
    swatch: "bg-teal-500",
  },
  {
    key: "occupancy",
    label: "Công suất",
    basis: "Đêm đã đặt ÷ (đã đặt + còn trống), theo tháng",
    color: "var(--color-amber-500)",
    swatch: "bg-amber-500",
  },
  {
    key: "adr",
    label: "Giá phòng (ADR)",
    basis: "Doanh thu ÷ đêm đã đặt, theo tháng",
    color: "var(--color-sky-500)",
    swatch: "bg-sky-500",
  },
  {
    key: "revpar",
    label: "RevPAR",
    basis: "Doanh thu ÷ đêm khả dụng, theo tháng",
    color: "var(--color-violet-500)",
    swatch: "bg-violet-500",
  },
] as const satisfies readonly MetricSpec[]

export const metricOf = (key: MetricKey): MetricSpec =>
  METRICS.find((metric) => metric.key === key) ?? METRICS[0]

// ── Events: mốc nhu cầu du lịch Việt Nam ──

export const ANNOTATIONS = [
  { id: "tet", label: "Tết", kind: "marker", fromMonth: 2, toMonth: 2 },
  { id: "le-30-4", label: "30/4", kind: "marker", fromMonth: 5, toMonth: 5 },
  { id: "he", label: "Hè", kind: "band", fromMonth: 6, toMonth: 8 },
  { id: "le-2-9", label: "2/9", kind: "marker", fromMonth: 9, toMonth: 9 },
] as const satisfies readonly Annotation[]

// ── View ──

export const DEFAULT_VIEW: ViewState = {
  metric: "revenue",
  range: "12m",
  annotations: true,
  average: false,
  grid: true,
}

export const chartConfigOf = (metric: MetricSpec) =>
  ({
    current: { label: metric.label, color: metric.color },
  }) satisfies ChartConfig
