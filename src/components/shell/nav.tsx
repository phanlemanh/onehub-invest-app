import type { ReactNode } from "react"
import { ActivityIcon, CalculatorIcon, GaugeIcon, GitCompareIcon, HouseIcon, MapIcon, PaletteIcon } from "lucide-react"

/**
 * Cấu hình điều hướng theo cổng (docs/architecture/portals.md).
 * Chỉ khai báo route ĐÃ tồn tại — mục mới thêm vào đây khi trang của nó ship,
 * không hiện tab "sắp có".
 */
export type Portal = "invest" | "ops"

export interface NavSection {
  id: string
  label: string
  href: string
  icon: ReactNode
  /** Mục đang chọn tính theo URL, không giữ state. */
  match: (pathname: string) => boolean
}

const icon = (Icon: typeof MapIcon) => (
  <Icon className="size-4" aria-hidden="true" />
)

export const NAV_SECTIONS: Record<Portal, NavSection[]> = {
  invest: [
    {
      id: "markets",
      label: "Thị trường",
      href: "/vn",
      icon: icon(MapIcon),
      match: (p) => /^\/(vn|th)(\/|$)/.test(p) && !p.endsWith("/listings"),
    },
    {
      id: "listings",
      label: "Listing",
      // Thị trường nhiều listing nhất; Finder/Insight dẫn tới thị trường khác.
      href: "/vn/hanoi/listings",
      icon: icon(HouseIcon),
      match: (p) => p.endsWith("/listings") || p.startsWith("/listing/"),
    },
    {
      id: "yield",
      label: "Lợi suất",
      href: "/yield",
      icon: icon(CalculatorIcon),
      match: (p) => p.startsWith("/yield"),
    },
    {
      id: "deals",
      label: "Căn giá tốt",
      href: "/deals",
      icon: icon(ActivityIcon),
      match: (p) => p.startsWith("/deals"),
    },
    {
      id: "compare",
      label: "So sánh",
      href: "/so-sanh",
      icon: icon(GitCompareIcon),
      match: (p) => p.startsWith("/so-sanh"),
    },
  ],
  ops: [
    {
      id: "overview",
      label: "Tổng quan",
      href: "/ops",
      icon: icon(GaugeIcon),
      match: (p) => p === "/ops",
    },
    {
      id: "collections",
      label: "Thu thập",
      href: "/ops/collections",
      icon: icon(ActivityIcon),
      match: (p) => p.startsWith("/ops/collections"),
    },
    {
      id: "sources",
      label: "Nguồn dữ liệu",
      href: "/ops/sources",
      icon: icon(PaletteIcon),
      match: (p) => p.startsWith("/ops/sources"),
    },
    {
      id: "quality",
      label: "Chất lượng dữ liệu",
      href: "/ops/quality",
      icon: icon(GaugeIcon),
      match: (p) => p.startsWith("/ops/quality"),
    },
    {
      id: "design",
      label: "Thư viện thiết kế",
      href: "/ops/design",
      icon: icon(PaletteIcon),
      match: (p) => p.startsWith("/ops/design"),
    },
  ],
}

export const PORTAL_HOME: Record<Portal, string> = {
  invest: "/",
  ops: "/ops",
}
