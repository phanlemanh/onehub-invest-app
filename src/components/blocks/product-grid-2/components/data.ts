export const ECOMMERCE_LINK_CLASS_NAME =
  "underline-offset-4 transition-colors hover:text-primary hover:underline"

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export type ProductColor = {
  name: string
  className: string
  image: string
  imageAlt: string
}

export type ProductBadge = {
  label: string
  variant: "destructive" | "default"
}

export type Product = {
  id: string
  name: string
  href: string
  category: string
  categoryHref: string
  description: string
  price: string
  compareAtPrice?: string
  badge?: ProductBadge
  colors: ProductColor[]
}

// ─────────────────────────────────────────────────────────────────────────
// Demo data. Four curated travel bags. Each carries a small variant
// palette so the swatch row in the card earns its place; image swaps
// follow the variant so changing color updates the hero.
// ─────────────────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  {
    id: "wayfarer-daypack",
    name: "Wayfarer Daypack",
    href: "#",
    category: "Daypacks",
    categoryHref: "#",
    description:
      "Everyday 18 L pack with a padded laptop sleeve and a side-zip opening to the main compartment.",
    price: "$148",
    compareAtPrice: "$185",
    badge: { label: "20% Off", variant: "destructive" },
    colors: [
      {
        name: "Charcoal",
        className: "bg-zinc-700",
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Wayfarer Daypack in Charcoal, three-quarter studio shot",
      },
      {
        name: "Sand",
        className: "bg-stone-300",
        image:
          "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Wayfarer Daypack in Sand, resting on a wooden surface",
      },
      {
        name: "Navy",
        className: "bg-blue-950",
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Wayfarer Daypack in Navy, three-quarter studio shot",
      },
      {
        name: "Olive",
        className: "bg-lime-900",
        image:
          "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Wayfarer Daypack in Olive, resting on a wooden surface",
      },
    ],
  },
  {
    id: "sundown-weekender",
    name: "Sundown Weekender",
    href: "#",
    category: "Weekenders",
    categoryHref: "#",
    description:
      "48-hour duffel with full-grain leather pulls, a top-load main compartment, and a hidden shoe pocket.",
    price: "$224",
    badge: { label: "New", variant: "default" },
    colors: [
      {
        name: "Black",
        className: "bg-zinc-950",
        image:
          "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Sundown Weekender in Black on a marble surface",
      },
      {
        name: "Bone",
        className: "bg-stone-100",
        image:
          "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Sundown Weekender in Bone on a concrete bench",
      },
      {
        name: "Saddle Tan",
        className: "bg-amber-800",
        image:
          "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Sundown Weekender in Saddle Tan on a marble surface",
      },
    ],
  },
  {
    id: "saddle-tote",
    name: "Saddle Tote",
    href: "#",
    category: "Totes",
    categoryHref: "#",
    description:
      "Waxed canvas tote with a padded laptop sleeve, a hidden zip pocket, and stitched leather handles.",
    price: "$98",
    compareAtPrice: "$128",
    badge: { label: "23% Off", variant: "destructive" },
    colors: [
      {
        name: "Stone",
        className: "bg-stone-400",
        image:
          "https://images.unsplash.com/photo-1597633425046-08f5110420b5?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Saddle Tote in Stone, packed for the day",
      },
      {
        name: "Black",
        className: "bg-zinc-950",
        image:
          "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Saddle Tote in Black on a studio backdrop",
      },
      {
        name: "Cognac",
        className: "bg-amber-900",
        image:
          "https://images.unsplash.com/photo-1597633425046-08f5110420b5?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Saddle Tote in Cognac, packed for the day",
      },
      {
        name: "Sage",
        className: "bg-emerald-800",
        image:
          "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Saddle Tote in Sage on a studio backdrop",
      },
    ],
  },
  {
    id: "outpost-45l-pack",
    name: "Outpost 45L Pack",
    href: "#",
    category: "Travel Packs",
    categoryHref: "#",
    description:
      "Carry-on travel pack with clamshell access, a stowable hipbelt, and ventilated back panels.",
    price: "$268",
    colors: [
      {
        name: "Slate",
        className: "bg-slate-600",
        image:
          "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Outpost 45L Pack in Slate, hero studio shot",
      },
      {
        name: "Forest",
        className: "bg-emerald-900",
        image:
          "https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Outpost 45L Pack in Forest, leaning against a wall",
      },
      {
        name: "Sand",
        className: "bg-stone-300",
        image:
          "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=900&h=1100&q=80",
        imageAlt: "Outpost 45L Pack in Sand, hero studio shot",
      },
    ],
  },
]

// Initial state. Pre-like one product to demonstrate the wishlist state
// without forcing the user to click before seeing it.
export const DEFAULT_LIKED_PRODUCT_IDS: readonly string[] = ["saddle-tote"]

export const DEFAULT_SELECTED_COLORS: Record<string, string> = {
  "wayfarer-daypack": "Charcoal",
  "sundown-weekender": "Black",
  "saddle-tote": "Cognac",
  "outpost-45l-pack": "Forest",
}