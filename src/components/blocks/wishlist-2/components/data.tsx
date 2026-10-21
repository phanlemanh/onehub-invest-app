import type { BadgeProps } from "@/components/reui/badge"

export const ECOMMERCE_LINK_CLASS_NAME =
  "underline-offset-2 transition-colors hover:text-primary hover:underline"

export type WishlistSignalKind =
  | "price-drop"
  | "back-in-stock"
  | "almost-gone"
  | "unavailable"

export type WishlistSignal = {
  kind: WishlistSignalKind
  label: string
  variant: BadgeProps["variant"]
}

export type WishlistItem = {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  stock: "in_stock" | "low_stock" | "out_of_stock"
  stockNote?: string
  savedAt: string
  restockedAt?: string
  image: {
    src: string
    alt: string
  }
}

export type WishlistFilter =
  | "all"
  | "price-drop"
  | "back-in-stock"
  | "almost-gone"

export function getItemSignal(item: WishlistItem): WishlistSignal | null {
  if (item.stock === "out_of_stock") {
    return {
      kind: "unavailable",
      label: "Unavailable",
      variant: "secondary",
    }
  }
  if (item.originalPrice != null && item.originalPrice > item.price) {
    return {
      kind: "price-drop",
      label: "Price Drop",
      variant: "success",
    }
  }
  if (item.restockedAt != null) {
    return {
      kind: "back-in-stock",
      label: "Back In Stock",
      variant: "info",
    }
  }
  if (item.stock === "low_stock") {
    return {
      kind: "almost-gone",
      label: "Almost Gone",
      variant: "warning",
    }
  }
  return null
}

export const WISHLIST_ITEMS: WishlistItem[] = [
  {
    id: "storm-wool-coat",
    name: "Storm Wool Coat",
    category: "Outerwear",
    price: 385,
    originalPrice: 420,
    stock: "in_stock",
    savedAt: "Saved 3 days ago",
    image: {
      src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&h=750&q=80",
      alt: "Storm Wool Coat in camel on a studio backdrop",
    },
  },
  {
    id: "italian-penny-loafers",
    name: "Italian Penny Loafers",
    category: "Footwear",
    price: 295,
    stock: "low_stock",
    stockNote: "Only 2 left",
    savedAt: "Saved 1 week ago",
    image: {
      src: "https://images.unsplash.com/photo-1614253429340-98120bd6d753?auto=format&fit=crop&w=600&h=750&q=80",
      alt: "Italian Penny Loafers in walnut leather",
    },
  },
  {
    id: "cashmere-v-neck",
    name: "Cashmere V-Neck Sweater",
    category: "Knits",
    price: 228,
    stock: "in_stock",
    savedAt: "Saved yesterday",
    restockedAt: "Restocked 2 days ago",
    image: {
      src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&h=750&q=80",
      alt: "Cashmere V-Neck Sweater in oat heather",
    },
  },
  {
    id: "slim-card-holder",
    name: "Slim Card Holder",
    category: "Leather Goods",
    price: 85,
    stock: "in_stock",
    savedAt: "Saved 4 days ago",
    image: {
      src: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&h=750&q=80",
      alt: "Slim Card Holder in oxblood leather",
    },
  },
  {
    id: "weekend-tote",
    name: "Weekend Tote Bag",
    category: "Bags",
    price: 310,
    stock: "out_of_stock",
    savedAt: "Saved 5 days ago",
    image: {
      src: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&h=750&q=80",
      alt: "Weekend Tote Bag in tan canvas with leather handles",
    },
  },
]