import { INFLOWS, REST_NAME, type PeriodKey, type SourceKey } from "./data"

/** One slice of the ring: a tracked source, or the rest of the total. */
export type Slice = {
  key: SourceKey | "rest"
  name: string
  amount: number
  previous: number
  /** Whole percent of the period total. */
  share: number
}

/** The change on the period before, or null when there was nothing before. */
export const changeOf = (value: number, previous: number) =>
  previous > 0 ? value / previous - 1 : null

// Three periods, so each is built once and kept: a re-render never hands
// Recharts a new array, which would restart the slice morph.
const SLICES = new Map<PeriodKey, Slice[]>()

/** The tracked sources, then the rest of the total, each with its share. */
export function slicesOf(key: PeriodKey): Slice[] {
  const cached = SLICES.get(key)
  if (cached) return cached
  const period = INFLOWS[key]
  const shareOf = (amount: number) => Math.round((amount / period.total) * 100)
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)
  const rest = period.total - sum(period.sources.map((source) => source.amount))
  const restBefore =
    period.previousTotal - sum(period.sources.map((source) => source.previous))
  const slices: Slice[] = [
    ...period.sources.map((source) => ({
      ...source,
      share: shareOf(source.amount),
    })),
    {
      key: "rest",
      name: REST_NAME,
      amount: Math.max(rest, 0),
      previous: Math.max(restBefore, 0),
      share: shareOf(Math.max(rest, 0)),
    },
  ]
  SLICES.set(key, slices)
  return slices
}