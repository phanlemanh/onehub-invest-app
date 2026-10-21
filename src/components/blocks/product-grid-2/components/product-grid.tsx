"use client"

import { useState } from "react"

import {
  DEFAULT_LIKED_PRODUCT_IDS,
  DEFAULT_SELECTED_COLORS,
  PRODUCTS,
} from "./data"
import { ProductCard } from "./product-card"

// ─────────────────────────────────────────────────────────────────────────
// Product grid. Bare 2x2 collection grid (same shape as product-grid-1):
// four curated travel bags rendered through `ProductCard`, which wraps
// each tile in a ReUI Frame instead of a shadcn Card. No outer container,
// header, or footer chrome so the block embeds cleanly into any composer.
// ─────────────────────────────────────────────────────────────────────────

export function ProductGrid() {
  const [likedProducts, setLikedProducts] = useState<Set<string>>(
    () => new Set(DEFAULT_LIKED_PRODUCT_IDS)
  )
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(
    () => ({ ...DEFAULT_SELECTED_COLORS })
  )

  function handleLikedChange(productId: string) {
    setLikedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  function handleColorChange(productId: string, colorName: string) {
    setSelectedColors((prev) => ({ ...prev, [productId]: colorName }))
  }

  return (
    <section
      aria-label="Featured bags"
      className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
        {PRODUCTS.map((product) => {
          const selectedColor =
            product.colors.find(
              (c) => c.name === selectedColors[product.id]
            ) ?? product.colors[0]!
          return (
            <ProductCard
              key={product.id}
              product={product}
              liked={likedProducts.has(product.id)}
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
              onLikedChange={handleLikedChange}
            />
          )
        })}
      </div>
    </section>
  )
}