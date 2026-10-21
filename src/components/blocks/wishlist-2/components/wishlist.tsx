"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/reui/badge"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ECOMMERCE_LINK_CLASS_NAME,
  getItemSignal,
  WISHLIST_ITEMS,
  type WishlistFilter,
  type WishlistItem,
} from "./data"
import { WishlistItemCard } from "./wishlist-item"
import { Share2Icon, ShoppingBagIcon, FilterIcon, HeartIcon } from "lucide-react"

interface SignalSummary {
  priceDrop: number
  backInStock: number
  almostGone: number
  ready: number
  totalSavings: number
}

function getSignalSummary(items: WishlistItem[]): SignalSummary {
  let priceDrop = 0
  let backInStock = 0
  let almostGone = 0
  let ready = 0
  let totalSavings = 0
  for (const item of items) {
    if (item.stock !== "out_of_stock") {
      ready += 1
    }
    const signal = getItemSignal(item)
    if (signal?.kind === "price-drop") priceDrop += 1
    if (signal?.kind === "back-in-stock") backInStock += 1
    if (signal?.kind === "almost-gone") almostGone += 1
    if (item.originalPrice != null && item.originalPrice > item.price) {
      totalSavings += item.originalPrice - item.price
    }
  }
  return { priceDrop, backInStock, almostGone, ready, totalSavings }
}

function matchesFilter(item: WishlistItem, filter: WishlistFilter): boolean {
  if (filter === "all") return true
  const signal = getItemSignal(item)
  return signal?.kind === filter
}

const FILTER_OPTIONS: Array<{ value: WishlistFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "price-drop", label: "Price Drops" },
  { value: "back-in-stock", label: "Back In Stock" },
  { value: "almost-gone", label: "Almost Gone" },
]

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>(WISHLIST_ITEMS)
  const [filter, setFilter] = useState<WishlistFilter>("all")
  const [notifyRequested, setNotifyRequested] = useState<Set<string>>(
    () => new Set()
  )
  const [addedToCart, setAddedToCart] = useState<Set<string>>(() => new Set())

  const summary = useMemo(() => getSignalSummary(items), [items])
  const filteredItems = useMemo(
    () => items.filter((item) => matchesFilter(item, filter)),
    [items, filter]
  )
  const readyAddable = useMemo(
    () =>
      items.filter(
        (item) =>
          item.stock !== "out_of_stock" && !addedToCart.has(item.id)
      ).length,
    [items, addedToCart]
  )

  const counts: Record<WishlistFilter, number> = {
    all: items.length,
    "price-drop": summary.priceDrop,
    "back-in-stock": summary.backInStock,
    "almost-gone": summary.almostGone,
  }

  function handleRemove(itemId: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    )
    setNotifyRequested((current) => {
      if (!current.has(itemId)) return current
      const next = new Set(current)
      next.delete(itemId)
      return next
    })
    setAddedToCart((current) => {
      if (!current.has(itemId)) return current
      const next = new Set(current)
      next.delete(itemId)
      return next
    })
  }

  function handleAddToCart(itemId: string) {
    setAddedToCart((current) => {
      if (current.has(itemId)) return current
      const next = new Set(current)
      next.add(itemId)
      return next
    })
  }

  function handleNotify(itemId: string) {
    setNotifyRequested((current) => {
      const next = new Set(current)
      next.add(itemId)
      return next
    })
  }

  function handleAddAllReadyToCart() {
    const idsToAdd = items
      .filter(
        (item) =>
          item.stock !== "out_of_stock" && !addedToCart.has(item.id)
      )
      .map((item) => item.id)
    if (idsToAdd.length === 0) return
    setAddedToCart((current) => {
      const next = new Set(current)
      for (const id of idsToAdd) next.add(id)
      return next
    })
  }

  function handleClearFilter() {
    setFilter("all")
  }

  function handleRestoreSampleList() {
    setItems(WISHLIST_ITEMS)
    setFilter("all")
    setNotifyRequested(new Set())
    setAddedToCart(new Set())
  }

  const hasItems = items.length > 0
  const hasFiltered = filteredItems.length > 0
  const subtitleSegments: string[] = []
  if (summary.priceDrop > 0) {
    subtitleSegments.push(
      `${summary.priceDrop} ${summary.priceDrop === 1 ? "price drop" : "price drops"}`
    )
  }
  if (summary.backInStock > 0) {
    subtitleSegments.push(
      `${summary.backInStock} back in stock`
    )
  }
  if (summary.almostGone > 0) {
    subtitleSegments.push(
      `${summary.almostGone} almost gone`
    )
  }

  return (
    <section
      aria-labelledby="wishlist-title"
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10"
    >
      {/* Header */}
      <header className="mb-5 flex flex-col gap-3 sm:mb-7">
        <Breadcrumb>
          <BreadcrumbList className="text-xs sm:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className={ECOMMERCE_LINK_CLASS_NAME}>
                Shop
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Wishlist</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <h1
                id="wishlist-title"
                className="text-foreground text-2xl leading-tight font-semibold tracking-tight sm:text-[1.75rem]"
              >
                Saved For Later
              </h1>
              {hasItems ? (
                <Badge
                  variant="default"
                  radius="full"
                  className="tabular-nums"
                  aria-label={`${items.length} ${items.length === 1 ? "item" : "items"} saved`}
                >
                  {items.length}
                </Badge>
              ) : null}
            </div>
            {hasItems ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" type="button">
                  <Share2Icon data-icon="inline-start" aria-hidden="true" />
                  Share List
                </Button>
                <Button
                  type="button"
                  onClick={handleAddAllReadyToCart}
                  disabled={readyAddable === 0}
                >
                  <ShoppingBagIcon data-icon="inline-start" aria-hidden="true" />
                  Add {readyAddable} To Cart
                </Button>
              </div>
            ) : null}
          </div>
          {hasItems ? (
            <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
              {subtitleSegments.length > 0 ? (
                subtitleSegments.map((segment, index) => (
                  <span
                    key={segment}
                    className="inline-flex items-center gap-2"
                  >
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className="bg-muted-foreground/40 size-1 shrink-0 rounded-full"
                      />
                    ) : null}
                    <span>{segment}</span>
                  </span>
                ))
              ) : (
                <span>Nothing new on your saved items.</span>
              )}
              {summary.totalSavings > 0 ? (
                <>
                  <span
                    aria-hidden="true"
                    className="bg-muted-foreground/40 size-1 shrink-0 rounded-full"
                  />
                  <span className="text-success font-medium">
                    Total savings {formatCurrency.format(summary.totalSavings)}
                  </span>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </header>

      {/* Filters */}
      {hasItems ? (
        <div className="mb-5 sm:mb-6">
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as WishlistFilter)}
          >
            <TabsList
              variant="line"
              className="h-10! w-full justify-start gap-1 border-b"
            >
              {FILTER_OPTIONS.map((option) => {
                const count = counts[option.value]
                const disabled = count === 0 && option.value !== "all"
                return (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    disabled={disabled}
                    aria-label={`${option.label}, ${count} ${count === 1 ? "item" : "items"}`}
                    className="group-data-horizontal/tabs:after:bottom-[-5px]! gap-2 px-3 py-1.5"
                  >
                    <span>{option.label}</span>
                    <span className="text-muted-foreground bg-muted inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums">
                      {count}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      ) : null}

      {/* Body */}
      {hasItems ? (
        hasFiltered ? (
          <ul
            role="list"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
          >
            {filteredItems.map((item, index) => (
              <li key={item.id} className="min-w-0">
                <WishlistItemCard
                  item={item}
                  priority={index < 2}
                  notifyRequested={notifyRequested.has(item.id)}
                  addedToCart={addedToCart.has(item.id)}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                  onNotify={handleNotify}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="min-h-[280px] justify-center py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FilterIcon aria-hidden="true" className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No Items Match This Filter</EmptyTitle>
              <EmptyDescription>
                Switch back to All to see every saved item.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilter}
              >
                Show All Items
              </Button>
            </EmptyContent>
          </Empty>
        )
      ) : (
        <Empty className="min-h-[320px] justify-center py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HeartIcon aria-hidden="true" className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Your Wishlist Is Empty</EmptyTitle>
            <EmptyDescription>
              Items you save will appear here with price drops, restocks, and
              low stock alerts.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={handleRestoreSampleList}>
              Restore Sample List
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </section>
  )
}