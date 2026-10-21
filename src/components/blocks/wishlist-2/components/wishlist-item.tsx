import { Badge } from "@/components/reui/badge"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import {
  ECOMMERCE_LINK_CLASS_NAME,
  getItemSignal,
  type WishlistItem,
} from "./data"
import { TrendingDown, PackageIcon, EyeOffIcon, FlameIcon, XIcon, CheckIcon, BellIcon, ShoppingBagIcon } from "lucide-react"

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function SignalIcon({ kind }: { kind: ReturnType<typeof getItemSignal> }) {
  if (kind == null) return null
  if (kind.kind === "price-drop") {
    return (
      <TrendingDown aria-hidden="true" className="size-3" />
    )
  }
  if (kind.kind === "back-in-stock") {
    return (
      <PackageIcon aria-hidden="true" className="size-3" />
    )
  }
  if (kind.kind === "unavailable") {
    return (
      <EyeOffIcon aria-hidden="true" className="size-3" />
    )
  }
  return (
    <FlameIcon aria-hidden="true" className="size-3" />
  )
}

export function WishlistItemCard({
  item,
  priority,
  onRemove,
  onAddToCart,
  onNotify,
  notifyRequested,
  addedToCart,
}: {
  item: WishlistItem
  priority?: boolean
  onRemove: (itemId: string) => void
  onAddToCart: (itemId: string) => void
  onNotify: (itemId: string) => void
  notifyRequested: boolean
  addedToCart: boolean
}) {
  const signal = getItemSignal(item)
  const hasDiscount =
    item.originalPrice != null && item.originalPrice > item.price
  const savings = hasDiscount ? (item.originalPrice as number) - item.price : 0
  const metaLine =
    item.stock === "out_of_stock"
      ? "Currently unavailable"
      : item.stock === "low_stock"
        ? (item.stockNote ?? "Low stock")
        : (item.restockedAt ?? item.savedAt)

  return (
    <article className="group/card flex min-w-0 flex-col gap-3">
      {/* Media */}
      <Item
        variant="muted"
        className={cn(
          "relative aspect-[4/5] overflow-hidden p-0",
          item.stock === "out_of_stock" && "opacity-60"
        )}
      >
        <a
          href="#"
          aria-label={`View ${item.name}`}
          className={cn(
            ECOMMERCE_LINK_CLASS_NAME,
            "focus-visible:ring-ring absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-inset"
          )}
        >
          <img
            src={item.image.src}
            alt={item.image.alt}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out",
              item.stock === "out_of_stock"
                ? "grayscale"
                : "group-hover/card:scale-105"
            )}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        </a>
        {signal != null ? (
          <div className="pointer-events-none absolute top-2 left-2">
            <Badge
              variant={signal.variant}
              radius="full"
              className="gap-1 pr-2 pl-1.5"
            >
              <SignalIcon kind={signal} />
              {signal.label}
            </Badge>
          </div>
        ) : null}
        <Button
          variant="secondary"
          size="icon-sm"
          type="button"
          aria-label={`Remove ${item.name} from wishlist`}
          onClick={() => onRemove(item.id)}
          className="bg-background/90 absolute top-2 right-2 opacity-0 backdrop-blur-sm transition-opacity duration-200 ease-out group-focus-within/card:opacity-100 group-hover/card:opacity-100 focus-visible:opacity-100"
        >
          <XIcon aria-hidden="true" />
        </Button>
      </Item>

      {/* Content */}
      <div className="flex min-w-0 flex-col gap-1.5">
        <a
          href="#"
          aria-label={`Shop all ${item.category}`}
          className={cn(
            ECOMMERCE_LINK_CLASS_NAME,
            "text-muted-foreground min-w-0 truncate text-xs font-medium"
          )}
        >
          {item.category}
        </a>

        <h3 className="text-foreground min-w-0 text-sm leading-tight font-semibold tracking-tight sm:text-base">
          <a
            href="#"
            className={cn(ECOMMERCE_LINK_CLASS_NAME, "block truncate")}
          >
            {item.name}
          </a>
        </h3>

        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-foreground text-base font-semibold tabular-nums">
            {formatCurrency.format(item.price)}
          </span>
          {hasDiscount ? (
            <>
              <span className="text-muted-foreground text-xs tabular-nums line-through">
                {formatCurrency.format(item.originalPrice as number)}
              </span>
              <span className="text-success text-xs font-semibold tabular-nums">
                Save {formatCurrency.format(savings)}
              </span>
            </>
          ) : null}
        </div>

        {/* Meta line */}
        <p
          className={cn(
            "text-xs",
            item.stock === "out_of_stock"
              ? "text-muted-foreground"
              : "text-muted-foreground"
          )}
        >
          {metaLine}
        </p>
      </div>

      {/* Action */}
      {item.stock === "out_of_stock" ? (
        <Button
          variant="outline"
          type="button"
          className="w-full"
          disabled={notifyRequested}
          onClick={() => onNotify(item.id)}
          aria-label={
            notifyRequested
              ? `Restock alert set for ${item.name}`
              : `Notify me when ${item.name} is restocked`
          }
        >
          {notifyRequested ? (
            <>
              <CheckIcon data-icon="inline-start" aria-hidden="true" className="text-success" />
              Restock Alert On
            </>
          ) : (
            <>
              <BellIcon data-icon="inline-start" aria-hidden="true" />
              Notify When Restocked
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="outline"
          type="button"
          className="w-full"
          disabled={addedToCart}
          onClick={() => onAddToCart(item.id)}
          aria-label={
            addedToCart ? `${item.name} is in cart` : `Add ${item.name} to cart`
          }
        >
          {addedToCart ? (
            <>
              <CheckIcon data-icon="inline-start" aria-hidden="true" className="text-success" />
              Added To Cart
            </>
          ) : (
            <>
              <ShoppingBagIcon data-icon="inline-start" aria-hidden="true" />
              Add To Cart
            </>
          )}
        </Button>
      )}
    </article>
  )
}