import { type ChartConfig } from "@/components/ui/chart"

export const FISCAL_YEAR = 2026
/** Months the books have closed; the rest of the year is forecast. */
export const CLOSED_MONTHS = 9
/** The fixed demo date the figures are read on. */
export const AS_OF = Date.UTC(2026, 9, 1)
/** The full-year operating margin the plan commits to. */
export const TARGET_MARGIN = 0.18

export type Figures = { revenue: number; expenses: number }

/** January to December; April carries the annual offsite and a hiring wave. */
// prettier-ignore
export const MONTHS: Figures[] = [
  { revenue: 1840, expenses: 1690 },
  { revenue: 1910, expenses: 1720 },
  { revenue: 2080, expenses: 1760 },
  { revenue: 2010, expenses: 1930 },
  { revenue: 2150, expenses: 1810 },
  { revenue: 2290, expenses: 1850 },
  { revenue: 2240, expenses: 1880 },
  { revenue: 2380, expenses: 1900 },
  { revenue: 2510, expenses: 1950 },
  { revenue: 2580, expenses: 2010 },
  { revenue: 2650, expenses: 2090 },
  { revenue: 2820, expenses: 2150 },
]

/** January to September 2025, set against this year's closed months. */
export const PRIOR_YTD: Figures = { revenue: 16380, expenses: 14620 }

export type Granularity = "month" | "quarter"

export const GRANULARITIES = [
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
] as const satisfies readonly { value: Granularity; label: string }[]

export type ViewState = {
  granularity: Granularity
  forecast: boolean
  target: boolean
}

export const DEFAULT_VIEW: ViewState = {
  granularity: "month",
  forecast: true,
  target: true,
}

export const CHART_CONFIG = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "var(--color-indigo-500)",
      dark: "var(--color-indigo-400)",
    },
  },
  expenses: {
    label: "Expenses",
    theme: {
      light: "var(--color-slate-300)",
      dark: "var(--color-slate-600)",
    },
  },
  margin: {
    label: "Operating margin",
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
  /** First month of the period, 0 to 11. */
  start: number
  months: number
  net: number
  margin: number
  forecast: boolean
}

const MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
})
export const monthName = (index: number) =>
  MONTH.format(Date.UTC(FISCAL_YEAR, index, 1))

const sum = (items: Figures[], key: keyof Figures) =>
  items.reduce((total, item) => total + item[key], 0)

/** Totals and margin for a run of months. */
export function totalsOf(items: Figures[]) {
  const revenue = sum(items, "revenue")
  const expenses = sum(items, "expenses")
  const net = revenue - expenses
  return { revenue, expenses, net, margin: revenue ? net / revenue : 0 }
}

/** The columns a view plots: months or quarters, forecast ones optional. */
export function periodsOf(
  granularity: Granularity,
  withForecast: boolean
): Period[] {
  const size = granularity === "month" ? 1 : 3
  const periods: Period[] = []
  for (let start = 0; start < MONTHS.length; start += size) {
    const forecast = start + size > CLOSED_MONTHS
    if (forecast && !withForecast) break
    const totals = totalsOf(MONTHS.slice(start, start + size))
    periods.push({
      key: size === 1 ? monthName(start) : `Q${start / 3 + 1}`,
      start,
      months: size,
      forecast,
      ...totals,
    })
  }
  return periods
}