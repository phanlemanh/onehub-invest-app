import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Portal } from "./nav"

/**
 * Footer — ReUI không có block footer (docs/research/reui-inventory.md §4),
 * ghép từ Separator + Button link. Link "Nội bộ" sang /ops CHỈ nằm ở đây
 * (portals.md luật 4).
 */
const LINKS: Record<Portal, { label: string; href: string }[]> = {
  invest: [
    { label: "Thị trường Việt Nam", href: "/vn" },
    { label: "Hà Nội", href: "/vn/hanoi" },
    { label: "Đã lưu", href: "/saved" },
    { label: "Phương pháp", href: "/phuong-phap" },
    { label: "Nội bộ", href: "/ops" },
  ],
  ops: [{ label: "Về Invest Portal", href: "/" }],
}

export function SiteFooter({ portal }: { portal: Portal }) {
  return (
    <footer className="flex flex-col gap-3 px-4 pt-6 pb-8 sm:px-6">
      <Separator />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Liên kết cuối trang" className="-mx-2.5 flex flex-wrap items-center">
          {LINKS[portal].map((link) => (
            <Button
              key={link.href}
              variant="link"
              size="sm"
              nativeButton={false}
              render={<Link href={link.href} />}
              className="text-muted-foreground text-xs"
            >
              {link.label}
            </Button>
          ))}
        </nav>
        <p className="text-muted-foreground text-xs">
          © 2026 One Invest · Dữ liệu: Airbnb (tự thu thập), Inside Airbnb, OpenStreetMap
        </p>
      </div>
    </footer>
  )
}
