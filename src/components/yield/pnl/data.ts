import { type ChartConfig } from "@/components/ui/chart"

/**
 * Chuyển thể từ @reui/chart-36. Khác bản gốc: 12 tháng tới đến qua props (mọi
 * cột là ước tính, không có "đã chốt sổ"), đường mục tiêu = biên lợi nhuận để
 * thu nhập ròng ngắn hạn ngang cho thuê dài hạn.
 */
export type Figures = { revenue: number; expenses: number }

/** Một tháng của ước tính, khoá theo ngày đầu tháng (UTC ms). */
export type MonthFigures = Figures & { start: number }

export type Granularity = "month" | "quarter"

export const GRANULARITIES = [
  { value: "month", label: "Tháng" },
  { value: "quarter", label: "Quý" },
] as const satisfies readonly { value: Granularity; label: string }[]

export type ViewState = {
  granularity: Granularity
  target: boolean
}

export const DEFAULT_VIEW: ViewState = {
  granularity: "month",
  target: true,
}

export const CHART_CONFIG = {
  revenue: {
    label: "Doanh thu",
    theme: {
      light: "var(--color-indigo-500)",
      dark: "var(--color-indigo-400)",
    },
  },
  expenses: {
    label: "Chi phí",
    theme: {
      light: "var(--color-slate-300)",
      dark: "var(--color-slate-600)",
    },
  },
  margin: {
    label: "Biên lợi nhuận",
    theme: {
      light: "var(--color-emerald-600)",
      dark: "var(--color-emerald-400)",
    },
  },
} satisfies ChartConfig

export type SeriesKey = keyof typeof CHART_CONFIG

/** Legend and tooltip dots, in the config's colours. */
export const SWATCHES = {
  revenue: "bg-indigo-500 dark:bg-indigo-400",
  expenses: "bg-slate-300 dark:bg-slate-600",
  margin: "bg-emerald-600 dark:bg-emerald-400",
} satisfies Record<SeriesKey, string>

/** One plotted column: a month or a quarter. */
export type Period = Figures & {
  key: string
  /** Index of the first month in the input, 0 to 11. */
  start: number
  months: number
  /** Ngày đầu kỳ (UTC ms), cho tiêu đề tooltip. */
  time: number
  net: number
  margin: number
  /** Giữ trường của block; ở đây không có kỳ đã chốt nên luôn false. */
  forecast: boolean
}

const sum = (items: Figures[], key: keyof Figures) =>
  items.reduce((total, item) => total + item[key], 0)

/** Totals and margin for a run of months. */
export function totalsOf(items: Figures[]) {
  const revenue = sum(items, "revenue")
  const expenses = sum(items, "expenses")
  const net = revenue - expenses
  return { revenue, expenses, net, margin: revenue ? net / revenue : 0 }
}

const monthLabel = (time: number) => `T${new Date(time).getUTCMonth() + 1}`

/** The columns a view plots: months or quarters of the input. */
export function periodsOf(months: MonthFigures[], granularity: Granularity): Period[] {
  const size = granularity === "month" ? 1 : 3
  const periods: Period[] = []
  for (let start = 0; start < months.length; start += size) {
    const slice = months.slice(start, start + size)
    periods.push({
      key:
        size === 1
          ? monthLabel(slice[0].start)
          : `${monthLabel(slice[0].start)}–${monthLabel(slice[slice.length - 1].start)}`,
      start,
      months: slice.length,
      time: slice[0].start,
      forecast: false,
      ...totalsOf(slice),
    })
  }
  return periods
}
