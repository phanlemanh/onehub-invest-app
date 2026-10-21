import {
  ANNOTATIONS,
  rangeOf,
  type MetricKey,
  type MonthRow,
  type RangeKey,
} from "./data"

/** One plotted month. */
export type PlotRow = { day: number; current: number }

/** A window's headline for one metric. */
export type Summary = { value: number }

/** Placed annotation: month ids resolved to the shown rows' timestamps. */
export type PlacedAnnotation = {
  id: string
  label: string
  kind: "marker" | "band"
  from: number
  to: number
}

const monthOf = (day: number) => new Date(day).getUTCMonth() + 1

/** Lịch tương lai: cửa sổ tính từ tháng đầu tiên trở đi. */
export function windowOf(rows: MonthRow[], range: RangeKey) {
  return rows.slice(0, rangeOf(range).months)
}

export function plotRows(rows: MonthRow[], metric: MetricKey): PlotRow[] {
  return rows.map((row) => ({ day: row.day, current: row[metric] }))
}

/** Gộp theo trọng số đêm, không lấy trung bình các tháng. */
export function summariesOf(rows: MonthRow[]): Record<MetricKey, Summary> {
  const revenue = rows.reduce((sum, row) => sum + row.revenue, 0)
  const booked = rows.reduce((sum, row) => sum + row.bookedNights, 0)
  const open = rows.reduce((sum, row) => sum + row.availableNights, 0)
  const nights = booked + open
  return {
    revenue: { value: revenue },
    occupancy: { value: nights > 0 ? booked / nights : 0 },
    adr: { value: booked > 0 ? revenue / booked : 0 },
    revpar: { value: nights > 0 ? revenue / nights : 0 },
  }
}

/** The shown months' mean, for the average rule and its legend figure. */
export const averageOf = (rows: PlotRow[]) =>
  rows.reduce((sum, row) => sum + row.current, 0) / Math.max(1, rows.length)

/** The events that fall inside the shown months, placed on their rows. */
export function annotationsIn(rows: PlotRow[]): PlacedAnnotation[] {
  return ANNOTATIONS.flatMap((item) => {
    const inside = rows.filter((row) => {
      const m = monthOf(row.day)
      return m >= item.fromMonth && m <= item.toMonth
    })
    if (inside.length === 0) return []
    return [
      {
        id: item.id,
        label: item.label,
        kind: item.kind,
        from: inside[0].day,
        to: inside[inside.length - 1].day,
      },
    ]
  })
}

/** The event a month falls in, for the readout. */
export function annotationOn(day: number) {
  const m = monthOf(day)
  return ANNOTATIONS.find((item) => m >= item.fromMonth && m <= item.toMonth)
}
