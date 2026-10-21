import { fmtCompact, fmtMoney, fmtMoneyCompact, fmtPct } from "@/lib/format"

import { type MetricKey } from "./data"

/** Formatters bound to the market's currency. */
export type Formatters = {
  value: (metric: MetricKey, value: number) => string
  headline: (metric: MetricKey, value: number) => string
  axis: (metric: MetricKey, value: number) => string
}

export function formattersFor(currency: string): Formatters {
  return {
    /** A month's exact figure: "279.506 ₫", "68,1%". */
    value: (metric, value) =>
      metric === "occupancy" ? fmtPct(value) : fmtMoney(value, currency),
    /** A window's headline: "2,4 tỷ ₫", "14,5%". */
    headline: (metric, value) =>
      metric === "occupancy"
        ? fmtPct(value)
        : metric === "revenue"
          ? fmtMoneyCompact(value, currency)
          : fmtMoney(value, currency),
    /** An axis tick: "1,2 tỷ", "40%" — đơn vị tiền ghi ở chân khung. */
    axis: (metric, value) =>
      metric === "occupancy" ? fmtPct(value, 0) : fmtCompact(value),
  }
}

const MONTH = (day: number) => new Date(day)

/** "T10/26" */
export const formatMonth = (day: number) =>
  `T${MONTH(day).getUTCMonth() + 1}/${String(MONTH(day).getUTCFullYear()).slice(2)}`

/** "Tháng 10/2026" */
export const formatLongMonth = (day: number) =>
  `Tháng ${MONTH(day).getUTCMonth() + 1}/${MONTH(day).getUTCFullYear()}`

/** "T10/26 – T9/27" */
export const formatSpan = (from: number, to: number) =>
  `${formatMonth(from)} – ${formatMonth(to)}`
