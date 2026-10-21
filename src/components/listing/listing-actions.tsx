"use client"

import { ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Khe `actions` của PageHeader trên trang listing. */
export function ListingActions({ airbnbUrl }: { airbnbUrl: string | null }) {
  if (!airbnbUrl) return null
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs shadow-xs"
      nativeButton={false}
      render={<a href={airbnbUrl} target="_blank" rel="noopener noreferrer" />}
    >
      <ExternalLinkIcon data-icon="inline-start" aria-hidden="true" />
      Mở trên Airbnb
    </Button>
  )
}
