"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { LngLatBounds, Map as MLMap, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/lib/map-worker";

import { MAP_OPTIONS, addAttribution, basemapUrl, prepareBasemap } from "@/lib/map-style";

/**
 * Bản đồ nhỏ trên trang Insight: các phường của thị trường, phường đang xem tô
 * đậm. Nền OpenFreeMap xám nhạt (tối: nền tối), lớp màu nằm dưới tên đường.
 */
export function MiniMap({
  features,
  lat,
  lng,
}: {
  features: { type: "Feature"; properties: { name: string; active: boolean }; geometry: unknown }[];
  lat: number;
  lng: number;
}) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const styleRef = useRef<string | null>(null);

  const themeKnown = resolvedTheme !== undefined;
  useEffect(() => {
    // Chờ biết sáng/tối để nạp đúng nền ngay lần đầu, khỏi nháy.
    if (!ref.current || !themeKnown) return;
    const bounds = new LngLatBounds();
    const walk = (x: unknown) => {
      if (!Array.isArray(x)) return;
      if (typeof x[0] === "number" && typeof x[1] === "number") {
        bounds.extend([x[0], x[1]]);
        return;
      }
      for (const y of x) walk(y);
    };
    for (const f of features) walk((f.geometry as { coordinates?: unknown })?.coordinates);

    const url = basemapUrl("muted", dark);
    const map = new MLMap({
      ...MAP_OPTIONS,
      container: ref.current,
      style: url,
      bounds: bounds.isEmpty() ? undefined : bounds,
      center: bounds.isEmpty() ? [lng, lat] : undefined,
      zoom: bounds.isEmpty() ? 10 : undefined,
      fitBoundsOptions: { padding: 24 },
    });
    mapRef.current = map;
    styleRef.current = url;
    addAttribution(map);

    // Chạy mỗi lần nạp style (lần đầu và mỗi lần đổi sáng/tối): nền mới xoá hết lớp riêng.
    map.on("style.load", () => {
      const beforeLabels = prepareBasemap(map);
      map.addSource("areas", {
        type: "geojson",
        data: { type: "FeatureCollection", features } as never,
      });
      map.addLayer(
        {
          id: "areas-fill",
          type: "fill",
          source: "areas",
          paint: {
            "fill-color": ["case", ["get", "active"], "#2563eb", "#93c5fd"],
            "fill-opacity": ["case", ["get", "active"], 0.6, 0.35],
          },
        },
        beforeLabels,
      );
      map.addLayer(
        {
          id: "areas-line",
          type: "line",
          source: "areas",
          paint: { "line-color": "#1e3a8a", "line-width": 1 },
        },
        beforeLabels,
      );
    });

    const popup = new Popup({ closeButton: false, offset: 4 });
    map.on("mousemove", "areas-fill", (e) => {
      const f = e.features?.[0];
      if (!f) return;
      map.getCanvas().style.cursor = "pointer";
      const name = document.createElement("strong");
      name.textContent = String(f.properties?.name ?? "");
      popup.setLngLat(e.lngLat).setDOMContent(name).addTo(map);
    });
    map.on("mouseleave", "areas-fill", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });

    return () => {
      map.remove();
      mapRef.current = null;
      styleRef.current = null;
    };
    // Đổi sáng/tối xử lý ở effect dưới, không dựng lại bản đồ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features, lat, lng, themeKnown]);

  // Đổi sáng/tối: thay nền, giữ khung nhìn; style.load dựng lại các lớp.
  useEffect(() => {
    const map = mapRef.current;
    const url = basemapUrl("muted", dark);
    if (!map || styleRef.current === url) return;
    styleRef.current = url;
    map.setStyle(url, { diff: false });
  }, [dark]);

  return <div ref={ref} className="h-72 w-full" />;
}
