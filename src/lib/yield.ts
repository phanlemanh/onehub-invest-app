/**
 * Mô hình ước tính lợi suất một căn (IA §3.2, "Rentalizer" VN). Hàm thuần —
 * dùng ở server (báo cáo) và client (dải tóm tắt). Mọi giả định chi phí là
 * MẶC ĐỊNH SỬA ĐƯỢC trên form, không phải số đo.
 */

export type YieldInputs = {
  /** Area id của phường. */
  area: string
  bedrooms: number
  sqm: number
  /** Giá mua (₫). */
  price: number
  /** Tỉ lệ trên doanh thu ngắn hạn. */
  mgmtPct: number
  platformPct: number
  taxPct: number
  /** ₫/tháng: điện nước, internet, phí dịch vụ toà nhà, vật tư. */
  fixedMonthly: number
  /** ₫ một lần: nội thất, setup — chỉ ảnh hưởng thời gian hoàn vốn. */
  setupCost: number
}

export const COST_DEFAULTS = {
  /** Đơn vị vận hành thuê ngắn hạn thường thu 15–25% doanh thu. */
  mgmtPct: 0.2,
  /** Phí host của Airbnb (mô hình chia phí). */
  platformPct: 0.03,
  /** Thuế khoán hộ kinh doanh dịch vụ lưu trú: 5% GTGT + 2% TNCN (tham khảo). */
  taxPct: 0.07,
  fixedMonthly: 4_000_000,
  setupCost: 150_000_000,
} as const

/** Thuế cho thuê tài sản dài hạn: 5% GTGT + 5% TNCN (tham khảo). */
export const LT_TAX_PCT = 0.1

/** Một listing so sánh: giá niêm yết và công suất 90 đêm đầu của lịch. */
export type CompSample = { price: number; occupancy: number }

export type CompScope = "area-bedrooms" | "market-bedrooms" | "market"

export type Confidence = {
  level: "Cao" | "Trung bình" | "Thấp"
  reasons: string[]
}

export type YieldEstimate = {
  adr: number
  occupancy: number
  revenue: { low: number; mid: number; high: number }
  costs: { mgmt: number; platform: number; tax: number; fixed: number; total: number }
  noi: number
  grossYield: number
  netYield: number
  paybackYears: number | null
  lt: { rentMonthly: number; grossYield: number; netYield: number; netIncome: number } | null
  /** Biên lợi nhuận ngắn hạn để thu nhập ròng ngang thuê dài hạn. */
  breakEvenMargin: number | null
  confidence: Confidence
}

function quantile(values: number[], q: number) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = (sorted.length - 1) * q
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

function confidenceOf(samples: CompSample[], scope: CompScope): Confidence {
  const n = samples.length
  const prices = samples.map((s) => s.price)
  const mean = prices.reduce((a, b) => a + b, 0) / Math.max(1, n)
  const sd = Math.sqrt(prices.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n))
  const cv = mean > 0 ? sd / mean : 1
  const reasons = [
    `${n} listing so sánh`,
    scope === "area-bedrooms"
      ? "cùng phường, cùng số phòng ngủ"
      : scope === "market-bedrooms"
        ? "phường quá ít mẫu — lấy cả thị trường, cùng số phòng ngủ"
        : "thiếu mẫu cùng số phòng ngủ — lấy cả thị trường",
    `giá phân tán ${cv < 0.35 ? "thấp" : cv < 0.7 ? "vừa" : "cao"} (CV ${cv.toFixed(2)})`,
    "công suất từ 90 đêm đầu của lịch đặt, chưa có mùa vụ",
  ]
  const level =
    scope === "area-bedrooms" && n >= 10 && cv < 0.7
      ? "Cao"
      : scope !== "market" && n >= 5
        ? "Trung bình"
        : "Thấp"
  return { level, reasons }
}

export function estimateYield(
  inputs: YieldInputs,
  samples: CompSample[],
  scope: CompScope,
  rentLtMonthly: number | null
): YieldEstimate {
  const perComp = samples.map((s) => s.price * s.occupancy * 365)
  const revenue = {
    low: quantile(perComp, 0.25),
    mid: quantile(perComp, 0.5),
    high: quantile(perComp, 0.75),
  }
  const mgmt = revenue.mid * inputs.mgmtPct
  const platform = revenue.mid * inputs.platformPct
  const tax = revenue.mid * inputs.taxPct
  const fixed = inputs.fixedMonthly * 12
  const total = mgmt + platform + tax + fixed
  const noi = revenue.mid - total

  const lt = rentLtMonthly
    ? {
        rentMonthly: rentLtMonthly,
        grossYield: (rentLtMonthly * 12) / inputs.price,
        netIncome: rentLtMonthly * 12 * (1 - LT_TAX_PCT),
        netYield: (rentLtMonthly * 12 * (1 - LT_TAX_PCT)) / inputs.price,
      }
    : null

  return {
    adr: quantile(samples.map((s) => s.price), 0.5),
    occupancy: quantile(samples.map((s) => s.occupancy), 0.5),
    revenue,
    costs: { mgmt, platform, tax, fixed, total },
    noi,
    grossYield: revenue.mid / inputs.price,
    netYield: noi / inputs.price,
    paybackYears: noi > 0 ? (inputs.price + inputs.setupCost) / noi : null,
    lt,
    breakEvenMargin: lt && revenue.mid > 0 ? lt.netIncome / revenue.mid : null,
    confidence: confidenceOf(samples, scope),
  }
}

/** 12 tháng tới: doanh thu chia theo số đêm của tháng (chưa có mùa vụ). */
export function monthlyPnl(estimate: YieldEstimate, inputs: YieldInputs, from: Date) {
  const variablePct = inputs.mgmtPct + inputs.platformPct + inputs.taxPct
  return Array.from({ length: 12 }, (_, i) => {
    const start = Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + i, 1)
    const d = new Date(start)
    const days = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
    const revenue = (estimate.revenue.mid * days) / 365
    return { start, revenue, expenses: revenue * variablePct + inputs.fixedMonthly }
  })
}
