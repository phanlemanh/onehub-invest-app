"use client"

import Link from "next/link"
import { ArrowRightIcon, MapIcon, MapPinIcon, XIcon } from "lucide-react"

import { toggleSaved } from "@/app/actions"
import { Badge } from "@/components/reui/badge"
import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import { fmtInt, fmtMoney, fmtPct } from "@/lib/format"

/** Link class của wishlist-2 (ECOMMERCE_LINK_CLASS_NAME). */
const LINK = "underline-offset-2 transition-colors hover:text-primary hover:underline"

export type SavedArea = {
  id: string
  name: string
  parentName: string | null
  regionType: "market" | "submarket"
  href: string
  savedAt: string
  listings: number | null
  revpar: number | null
  occupancy: number | null
  adr: number | null
  currency: string
}

/**
 * Thẻ khu vực đã lưu — chuyển thể WishlistItemCard của @reui/wishlist-2. Khác
 * bản gốc: panel ảnh thành panel số (RevPAR + công suất, ADR) vì không có ảnh
 * khu vực; nút ✕ gỡ lưu bằng server action; "Add to cart" → "Xem Insight".
 */
export function SavedItemCard({ area }: { area: SavedArea }) {
  const isMarket = area.regionType === "market"
  return (
    <article className="group/card flex min-w-0 flex-col gap-3">
      <Item variant="muted" className="relative aspect-[4/3] flex-col items-start justify-end gap-1 overflow-hidden p-4">
        <div className="pointer-events-none absolute top-2 left-2">
          <Badge variant={isMarket ? "info-light" : "outline"} radius="full" className="gap-1 pr-2 pl-1.5">
            {isMarket ? (
              <MapIcon aria-hidden="true" className="size-3" />
            ) : (
              <MapPinIcon aria-hidden="true" className="size-3" />
            )}
            {isMarket ? "Thị trường" : "Phường"}
          </Badge>
        </div>
        <form action={toggleSaved} className="absolute top-2 right-2">
          <input type="hidden" name="areaId" value={area.id} />
          <input type="hidden" name="redirectTo" value="/saved" />
          <Button
            variant="secondary"
            size="icon-sm"
            type="submit"
            aria-label={`Bỏ lưu ${area.name}`}
            className="bg-background/90 opacity-0 backdrop-blur-sm transition-opacity duration-200 ease-out group-focus-within/card:opacity-100 group-hover/card:opacity-100 focus-visible:opacity-100 max-sm:opacity-100"
          >
            <XIcon aria-hidden="true" />
          </Button>
        </form>
        <span className="text-muted-foreground text-xs">RevPAR</span>
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {area.revpar ? fmtMoney(area.revpar, area.currency) : "—"}
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          Công suất {fmtPct(area.occupancy)} · ADR {area.adr ? fmtMoney(area.adr, area.currency) : "—"}
        </span>
      </Item>

      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-muted-foreground min-w-0 truncate text-xs font-medium">
          {area.parentName ?? "Việt Nam"}
        </span>
        <h3 className="text-foreground min-w-0 text-sm leading-tight font-semibold tracking-tight sm:text-base">
          <Link href={area.href} prefetch={false} className={`${LINK} block truncate`}>
            {area.name}
          </Link>
        </h3>
        <p className="text-muted-foreground text-xs">
          {area.listings !== null ? `${fmtInt(area.listings)} listing · ` : ""}
          Lưu ngày {area.savedAt.split("-").reverse().join("/")}
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full"
        nativeButton={false}
        render={<Link href={area.href} prefetch={false} />}
      >
        Xem Insight
        <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
      </Button>
    </article>
  )
}
