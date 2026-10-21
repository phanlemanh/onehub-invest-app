import { fmtCompact, fmtInt, fmtMoney, fmtMoneyCompact, fmtPct } from "@/lib/format"

/**
 * Bốn bậc theo phân vị p30/p60/p90 của tập đang xem (AirDNA: legend động theo
 * phân bố). Cùng một bảng màu cho bản đồ, chú giải và thanh trong bảng, để ba
 * chỗ đọc như một: blue-200/400/700/900 của Tailwind v4. Bản đồ cần hex vì
 * MapLibre không đọc được biến CSS/oklch; thanh và chú giải dùng class.
 */
export const BIN_COLORS = ["#bedbff", "#51a2ff", "#1447e6", "#1c398e"] as const
export const NO_DATA_COLOR = "#e2e8f0"
/** Vùng chưa có số trên nền bản đồ tối (zinc-700). */
export const NO_DATA_COLOR_DARK = "#3f3f46"

/** Ô màu chú giải — class tĩnh để Tailwind sinh đủ. */
export const BIN_SWATCH = ["bg-blue-200", "bg-blue-400", "bg-blue-700", "bg-blue-900"] as const

/** Màu thanh Progress (mẫu ScoreCell của data-grid-base-2). */
export const BIN_INDICATOR = [
  "**:data-[slot=progress-indicator]:bg-blue-200",
  "**:data-[slot=progress-indicator]:bg-blue-400",
  "**:data-[slot=progress-indicator]:bg-blue-700",
  "**:data-[slot=progress-indicator]:bg-blue-900",
] as const

export type FinderMetric = "revpar" | "revenue" | "occupancy" | "adr" | "listings"

export const FINDER_METRICS: { value: FinderMetric; label: string }[] = [
  { value: "revpar", label: "RevPAR" },
  { value: "revenue", label: "Doanh thu" },
  { value: "occupancy", label: "Công suất" },
  { value: "adr", label: "Giá phòng (ADR)" },
  { value: "listings", label: "Số listing" },
]

export const metricLabel = (metric: FinderMetric) =>
  FINDER_METRICS.find((m) => m.value === metric)?.label ?? metric

/** p30/p60/p90 nội suy tuyến tính (mirror `metric_percentiles`). */
export function cutsOf(values: number[]): [number, number, number] | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const at = (q: number) => {
    const idx = (sorted.length - 1) * q
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
  }
  return [at(0.3), at(0.6), at(0.9)]
}

/** Bậc 0–3 của một giá trị, null khi chưa có số. */
export function binOf(value: number | null, cuts: [number, number, number] | null) {
  if (value === null || !cuts) return null
  if (value < cuts[0]) return 0
  if (value < cuts[1]) return 1
  if (value < cuts[2]) return 2
  return 3
}

export function formatMetric(metric: FinderMetric, value: number | null, currency: string) {
  if (value === null) return "—"
  if (metric === "occupancy") return fmtPct(value)
  if (metric === "listings") return fmtInt(value)
  if (metric === "revenue") return fmtMoneyCompact(value, currency)
  return fmtMoney(value, currency)
}

/** Nhãn ngắn cho chú giải ("< 12k", "12k – 30k"). */
export function formatCut(metric: FinderMetric, value: number) {
  if (metric === "occupancy") return fmtPct(value, 0)
  if (metric === "listings") return fmtInt(value)
  return fmtCompact(value)
}
