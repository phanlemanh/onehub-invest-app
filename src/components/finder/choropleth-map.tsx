"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { LngLatBounds, Map as MLMap, Popup } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "@/lib/map-worker"

import { MAP_OPTIONS, addAttribution, basemapUrl, prepareBasemap } from "@/lib/map-style"

import { BIN_COLORS, NO_DATA_COLOR, NO_DATA_COLOR_DARK } from "./bins"

export type ChoroplethArea = {
  id: string
  name: string
  href: string
  /** Bậc 0–3, null khi chưa có số. */
  bin: number | null
  /** Giá trị đã định dạng cho popup. */
  label: string
  geometry: unknown
}

/** Mọi toạ độ của một GeoJSON geometry (Polygon/MultiPolygon). */
function* coordsOf(geometry: unknown): Generator<[number, number]> {
  const walk = function* (node: unknown): Generator<[number, number]> {
    if (Array.isArray(node) && typeof node[0] === "number") {
      yield [node[0] as number, node[1] as number]
    } else if (Array.isArray(node)) {
      for (const child of node) yield* walk(child)
    }
  }
  yield* walk((geometry as { coordinates?: unknown })?.coordinates)
}

/**
 * Bản đồ choropleth (MapLibre — ReUI không có map) trên nền OpenFreeMap xám
 * nhạt (tối: nền tối): màu là dữ liệu nên nền phải trung tính. Lớp màu nằm DƯỚI
 * tên đường / địa danh để vẫn định vị được. Chỉ vẽ: màu theo bậc, popup khi rê
 * chuột, bấm để mở Insight. Bộ chọn chỉ số và chú giải nằm ngoài, dựng bằng ReUI.
 * Canh khung theo các khu vực đang xem.
 */
export function ChoroplethMap({ areas }: { areas: ChoroplethArea[] }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  const styleRef = useRef<string | null>(null)

  const data = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: areas
        .filter((a) => a.geometry)
        .map((a) => ({
          type: "Feature" as const,
          properties: {
            id: a.id,
            name: a.name,
            href: a.href,
            label: a.label,
            // null = chưa có số → màu "trống" theo sáng/tối, gán lúc vẽ.
            color: a.bin === null ? null : BIN_COLORS[a.bin],
          },
          geometry: a.geometry,
        })),
    }),
    [areas]
  )
  const dataRef = useRef(data)
  useEffect(() => {
    dataRef.current = data
  })

  // Khung nhìn: dựng lại bản đồ khi tập khu vực đổi (đổi cấp / đổi thị trường).
  const themeKnown = resolvedTheme !== undefined
  const areaKey = areas.map((a) => a.id).join(",")
  useEffect(() => {
    // Chờ biết sáng/tối để nạp đúng nền ngay lần đầu, khỏi nháy.
    if (!ref.current || !themeKnown) return
    const bounds = new LngLatBounds()
    for (const a of areas) for (const c of coordsOf(a.geometry)) bounds.extend(c)
    const url = basemapUrl("muted", dark)
    const map = new MLMap({
      ...MAP_OPTIONS,
      container: ref.current,
      style: url,
      bounds: bounds.isEmpty() ? undefined : bounds,
      center: bounds.isEmpty() ? [105.85, 21.03] : undefined,
      zoom: bounds.isEmpty() ? 9 : undefined,
      fitBoundsOptions: { padding: 24 },
    })
    mapRef.current = map
    styleRef.current = url
    addAttribution(map)

    // Chạy mỗi lần nạp style (lần đầu và mỗi lần đổi sáng/tối): nền mới xoá hết lớp riêng.
    map.on("style.load", () => {
      const beforeLabels = prepareBasemap(map)
      const isDark = styleRef.current === basemapUrl("muted", true)
      map.addSource("areas", { type: "geojson", data: dataRef.current as never })
      map.addLayer(
        {
          id: "areas-fill",
          type: "fill",
          source: "areas",
          paint: {
            "fill-color": ["coalesce", ["get", "color"], isDark ? NO_DATA_COLOR_DARK : NO_DATA_COLOR],
            "fill-opacity": isDark ? 0.75 : 0.7,
          },
        },
        beforeLabels
      )
      map.addLayer(
        {
          id: "areas-line",
          type: "line",
          source: "areas",
          paint: { "line-color": isDark ? "#0a0a0a" : "#ffffff", "line-width": 0.8 },
        },
        beforeLabels
      )
    })

    const popup = new Popup({ closeButton: false, offset: 4 })
    map.on("mousemove", "areas-fill", (e) => {
      const f = e.features?.[0]
      if (!f) return
      map.getCanvas().style.cursor = "pointer"
      const props = f.properties as { name: string; label: string }
      const el = document.createElement("div")
      const name = document.createElement("strong")
      name.textContent = props.name
      el.append(name, document.createElement("br"), props.label)
      popup.setLngLat(e.lngLat).setDOMContent(el).addTo(map)
    })
    map.on("mouseleave", "areas-fill", () => {
      map.getCanvas().style.cursor = ""
      popup.remove()
    })
    map.on("click", "areas-fill", (e) => {
      const href = e.features?.[0]?.properties?.href
      if (typeof href === "string") router.push(href)
    })

    return () => {
      map.remove()
      mapRef.current = null
      styleRef.current = null
    }
    // Chỉ dựng lại khi tập khu vực đổi; đổi chỉ số chỉ cập nhật dữ liệu bên dưới,
    // đổi sáng/tối chỉ thay nền (effect dưới).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaKey, themeKnown])

  // Đổi sáng/tối: thay nền, giữ khung nhìn; style.load dựng lại các lớp.
  useEffect(() => {
    const map = mapRef.current
    const url = basemapUrl("muted", dark)
    if (!map || styleRef.current === url) return
    styleRef.current = url
    map.setStyle(url, { diff: false })
  }, [dark])

  // Đổi chỉ số → chỉ đổi màu/nhãn, giữ nguyên khung nhìn.
  useEffect(() => {
    const map = mapRef.current
    const source = map?.getSource("areas") as { setData?: (d: unknown) => void } | undefined
    source?.setData?.(data)
  }, [data])

  return <div ref={ref} className="size-full min-h-80" />
}
