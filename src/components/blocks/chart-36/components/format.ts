import { FISCAL_YEAR, monthName, type Period } from "./data"

const THOUSANDS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
const MILLIONS = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const AXIS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})

/** USD thousands as "$2.51M", or "$560K" under a million. */
export function formatUsd(thousands: number) {
  const amount = Math.abs(thousands)
  const sign = thousands < 0 ? "-" : ""
  return amount >= 1000
    ? `${sign}$${MILLIONS.format(amount / 1000)}M`
    : `${sign}$${THOUSANDS.format(amount)}K`
}

export const formatAxis = (thousands: number) =>
  thousands === 0 ? "$0" : AXIS.format(thousands * 1000)

const percent = (signDisplay: "auto" | "exceptZero") =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay,
  })
const PERCENT = percent("auto")
const PERCENT_SIGNED = percent("exceptZero")

export const formatPercent = (ratio: number, signed = false) =>
  (signed ? PERCENT_SIGNED : PERCENT).format(ratio)

/** A margin gap in percentage points: "+4.3 pts", or "0.8 pts" unsigned. */
export const formatPoints = (ratio: number, signed = true) =>
  `${formatPercent(ratio, signed).replace("%", "")} pts`

const FULL_DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})
const LONG_MONTH = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export const formatDay = (time: number) => FULL_DAY.format(time)

/** "Jan to Sep": a run of months, by index. */
export const monthSpan = (first: number, last: number) =>
  `${monthName(first)} to ${monthName(last)}`

/** The tooltip's heading: "March 2026" or "Q1 2026". */
export const periodTitle = (period: Period) =>
  period.months === 1
    ? LONG_MONTH.format(Date.UTC(FISCAL_YEAR, period.start, 1))
    : `${period.key} ${FISCAL_YEAR}`