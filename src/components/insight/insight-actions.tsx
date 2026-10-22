"use client"

import Link from "next/link"
import { BookmarkCheckIcon, BookmarkIcon, CalculatorIcon, GitCompareIcon, MapIcon } from "lucide-react"

import { toggleSaved } from "@/app/actions"
import { Button } from "@/components/ui/button"

/** Nút So sánh + Bản đồ + Lưu của trang Insight (khe `actions` của PageHeader). */
export function InsightActions({
  areaId,
  currentPath,
  saved,
  signedIn,
  mapHref,
}: {
  areaId: string
  currentPath: string
  saved: boolean
  signedIn: boolean
  mapHref?: string
}) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-xs shadow-xs"
        nativeButton={false}
        render={<Link href={`/so-sanh?areas=${areaId}`} />}
      >
        <GitCompareIcon data-icon="inline-start" aria-hidden="true" />
        So sánh
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-xs shadow-xs"
        nativeButton={false}
        render={<Link href={`/${areaId.split("-")[0]}/${areaId.split("-").slice(1).join("-")}/dau-tu`} />}
      >
        <CalculatorIcon data-icon="inline-start" aria-hidden="true" />
        Đầu tư
      </Button>
      {mapHref && (
        <Button
          variant="outline"
          size="sm"
          className="text-xs shadow-xs"
          nativeButton={false}
          render={<Link href={mapHref} />}
        >
          <MapIcon data-icon="inline-start" aria-hidden="true" />
          Bản đồ
        </Button>
      )}
      {signedIn ? (
        <form action={toggleSaved}>
          <input type="hidden" name="areaId" value={areaId} />
          <input type="hidden" name="redirectTo" value={currentPath} />
          <Button
            type="submit"
            size="sm"
            variant={saved ? "default" : "outline"}
            className="text-xs shadow-xs"
            aria-pressed={saved}
          >
            {saved ? (
              <BookmarkCheckIcon data-icon="inline-start" aria-hidden="true" />
            ) : (
              <BookmarkIcon data-icon="inline-start" aria-hidden="true" />
            )}
            {saved ? "Đã lưu" : "Lưu"}
          </Button>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-xs shadow-xs"
          nativeButton={false}
          render={<Link href={`/login?next=${encodeURIComponent(currentPath)}`} />}
        >
          <BookmarkIcon data-icon="inline-start" aria-hidden="true" />
          Lưu
        </Button>
      )}
    </>
  )
}
