import Link from "next/link"
import { ChartNoAxesColumnIncreasingIcon } from "lucide-react"

import { Badge } from "@/components/reui/badge"

/** Logo chữ One Invest — thay ReuiMark của app-shell-30. */
export function BrandMark({ href, label }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="text-foreground flex shrink-0 items-center gap-2"
      aria-label="One Invest — trang chủ"
    >
      <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
        <ChartNoAxesColumnIncreasingIcon className="size-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold max-sm:hidden">One Invest</span>
      {label && (
        <Badge variant="outline" size="sm" radius="full" className="max-sm:hidden">
          {label}
        </Badge>
      )}
    </Link>
  )
}
