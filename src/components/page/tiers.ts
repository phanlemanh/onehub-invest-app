import type { BadgeProps } from "@/components/reui/badge"

/** Kiểu + bậc của StatTiles — module thường để trang server cũng gọi được. */
export type Tier = { label: string; variant: BadgeProps["variant"] }

export type StatTile = {
  title: string
  value: string
  tier?: Tier | null
  footer: string
}

/** Bậc theo p30/p60/p90 của nhóm so sánh, cao = tốt (giá dùng nhãn trung tính riêng). */
export function tierOf(
  mine: number | null,
  p: number[] | null | undefined,
  labels: [string, string, string, string] = ["Thấp", "Trung bình", "Khá", "Nhóm đầu"]
): Tier | null {
  if (mine === null || !p || p.length < 3) return null
  if (mine >= p[2]) return { label: labels[3], variant: "success-light" }
  if (mine >= p[1]) return { label: labels[2], variant: "info-light" }
  if (mine >= p[0]) return { label: labels[1], variant: "outline" }
  return { label: labels[0], variant: "warning-light" }
}
