"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  type FilterSpecification,
  type GeoJSONSource,
  type SymbolLayerSpecification,
  Map as MLMap,
} from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "@/lib/map-worker"

import { fmtCompact } from "@/lib/format"
import {
  MAP_FONT,
  MAP_OPTIONS,
  addAttribution,
  basemapUrl,
  denseBounds,
  prepareBasemap,
} from "@/lib/map-style"
import type { ListingCardRow } from "@/lib/queries"

/**
 * Màu nhãn theo kiểu Airbnb (MapLibre cần hex): nhãn giá trắng chữ đậm ở cả sáng
 * lẫn tối, nhãn đang chọn đen viền trắng; cụm và chấm đảo màu theo nền.
 */
const INK = "#18181b"
const PAPER = "#ffffff"
const EDGE = "#d4d4d8"

const SOURCE = "listings"
const L = {
  clusters: "listings-clusters",
  clusterCount: "listings-cluster-count",
  dots: "listings-dots",
  pills: "listings-pills",
  pillActive: "listings-pill-active",
} as const

/**
 * Ảnh nền nhãn giá: viên thuốc co giãn (icon-text-fit) để vừa mọi độ dài chữ.
 * Vẽ bằng canvas một lần cho mỗi màu; toạ độ stretch/content tính theo pixel ảnh.
 */
function pillImage(fill: string, stroke: string) {
  const r = 2 // vẽ 2x cho màn hình nét
  const W = 32
  const H = 28
  const box = { x: 2, y: 1, w: 28, h: 24, rad: 11 }
  const canvas = document.createElement("canvas")
  canvas.width = W * r
  canvas.height = H * r
  const ctx = canvas.getContext("2d")!
  ctx.scale(r, r)
  ctx.shadowColor = "rgba(0,0,0,0.18)"
  ctx.shadowBlur = 2
  ctx.shadowOffsetY = 1
  ctx.beginPath()
  ctx.roundRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, box.rad)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.shadowColor = "transparent"
  ctx.lineWidth = 1
  ctx.strokeStyle = stroke
  ctx.stroke()
  const left = box.x + box.rad
  const right = box.x + box.w - box.rad
  const top = box.y + box.rad
  const bottom = box.y + box.h - box.rad
  return {
    data: ctx.getImageData(0, 0, W * r, H * r),
    options: {
      pixelRatio: r,
      stretchX: [[left * r, right * r]] as [number, number][],
      stretchY: [[top * r, bottom * r]] as [number, number][],
      content: [(box.x + 7) * r, (box.y + 5) * r, (box.x + box.w - 7) * r, (box.y + box.h - 5) * r] as [
        number,
        number,
        number,
        number,
      ],
    },
  }
}

/**
 * Bản đồ nhãn giá (MapLibre — ReUI không có map), trên nền OpenFreeMap có màu.
 * Thu nhỏ: listing gom thành cụm có số đếm; phóng to: nhãn giá, nhãn nào đè nhau
 * thì ẩn còn chấm (ưu tiên listing doanh thu cao — thứ tự của danh sách).
 *
 * Báo về danh sách id đang nằm trong khung nhìn sau khi NGƯỜI DÙNG kéo/zoom (kể
 * cả bấm vào cụm), để danh sách lọc theo vùng bản đồ như AirDNA. Resize khung,
 * canh khung đầu, đổi sáng/tối và "Bỏ lọc" đều không lọc.
 */
export function ListingsMap({
  listings,
  activeId,
  onHover,
  onViewportChange,
  resetKey,
}: {
  listings: ListingCardRow[]
  activeId: string | null
  onHover: (id: string | null) => void
  onViewportChange: (ids: Set<string>) => void
  /** Đổi giá trị để canh lại khung về toàn bộ listing (nút "Bỏ lọc"). */
  resetKey: number
}) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  const styleRef = useRef<string | null>(null)
  /** true từ lúc người dùng bắt đầu kéo/zoom tới moveend tương ứng. */
  const userMoveRef = useRef(false)
  const live = useRef({ onHover, onViewportChange, activeId })
  useEffect(() => {
    live.current = { onHover, onViewportChange, activeId }
  })

  const data = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: listings.map((l, rank) => ({
        type: "Feature" as const,
        properties: { id: l.id, label: l.priceListed ? fmtCompact(l.priceListed) : "", rank },
        geometry: { type: "Point" as const, coordinates: [l.lng, l.lat] },
      })),
    }),
    [listings]
  )
  const dataRef = useRef(data)
  useEffect(() => {
    dataRef.current = data
  })

  const boundsOf = () => denseBounds(listings.map((l) => [l.lng, l.lat]))

  const themeKnown = resolvedTheme !== undefined
  const listingKey = listings.map((l) => l.id).join(",")
  useEffect(() => {
    // Chờ biết sáng/tối để nạp đúng nền ngay lần đầu, khỏi nháy.
    if (!ref.current || !themeKnown) return
    const bounds = boundsOf()
    const url = basemapUrl("colored", dark)
    const map = new MLMap({
      ...MAP_OPTIONS,
      container: ref.current,
      style: url,
      bounds: bounds.isEmpty() ? undefined : bounds,
      center: bounds.isEmpty() ? [105.85, 21.03] : undefined,
      zoom: bounds.isEmpty() ? 11 : undefined,
      fitBoundsOptions: { padding: 40, maxZoom: 15 },
    })
    mapRef.current = map
    styleRef.current = url
    userMoveRef.current = false
    addAttribution(map)

    // Chạy mỗi lần nạp style (lần đầu và mỗi lần đổi sáng/tối): nền mới xoá hết lớp riêng.
    map.on("style.load", () => {
      prepareBasemap(map)
      // Cụm và chấm đảo màu theo nền: đen trên nền sáng, trắng trên nền tối.
      const isDark = styleRef.current === basemapUrl("colored", true)
      const mark = isDark ? PAPER : INK
      const markEdge = isDark ? INK : PAPER
      const pill = pillImage(PAPER, EDGE)
      const pillActive = pillImage(INK, PAPER)
      map.addImage("pill", pill.data, pill.options)
      map.addImage("pill-active", pillActive.data, pillActive.options)

      map.addSource(SOURCE, {
        type: "geojson",
        data: dataRef.current,
        cluster: true,
        // Từ zoom 12 (cỡ một quận) hết gom cụm: nhãn tự ẩn khi đè nhau, còn chấm.
        clusterRadius: 36,
        clusterMaxZoom: 11,
      })
      map.addLayer({
        id: L.clusters,
        type: "circle",
        source: SOURCE,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": mark,
          "circle-stroke-color": markEdge,
          "circle-stroke-width": 2,
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 18, 50, 23],
        },
      })
      map.addLayer({
        id: L.clusterCount,
        type: "symbol",
        source: SOURCE,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": MAP_FONT.bold,
          "text-size": 12,
          "text-allow-overlap": true,
        },
        paint: { "text-color": markEdge },
      })
      // Chấm cho mọi listing lẻ: nhãn bị ẩn do đè nhau vẫn còn dấu trên bản đồ.
      map.addLayer({
        id: L.dots,
        type: "circle",
        source: SOURCE,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": mark,
          "circle-radius": 4,
          "circle-stroke-color": markEdge,
          "circle-stroke-width": 1.5,
        },
      })
      const pillLayout = {
        "icon-text-fit": "both",
        "icon-text-fit-padding": [1, 2, 1, 2],
        "text-field": ["get", "label"],
        "text-font": MAP_FONT.bold,
        "text-size": 12,
      } satisfies SymbolLayerSpecification["layout"]
      map.addLayer({
        id: L.pills,
        type: "symbol",
        source: SOURCE,
        filter: ["all", ["!", ["has", "point_count"]], ["!=", ["get", "label"], ""]],
        layout: {
          ...pillLayout,
          "icon-image": "pill",
          "symbol-sort-key": ["get", "rank"],
          "symbol-z-order": "source",
          "icon-padding": 1,
        },
        paint: { "text-color": INK },
      })
      map.addLayer({
        id: L.pillActive,
        type: "symbol",
        source: SOURCE,
        filter: activeFilter(live.current.activeId),
        layout: {
          ...pillLayout,
          "icon-image": "pill-active",
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
          "icon-ignore-placement": true,
          "text-ignore-placement": true,
        },
        paint: { "text-color": PAPER },
      })
    })

    // Rê chuột / bấm: nhãn hoặc chấm của listing lẻ.
    for (const layer of [L.pills, L.dots]) {
      map.on("mousemove", layer, (e) => {
        const id = e.features?.[0]?.properties?.id
        if (typeof id !== "string") return
        map.getCanvas().style.cursor = "pointer"
        live.current.onHover(id)
      })
      map.on("mouseleave", layer, () => {
        map.getCanvas().style.cursor = ""
        live.current.onHover(null)
      })
      map.on("click", layer, (e) => {
        const id = e.features?.[0]?.properties?.id
        if (typeof id === "string") router.push(`/listing/${id}`)
      })
    }
    // Bấm cụm: phóng tới mức tách cụm — tính là người dùng di chuyển (lọc danh sách).
    map.on("click", L.clusters, async (e) => {
      const f = e.features?.[0]
      if (!f) return
      const source = map.getSource(SOURCE) as GeoJSONSource
      const zoom = await source.getClusterExpansionZoom(f.properties.cluster_id)
      userMoveRef.current = true
      map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom })
    })
    map.on("mouseenter", L.clusters, () => (map.getCanvas().style.cursor = "pointer"))
    map.on("mouseleave", L.clusters, () => (map.getCanvas().style.cursor = ""))

    const markUser = (e: { originalEvent?: unknown }) => {
      if (e.originalEvent) userMoveRef.current = true
    }
    map.on("dragstart", markUser)
    map.on("zoomstart", markUser)
    map.on("moveend", () => {
      if (!userMoveRef.current) return
      userMoveRef.current = false
      const view = map.getBounds()
      live.current.onViewportChange(
        new Set(listings.filter((l) => view.contains([l.lng, l.lat])).map((l) => l.id))
      )
    })

    return () => {
      map.remove()
      mapRef.current = null
      styleRef.current = null
    }
    // Dựng lại khi tập listing đổi; đổi sáng/tối xử lý ở effect dưới.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingKey, themeKnown])

  // Đổi sáng/tối: thay nền, giữ khung nhìn; style.load dựng lại các lớp.
  useEffect(() => {
    const map = mapRef.current
    const url = basemapUrl("colored", dark)
    if (!map || styleRef.current === url) return
    styleRef.current = url
    map.setStyle(url, { diff: false })
  }, [dark])

  // "Bỏ lọc": canh khung lại toàn bộ.
  useEffect(() => {
    if (resetKey === 0) return
    const map = mapRef.current
    const bounds = boundsOf()
    if (!map || bounds.isEmpty()) return
    userMoveRef.current = false
    map.fitBounds(bounds, { padding: 40, maxZoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  // Nhãn của thẻ đang rê chuột đổi sang đen, luôn nổi trên cùng.
  useEffect(() => {
    const map = mapRef.current
    if (map?.getLayer(L.pillActive)) map.setFilter(L.pillActive, activeFilter(activeId))
  }, [activeId])

  return <div ref={ref} className="size-full min-h-80" />
}

function activeFilter(id: string | null) {
  return [
    "all",
    ["!", ["has", "point_count"]],
    ["!=", ["get", "label"], ""],
    ["==", ["get", "id"], id ?? ""],
  ] as FilterSpecification
}
