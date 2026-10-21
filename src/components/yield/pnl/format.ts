import { fmtCompact, fmtMoneyCompact } from "@/lib/format"

import { type Period } from "./data"

/** Tiền theo đơn vị của thị trường: "1,2 tỷ ₫", "9,7 tr ₫". */
export const moneyFormatter = (currency: string) => (value: number) =>
  fmtMoneyCompact(value, currency)

/** Nhãn trục: "40 tr", "0" — đơn vị ghi ở chân khung. */
export const formatAxis = (value: number) => (value === 0 ? "0" : fmtCompact(value))

const percent = (signDisplay: "auto" | "exceptZero") =>
  new Intl.NumberFormat("vi-VN", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay,
  })
const PERCENT = percent("auto")
const PERCENT_SIGNED = percent("exceptZero")

export const formatPercent = (ratio: number, signed = false) =>
  (signed ? PERCENT_SIGNED : PERCENT).format(ratio)

/** Tiêu đề tooltip: "Tháng 11/2026" hoặc "T11–T1 (từ 11/2026)". */
export const periodTitle = (period: Period) => {
  const d = new Date(period.time)
  const my = `${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`
  return period.months === 1 ? `Tháng ${my}` : `${period.key} (từ ${my})`
}
