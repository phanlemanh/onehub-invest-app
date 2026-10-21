/** Ba loại phòng lớn nhất theo doanh thu; phần còn lại gộp thành một lát. */
export type SliceKey = "lead" | "second" | "third"

/** One slice of the ring: a tracked room type, or the rest. */
export type Slice = {
  key: SliceKey | "rest"
  name: string
  amount: number
  listings: number
  /** Whole percent of the total. */
  share: number
}

export type MixInput = { label: string; revenue: number; listings: number }

/** Nhãn Airbnb → tiếng Việt. */
const ROOM_TYPE_VI: Record<string, string> = {
  "Entire home/apt": "Nguyên căn",
  "Private room": "Phòng riêng",
  "Hotel room": "Phòng khách sạn",
  "Shared room": "Phòng ở chung",
}

export const REST_NAME = "Khác"

const KEYS: SliceKey[] = ["lead", "second", "third"]

/** Tracked types by revenue, then the rest (only when it holds anything). */
export function slicesOf(rows: MixInput[]): { slices: Slice[]; total: number } {
  const sorted = [...rows].sort((a, b) => b.revenue - a.revenue)
  const total = sorted.reduce((sum, row) => sum + row.revenue, 0)
  const shareOf = (amount: number) =>
    total > 0 ? Math.round((amount / total) * 100) : 0
  const tracked = sorted.slice(0, KEYS.length).map((row, index) => ({
    key: KEYS[index],
    name: ROOM_TYPE_VI[row.label] ?? row.label,
    amount: row.revenue,
    listings: row.listings,
    share: shareOf(row.revenue),
  }))
  const restRows = sorted.slice(KEYS.length)
  const rest = restRows.reduce((sum, row) => sum + row.revenue, 0)
  const slices: Slice[] =
    restRows.length > 0
      ? [
          ...tracked,
          {
            key: "rest",
            name: REST_NAME,
            amount: rest,
            listings: restRows.reduce((sum, row) => sum + row.listings, 0),
            share: shareOf(rest),
          },
        ]
      : tracked
  return { slices, total }
}
