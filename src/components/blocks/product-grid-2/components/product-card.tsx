import { Badge } from "@/components/reui/badge"
import { Frame, FramePanel } from "@/components/reui/frame"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  ECOMMERCE_LINK_CLASS_NAME,
  type Product,
  type ProductColor,
} from "./data"
import { HeartIcon } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────
// Product card (Frame + two FramePanels variant). Same content contract
// as product-grid-1's tile, but the outer is a ReUI `Frame` and the tile
// is split into two stacked `FramePanel` panels: one for the media, one
// for the content. `dense={false}` (the default) so a small theme gap
// sits between the panels, creating a bento-style "panels inside a panel"
// rhythm rather than a single bounded card.
// ─────────────────────────────────────────────────────────────────────────

export function ProductCard({
  product,
  liked,
  selectedColor,
  onColorChange,
  onLikedChange,
}: {
  product: Product
  liked: boolean
  selectedColor: ProductColor
  onColorChange: (productId: string, colorName: string) => void
  onLikedChange: (productId: string) => void
}) {
  const wishlistLabel = liked
    ? `Remove ${product.name} from wishlist`
    : `Add ${product.name} to wishlist`

  return (
    <Frame
      variant="default"
      spacing="default"
      dense={false}
      className="group/card"
    >
      {/* Media panel. p-0 overrides FramePanel's default padding so the
          image bleeds to the panel edges; flex-none stops the panel from
          flex-growing past its aspect-square height. */}
      <FramePanel className="group/media relative aspect-square flex-none p-0">
        <a
          href={product.href}
          aria-label={`View ${product.name}`}
          className="focus-visible:ring-ring absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-inset"
        >
          <img
            src={selectedColor.image}
            alt={selectedColor.imageAlt}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover/media:scale-105 motion-reduce:transition-none"
            loading="lazy"
          />
        </a>

        {/* Discount or New badge top-left */}
        {product.badge ? (
          <div className="absolute top-3 left-3">
            <Badge variant={product.badge.variant} radius="full">
              {product.badge.label}
            </Badge>
          </div>
        ) : null}

        {/* Wishlist toggle. Hidden by default on sm+ and revealed on
            card hover or focus-within; always visible when already liked. */}
        <Button
          variant="secondary"
          size="icon-sm"
          type="button"
          aria-label={wishlistLabel}
          aria-pressed={liked}
          onClick={() => onLikedChange(product.id)}
          className={cn(
            "absolute top-3 right-3 transition-opacity",
            !liked &&
              "sm:opacity-0 sm:group-focus-within/card:opacity-100 sm:group-hover/card:opacity-100 sm:focus-visible:opacity-100"
          )}
        >
          <HeartIcon className={cn(
                                "size-4",
                                liked && "fill-destructive text-destructive"
                              )} aria-hidden="true" />
        </Button>
      </FramePanel>

      {/* Content panel. Uses the default FramePanel padding from
          spacing="default" (= --frame-panel-px and --frame-panel-py
          spacing(4) each). Default `grow` lets this panel fill any
          remaining tile height when grid rows stretch. */}
      <FramePanel className="flex flex-col gap-3">
        {/* Category eyebrow link */}
        <a
          href={product.categoryHref}
          aria-label={`View all ${product.category}`}
          className={cn(
            ECOMMERCE_LINK_CLASS_NAME,
            "text-muted-foreground w-fit text-xs font-medium tracking-wide uppercase"
          )}
        >
          {product.category}
        </a>

        {/* Swatch row with selected-color label */}
        <div
          role="group"
          aria-label={`Choose color for ${product.name}`}
          className="flex min-h-6 min-w-0 items-center justify-between gap-3"
        >
          <div className="flex min-w-0 items-center gap-2">
            {product.colors.map((color) => {
              const selected = selectedColor.name === color.name
              return (
                <button
                  key={color.name}
                  type="button"
                  aria-label={`Show ${product.name} in ${color.name}`}
                  aria-pressed={selected}
                  onClick={() => onColorChange(product.id, color.name)}
                  className={cn(
                    "border-border/70 size-4.5 shrink-0 rounded-full border transition-[box-shadow,transform] outline-none",
                    "hover:ring-ring/20 focus-visible:ring-ring hover:ring-2 focus-visible:ring-2 focus-visible:ring-offset-2",
                    "motion-safe:hover:scale-110",
                    selected &&
                      "ring-ring ring-offset-background ring-2 ring-offset-2",
                    color.className
                  )}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              )
            })}
          </div>
          <span className="text-muted-foreground shrink-0 text-xs">
            {selectedColor.name}
          </span>
        </div>

        {/* Title + description */}
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-foreground min-w-0 text-base leading-snug font-medium tracking-tight">
            <a
              href={product.href}
              className={cn(ECOMMERCE_LINK_CLASS_NAME, "block truncate")}
            >
              {product.name}
            </a>
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {product.description}
          </p>
        </div>

        {/* Price row. Baseline-aligned same-size prices: current carries
            the weight, compareAt drops weight + strikes through but keeps
            the same font size. Pinned to the bottom via mt-auto so prices
            align across tiles in the same grid row. */}
        <div className="mt-auto flex min-w-0 items-baseline gap-2 text-base font-semibold tabular-nums">
          <span className="text-foreground">{product.price}</span>
          {product.compareAtPrice ? (
            <span className="text-muted-foreground font-normal line-through">
              {product.compareAtPrice}
            </span>
          ) : null}
        </div>
      </FramePanel>
    </Frame>
  )
}