import {
  AttributionControl,
  LngLatBounds,
  type ExpressionSpecification,
  type Map as MLMap,
  type MapOptions,
} from "maplibre-gl"

/**
 * Bản đồ nền dùng chung cho mọi bản đồ MapLibre (ReUI không có map).
 *
 * Nguồn: OpenFreeMap — tile vector OpenStreetMap, không khoá, không giới hạn lượt,
 * dùng được cả khi sản phẩm ra công khai. Ba kiểu:
 * - "colored" (Liberty): đường, công viên, mặt nước có màu — cho bản đồ giá listing,
 *   cần định vị căn như Airbnb.
 * - "muted" (Positron): xám nhạt — cho choropleth, nơi màu là dữ liệu.
 * - Chế độ tối dùng chung kiểu "dark" cho cả hai.
 */
const STYLE_URL = {
  colored: "https://tiles.openfreemap.org/styles/liberty",
  muted: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const

export type BasemapKind = "colored" | "muted"

export function basemapUrl(kind: BasemapKind, dark: boolean) {
  return dark ? STYLE_URL.dark : STYLE_URL[kind]
}

/**
 * Tên địa danh: style gốc ưu tiên name_en ("West Lake"). Đổi sang tiếng Việt nếu
 * * có, rồi tên gốc (tiếng Việt đã là dạng Latin).
 */
const LABEL_FIELD: ExpressionSpecification = [
  "coalesce",
  ["get", "name:vi"],
  ["get", "name:latin"],
  ["get", "name"],
]

/** Font có sẵn trên máy chủ glyph của OpenFreeMap (đủ dấu tiếng Việt). */
export const MAP_FONT = { regular: ["Noto Sans Regular"], bold: ["Noto Sans Bold"] }

/** Tuỳ chọn chung: cuộn trang không bị bản đồ nuốt, lời nhắc tiếng Việt. */
export const MAP_OPTIONS = {
  attributionControl: false,
  cooperativeGestures: true,
  locale: {
    "CooperativeGesturesHandler.WindowsHelpText": "Giữ Ctrl và lăn chuột để phóng to bản đồ",
    "CooperativeGesturesHandler.MacHelpText": "Giữ ⌘ và lăn chuột để phóng to bản đồ",
    "CooperativeGesturesHandler.MobileHelpText": "Dùng hai ngón tay để di chuyển bản đồ",
  },
} satisfies Partial<MapOptions>

/** Ghi nguồn thu gọn thành nút (i) — nội dung lấy từ TileJSON của OpenFreeMap. */
export function addAttribution(map: MLMap) {
  map.addControl(new AttributionControl({ compact: true }))
  // MapLibre mở sẵn dòng ghi nguồn ở khung rộng — thu lại, bấm (i) để xem.
  map.once("load", () => {
    map.getContainer().querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show")
  })
}

/**
 * Khung nhìn ban đầu theo vùng tập trung: bỏ 3% điểm ngoài cùng mỗi phía (từ 20
 * điểm trở lên) để một listing lẻ ở ngoại thành không kéo cả bản đồ ra xa.
 */
export function denseBounds(points: [number, number][]) {
  const bounds = new LngLatBounds()
  if (points.length === 0) return bounds
  const trim = points.length >= 20 ? Math.floor(points.length * 0.03) : 0
  const lngs = points.map((p) => p[0]).sort((a, b) => a - b)
  const lats = points.map((p) => p[1]).sort((a, b) => a - b)
  const last = points.length - 1 - trim
  bounds.extend([lngs[trim], lats[trim]])
  bounds.extend([lngs[last], lats[last]])
  return bounds
}

/**
 * Sau mỗi lần nạp style (kể cả đổi sáng/tối): đổi tên địa danh sang tiếng Việt.
 * Trả về id lớp nhãn đầu tiên — lớp dữ liệu chèn TRƯỚC nó để tên đường nằm trên.
 */
export function prepareBasemap(map: MLMap): string | undefined {
  let firstSymbol: string | undefined
  for (const layer of map.getStyle().layers) {
    if (layer.type !== "symbol") continue
    firstSymbol ??= layer.id
    // Chỉ lớp hiện TÊN — bỏ qua số nhà, số hiệu đường (ref), mũi tên một chiều.
    const field = map.getLayoutProperty(layer.id, "text-field")
    if (field !== undefined && JSON.stringify(field).includes("name")) {
      map.setLayoutProperty(layer.id, "text-field", LABEL_FIELD)
    }
  }
  return firstSymbol
}
