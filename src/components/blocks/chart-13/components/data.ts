export type PeriodKey = "week" | "month" | "year"
/** The three tracked sources, by rank; the rest of the total fills a fourth. */
export type SourceKey = "lead" | "second" | "third"

export const PERIODS = [
  {
    value: "week",
    label: "Week",
    caption: "last 7 days",
    previous: "the 7 days before",
  },
  {
    value: "month",
    label: "Month",
    caption: "last 30 days",
    previous: "the 30 days before",
  },
  {
    value: "year",
    label: "Year",
    caption: "last 12 months",
    previous: "the 12 months before",
  },
] as const satisfies readonly {
  value: PeriodKey
  label: string
  caption: string
  previous: string
}[]

export const DEFAULT_PERIOD: PeriodKey = "week"

export const periodOf = (key: PeriodKey) =>
  PERIODS.find((period) => period.value === key) ?? PERIODS[0]

export interface InflowSource {
  key: SourceKey
  name: string
  /** USD millions this period, and over the same span before it. */
  amount: number
  previous: number
}

export interface InflowPeriod {
  /** USD millions; the tracked sources never exceed either total. */
  total: number
  previousTotal: number
  sources: InflowSource[]
}

/** The slice for capital no tracked source accounts for. */
export const REST_NAME = "Other Sources"

export const INFLOWS: Record<PeriodKey, InflowPeriod> = {
  week: {
    total: 12.4,
    previousTotal: 11.6,
    sources: [
      { key: "lead", name: "Northline Capital", amount: 4.6, previous: 4.1 },
      { key: "second", name: "Copper Market", amount: 4.1, previous: 4.4 },
      { key: "third", name: "Bridgewell Fund", amount: 1.9, previous: 1.6 },
    ],
  },
  month: {
    total: 48.2,
    previousTotal: 45.1,
    sources: [
      { key: "lead", name: "Northline Capital", amount: 18.8, previous: 16.9 },
      { key: "second", name: "Copper Market", amount: 14.9, previous: 15.2 },
      { key: "third", name: "Bridgewell Fund", amount: 8.7, previous: 7.9 },
    ],
  },
  year: {
    total: 186.7,
    previousTotal: 158.3,
    sources: [
      { key: "lead", name: "Northline Capital", amount: 69.1, previous: 57.8 },
      { key: "second", name: "Copper Market", amount: 61.6, previous: 55.0 },
      { key: "third", name: "Bridgewell Fund", amount: 29.9, previous: 24.3 },
    ],
  },
}